from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional
from datetime import datetime


class ModelBase(BaseModel):
    brand_id: int
    model_name: str = Field(..., description="Model name")
    warranty_months: Optional[int] = None

    @field_validator("model_name", mode="before")
    def validate_model_name(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Model name must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Model name is required.")
        return val.strip()


class ModelCreate(ModelBase):
    pass


class ModelResponse(BaseModel):
    id: int
    brand_id: int
    model_name: str
    warranty_months: Optional[int]
    is_active: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
