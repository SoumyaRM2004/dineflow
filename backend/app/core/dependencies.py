"""FastAPI dependencies for auth, DB sessions, and tenant context."""

from uuid import UUID

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.core.permissions import UserRole
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repo import UserRepository

# HTTP Bearer scheme for JWT
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate JWT, return the authenticated User.

    Raises CredentialsException if token is missing, expired, or invalid.
    """
    if credentials is None:
        raise CredentialsException("Authorization header missing")

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError:
        raise CredentialsException("Invalid or expired token")

    if payload.get("type") != "access":
        raise CredentialsException("Invalid token type")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise CredentialsException("Token missing subject")

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise CredentialsException("Invalid user ID in token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)

    if user is None:
        raise CredentialsException("User not found")
    if not user.is_active:
        raise CredentialsException("User account is disabled")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Alias for get_current_user that also checks is_active (redundant but explicit)."""
    if not current_user.is_active:
        raise CredentialsException("User account is disabled")
    return current_user


def require_roles(*roles: UserRole):
    """Factory that creates a dependency checking if user has one of the given roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles(UserRole.OWNER))])
        async def admin_endpoint(): ...
    """
    async def _check_role(user: User = Depends(get_current_user)) -> User:
        if user.role not in [r.value for r in roles]:
            raise PermissionDeniedException(
                f"Requires one of: {[r.value for r in roles]}"
            )
        return user
    return _check_role


# Convenience dependencies for common role combinations
get_owner = require_roles(UserRole.OWNER)
get_owner_or_manager = require_roles(UserRole.OWNER, UserRole.MANAGER)
get_any_staff = require_roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN_STAFF)
