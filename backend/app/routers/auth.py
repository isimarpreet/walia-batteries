from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.auth import LoginRequest
from app.utils.auth import authenticate_user, get_current_user
from app.utils.response import SuccessResponse, ErrorResponse
from app.models.models import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=SuccessResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """Login with email and password to get JWT token"""
    email = request.email.strip()
    password = request.password.strip()
    
    # Authenticate with Supabase
    auth_response = authenticate_user(email=email, password=password)
    
    if not auth_response.success:
        return auth_response
    
    auth_data = auth_response.data
    supabase_user = auth_data["user"]
    session = auth_data["session"]
    
    # Get user from local database
    local_user = db.query(User).filter(
        User.supabase_uid == supabase_user.id
    ).first()
    
    if not local_user:
        return ErrorResponse(
            code=404,
            message="User not found in database"
        )
    
    if not local_user.is_active == 1:
        return ErrorResponse(
            code=403,
            message="User account is inactive"
        )
    
    # Return login response with tokens
    return SuccessResponse(
        code=200,
        message="Login successful",
        data={
            "user_id": local_user.id,
            "supabase_uid": local_user.supabase_uid,
            "email": local_user.email,
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "token_type": "bearer"
        }
    )


@router.get("/me", response_model=SuccessResponse)
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get current authenticated user information"""
    user_data = current_user.data
    
    # Fetch full user details from database
    local_user = db.query(User).filter(
        User.id == user_data["user_id"]
    ).first()
    
    if not local_user:
        return ErrorResponse(
            code=404,
            message="User not found"
        )
    
    return SuccessResponse(
        code=200,
        message="User information retrieved successfully",
        data={
            "user_id": local_user.id,
            "supabase_uid": local_user.supabase_uid,
            "email": local_user.email,
            "is_active": local_user.is_active,
            "created_at": local_user.created_at,
        }
    )


@router.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    """Protected route example"""
    return current_user
