from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Battery, BatteryBrand, BatteryModel, Customer
from app.schemas.battery import BatteryCreate, BatteryResponse, BatteryBrandResponse, BatteryModelResponse
from app.utils.response import SuccessResponse, ErrorResponse


def create_battery(*, db: Session, battery: BatteryCreate, current_user: dict):
    """Create a new battery"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == battery.customer_id).first()
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
            success=False,
        )
    
    # Verify brand exists
    brand = db.query(BatteryBrand).filter(BatteryBrand.id == battery.brand_id).first()
    if not brand:
        return ErrorResponse(
            code=404,
            message="Battery brand not found.",
            success=False,
        )
    
    # Verify model exists
    model = db.query(BatteryModel).filter(BatteryModel.id == battery.model_id).first()
    if not model:
        return ErrorResponse(
            code=404,
            message="Battery model not found.",
            success=False,
        )
    
    # Check if serial number already exists
    existing_battery = db.query(Battery).filter(
        func.lower(Battery.serial_number) == battery.serial_number.lower()
    ).first()
    if existing_battery:
        return ErrorResponse(
            code=400,
            message=f"Battery with serial number {battery.serial_number} already exists.",
            success=False,
        )
    
    # Create new battery
    db_battery = Battery(
        customer_id=battery.customer_id,
        brand_id=battery.brand_id,
        model_id=battery.model_id,
        serial_number=battery.serial_number,
        date_of_sale=battery.date_of_sale,
        invoice_number=battery.invoice_number
    )
    db.add(db_battery)
    db.commit()
    db.refresh(db_battery)
    
    response = BatteryResponse.model_validate(db_battery)
    return SuccessResponse(
        code=201,
        message="Battery added successfully.",
        data=response,
        success=True,
    )


def get_battery_by_id(*, db: Session, battery_id: int, current_user: dict):
    """Get battery details by ID with brand and model"""
    battery = db.query(Battery).filter(Battery.id == battery_id).first()
    
    if not battery:
        return ErrorResponse(
            code=404,
            message="Battery not found.",
            success=False,
        )
    
    brand = db.query(BatteryBrand).filter(BatteryBrand.id == battery.brand_id).first()
    model = db.query(BatteryModel).filter(BatteryModel.id == battery.model_id).first()
    
    battery_data = BatteryResponse.model_validate(battery)
    brand_data = BatteryBrandResponse.model_validate(brand) if brand else None
    model_data = BatteryModelResponse.model_validate(model) if model else None
    
    return SuccessResponse(
        code=200,
        message="Battery fetched successfully.",
        data={
            "battery": battery_data,
            "brand": brand_data,
            "model": model_data
        },
        success=True,
    )


def get_batteries_by_customer(*, db: Session, customer_id: int, current_user: dict):
    """Get all batteries of a customer with brand and model details"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
            success=False,
        )
    
    batteries = db.query(Battery).filter(Battery.customer_id == customer_id).all()
    
    # Get all brand and model IDs
    brand_ids = list({b.brand_id for b in batteries})
    model_ids = list({b.model_id for b in batteries})
    
    # Fetch brands and models in bulk
    brands = db.query(BatteryBrand).filter(BatteryBrand.id.in_(brand_ids)).all()
    models = db.query(BatteryModel).filter(BatteryModel.id.in_(model_ids)).all()
    
    brands_map = {b.id: b for b in brands}
    models_map = {m.id: m for m in models}
    
    result = []
    for battery in batteries:
        brand = brands_map.get(battery.brand_id)
        model = models_map.get(battery.model_id)
        
        result.append({
            "battery": BatteryResponse.model_validate(battery),
            "brand": BatteryBrandResponse.model_validate(brand) if brand else None,
            "model": BatteryModelResponse.model_validate(model) if model else None
        })
    
    return SuccessResponse(
        code=200,
        message="Batteries fetched successfully.",
        data=result,
        success=True,
    )


def get_all_batteries(
    *,
    db: Session,
    current_user: dict,
    page: int = None,
    page_size: int = None,
):
    """Get all batteries with pagination"""
    battery_query = db.query(Battery)
    total_count = db.query(Battery).count()
    total_records = battery_query.count()
    
    if page is not None and page_size is not None:
        total_pages = (total_records + page_size - 1) // page_size
        offset = (page - 1) * page_size
        batteries = (
            battery_query.order_by(Battery.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
    else:
        batteries = battery_query.order_by(Battery.created_at.desc()).all()
        total_pages = 1
        page = 1
        page_size = total_records
    
    response = [BatteryResponse.model_validate(b) for b in batteries]
    
    return SuccessResponse(
        code=200,
        message="Batteries fetched successfully.",
        data={
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_records": total_records,
            "total_pages": total_pages,
            "batteries": response,
        },
        success=True,
    )
