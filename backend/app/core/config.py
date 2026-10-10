import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import field_validator

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def normalize_database_url(raw: str | None) -> str:
    """Get and fix database URL for async SQLAlchemy compatibility."""
    if not raw or not isinstance(raw, str) or not raw.strip():
        return f"sqlite+aiosqlite:///{BASE_DIR / 'communication.db'}"

    url = raw.strip().strip('"').strip("'")

    # Render provides postgres:// or postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        if "+asyncpg" not in url and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Clean up sslmode if present for asyncpg
    if "+asyncpg" in url and "sslmode=" in url:
        url = url.replace("sslmode=require", "ssl=require").replace("sslmode=prefer", "")
        if url.endswith("?"):
            url = url[:-1]

    return url

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adda — স্মার্ট আলাপ, যেকোনো জায়গায়।"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "antigravity-secret-key-super-secure-comm-platform-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Dual database support: SQLite async by default, or PostgreSQL if DATABASE_URL provided
    DATABASE_URL: str = normalize_database_url(os.getenv("DATABASE_URL"))

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        return normalize_database_url(v)

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Render.com production
        "https://*.onrender.com",
        "*"
    ]

    UPLOAD_PATH: str = str(UPLOAD_DIR)

    class Config:
        case_sensitive = True

settings = Settings()
