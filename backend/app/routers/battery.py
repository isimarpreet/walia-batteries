from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.battery import BatteryCreate
from app.crud import battery as battery_crud
from app.utils.auth import get_current_user
from app.utils.response import SuccessResponse

router = APIRouter(
    prefix="/batteries",
    tags=["Batteries"]
)


@router.post("/create", response_model=SuccessResponse)
def add_battery_route(
    payload: BatteryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Add a new battery for a customer"""
    return battery_crud.create_battery(
        db=db,
        battery=payload,
        current_user=current_user.data,
    )


@router.get("/customer/{customer_id}", response_model=SuccessResponse)
def get_customer_batteries_route(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get all batteries of a specific customer with details"""
    return battery_crud.get_batteries_by_customer(
        db=db,
        customer_id=customer_id,
        current_user=current_user.data,
    )


@router.get("/all", response_model=SuccessResponse)
def get_all_batteries_route(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    page: int = None,
    page_size: int = None,
):
    """Get all batteries"""
    return battery_crud.get_all_batteries(
        db=db,
        current_user=current_user.data,
        page=page,
        page_size=page_size,
    )


@router.get("/{id:int}", response_model=SuccessResponse)
def get_battery_by_id_route(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get battery details by ID"""
    return battery_crud.get_battery_by_id(
        db=db,
        battery_id=id,
        current_user=current_user.data,
    )
