from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional
from datetime import datetime
from app.utils.response import AddedByResponse


class CustomerBase(BaseModel):
    name: str = Field(..., description="Customer name")
    phone: str = Field(..., description="Customer phone number")
    email: Optional[EmailStr] = None
    address: Optional[str] = None

    @field_validator("name", mode="before")
    def validate_name(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Customer name must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Customer name is required.")
        return val.strip()

    @field_validator("phone", mode="before")
    def validate_phone(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Phone number must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Phone number is required.")
        phone = val.strip()
        if len(phone) < 10:
            raise PydanticCustomError("custom", "Phone number must be at least 10 digits.")
        return phone


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Customer name")
    phone: Optional[str] = Field(None, description="Customer phone number")
    email: Optional[EmailStr] = None
    address: Optional[str] = None

    @field_validator("name", mode="before")
    def validate_name(cls, val):
        if val is not None:
            if not isinstance(val, str):
                raise PydanticCustomError("custom", "Customer name must be a string.")
            if not val.strip():
                raise PydanticCustomError("custom", "Customer name cannot be empty.")
            return val.strip()
        return val

    @field_validator("phone", mode="before")
    def validate_phone(cls, val):
        if val is not None:
            if not isinstance(val, str):
                raise PydanticCustomError("custom", "Phone number must be a string.")
            phone = val.strip()
            if len(phone) < 10:
                raise PydanticCustomError("custom", "Phone number must be at least 10 digits.")
            return phone
        return val


class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
