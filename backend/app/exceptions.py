from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.utils.response import ErrorResponse


async def validation_exception_handler(request, exc: RequestValidationError):
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

    error_resp = ErrorResponse(
        code=400,
        message=error_message,
    )

    return JSONResponse(status_code=400, content=error_resp.model_dump())


async def generic_exception_handler(request, exc: Exception):
    error_resp = ErrorResponse(
        code=500,
        message="An internal server error occurred.",
    )
    return JSONResponse(status_code=500, content=error_resp.model_dump())


async def custom_http_exception_handler(request, exc: StarletteHTTPException):
    status_code = exc.status_code

    error_resp = ErrorResponse(
        code=exc.status_code,
        message=exc.detail,
    )

    return JSONResponse(status_code=status_code, content=error_resp.model_dump())