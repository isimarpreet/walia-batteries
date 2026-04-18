from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional
from datetime import datetime


class BrandBase(BaseModel):
    name: str = Field(..., description="Brand name")

    @field_validator("name", mode="before")
    def validate_name(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Brand name must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Brand name is required.")
        return val.strip()


class BrandCreate(BrandBase):
    pass


class BrandResponse(BaseModel):
    id: int
    name: str
    is_active: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
