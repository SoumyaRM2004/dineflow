"""Restaurant service — business logic for restaurant profile management."""

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.restaurant import Restaurant
from app.repositories.restaurant_repo import RestaurantRepository
from app.schemas.restaurant import RestaurantUpdate
from app.services.storage_service import StorageService
from app.core.exceptions import DineFlowException
from fastapi import status


class RestaurantService:
    """Service class encapsulating restaurant profile CRUD and media actions."""

    @staticmethod
    async def get_restaurant(db: AsyncSession, restaurant_id: UUID) -> Restaurant:
        """Retrieve a restaurant by its UUID."""
        repo = RestaurantRepository(db)
        restaurant = await repo.get_by_id(restaurant_id)
        if not restaurant:
            raise DineFlowException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found",
            )
        return restaurant

    @classmethod
    async def update_restaurant(
        cls, db: AsyncSession, restaurant_id: UUID, data: RestaurantUpdate
    ) -> Restaurant:
        """Update restaurant details, excluding immutable fields like slug."""
        repo = RestaurantRepository(db)
        restaurant = await cls.get_restaurant(db, restaurant_id)

        update_data = data.model_dump(exclude_unset=True)

        updated_restaurant = await repo.update_by_id(restaurant_id, **update_data)
        return updated_restaurant

    @classmethod
    async def upload_logo(
        cls,
        db: AsyncSession,
        restaurant_id: UUID,
        file_bytes: bytes,
        filename: str,
        content_type: str,
    ) -> Restaurant:
        """Upload a new logo, delete the old logo if it exists, and update the DB."""
        repo = RestaurantRepository(db)
        restaurant = await cls.get_restaurant(db, restaurant_id)

        # Invalidate old logo file from storage
        if restaurant.logo_url:
            await StorageService.delete_file(restaurant.logo_url)

        # Upload new logo file
        logo_url = await StorageService.upload_file(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
            folder="logos",
        )

        # Save to database
        updated_restaurant = await repo.update_by_id(restaurant_id, logo_url=logo_url)
        return updated_restaurant

    @classmethod
    async def delete_logo(cls, db: AsyncSession, restaurant_id: UUID) -> Restaurant:
        """Remove the logo from storage and update the database URL to NULL."""
        repo = RestaurantRepository(db)
        restaurant = await cls.get_restaurant(db, restaurant_id)

        if not restaurant.logo_url:
            return restaurant

        # Delete the file
        await StorageService.delete_file(restaurant.logo_url)

        # Update in DB
        updated_restaurant = await repo.update_by_id(restaurant_id, logo_url=None)
        return updated_restaurant
