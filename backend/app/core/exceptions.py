"""Custom HTTP exceptions for consistent API error responses."""

from fastapi import HTTPException, status


class DineFlowException(HTTPException):
    """Base exception for DineFlow application."""

    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class CredentialsException(DineFlowException):
    """Raised when authentication credentials are invalid."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )


class PermissionDeniedException(DineFlowException):
    """Raised when user lacks required permissions."""

    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class NotFoundException(DineFlowException):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str = "Resource", detail: str | None = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail or f"{resource} not found",
        )


class ConflictException(DineFlowException):
    """Raised when a resource already exists or conflicts."""

    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class BadRequestException(DineFlowException):
    """Raised for invalid request data."""

    def __init__(self, detail: str = "Bad request"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
