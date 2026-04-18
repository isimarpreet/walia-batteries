from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional
from datetime import date, datetime


class BatteryBase(BaseModel):
    customer_id: int
    brand_id: int
    model_id: int
    serial_number: str = Field(..., description="Battery serial number")
    date_of_sale: date
    invoice_number: Optional[str] = None

    @field_validator("serial_number", mode="before")
    def validate_serial_number(cls, val):
        if not isinstance(val, str):
            raise PydanticCustomError("custom", "Serial number must be a string.")
        if not val.strip():
            raise PydanticCustomError("custom", "Serial number is required.")
        return val.strip()


class BatteryCreate(BatteryBase):
    pass


class BatteryResponse(BaseModel):
    id: int
    customer_id: int
    brand_id: int
    model_id: int
    serial_number: str
    date_of_sale: date
    invoice_number: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BatteryBrandResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BatteryModelResponse(BaseModel):
    id: int
    brand_id: int
    model_name: str
    warranty_months: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BatteryDetailResponse(BaseModel):
    battery: BatteryResponse
    brand: Optional[BatteryBrandResponse]
    model: Optional[BatteryModelResponse]

    class Config:
        from_attributes = True
