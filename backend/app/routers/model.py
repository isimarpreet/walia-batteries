from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.model import ModelCreate
from app.crud import model as model_crud
from app.utils.auth import get_current_user
from app.utils.response import SuccessResponse

router = APIRouter(
    prefix="/models",
    tags=["Battery Models"]
)


@router.post("/create", response_model=SuccessResponse)
def create_model_route(
    payload: ModelCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new battery model"""
    return model_crud.create_model(
        db=db,
        model=payload,
        current_user=current_user.data,
    )


@router.get("/all", response_model=SuccessResponse)
def get_all_models_route(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    brand_id: int = None,
    is_active: int = None,
):
    """Get all battery models, optionally filtered by brand"""
    return model_crud.get_all_models(
        db=db,
        current_user=current_user.data,
        brand_id=brand_id,
        is_active=is_active,
    )


@router.get("/{id:int}", response_model=SuccessResponse)
def get_model_by_id_route(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get model by ID"""
    return model_crud.get_model_by_id(
        db=db,
        model_id=id,
        current_user=current_user.data,
    )
