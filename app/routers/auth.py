from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token, RegisterResponse
from app.services.auth_service import AuthService
from app.utils.security import create_access_token
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Mendaftarkan pengguna baru
    """
    auth_service = AuthService(db)
    user = auth_service.create_user(user_data)
    
    return RegisterResponse(
        message="User registered successfully.",
        userId=user.id
    )


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login pengguna dan mendapatkan bearer token
    """
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(user_data.username, user_data.password)
    
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
        token=access_token
    )
