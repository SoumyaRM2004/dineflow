"""User model — restaurant staff with role-based access."""

from sqlalchemy import Column, String, Boolean, Enum as SAEnum
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin
from app.core.permissions import UserRole


class User(UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin, Base):
    """A user belongs to a restaurant and has a specific role.

    Roles: OWNER, MANAGER, KITCHEN_STAFF, WAITER.
    Owners and managers use email+password; staff may use PIN.
    """

    __tablename__ = "users"

    # Identity
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)

    # Authentication
    password_hash = Column(String(255), nullable=False)
    pin = Column(String(10), nullable=True)  # For kitchen/waiter staff

    # Role
    role = Column(
        SAEnum(UserRole, name="user_role", create_type=True),
        nullable=False,
        default=UserRole.OWNER,
    )

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="noload")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
