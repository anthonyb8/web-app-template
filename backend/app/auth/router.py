# app/auth/router.py
import datetime as dt
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from datetime import timedelta
from app.auth.services import (
    RecoveryCodeService,
    UserService,
    TokenService,
    send_reset_password_msg,
    send_verify_email_msg,
    update_response_refresh_token,
)
from app.auth.schemas import (
    Email,
    ForgotPassword,
    LoginResponse,
    MFAVerifiactionCode,
    RecoveryCodes,
    RegisterRequest,
    ResetPassword,
)
from app.auth.utils import SecurityService
from app.auth.services import update_user_password
from app.config import settings
from app.dependencies import get_current_user, get_user_pending_mfa
from app.auth.schemas import (
    LoginRequest,
    TokenResponse,
    MFASetupResponse,
    User,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(data: RegisterRequest):
    if await UserService.check_user_exists(data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    # Create user
    user = await UserService.create_user(data.email, data.password)

    await send_verify_email_msg(user.id, user.email)

    return {"message": "Registration successful. Check your email to verify."}


@router.post("/send-verification")
async def send_verification_email(email: Email):
    user = await UserService.get_user_by_email(email.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email.",
        )

    await send_verify_email_msg(user.id, user.email)

    return {"message": "Registration successful. Check your email to verify."}


@router.post("/verify-email")
async def verify_email(token: str):
    token_obj = await TokenService.get_verification_token(
        token,
        "email_verification",
    )

    if not token_obj:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if SecurityService.is_expired(token_obj):
        await TokenService.delete_verification_token(token_obj.user_id)
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Mark user as verified
    update_user = UserUpdate()
    update_user.is_verified = True
    await UserService.update_user(token_obj.user_id, update_user)

    # Mark token as used
    await TokenService.delete_verification_token(token_obj.user_id)

    return {"message": "Email verified successfully"}


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    user = await UserService.validate_user(data.email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=400, detail="Please verify your email first"
        )

    # Update last login
    user_update = UserUpdate()
    user_update.last_login = dt.datetime.now(dt.timezone.utc)
    await UserService.update_user(user.id, user_update)

    # Issue temp token good until MFA verified
    (temp_token, expiry) = SecurityService.generate_jwt(
        user.id,
        timedelta(minutes=5),
        False,
    )

    if user.mfa_enabled:
        return LoginResponse(
            access_token=temp_token,
            mfa_setup=True,
            mfa_required=True,
            expires_at=expiry,
        )
    else:
        return LoginResponse(
            access_token=temp_token,
            mfa_setup=False,
            mfa_required=True,
            expires_at=expiry,
        )


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    user = await UserService.get_user_by_email(data.email)
    if not user:
        return {"message": "If email exists, reset link sent"}

    await send_reset_password_msg(user.id, user.email)

    return {"message": "If email exists, reset link sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    token_obj = await TokenService.get_verification_token(
        data.token,
        "password_reset",
    )

    if not token_obj:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if SecurityService.is_expired(token_obj):
        await TokenService.delete_verification_token(token_obj.user_id)
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Update password
    await update_user_password(token_obj.user_id, data.new_password)

    # Mark token as used
    await TokenService.delete_verification_token(token_obj.user_id)

    return {"message": "Password updated successfully"}


@router.post("/setup-mfa", response_model=MFASetupResponse)
async def setup_mfa(user: User = Depends(get_user_pending_mfa)):
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled",
        )

    # Generate secret and QR code
    secret = SecurityService.generate_mfa_secret()
    qr_code = SecurityService.generate_qr_code(user.email, secret)

    # recovery_codes = SecurityService.generate_recovery_codes()
    recovery_codes = await RecoveryCodeService.create_recovery_codes(user.id)

    # Store secret (not enabled yet)
    user_update = UserUpdate()
    user_update.mfa_secret = SecurityService.encrypt_mfa_secret(secret)
    await UserService.update_user(user.id, user_update)

    return MFASetupResponse(
        secret=secret,
        qr_code=qr_code,
        recovery_codes=recovery_codes,
    )


@router.post("/verify-mfa", response_model=TokenResponse)
async def verify_mfa(
    data: MFAVerifiactionCode,
    response: Response,
    user: User = Depends(get_user_pending_mfa),
):
    if not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="MFA not set up"
        )

    if not SecurityService.verify_totp(
        SecurityService.decrypt_mfa_secret(user.mfa_secret), data.code
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MFA code"
        )

    # If MFA wasn't enabled yet, enable it now
    if not user.mfa_enabled:
        user_update = UserUpdate()
        user_update.mfa_enabled = True
        await UserService.update_user(user.id, user_update)

    await update_response_refresh_token(user.id, response)

    (access_token, expiry) = SecurityService.generate_jwt(
        user.id,
        timedelta(minutes=settings.access_token_expire_minutes),
        True,
    )

    return TokenResponse(access_token=access_token, expires_at=expiry)


@router.post("/verify-recovery-code", response_model=TokenResponse)
async def verify_recovery_code(
    data: MFAVerifiactionCode,
    response: Response,
    user: User = Depends(get_user_pending_mfa),
):
    if not user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="MFA not set up"
        )

    if not await RecoveryCodeService.verify_recovery_code(user.id, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recovery code.",
        )

    await update_response_refresh_token(user.id, response)

    (access_token, expiry) = SecurityService.generate_jwt(
        user.id,
        timedelta(minutes=settings.access_token_expire_minutes),
        True,
    )

    return TokenResponse(access_token=access_token, expires_at=expiry)


@router.post("/regenerate-recovery-codes", response_model=RecoveryCodes)
async def regenerate_recovery_codes(
    user: User = Depends(get_current_user),
):
    if not user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="MFA not set up"
        )

    codes = await RecoveryCodeService.regenerate_recovery_codes(user.id)

    if not codes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recovery codes. Please try again.",
        )

    return RecoveryCodes(codes=codes)


@router.post("/disable-mfa")
async def disable_mfa(
    data: MFAVerifiactionCode,
    user: User = Depends(get_current_user),
):
    if not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled",
        )

    if not SecurityService.verify_totp(
        SecurityService.decrypt_mfa_secret(user.mfa_secret), data.code
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MFA code"
        )

    # Disable MFA
    user_update = UserUpdate()
    user_update.mfa_enabled = False
    user_update.mfa_secret = None
    await UserService.update_user(user.id, user_update)

    return {"message": "MFA disabled successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
    # print(token)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token",
        )

    refresh_token = await TokenService.refresh_token(token)

    return refresh_token


@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    user: User = Depends(get_current_user),
):
    token = request.cookies.get("refresh_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token already invalid",
        )

    await TokenService.delete_refresh_token(token, user.id)

    # Clear cookie in browser
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,
        samesite="none",
    )

    return {"message": "Successfully logged out."}
