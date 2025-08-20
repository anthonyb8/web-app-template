import aiomysql
from typing import List, Union
from fastapi import HTTPException, status
from app.database import database
from app.auth.schemas import (
    RefreshToken,
    TokenResponse,
    User,
    UserResponse,
    UserUpdate,
    VerificationToken,
)
from fastapi import Response
from app.auth.utils import SecurityService
import datetime as dt
from datetime import timedelta, datetime
from app.config import settings
from app.email.messages import ResetPasswordMessage, VerifyEmailMessage
from app.email.service import EmailService


async def update_response_refresh_token(user_id: int, response: Response):
    # Create Refresh token
    days_to_expire = settings.refresh_token_expire_days
    refresh_token = SecurityService.generate_secure_token()

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=days_to_expire * 24 * 60 * 60,
        path="/",
    )

    # Add to database
    token = RefreshToken(
        id=None,
        user_id=user_id,
        token_hash=SecurityService.hash_token(refresh_token),
        expires_at=datetime.now(dt.timezone.utc)
        + timedelta(days=days_to_expire),
    )
    await TokenService.create_refresh_token(token)


async def send_verify_email_msg(user_id: int, email: str):
    # delete if any token exists
    await TokenService.delete_verification_token(user_id)

    # Token to verify
    token = SecurityService.generate_secure_token()

    verification_token = VerificationToken(
        id=None,
        user_id=user_id,
        token_hash=SecurityService.hash_token(token),
        token_type="email_verification",
        expires_at=datetime.now(dt.timezone.utc) + timedelta(days=1),
    )
    await TokenService.create_verification_token(verification_token)

    # Send verification email
    verification_url = f"{settings.app_url}/verify-email?token={token}"
    (
        EmailService()
        .recipient(email)
        .subject("Verify Email")
        .body(VerifyEmailMessage(verification_url))
        .send()
    )


async def send_reset_password_msg(user_id: int, email: str):
    # delete if any token exists
    await TokenService.delete_verification_token(user_id)

    token = SecurityService.generate_secure_token()
    reset_token = VerificationToken(
        id=None,
        user_id=user_id,
        token_hash=SecurityService.hash_token(token),
        token_type="password_reset",
        expires_at=datetime.now(dt.timezone.utc) + timedelta(hours=1),
    )

    await TokenService.create_verification_token(reset_token)

    # Send verification email
    reset_url = f"{settings.app_url}/reset-password?token={token}"
    (
        EmailService()
        .recipient(email)
        .subject("Reset Password")
        .body(ResetPasswordMessage(reset_url))
        .send()
    )


async def update_user_last_login(user_id: int):
    user_update = UserUpdate()
    user_update.last_login = dt.datetime.now(dt.timezone.utc)
    await UserService.update_user(user_id, user_update)


async def update_user_password(user_id: int, password: str):
    user_update = UserUpdate()
    user_update.password_hash = SecurityService.hash_password(password)
    await UserService.update_user(user_id, user_update)


async def update_user_is_verified(user_id: int, is_verified: bool):
    user_update = UserUpdate()
    user_update.is_verified = is_verified
    await UserService.update_user(user_id, user_update)


# Users
class UserService:
    # Helper methods
    @staticmethod
    async def validate_user(email: str, password: str) -> Union[User, None]:
        user = await UserService.get_user_by_email(email)
        if user is None:
            return None
        elif not SecurityService.verify_password(password, user.password_hash):
            return None
        else:
            return user

    @staticmethod
    async def check_user_exists(email: str):
        user = await UserService.get_user_by_email(email)

        if user:
            return True
        else:
            return False

    # Services
    @staticmethod
    async def create_user(email: str, password: str) -> UserResponse:
        password_hash = SecurityService.hash_password(password)

        query = "INSERT INTO users (email, password_hash, is_verified) VALUES (%s, %s, %s);"

        async with database.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (email, password_hash, False))
                await conn.commit()

                # Get the ID of the inserted user
                user_id = cursor.lastrowid

                # Fetch the complete user record
                select_query = "SELECT id, email, mfa_enabled, created_at, last_login FROM users WHERE id = %s;"
                await cursor.execute(select_query, (user_id,))
                row = await cursor.fetchone()

                return UserResponse(**row)

    @staticmethod
    async def get_user_by_id(id: int) -> Union[User, None]:
        query = "SELECT * FROM users WHERE id=%s LIMIT 1;"

        async with database.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, id)
                row = await cursor.fetchone()
                return User(**row) if row else None

    @staticmethod
    async def get_user_by_email(email: str) -> Union[User, None]:
        query = "SELECT * FROM users WHERE email=%s LIMIT 1;"

        async with database.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, email)
                row = await cursor.fetchone()
                return User(**row) if row else None

    @staticmethod
    async def update_user(user_id: int, user_update: UserUpdate) -> bool:
        updates = user_update.model_dump(exclude_unset=True)

        if not updates:
            return False

        set_clauses = [f"{field}=%s" for field in updates.keys()]
        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id=%s"
        values = list(updates.values()) + [user_id]

        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(query, values)
                await conn.commit()
                return cursor.rowcount > 0

    @staticmethod
    async def delete_user(email: str, password: str):
        query = "DELETE FROM users WHERE id=%s;"

        user = await UserService.validate_user(email, password)

        if user:
            async with database.get_connection() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(query, (user.id,))
                    await conn.commit()

                    await cursor.execute(
                        "SELECT COUNT(*) FROM users WHERE id=%s;", (user.id,)
                    )
                    result = await cursor.fetchone()
                    return result[0] == 0


