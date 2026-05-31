"""Restaurant model — the primary tenant entity in DineFlow."""

from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Restaurant(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A restaurant is the primary tenant in the system.

    Every restaurant has its own users, tables, menu, orders, etc.
    All tenant-scoped data references restaurant_id.
    """

    __tablename__ = "restaurants"

    # Core identity
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)

    # Branding
    logo_url = Column(String(500), nullable=True)

    # Contact & location
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)

    # Business details
    tax_details = Column(JSONB, nullable=True, default=dict)
    timezone = Column(String(50), default="Asia/Kolkata", nullable=False)
    currency = Column(String(3), default="INR", nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    users = relationship("User", back_populates="restaurant", lazy="selectin")
    subscription = relationship(
        "Subscription",
        back_populates="restaurant",
        uselist=False,
        lazy="selectin",
    )
    audit_logs = relationship("AuditLog", back_populates="restaurant", lazy="noload")

    def __repr__(self) -> str:
        return f"<Restaurant(id={self.id}, name='{self.name}', slug='{self.slug}')>"
