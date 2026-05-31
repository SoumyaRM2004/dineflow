"""Integration tests for restaurant profile management APIs."""

import pytest
from httpx import AsyncClient
from app.models.restaurant import Restaurant

pytestmark = pytest.mark.asyncio(scope="session")


async def test_get_restaurant_profile_owner(
    client: AsyncClient, test_restaurant: Restaurant, owner_headers: dict
):
    """Test retrieving own restaurant profile as OWNER."""
    response = await client.get("/api/v1/restaurant", headers=owner_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_restaurant.id)
    assert data["name"] == test_restaurant.name
    assert data["slug"] == test_restaurant.slug
    assert data["email"] == test_restaurant.email


async def test_get_restaurant_profile_manager(
    client: AsyncClient, test_restaurant: Restaurant, manager_headers: dict
):
    """Test retrieving own restaurant profile as MANAGER."""
    response = await client.get("/api/v1/restaurant", headers=manager_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_restaurant.name


async def test_get_restaurant_profile_unauthorized(client: AsyncClient):
    """Test retrieving restaurant profile without a JWT token."""
    response = await client.get("/api/v1/restaurant")
    assert response.status_code == 401


async def test_update_restaurant_profile_owner(
    client: AsyncClient, test_restaurant: Restaurant, owner_headers: dict
):
    """Test updating restaurant profile details as OWNER."""
    update_data = {
        "name": "Updated Golden Diner",
        "phone": "+918888888888",
        "email": "updated@diner.com",
        "address": "456 New Road",
        "timezone": "UTC",
        "currency": "USD",
        "tax_details": {"gstin": "27BBBBB2222B2Z2", "tax_rate": 12.5},
    }
    response = await client.put(
        "/api/v1/restaurant", json=update_data, headers=owner_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Golden Diner"
    assert data["phone"] == "+918888888888"
    assert data["email"] == "updated@diner.com"
    assert data["address"] == "456 New Road"
    assert data["currency"] == "USD"
    assert data["timezone"] == "UTC"
    assert data["tax_details"]["gstin"] == "27BBBBB2222B2Z2"
    assert data["tax_details"]["tax_rate"] == 12.5


async def test_update_restaurant_profile_manager_forbidden(
    client: AsyncClient, test_restaurant: Restaurant, manager_headers: dict
):
    """Test that MANAGER receives 403 Forbidden when trying to update details."""
    update_data = {"name": "Manager Attempt"}
    response = await client.put(
        "/api/v1/restaurant", json=update_data, headers=manager_headers
    )
    assert response.status_code == 403


async def test_logo_upload_and_delete_owner(
    client: AsyncClient, test_restaurant: Restaurant, owner_headers: dict
):
    """Test uploading a logo image and deleting it as OWNER."""
    # 1. Upload logo
    files = {"file": ("test_logo.png", b"fake-logo-file-bytes", "image/png")}
    response = await client.post(
        "/api/v1/restaurant/logo", files=files, headers=owner_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["logo_url"] is not None
    assert "/static/uploads/logos/" in data["logo_url"]

    # 2. Delete logo
    response = await client.delete(
        "/api/v1/restaurant/logo", headers=owner_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["logo_url"] is None
