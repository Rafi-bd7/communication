import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def _get_database_url() -> str:
    """Get and fix database URL for async SQLAlchemy compatibility."""
    url = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{BASE_DIR / 'communication.db'}"
    )
    # Render provides postgres:// but SQLAlchemy async requires postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    # Also handle postgresql:// without asyncpg driver
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adda — স্মার্ট আলাপ, যেকোনো জায়গায়।"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "antigravity-secret-key-super-secure-comm-platform-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Dual database support: SQLite async by default, or PostgreSQL if DATABASE_URL provided
    DATABASE_URL: str = _get_database_url()

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
