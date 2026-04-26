from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.claim import ClaimCreate, ClaimStatusUpdate
from app.crud import claim as claim_crud
from app.utils.auth import get_current_user
from app.utils.response import SuccessResponse

router = APIRouter(
    prefix="/claims",
    tags=["Claims"]
)


@router.post("/create", response_model=SuccessResponse)
def create_claim_route(
    payload: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new warranty claim"""
    return claim_crud.create_claim(
        db=db,
        claim=payload,
        current_user=current_user.data,
    )


@router.get("/all", response_model=SuccessResponse)
def get_all_claims_route(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    page: int = None,
    page_size: int = None,
    status: str = None,
):
    """Get all claims with optional filters"""
    return claim_crud.get_all_claims(
        db=db,
        current_user=current_user.data,
        page=page,
        page_size=page_size,
        status=status,
    )


@router.get("/search", response_model=SuccessResponse)
def search_claims_by_phone_route(
    phone: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get claims for a customer found by phone number"""
    return claim_crud.get_claims_by_phone(
        db=db,
        phone=phone,
        current_user=current_user.data,
    )


@router.patch("/{id:int}/status", response_model=SuccessResponse)
def update_claim_status_route(
    id: int,
    payload: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update claim status (pending / resolved / rejected)"""
    return claim_crud.update_claim_status(
        db=db,
        claim_id=id,
        status_update=payload,
        current_user=current_user.data,
    )


@router.get("/customer/{customer_id}", response_model=SuccessResponse)
def get_customer_claims_route(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get all claims for a specific customer"""
    return claim_crud.get_claims_by_customer(
        db=db,
        customer_id=customer_id,
        current_user=current_user.data,
    )


@router.get("/{id:int}", response_model=SuccessResponse)
def get_claim_by_id_route(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get claim details by ID"""
    return claim_crud.get_claim_by_id(
        db=db,
        claim_id=id,
        current_user=current_user.data,
    )
