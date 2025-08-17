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

    # MFA
    mfa_secret_key: str = get_env("MFA_ENCRYPTION_KEY")

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
    app_name: str = "Worklog"
    debug: bool = os.getenv("DEBUG") == "True"

    # Email
    email: str = get_env("EMAIL")
    email_pw: str = get_env("EMAIL_PASSWORD")


settings = Settings()
