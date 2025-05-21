from fastapi.responses import ORJSONResponse
from fastapi import Request, status
from mysql.connector.errors import DatabaseError, Error

from middleware import logger


def handle_mysql_error(request: Request, exc: Error) -> ORJSONResponse:
    logger.error(
        "MySQL database error during request %s %s: %s",
        request.method,
        request.url,
        str(exc),
        exc_info=exc
    )
    return ORJSONResponse(
        status_code=500,
        content={
            "error": type(exc).__name__,
            "message": "A database error occurred. Please try again later."
        }
    )


def handle_unexpected_error(request: Request, exc: Exception) -> ORJSONResponse:
    logger.error(
        "Unexpected error occurred during request %s %s: %s",
        request.method,
        request.url,
        str(exc),
        exc_info=exc
    )
    return ORJSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": type(exc).__name__,
            "message": "Internal server error. Please try again later."
        }
    )
