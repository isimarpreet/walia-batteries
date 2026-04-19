from typing import Any, Optional
from pydantic import BaseModel


class AddedByResponse(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None


class SuccessResponse(BaseModel):
    code: int
    message: str
    data: Any = None
    success: bool = True


class ErrorResponse(BaseModel):
    code: int
    message: str
    success: bool = False
    data: Any = None
