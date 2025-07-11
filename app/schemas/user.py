import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserCreate(BaseModel):
    username: Optional[str] = Field(
        None, description="Nama pengguna unik (opsional)", example="userbaru"
    )
    email: EmailStr = Field(
        ..., description="Alamat email yang valid", example="user@example.com"
    )
    password: str = Field(
        ..., description="Kata sandi pengguna", example="StrongPass123!"
    )

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 10:
            raise ValueError("Password must be at least 10 characters long")

        # Check for alphanumeric and special character
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")

        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")

        return v


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Alamat email", example="user@example.com")
    password: str = Field(..., description="Kata sandi", example="StrongPass123!")


class UserLoginUsername(BaseModel):
    """Login with username for backward compatibility"""

    username: str = Field(..., description="Nama pengguna", example="userbaru")
    password: str = Field(..., description="Kata sandi", example="StrongPass123!")


class UserResponse(BaseModel):
    id: str = Field(..., description="ID unik pengguna")
    username: Optional[str] = Field(None, description="Nama pengguna")
    email: EmailStr = Field(..., description="Alamat email pengguna")
    is_active: bool = Field(..., description="Status aktif pengguna")
    is_verified: bool = Field(..., description="Status verifikasi email")
    created_at: datetime = Field(..., description="Waktu pembuatan akun")

    class Config:
        from_attributes = True


class Token(BaseModel):
    message: str = Field(..., example="Login successful.")
    token: str = Field(..., description="Bearer token untuk autentikasi")
    token_type: str = Field(default="bearer", description="Tipe token")
    expires_in: int = Field(..., description="Token expiration time in minutes")


class RegisterResponse(BaseModel):
    message: str = Field(..., example="User registered successfully.")
    userId: str = Field(..., example="654321abcdef")
    email: EmailStr = Field(..., example="user@example.com")
