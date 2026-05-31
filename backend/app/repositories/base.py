"""Generic base repository with common CRUD operations."""

from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Abstract base repository providing common database operations.

    Subclasses must set `model` to the SQLAlchemy model class.
    """

    model: type[ModelType]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, id: UUID) -> ModelType | None:
        """Fetch a single record by primary key."""
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> list[ModelType]:
        """Fetch multiple records with optional filtering and pagination."""
        query = select(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                query = query.where(getattr(self.model, key) == value)
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, obj: ModelType) -> ModelType:
        """Insert a new record."""
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update_by_id(self, id: UUID, **values: Any) -> ModelType | None:
        """Update a record by ID with given values."""
        await self.db.execute(
            update(self.model).where(self.model.id == id).values(**values)
        )
        await self.db.flush()
        return await self.get_by_id(id)

    async def delete_by_id(self, id: UUID) -> bool:
        """Hard-delete a record by ID. Returns True if found and deleted."""
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.db.flush()
        return result.rowcount > 0

    async def soft_delete(self, id: UUID) -> ModelType | None:
        """Soft-delete by setting is_active=False."""
        return await self.update_by_id(id, is_active=False)
