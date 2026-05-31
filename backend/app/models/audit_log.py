"""AuditLog model — tracks administrative actions for compliance."""

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin


class AuditLog(UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin, Base):
    """Records who did what to which entity and when.

    Used for administrative tracking, debugging, and compliance.
    old_values and new_values store JSONB snapshots of the changed data.
    """

    __tablename__ = "audit_logs"

    # Who
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # What
    action = Column(String(50), nullable=False)  # e.g., "CREATE", "UPDATE", "DELETE"
    entity_type = Column(String(100), nullable=False, index=True)  # e.g., "order", "menu_item"
    entity_id = Column(UUID(as_uuid=True), nullable=True)

    # Change data
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)

    # Context
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6

    # Relationships
    restaurant = relationship("Restaurant", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return (
            f"<AuditLog(id={self.id}, action='{self.action}', "
            f"entity='{self.entity_type}:{self.entity_id}')>"
        )
