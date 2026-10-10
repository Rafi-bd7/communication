from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Engine configuration
engine_args = {}
if "sqlite" in settings.DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_pre_ping"] = True
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    **engine_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

from sqlalchemy import text

async def init_db():
    from app.models import models  # noqa
    # 1. Create all tables in its own dedicated transaction
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seamlessly auto-migrate new profile fields for any legacy existing database
    new_cols = [
        ("date_of_birth", "VARCHAR(50)"),
        ("lives_in", "VARCHAR(100)"),
        ("education", "VARCHAR(150)"),
        ("workplace", "VARCHAR(150)"),
        ("cover_url", "VARCHAR(255)"),
    ]
    for col_name, col_type in new_cols:
        try:
            async with engine.begin() as conn:
                if "sqlite" in settings.DATABASE_URL:
                    await conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                else:
                    await conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
        except Exception:
            pass
