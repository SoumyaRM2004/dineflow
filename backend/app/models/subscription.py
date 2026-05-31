"""Subscription and SubscriptionInvoice models for SaaS billing."""

from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin


class SubscriptionStatus(str, enum.Enum):
    """Subscription lifecycle states."""

    TRIALING = "TRIALING"
    ACTIVE = "ACTIVE"
    PAST_DUE = "PAST_DUE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class BillingCycle(str, enum.Enum):
    """Billing frequency."""

    MONTHLY = "MONTHLY"
    ANNUAL = "ANNUAL"


class InvoiceStatus(str, enum.Enum):
    """Invoice payment states."""

    DRAFT = "DRAFT"
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    VOID = "VOID"


class Subscription(UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin, Base):
    """A restaurant's active subscription to a plan.

    One active subscription per restaurant (1:1 relationship).
    """

    __tablename__ = "subscriptions"

    # Plan reference
    plan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("plans.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Status
    status = Column(
        SAEnum(SubscriptionStatus, name="subscription_status", create_type=True),
        nullable=False,
        default=SubscriptionStatus.TRIALING,
    )
    billing_cycle = Column(
        SAEnum(BillingCycle, name="billing_cycle", create_type=True),
        nullable=False,
        default=BillingCycle.MONTHLY,
    )

    # Billing period
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")
    invoices = relationship(
        "SubscriptionInvoice", back_populates="subscription", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, status='{self.status}')>"


class SubscriptionInvoice(UUIDPrimaryKeyMixin, TenantMixin, TimestampMixin, Base):
    """A billing invoice for a subscription period."""

    __tablename__ = "subscription_invoices"

    # References
    subscription_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Invoice details
    invoice_number = Column(String(50), unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    # Status
    status = Column(
        SAEnum(InvoiceStatus, name="invoice_status", create_type=True),
        nullable=False,
        default=InvoiceStatus.DRAFT,
    )

    # Dates
    due_date = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    # Payment reference
    payment_reference = Column(String(255), nullable=True)

    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")

    def __repr__(self) -> str:
        return f"<SubscriptionInvoice(id={self.id}, number='{self.invoice_number}')>"
