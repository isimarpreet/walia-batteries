from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import BatteryModel, BatteryBrand
from app.schemas.model import ModelCreate, ModelResponse
from app.utils.response import SuccessResponse, ErrorResponse


def create_model(*, db: Session, model: ModelCreate, current_user: dict):
    """Create a new battery model"""
    # Verify brand exists
    brand = db.query(BatteryBrand).filter(BatteryBrand.id == model.brand_id).first()
    if not brand:
        return ErrorResponse(
            code=404,
            message="Brand not found.",
        )
    
    # Check if model already exists for this brand
    existing_model = db.query(BatteryModel).filter(
        BatteryModel.brand_id == model.brand_id,
        func.lower(BatteryModel.model_name) == model.model_name.lower()
    ).first()
    
    if existing_model:
        return ErrorResponse(
            code=400,
            message=f"Model '{model.model_name}' already exists for this brand.",
        )
    
    # Create new model
    db_model = BatteryModel(
        brand_id=model.brand_id,
        model_name=model.model_name,
        warranty_months=model.warranty_months,
        is_active=1
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    response = ModelResponse.model_validate(db_model)
    return SuccessResponse(
        code=201,
        message="Model created successfully.",
        data=response,
    )


def get_all_models(*, db: Session, current_user: dict, brand_id: int = None, is_active: int = None):
    """Get all battery models, optionally filtered by brand"""
    query = db.query(BatteryModel)
    
    if brand_id is not None:
        query = query.filter(BatteryModel.brand_id == brand_id)
    
    if is_active is not None:
        query = query.filter(BatteryModel.is_active == is_active)
    
    models = query.order_by(BatteryModel.model_name.asc()).all()
    response = [ModelResponse.model_validate(m) for m in models]
    
    return SuccessResponse(
        code=200,
        message="Models fetched successfully.",
        data=response,
    )


def get_model_by_id(*, db: Session, model_id: int, current_user: dict):
    """Get model by ID"""
    model = db.query(BatteryModel).filter(BatteryModel.id == model_id).first()
    
    if not model:
        return ErrorResponse(
            code=404,
            message="Model not found.",
        )
    
    response = ModelResponse.model_validate(model)
    return SuccessResponse(
        code=200,
        message="Model fetched successfully.",
        data=response,
    )
