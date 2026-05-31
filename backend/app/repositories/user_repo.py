"""User repository — data access layer for User model."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User CRUD and auth-specific queries."""

    model = User

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def get_by_email(self, email: str) -> User | None:
        """Find a user by email address (case-insensitive)."""
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_by_restaurant(
        self,
        restaurant_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        """List all users belonging to a restaurant."""
        result = await self.db.execute(
            select(User)
            .where(User.restaurant_id == restaurant_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def email_exists(self, email: str) -> bool:
        """Check if an email is already registered."""
        user = await self.get_by_email(email)
        return user is not None
