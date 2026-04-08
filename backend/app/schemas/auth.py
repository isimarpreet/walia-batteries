from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")

    @field_validator("email", mode="before")
    def validate_email(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Email must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Email is required.")
        return val.strip()

    @field_validator("password", mode="before")
    def validate_password(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Password must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Password is required.")
        if len(val.strip()) < 6:
            raise PydanticCustomError("custom", "Password must be at least 6 characters.")
        return val.strip()


class LoginResponse(BaseModel):
    user_id: int
    supabase_uid: str
    email: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    user_id: int
    supabase_uid: str
    email: str
    is_active: int  # 0=inactive, 1=active
