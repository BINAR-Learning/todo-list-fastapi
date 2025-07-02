from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password, generate_id
from typing import Optional


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        """
        Membuat user baru
        """
        # Check if username already exists
        db_user = self.db.query(User).filter(User.username == user_data.username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            id=generate_id(),
            username=user_data.username,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        Autentikasi user berdasarkan username dan password
        """
        user = self.db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        Mendapatkan user berdasarkan username
        """
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Mendapatkan user berdasarkan ID
        """
        return self.db.query(User).filter(User.id == user_id).first()
