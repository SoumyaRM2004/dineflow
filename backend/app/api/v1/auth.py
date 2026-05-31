"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new restaurant",
    description="Creates a restaurant and owner account. Returns JWT tokens for immediate access.",
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.register(data)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    description="Authenticates user and returns JWT access + refresh token pair.",
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.login(data)


@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new access token.",
)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.refresh_token(data.refresh_token)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout",
    description="Client-side logout. Invalidate tokens on the client.",
)
async def logout(
    current_user: User = Depends(get_current_user),
):
    # JWT tokens are stateless — logout is handled client-side by discarding tokens.
    # For enhanced security, implement a token blocklist with Redis in production.
    return MessageResponse(message="Successfully logged out")


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset",
    description="Sends a password reset link to the email if it exists.",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    message = await service.forgot_password(data.email)
    return MessageResponse(message=message)


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password with token",
    description="Reset password using the token from the reset email.",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.reset_password(data.token, data.new_password)
    return MessageResponse(message="Password reset successfully")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns the authenticated user's profile information.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.get_user_profile(current_user)
