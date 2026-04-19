from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.brand import BrandCreate
from app.crud import brand as brand_crud
from app.utils.auth import get_current_user
from app.utils.response import SuccessResponse

router = APIRouter(
    prefix="/brands",
    tags=["Battery Brands"]
)


@router.post("/create", response_model=SuccessResponse)
def create_brand_route(
    payload: BrandCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new battery brand"""
    return brand_crud.create_brand(
        db=db,
        brand=payload,
        current_user=current_user.data,
    )


@router.get("/all", response_model=SuccessResponse)
def get_all_brands_route(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    is_active: int = None,
):
    """Get all battery brands"""
    return brand_crud.get_all_brands(
        db=db,
        current_user=current_user.data,
        is_active=is_active,
    )


@router.get("/{id:int}", response_model=SuccessResponse)
def get_brand_by_id_route(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get brand by ID"""
    return brand_crud.get_brand_by_id(
        db=db,
        brand_id=id,
        current_user=current_user.data,
    )
