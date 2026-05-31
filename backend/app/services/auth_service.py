"""Authentication service — business logic for registration, login, and token management."""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import JWTError
from slugify import slugify
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    CredentialsException,
    NotFoundException,
)
from app.core.permissions import UserRole
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.plan import Plan
from app.models.restaurant import Restaurant
from app.models.subscription import BillingCycle, Subscription, SubscriptionStatus
from app.models.user import User
from app.repositories.restaurant_repo import RestaurantRepository
from app.repositories.user_repo import UserRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    AccessTokenResponse,
    UserResponse,
)


class AuthService:
    """Handles all authentication and registration business logic.

    Flow: Router → AuthService → UserRepository / RestaurantRepository
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.restaurant_repo = RestaurantRepository(db)

    async def register(self, data: RegisterRequest) -> TokenResponse:
        """Register a new restaurant owner.

        Creates:
        1. Restaurant with auto-generated slug
        2. Owner user account
        3. Free-tier subscription (if a free plan exists)

        Returns JWT token pair for immediate login.
        """
        # Check email uniqueness
        if await self.user_repo.email_exists(data.email):
            raise ConflictException("An account with this email already exists")

        # Generate unique slug from restaurant name
        base_slug = slugify(data.restaurant_name)
        slug = base_slug
        counter = 1
        while await self.restaurant_repo.slug_exists(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Create restaurant
        restaurant = Restaurant(
            name=data.restaurant_name,
            slug=slug,
            email=data.email,
        )
        restaurant = await self.restaurant_repo.create(restaurant)

        # Create owner user
        user = User(
            email=data.email.lower(),
            full_name=data.full_name,
            password_hash=hash_password(data.password),
            role=UserRole.OWNER,
            restaurant_id=restaurant.id,
        )
        user = await self.user_repo.create(user)

        # Attempt to assign a free plan subscription
        await self._create_default_subscription(restaurant.id)

        # Generate tokens
        access_token = create_access_token(
            user_id=user.id,
            restaurant_id=restaurant.id,
            role=user.role.value if isinstance(user.role, UserRole) else user.role,
        )
        refresh_token = create_refresh_token(user_id=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        """Authenticate user with email and password.

        Returns JWT token pair on success.
        """
        user = await self.user_repo.get_by_email(data.email.lower())
        if user is None:
            raise CredentialsException("Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            raise CredentialsException("Invalid email or password")

        if not user.is_active:
            raise CredentialsException("Account is disabled")

        access_token = create_access_token(
            user_id=user.id,
            restaurant_id=user.restaurant_id,
            role=user.role.value if isinstance(user.role, UserRole) else user.role,
        )
        refresh_token = create_refresh_token(user_id=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh_token(self, refresh_token_str: str) -> AccessTokenResponse:
        """Generate a new access token from a valid refresh token."""
        try:
            payload = decode_token(refresh_token_str)
        except JWTError:
            raise CredentialsException("Invalid or expired refresh token")

        if payload.get("type") != "refresh":
            raise CredentialsException("Invalid token type")

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise CredentialsException("Token missing subject")

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise CredentialsException("Invalid user ID in token")

        user = await self.user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            raise CredentialsException("User not found or disabled")

        access_token = create_access_token(
            user_id=user.id,
            restaurant_id=user.restaurant_id,
            role=user.role.value if isinstance(user.role, UserRole) else user.role,
        )

        return AccessTokenResponse(access_token=access_token)

    async def get_user_profile(self, user: User) -> UserResponse:
        """Return the authenticated user's profile."""
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role.value if isinstance(user.role, UserRole) else user.role,
            restaurant_id=str(user.restaurant_id),
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else "",
        )

    async def forgot_password(self, email: str) -> str:
        """Generate a password reset token.

        In production, this would send an email. For MVP, returns the token directly.
        """
        user = await self.user_repo.get_by_email(email.lower())
        if user is None:
            # Don't reveal whether email exists — return success either way
            return "If an account with that email exists, a reset link has been sent."

        token = create_password_reset_token(user.id)
        # TODO: Send email with reset link containing token
        # For development, we'll log the token
        return "If an account with that email exists, a reset link has been sent."

    async def reset_password(self, token: str, new_password: str) -> None:
        """Reset password using a valid reset token."""
        try:
            payload = decode_token(token)
        except JWTError:
            raise BadRequestException("Invalid or expired reset token")

        if payload.get("type") != "password_reset":
            raise BadRequestException("Invalid token type")

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise BadRequestException("Invalid reset token")

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise BadRequestException("Invalid reset token")

        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundException("User")

        await self.user_repo.update_by_id(
            user_id,
            password_hash=hash_password(new_password),
        )

    async def _create_default_subscription(self, restaurant_id: UUID) -> None:
        """Create a free-tier subscription for a newly registered restaurant.

        Looks for an active plan with slug 'free'. If none exists, skips.
        """
        from sqlalchemy import select

        result = await self.db.execute(
            select(Plan).where(Plan.slug == "free", Plan.is_active == True)
        )
        free_plan = result.scalar_one_or_none()

        if free_plan is None:
            return  # No free plan configured — skip subscription creation

        now = datetime.now(timezone.utc)
        subscription = Subscription(
            restaurant_id=restaurant_id,
            plan_id=free_plan.id,
            status=SubscriptionStatus.ACTIVE,
            billing_cycle=BillingCycle.MONTHLY,
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
        )
        self.db.add(subscription)
        await self.db.flush()
