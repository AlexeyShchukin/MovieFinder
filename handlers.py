from fastapi.responses import ORJSONResponse
from fastapi import Request, status
from mysql.connector.errors import DatabaseError, Error

from middleware import logger


def handle_db_error(request: Request, exc: DatabaseError) -> ORJSONResponse:
    logger.error(
        "Database error during request: %s %s",
        request.method,
        request.url,
        exc_info=exc
    )
    return ORJSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error has occurred. Our admins are already working on it."}
    )


async def handle_mysql_error(request: Request, exc: Error) -> ORJSONResponse:
    logger.error(
        "MySQL error: %s %s",
        request.method,
        request.url,
        exc_info=exc
    )
    return ORJSONResponse(
        status_code=500,
        content={"message": "A database error occurred. Please try again later."}
    )


async def handle_unexpected_error(request: Request, exc: Exception) -> ORJSONResponse:
    logger.error("Unexpected error occurred",
                 request.method,
                 request.url,
                 exc_info=exc)
    return ORJSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "Internal server error. Please try again later."}
    )
