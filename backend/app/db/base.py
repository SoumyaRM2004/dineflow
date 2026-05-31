"""SQLAlchemy async engine, Base declarative class, and metadata."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncAttrs
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Async engine — used by session factory and Alembic
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
)


class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass
