"""Pytest configuration and fixtures for database and API testing."""

import asyncio
import sys
from typing import AsyncGenerator, Generator

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.core.security import create_access_token
from app.core.permissions import UserRole
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.restaurant import Restaurant
from app.models.user import User
from app.core.security import hash_password

# Use a test database URL or use the development database with isolation
db_parts = settings.DATABASE_URL.rsplit("/", 1)
TEST_DATABASE_URL = f"{db_parts[0]}/dineflow_test"

@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Create database tables before tests."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Fixture that returns a clean database session for each test, rolling back changes."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        yield session
        await session.rollback()
        await session.close()
    await engine.dispose()


@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Fixture that returns a HTTPX AsyncClient with overridden database session."""
    async def _get_test_db():
        yield db

    app.dependency_overrides[get_db] = _get_test_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def test_restaurant(db: AsyncSession) -> Restaurant:
    """Fixture to create a test restaurant in the database."""
    restaurant = Restaurant(
        name="Test Kitchen",
        slug="test-kitchen",
        address="123 Test Street",
        phone="+919999999999",
        email="test@kitchen.com",
        timezone="Asia/Kolkata",
        currency="INR",
    )
    db.add(restaurant)
    await db.flush()
    await db.refresh(restaurant)
    return restaurant


@pytest.fixture
async def test_owner(db: AsyncSession, test_restaurant: Restaurant) -> User:
    """Fixture to create a test user with OWNER role."""
    user = User(
        email="owner@test.com",
        password_hash=hash_password("TestPassword123!"),
        full_name="John Owner",
        role=UserRole.OWNER.value,
        restaurant_id=test_restaurant.id,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@pytest.fixture
async def test_manager(db: AsyncSession, test_restaurant: Restaurant) -> User:
    """Fixture to create a test user with MANAGER role."""
    user = User(
        email="manager@test.com",
        password_hash=hash_password("TestPassword123!"),
        full_name="Jane Manager",
        role=UserRole.MANAGER.value,
        restaurant_id=test_restaurant.id,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@pytest.fixture
def owner_headers(test_owner: User) -> dict[str, str]:
    """Generate auth headers for owner."""
    token = create_access_token(
        user_id=test_owner.id,
        restaurant_id=test_owner.restaurant_id,
        role=test_owner.role
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def manager_headers(test_manager: User) -> dict[str, str]:
    """Generate auth headers for manager."""
    token = create_access_token(
        user_id=test_manager.id,
        restaurant_id=test_manager.restaurant_id,
        role=test_manager.role
    )
    return {"Authorization": f"Bearer {token}"}
