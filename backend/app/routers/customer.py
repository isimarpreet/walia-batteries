from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.crud import customer as customer_crud
from app.utils.auth import get_current_user
from app.utils.response import SuccessResponse

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("/create", response_model=SuccessResponse)
def create_customer_route(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new customer"""
    return customer_crud.create_customer(
        db=db,
        customer=payload,
        current_user=current_user.data,
    )


@router.get("/search", response_model=SuccessResponse)
def search_customer_by_phone_route(
    phone: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Search customer by phone number"""
    return customer_crud.get_customer_by_phone(
        db=db,
        phone=phone,
        current_user=current_user.data,
    )


@router.get("/all", response_model=SuccessResponse)
def get_all_customers_route(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    page: int = None,
    page_size: int = None,
):
    """Get all customers"""
    return customer_crud.get_all_customers(
        db=db,
        current_user=current_user.data,
        page=page,
        page_size=page_size,
    )


@router.get("/{id:int}", response_model=SuccessResponse)
def get_customer_by_id_route(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get customer by ID"""
    return customer_crud.get_customer_by_id(
        db=db,
        customer_id=id,
        current_user=current_user.data,
    )


@router.put("/{id:int}", response_model=SuccessResponse)
def update_customer_route(
    id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update customer details"""
    return customer_crud.update_customer(
        db=db,
        customer_id=id,
        customer_update=payload,
        current_user=current_user.data,
    )


@router.delete("/{id:int}", response_model=SuccessResponse)
def delete_customer_route(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete customer"""
    return customer_crud.delete_customer(
        db=db,
        customer_id=id,
        current_user=current_user.data,
    )