class RecoveryCodeService:
    @staticmethod
    async def create_recovery_codes(user_id: int) -> List[str]:
        codes = SecurityService.generate_recovery_codes()

        query = (
            "INSERT INTO recovery_codes (user_id, code_hash) VALUES (%s, %s);"
        )
        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                for code in codes:
                    await cursor.execute(
                        query,
                        (user_id, SecurityService.hash_token(code)),
                    )

                await conn.commit()

                return codes

    @staticmethod
    async def verify_recovery_code(user_id: int, code: str) -> bool:
        query = "SELECT code_hash FROM recovery_codes WHERE user_id = %s AND code_hash = %s;"
        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    query, (user_id, SecurityService.hash_token(code))
                )
                row = await cursor.fetchone()

                if row:
                    # Delete the used code instead of marking as used
                    await cursor.execute(
                        "DELETE FROM recovery_codes WHERE user_id = %s AND code_hash = %s",
                        (user_id, SecurityService.hash_token(code)),
                    )
                    return True

                return False

    @staticmethod
    async def delete_recovery_codes(user_id: int):
        query = "DELETE FROM recovery_codes WHERE user_id=%s;"
        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(query, (user_id,))

                await conn.commit()

    @staticmethod
    async def regenerate_recovery_codes(user_id: int) -> List[str]:
        await RecoveryCodeService.delete_recovery_codes(user_id)
        return await RecoveryCodeService.create_recovery_codes(user_id)


class TokenService:
    # Refresh tokens
    @staticmethod
    async def create_refresh_token(token: RefreshToken):
        query = "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (%s, %s, %s);"

        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    query, (token.user_id, token.token_hash, token.expires_at)
                )
                await conn.commit()

    @staticmethod
    async def get_refresh_token(token: str) -> RefreshToken | None:
        query = "SELECT * FROM refresh_tokens WHERE token_hash=%s;"

        async with database.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    query, (SecurityService.hash_token(token),)
                )
                row = await cursor.fetchone()
                return RefreshToken(**row) if row else None

    @staticmethod
    async def delete_refresh_token(token: str, user_id: int):
        query = """DELETE FROM refresh_tokens WHERE token_hash=%s AND user_id=%s;"""

        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    query, (SecurityService.hash_token(token), user_id)
                )
                await conn.commit()

    @staticmethod
    async def delete_expired_refresh_tokens(user_id: int):
        query = """DELETE FROM refresh_tokens WHERE user_id=%s AND expires_at <= UTC_TIMESTAMP();"""

        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(query, (user_id,))
                await conn.commit()

    @staticmethod
    async def refresh_token(token: str) -> TokenResponse:
        refresh_token = await TokenService.get_refresh_token(token)

        if not refresh_token or refresh_token.expires_at < dt.datetime.now(
            dt.timezone.utc
        ):
            if refresh_token:
                await TokenService.delete_expired_refresh_tokens(
                    refresh_token.user_id
                )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is expired",
            )

        # You can also rotate the refresh token here if needed
        (access_token, expiry) = SecurityService.generate_jwt(
            refresh_token.user_id,
            timedelta(minutes=settings.access_token_expire_minutes),
            True,
        )

        return TokenResponse(access_token=access_token, expires_at=expiry)

    # Verification tokens
    @staticmethod
    async def create_verification_token(token: VerificationToken):
        query = "INSERT INTO verification_tokens (user_id, token_hash, token_type, expires_at) VALUES (%s, %s, %s, %s);"
        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    query,
                    (
                        token.user_id,
                        token.token_hash,
                        token.token_type,
                        token.expires_at,
                    ),
                )
                await conn.commit()

    @staticmethod
    async def delete_verification_token(user_id: int):
        query = """DELETE FROM verification_tokens WHERE user_id=%s;"""

        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(query, (user_id))
                await conn.commit()

    @staticmethod
    async def delete_expired_verification_tokens():
        query = """DELETE FROM verification_tokens WHERE expires_at <= UTC_TIMESTAMP();"""

        async with database.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(query)
                await conn.commit()

    @staticmethod
    async def get_verification_token(
        token: str,
        type: str,
    ) -> VerificationToken | None:
        query = "SELECT * FROM verification_tokens WHERE token_hash=%s AND token_type=%s;"

        async with database.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    query, (SecurityService.hash_token(token), type)
                )
                row = await cursor.fetchone()
                return VerificationToken(**row) if row else None
