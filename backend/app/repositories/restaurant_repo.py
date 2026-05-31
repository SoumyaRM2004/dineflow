"""Restaurant repository — data access layer for Restaurant model."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.restaurant import Restaurant
from app.repositories.base import BaseRepository


class RestaurantRepository(BaseRepository[Restaurant]):
    """Repository for Restaurant CRUD and slug-based lookups."""

    model = Restaurant

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def get_by_slug(self, slug: str) -> Restaurant | None:
        """Find a restaurant by its URL slug."""
        result = await self.db.execute(
            select(Restaurant).where(Restaurant.slug == slug)
        )
        return result.scalar_one_or_none()

    async def slug_exists(self, slug: str) -> bool:
        """Check if a slug is already taken."""
        restaurant = await self.get_by_slug(slug)
        return restaurant is not None
