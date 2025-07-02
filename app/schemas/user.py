from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., description="Nama pengguna unik", example="userbaru")
    password: str = Field(..., description="Kata sandi pengguna", example="StrongPassword123")


class UserLogin(BaseModel):
    username: str = Field(..., description="Nama pengguna", example="userbaru")
    password: str = Field(..., description="Kata sandi", example="StrongPassword123")


class UserResponse(BaseModel):
    id: str = Field(..., description="ID unik pengguna")
    username: str = Field(..., description="Nama pengguna")
    is_active: bool = Field(..., description="Status aktif pengguna")
    created_at: datetime = Field(..., description="Waktu pembuatan akun")

    class Config:
        from_attributes = True


class Token(BaseModel):
    message: str = Field(..., example="Login successful.")
    token: str = Field(..., description="Bearer token untuk autentikasi")


class RegisterResponse(BaseModel):
    message: str = Field(..., example="User registered successfully.")
    userId: str = Field(..., example="654321abcdef")
