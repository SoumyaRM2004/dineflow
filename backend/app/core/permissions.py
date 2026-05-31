"""Role-based access control via FastAPI dependency injection."""

from enum import Enum

from fastapi import Depends

from app.core.exceptions import PermissionDeniedException


class UserRole(str, Enum):
    """User roles within a restaurant."""

    OWNER = "OWNER"
    MANAGER = "MANAGER"
    KITCHEN_STAFF = "KITCHEN_STAFF"
    WAITER = "WAITER"


class RoleChecker:
    """FastAPI dependency that checks if the current user has an allowed role.

    Usage:
        @router.get("/admin")
        def admin_only(user = Depends(RoleChecker([UserRole.OWNER]))):
            ...
    """

    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user=Depends(lambda: None)):
        # The actual dependency resolution happens in dependencies.py
        # This is wired up via get_current_user dependency
        if current_user is None:
            raise PermissionDeniedException()

        if current_user.role not in [r.value for r in self.allowed_roles]:
            raise PermissionDeniedException(
                detail=f"Role '{current_user.role}' is not authorized. "
                f"Required: {[r.value for r in self.allowed_roles]}"
            )
        return current_user


# Pre-built role checkers for common access patterns
require_owner = RoleChecker([UserRole.OWNER])
require_owner_or_manager = RoleChecker([UserRole.OWNER, UserRole.MANAGER])
require_staff = RoleChecker([UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER])
require_kitchen = RoleChecker([UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN_STAFF])
require_any_role = RoleChecker(list(UserRole))
