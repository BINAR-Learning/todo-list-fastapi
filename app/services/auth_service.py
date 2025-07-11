import re
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import generate_id, get_password_hash, verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        """
        Membuat user baru dengan email dan password
        """
        # Check if email already exists
        db_user = self.db.query(User).filter(User.email == user_data.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Check if username already exists (if provided)
        if user_data.username:
            db_user_username = (
                self.db.query(User).filter(User.username == user_data.username).first()
            )
            if db_user_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists",
                )

        # Validate password complexity
        self._validate_password_complexity(user_data.password)

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            id=generate_id(),
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
        )

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        return db_user

    def authenticate_user_email(self, email: str, password: str) -> Optional[User]:
        """
        Autentikasi user berdasarkan email dan password
        """
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def authenticate_user_username(
        self, username: str, password: str
    ) -> Optional[User]:
        """
        Autentikasi user berdasarkan username dan password (backward compatibility)
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

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Mendapatkan user berdasarkan email
        """
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Mendapatkan user berdasarkan ID
        """
        return self.db.query(User).filter(User.id == user_id).first()

    def _validate_password_complexity(self, password: str) -> None:
        """
        Validasi kompleksitas password
        """
        if len(password) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 10 characters long",
            )

        # Check for alphanumeric and special character
        if not re.search(r"[A-Za-z]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one letter",
            )

        if not re.search(r"\d", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one digit",
            )

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one special character",
            )
