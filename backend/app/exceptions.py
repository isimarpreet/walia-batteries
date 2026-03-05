from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError as PydanticValidationError
from pydantic_core import ValidationError as PydanticCoreValidationError
from typing import Union

from app.utils import response as resp_func
from app.utils import ErrorResponse

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
}


async def validation_exception_handler(
    request,
    exc: Union[RequestValidationError, PydanticValidationError, PydanticCoreValidationError],
):
    errors = exc.errors()
    error_response = errors[0]

    if error_response["type"] == "custom":
        error_message = error_response["msg"]
    else:
        loc = error_response.get("loc", [])
        field_name = loc[-1] if loc else "Field"
        raw_msg = error_response.get("msg", "is required").lower()

        if raw_msg.lower() == "field required":
            raw_msg = "is required"

        # Build message like: "Email is required"
        error_message = f"{field_name} {raw_msg}"

    error_response = ErrorResponse(
        code=400,
        message=error_message,
    )

    return JSONResponse(content=error_response.model_dump())


async def generic_exception_handler(request: Request, exc: Exception):
    error_response = ErrorResponse(
        code=500,
        message="An internal server error occurred.",
    )
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump(),
        headers=CORS_HEADERS
    )


async def custom_http_exception_handler(request, exc: StarletteHTTPException):
    status_code = exc.status_code

    error_response = ErrorResponse(
        code=exc.status_code,
        message=exc.detail,
    )

    return JSONResponse(status_code=status_code, content=error_response.model_dump())