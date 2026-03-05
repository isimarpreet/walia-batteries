# Define or import the `response` object here
from pydantic import BaseModel
from typing import Any, Optional

# Add this class definition
class ErrorResponse(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None

def response(status_code: int, message: str, data=None):
    """
    Utility function to create a consistent response structure.
    """
    return {
        "status_code": status_code,
        "message": message,
        "data": data,
    }
