from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_KEY
from app.utils.response import SuccessResponse, ErrorResponse
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models.models import User


security = HTTPBearer()


def get_supabase_client():
    """Returns a new Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def register_user_in_supabase(email: str, password: str):
    """Register a new user in Supabase Auth (for admin users only)"""
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
            }
        )
        
        if not auth_response.user:
            return ErrorResponse(code=400, message="User creation failed")
        
        return SuccessResponse(
            code=201,
            message="User created successfully",
            data={"user_id": auth_response.user.id}
        )
    except Exception as e:
        return ErrorResponse(code=400, message=str(e))


def authenticate_user(email: str, password: str):
    """Authenticate user with Supabase and return session"""
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if not auth_response.user:
            return ErrorResponse(
                code=401,
                message="Invalid email or password"
            )
        
        return SuccessResponse(
            code=200,
            message="Authentication successful",
            data={
                "user": auth_response.user,
                "session": auth_response.session
            }
        )
    except Exception as e:
        return ErrorResponse(
            code=401,
            message="Invalid email or password"
        )


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify the JWT token from Supabase"""
    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(credentials.credentials)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


def get_current_user(user = Depends(verify_token), db: Session = Depends(lambda: None)):
    """Get current authenticated user from local database"""
    # Get user from local database using supabase_uid
    if db:
        local_user = db.query(User).filter(User.supabase_uid == user.user.id).first()
        if not local_user or local_user.is_active != 1:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        
        return SuccessResponse(
            code=200,
            message="User authenticated",
            data={
                "user_id": local_user.id,
                "supabase_uid": local_user.supabase_uid,
                "email": local_user.email,
                "is_active": local_user.is_active,
            }
        )
    
    # Fallback if no db session
    return SuccessResponse(
        code=200,
        message="User authenticated",
        data={
            "supabase_uid": user.user.id,
            "email": user.user.email,
        }
    )
