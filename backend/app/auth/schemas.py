# app/schemas.py
from datetime import timezone
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import List, Literal, Optional


# Api objects
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    mfa_setup: bool = False
    mfa_required: bool = True
    expires_at: datetime
    token_type: str = "bearer"


class Email(BaseModel):
    email: EmailStr


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


class MFASetupResponse(BaseModel):
    secret: str
    qr_code: str
    recovery_codes: List[str]


class MFAVerifiactionCode(BaseModel):
    code: str


class MFARecoveryCode(BaseModel):
    code: str


class RecoveryCodes(BaseModel):
    codes: List[str]


class RecoveryCode(BaseModel):
    id: int
    user_id: int
    code_hash: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# User schemas
class User(BaseModel):
    id: int
    email: str
    password_hash: str
    mfa_enabled: bool
    mfa_secret: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True  # For **dict conversion


class UserResponse(BaseModel):
    id: int
    email: str
    mfa_enabled: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password_hash: Optional[str] = None
    mfa_enabled: Optional[bool] = None
    mfa_secret: Optional[str] = None
    is_verified: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


# Refresh tokens
class RefreshToken(BaseModel):
    id: Optional[int] = None
    user_id: int
    token_hash: str
    expires_at: datetime
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @validator("expires_at", pre=True, always=True)
    def ensure_utc(cls, v):
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)


class TokenResponse(BaseModel):
    access_token: str
    expires_at: datetime
    token_type: str = "bearer"


# verification tokens
class VerificationToken(BaseModel):
    id: Optional[int] = None
    user_id: int
    token_hash: str
    token_type: Literal["email_verification", "password_reset"]
    expires_at: datetime
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @validator("expires_at", pre=True, always=True)
    def ensure_utc(cls, v):
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)
