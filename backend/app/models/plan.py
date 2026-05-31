"""Plan model — SaaS subscription plans for restaurants."""

from sqlalchemy import Column, String, Boolean, Integer, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Plan(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A subscription plan defines features and limits for a restaurant.

    Plans are managed by the platform admin, not individual restaurants.
    """

    __tablename__ = "plans"

    # Identity
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)

    # Pricing (NUMERIC for currency accuracy)
    monthly_price = Column(Numeric(10, 2), nullable=False, default=0)
    annual_price = Column(Numeric(10, 2), nullable=False, default=0)

    # Limits
    max_tables = Column(Integer, nullable=False, default=10)
    max_staff = Column(Integer, nullable=False, default=5)

    # Feature flags
    has_analytics = Column(Boolean, default=False, nullable=False)
    has_feedback = Column(Boolean, default=True, nullable=False)
    has_payments = Column(Boolean, default=False, nullable=False)

    # Flexible feature storage for future additions
    features = Column(JSONB, nullable=True, default=dict)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    subscriptions = relationship("Subscription", back_populates="plan", lazy="noload")

    def __repr__(self) -> str:
        return f"<Plan(id={self.id}, name='{self.name}', monthly={self.monthly_price})>"
