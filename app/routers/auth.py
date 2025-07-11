from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserLoginUsername, Token, RegisterResponse, UserResponse
from app.models.user import User
from app.services.auth_service import AuthService
from app.utils.security import create_access_token
from datetime import timedelta
from app.config import settings
from app.utils.dependencies import get_current_user, get_current_user_flexible

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Mendaftarkan pengguna baru dengan email dan password
    
    **Requirements:**
    - Email: Must be a valid email format
    - Password: Minimum 10 characters, alphanumeric with at least one special character
    """
    auth_service = AuthService(db)
    user = auth_service.create_user(user_data)
    
    return RegisterResponse(
        message="User registered successfully.",
        userId=user.id,
        email=user.email
    )


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login_email(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login pengguna dengan email dan password dan mendapatkan bearer token
    """
    auth_service = AuthService(db)
    user = auth_service.authenticate_user_email(user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return Token(
        message="Login successful.",
        token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes
    )


@router.post("/login-username", response_model=Token, status_code=status.HTTP_200_OK)
def login_username(user_data: UserLoginUsername, db: Session = Depends(get_db)):
    """
    Login pengguna dengan username dan password (backward compatibility)
    """
    auth_service = AuthService(db)
    user = auth_service.authenticate_user_username(user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return Token(
        message="Login successful.",
        token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes
    )


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_current_user_info(current_user: User = Depends(get_current_user_flexible)):
    """
    Get current authenticated user information
    """
    return current_user
