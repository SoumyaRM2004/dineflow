"""Pydantic schemas for restaurant profile management."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class RestaurantCreate(BaseModel):
    """Internal schema used during registration."""

    name: str = Field(min_length=2, max_length=255)
    slug: str | None = None
    email: str | None = None


class RestaurantUpdate(BaseModel):
    """Request body for updating restaurant profile."""

    name: str | None = Field(None, min_length=2, max_length=255)
    address: str | None = None
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    timezone: str | None = None
    currency: str | None = Field(None, max_length=3)
    tax_details: dict | None = None


class RestaurantResponse(BaseModel):
    """Public restaurant profile response."""

    id: UUID
    name: str
    slug: str
    logo_url: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    tax_details: dict | None = None
    timezone: str
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
