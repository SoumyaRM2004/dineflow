"""Pydantic schemas for authentication requests and responses."""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request body for restaurant owner registration."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    restaurant_name: str = Field(min_length=2, max_length=255)


class LoginRequest(BaseModel):
    """Request body for user login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token pair returned after login or refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessTokenResponse(BaseModel):
    """Single access token returned after refresh."""

    access_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Request body for token refresh."""

    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Request body for initiating password reset."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request body for resetting password with token."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    """Public user profile response."""

    id: str
    email: str
    full_name: str
    role: str
    restaurant_id: str
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str
