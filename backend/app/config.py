# app/config.py
from typing import Any, List
import os
from dotenv import load_dotenv

load_dotenv()


def get_env(key: str) -> Any:
    value = os.getenv(key)

    if value is None:
        raise ValueError(f"Environment variable {key} not found.")
    return value


class Settings:
    # JWT
    jwt_access_secret: str = get_env("JWT_ACCESS_SECRET")
    jwt_refresh_secret: str = get_env("JWT_REFRESH_SECRET")
    jwt_algorithm: str = get_env("JWT_ALGORITHM")
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    temp_login_expire_minutes: int = 5
    reset_pw_expire_hours: int = 1
    verify_email_expire_day: int = 1

    # MFA
    mfa_secret_key: str = get_env("MFA_ENCRYPTION_KEY")
    email_mfa_expire_minutes: int = 5

    # Database
    database_url: str = get_env("DATABASE_URL")
    host: str = get_env("MYSQL_HOST")
    user: str = get_env("MYSQL_USER")
    password: str = get_env("MYSQL_PASSWORD")
    db: str = get_env("MYSQL_DATABASE")

    # CORS
    allowed_origins: List[str] = get_env("ALLOWED_ORIGINS")

    # App
    app_url: str = get_env("APP_URL")
    app_name: str = get_env("APP_NAME")
    debug: bool = os.getenv("DEBUG") == "True"

    # Email
    email: str = get_env("SUPPORT_EMAIL")
    email_pw: str = get_env("SUPPORT_EMAIL_PASSWORD")


settings = Settings()
