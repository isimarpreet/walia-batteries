from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Claim, Customer, Battery, BatteryBrand, BatteryModel
from app.schemas.claim import ClaimCreate, ClaimResponse, ClaimStatusUpdate
from app.utils.response import SuccessResponse, ErrorResponse
import random


def generate_claim_number(db: Session):
    """Generate unique 8-digit claim number"""
    max_attempts = 10
    for _ in range(max_attempts):
        claim_num = random.randint(10000000, 99999999)
        existing = db.query(Claim).filter(Claim.claim_number == claim_num).first()
        if not existing:
            return claim_num
    # Fallback: use max + 1
    max_claim = db.query(func.max(Claim.claim_number)).scalar()
    return (max_claim or 10000000) + 1


def create_claim(*, db: Session, claim: ClaimCreate, current_user: dict):
    """Create a new warranty claim"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == claim.customer_id).first()
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
        )
    
    # Verify faulty battery exists and belongs to customer
    faulty_battery = db.query(Battery).filter(
        Battery.id == claim.faulty_battery_id,
        Battery.customer_id == claim.customer_id
    ).first()
    if not faulty_battery:
        return ErrorResponse(
            code=404,
            message="Battery not found or does not belong to this customer.",
        )
    
    # If new battery model is provided, verify it exists
    if claim.new_battery_model_id:
        new_model = db.query(BatteryModel).filter(
            BatteryModel.id == claim.new_battery_model_id
        ).first()
        if not new_model:
            return ErrorResponse(
                code=404,
                message="New battery model not found.",
            )
    
    # Generate unique claim number
    claim_number = generate_claim_number(db)
    
    # Create claim
    db_claim = Claim(
        claim_number=claim_number,
        customer_id=claim.customer_id,
        faulty_battery_id=claim.faulty_battery_id,
        actual_dos=claim.actual_dos,
        co_number=claim.co_number,
        new_battery_model_id=claim.new_battery_model_id,
        new_battery_serial_number=claim.new_battery_serial_number,
        stock_status=claim.stock_status,
        remarks=claim.remarks,
        status="pending",
        is_active=1
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    
    response = ClaimResponse.model_validate(db_claim)
    return SuccessResponse(
        code=201,
        message="Claim created successfully.",
        data=response,
    )


def get_all_claims(
    *,
    db: Session,
    current_user: dict,
    page: int = None,
    page_size: int = None,
    status: str = None,
):
    """Get all claims with pagination and optional status filter"""
    claim_query = db.query(Claim).filter(Claim.is_active == 1)
    
    if status:
        claim_query = claim_query.filter(Claim.status == status)
    
    total_count = db.query(Claim).filter(Claim.is_active == 1).count()
    total_records = claim_query.count()
    
    if page is not None and page_size is not None:
        total_pages = (total_records + page_size - 1) // page_size
        offset = (page - 1) * page_size
        claims = (
            claim_query.order_by(Claim.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
    else:
        claims = claim_query.order_by(Claim.created_at.desc()).all()
        total_pages = 1
        page = 1
        page_size = total_records
    
    # Fetch related data in bulk
    customer_ids = list({c.customer_id for c in claims})
    battery_ids = list({c.faulty_battery_id for c in claims})
    model_ids = list({c.new_battery_model_id for c in claims if c.new_battery_model_id})
    
    customers = db.query(Customer).filter(Customer.id.in_(customer_ids)).all()
    batteries = db.query(Battery).filter(Battery.id.in_(battery_ids)).all()
    models = db.query(BatteryModel).filter(BatteryModel.id.in_(model_ids)).all() if model_ids else []
    
    customers_map = {c.id: c for c in customers}
    batteries_map = {b.id: b for b in batteries}
    models_map = {m.id: m for m in models}
    
    result = []
    for claim in claims:
        customer = customers_map.get(claim.customer_id)
        battery = batteries_map.get(claim.faulty_battery_id)
        new_model = models_map.get(claim.new_battery_model_id) if claim.new_battery_model_id else None
        
        result.append({
            "claim": ClaimResponse.model_validate(claim),
            "customer_name": customer.name if customer else None,
            "customer_phone": customer.phone if customer else None,
            "battery_serial": battery.serial_number if battery else None,
            "new_model_name": new_model.model_name if new_model else None,
        })
    
    return SuccessResponse(
        code=200,
        message="Claims fetched successfully.",
        data={
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_records": total_records,
            "total_pages": total_pages,
            "claims": result,
        },
    )


def get_claim_by_id(*, db: Session, claim_id: int, current_user: dict):
    """Get claim details by ID with full related information"""
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.is_active == 1
    ).first()
    
    if not claim:
        return ErrorResponse(
            code=404,
            message="Claim not found.",
        )
    
    # Fetch related data
    customer = db.query(Customer).filter(Customer.id == claim.customer_id).first()
    faulty_battery = db.query(Battery).filter(Battery.id == claim.faulty_battery_id).first()
    
    # Get brand and model for faulty battery
    faulty_brand = None
    faulty_model = None
    if faulty_battery:
        faulty_brand = db.query(BatteryBrand).filter(
            BatteryBrand.id == faulty_battery.brand_id
        ).first()
        faulty_model = db.query(BatteryModel).filter(
            BatteryModel.id == faulty_battery.model_id
        ).first()
    
    # Get new battery model if exists
    new_battery_model = None
    new_battery_brand = None
    if claim.new_battery_model_id:
        new_battery_model = db.query(BatteryModel).filter(
            BatteryModel.id == claim.new_battery_model_id
        ).first()
        if new_battery_model:
            new_battery_brand = db.query(BatteryBrand).filter(
                BatteryBrand.id == new_battery_model.brand_id
            ).first()
    
    return SuccessResponse(
        code=200,
        message="Claim fetched successfully.",
        data={
            "claim": ClaimResponse.model_validate(claim),
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "email": customer.email,
                "address": customer.address,
            } if customer else None,
            "faulty_battery": {
                "id": faulty_battery.id,
                "serial_number": faulty_battery.serial_number,
                "date_of_sale": faulty_battery.date_of_sale,
                "invoice_number": faulty_battery.invoice_number,
                "brand_name": faulty_brand.name if faulty_brand else None,
                "model_name": faulty_model.model_name if faulty_model else None,
                "warranty_months": faulty_model.warranty_months if faulty_model else None,
            } if faulty_battery else None,
            "new_battery": {
                "model_id": new_battery_model.id if new_battery_model else None,
                "model_name": new_battery_model.model_name if new_battery_model else None,
                "brand_name": new_battery_brand.name if new_battery_brand else None,
                "serial_number": claim.new_battery_serial_number,
            } if new_battery_model else None,
        },
    )


def update_claim_status(*, db: Session, claim_id: int, status_update: ClaimStatusUpdate, current_user: dict):
    """Update claim status"""
    claim = db.query(Claim).filter(Claim.id == claim_id, Claim.is_active == 1).first()
    if not claim:
        return ErrorResponse(
            code=404,
            message="Claim not found.",
        )

    claim.status = status_update.status
    db.commit()
    db.refresh(claim)

    return SuccessResponse(
        code=200,
        message="Claim status updated successfully.",
        data=ClaimResponse.model_validate(claim),
    )


def get_claims_by_phone(*, db: Session, phone: str, current_user: dict):
    """Get all claims for a customer found by phone number"""
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
        )

    claims = db.query(Claim).filter(
        Claim.customer_id == customer.id,
        Claim.is_active == 1
    ).order_by(Claim.created_at.desc()).all()

    battery_ids = list({c.faulty_battery_id for c in claims})
    model_ids = list({c.new_battery_model_id for c in claims if c.new_battery_model_id})

    batteries = db.query(Battery).filter(Battery.id.in_(battery_ids)).all() if battery_ids else []
    models = db.query(BatteryModel).filter(BatteryModel.id.in_(model_ids)).all() if model_ids else []

    batteries_map = {b.id: b for b in batteries}
    models_map = {m.id: m for m in models}

    result = []
    for claim in claims:
        battery = batteries_map.get(claim.faulty_battery_id)
        new_model = models_map.get(claim.new_battery_model_id) if claim.new_battery_model_id else None
        result.append({
            "claim": ClaimResponse.model_validate(claim),
            "customer_name": customer.name,
            "customer_phone": customer.phone,
            "battery_serial": battery.serial_number if battery else None,
            "new_model_name": new_model.model_name if new_model else None,
        })

    return SuccessResponse(
        code=200,
        message="Claims fetched successfully.",
        data={
            "customer": {"id": customer.id, "name": customer.name, "phone": customer.phone},
            "claims": result,
        },
    )


def get_claims_by_customer(*, db: Session, customer_id: int, current_user: dict):
    """Get all claims for a specific customer"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
        )
    
    claims = db.query(Claim).filter(
        Claim.customer_id == customer_id,
        Claim.is_active == 1
    ).order_by(Claim.created_at.desc()).all()
    
    result = [ClaimResponse.model_validate(c) for c in claims]
    
    return SuccessResponse(
        code=200,
        message="Customer claims fetched successfully.",
        data=result,
    )
