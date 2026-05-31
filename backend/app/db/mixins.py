"""SQLAlchemy model mixins for common columns."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declared_attr


class TimestampMixin:
    """Adds created_at and updated_at columns to any model."""

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class TenantMixin:
    """Adds restaurant_id foreign key for multi-tenant isolation.

    Every tenant-scoped model should inherit from this mixin.
    All queries MUST filter by restaurant_id.
    """

    @declared_attr
    def restaurant_id(cls):
        return Column(
            UUID(as_uuid=True),
            ForeignKey("restaurants.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )


class SoftDeleteMixin:
    """Adds soft-delete capability via is_active flag."""

    is_active = Column(Boolean, default=True, nullable=False)


class UUIDPrimaryKeyMixin:
    """Adds a UUID primary key column."""

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
