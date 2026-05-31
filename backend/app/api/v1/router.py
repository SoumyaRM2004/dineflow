"""V1 API router — aggregates all module routers under /api/v1."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router

# Aggregate v1 router
router = APIRouter(prefix="/api/v1")

# Module routers
router.include_router(auth_router)

# Future module routers will be added here:
# router.include_router(restaurants_router)
# router.include_router(tables_router)
# router.include_router(menu_router)
# router.include_router(orders_router)
# router.include_router(billing_router)
# router.include_router(payments_router)
# router.include_router(feedback_router)
# router.include_router(analytics_router)
# router.include_router(qr_codes_router)
# router.include_router(service_requests_router)
# router.include_router(staff_router)
# router.include_router(public_router)
