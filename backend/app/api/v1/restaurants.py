"""Restaurant API Router — endpoints for managing the restaurant profile."""

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_owner, get_owner_or_manager
from app.db.session import get_db
from app.models.user import User
from app.schemas.restaurant import RestaurantResponse, RestaurantUpdate
from app.services.restaurant_service import RestaurantService

router = APIRouter(prefix="/restaurant", tags=["Restaurant"])


@router.get("", response_model=RestaurantResponse)
async def get_restaurant_profile(
    current_user: User = Depends(get_owner_or_manager),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the restaurant profile for the authenticated tenant."""
    restaurant = await RestaurantService.get_restaurant(
        db, current_user.restaurant_id
    )
    return restaurant


@router.put("", response_model=RestaurantResponse)
async def update_restaurant_profile(
    data: RestaurantUpdate,
    current_user: User = Depends(get_owner),
    db: AsyncSession = Depends(get_db),
):
    """Update the restaurant profile (Owner-only)."""
    restaurant = await RestaurantService.update_restaurant(
        db, current_user.restaurant_id, data
    )
    return restaurant


@router.post("/logo", response_model=RestaurantResponse)
async def upload_restaurant_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_owner),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new restaurant logo (Owner-only)."""
    file_bytes = await file.read()
    restaurant = await RestaurantService.upload_logo(
        db,
        current_user.restaurant_id,
        file_bytes=file_bytes,
        filename=file.filename,
        content_type=file.content_type,
    )
    return restaurant


@router.delete("/logo", response_model=RestaurantResponse)
async def delete_restaurant_logo(
    current_user: User = Depends(get_owner),
    db: AsyncSession = Depends(get_db),
):
    """Remove the restaurant logo (Owner-only)."""
    restaurant = await RestaurantService.delete_logo(
        db, current_user.restaurant_id
    )
    return restaurant
