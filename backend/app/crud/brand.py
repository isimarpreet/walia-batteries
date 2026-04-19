from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import BatteryBrand
from app.schemas.brand import BrandCreate, BrandResponse
from app.utils.response import SuccessResponse, ErrorResponse


def create_brand(*, db: Session, brand: BrandCreate, current_user: dict):
    """Create a new battery brand"""
    # Check if brand already exists
    existing_brand = db.query(BatteryBrand).filter(
        func.lower(BatteryBrand.name) == brand.name.lower()
    ).first()
    
    if existing_brand:
        return ErrorResponse(
            code=400,
            message=f"Brand with name '{brand.name}' already exists.",
        )
    
    # Create new brand
    db_brand = BatteryBrand(
        name=brand.name,
        is_active=1
    )
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    
    response = BrandResponse.model_validate(db_brand)
    return SuccessResponse(
        code=201,
        message="Brand created successfully.",
        data=response,
    )


def get_all_brands(*, db: Session, current_user: dict, is_active: int = None):
    """Get all battery brands"""
    query = db.query(BatteryBrand)
    
    if is_active is not None:
        query = query.filter(BatteryBrand.is_active == is_active)
    
    brands = query.order_by(BatteryBrand.name.asc()).all()
    response = [BrandResponse.model_validate(b) for b in brands]
    
    return SuccessResponse(
        code=200,
        message="Brands fetched successfully.",
        data=response,
    )


def get_brand_by_id(*, db: Session, brand_id: int, current_user: dict):
    """Get brand by ID"""
    brand = db.query(BatteryBrand).filter(BatteryBrand.id == brand_id).first()
    
    if not brand:
        return ErrorResponse(
            code=404,
            message="Brand not found.",
        )
    
    response = BrandResponse.model_validate(brand)
    return SuccessResponse(
        code=200,
        message="Brand fetched successfully.",
        data=response,
    )
