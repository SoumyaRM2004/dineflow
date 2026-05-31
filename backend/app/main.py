"""DineFlow — FastAPI Application Entry Point.

This is the main application factory. It configures:
- CORS middleware
- API routers
- Exception handlers
- Startup/shutdown lifecycle events
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import DineFlowException
from app.api.v1.router import router as v1_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle — startup and shutdown hooks."""
    # Startup
    db_host = settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "configured"
    print(f"[DineFlow] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"[DineFlow] Environment: {settings.ENVIRONMENT}")
    print(f"[DineFlow] Database: {db_host}")

    yield

    # Shutdown
    print(f"[DineFlow] Shutting down {settings.APP_NAME}")
    from app.db.base import engine
    await engine.dispose()


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Multi-Tenant SaaS Restaurant Operating System API",
        docs_url="/docs" if settings.DEBUG or settings.ENVIRONMENT == "development" else None,
        redoc_url="/redoc" if settings.DEBUG or settings.ENVIRONMENT == "development" else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler for DineFlowException
    @app.exception_handler(DineFlowException)
    async def dineflow_exception_handler(request: Request, exc: DineFlowException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    # Catch-all for unhandled errors
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        if settings.DEBUG:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": str(exc)},
            )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred"},
        )

    # Include API routers
    app.include_router(v1_router)

    # Health check
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    return app


# Application instance used by uvicorn
app = create_app()
