from pydantic import BaseModel, Field
from typing import Optional, List as ListType
from datetime import datetime


class ListCreate(BaseModel):
    name: str = Field(..., description="Nama daftar tugas", example="Tugas Rumah")


class ListUpdate(BaseModel):
    name: str = Field(..., description="Nama baru untuk daftar tugas", example="Belanja Bulanan")


class ListResponse(BaseModel):
    id: str = Field(..., description="ID unik daftar tugas", example="list123")
    name: str = Field(..., description="Nama daftar tugas", example="Belanja Mingguan")
    userId: str = Field(..., description="ID pengguna yang memiliki daftar ini", example="user123")
    created_at: Optional[datetime] = Field(None, description="Waktu pembuatan daftar")
    updated_at: Optional[datetime] = Field(None, description="Waktu pembaruan terakhir")

    class Config:
        from_attributes = True


class ListWithTasks(ListResponse):
    """List response yang menyertakan tasks di dalamnya"""
    tasks: ListType["TaskResponse"] = Field(default=[], description="Daftar tugas dalam list ini")

    class Config:
        from_attributes = True


# Forward reference untuk TaskResponse akan di-resolve di runtime
