from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional
from datetime import date, datetime


class ClaimBase(BaseModel):
    customer_id: int
    faulty_battery_id: int
    actual_dos: Optional[date] = None
    co_number: Optional[str] = None
    new_battery_model_id: Optional[int] = None
    new_battery_serial_number: Optional[str] = None
    stock_status: str = Field(..., description="new / foc / not_in_stock")
    remarks: Optional[str] = None

    @field_validator("stock_status", mode="before")
    def validate_stock_status(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Stock status must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Stock status is required.")
        valid_statuses = ["new", "foc", "not_in_stock"]
        if val.strip().lower() not in valid_statuses:
            raise PydanticCustomError(
                "custom",
                f"Stock status must be one of: {', '.join(valid_statuses)}"
            )
        return val.strip().lower()


class ClaimCreate(ClaimBase):
    pass


class ClaimResponse(BaseModel):
    id: int
    claim_number: int
    customer_id: int
    faulty_battery_id: int
    actual_dos: Optional[date]
    co_number: Optional[str]
    new_battery_model_id: Optional[int]
    new_battery_serial_number: Optional[str]
    stock_status: str
    remarks: Optional[str]
    status: str
    is_active: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClaimDetailResponse(BaseModel):
    claim: ClaimResponse
    customer: dict
    faulty_battery: dict
    new_battery_model: Optional[dict] = None

    class Config:
        from_attributes = True
