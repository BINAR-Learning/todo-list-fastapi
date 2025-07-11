from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    description: str = Field(
        ..., description="Deskripsi tugas", example="Kirim email ke tim"
    )
    completed: Optional[bool] = Field(
        False, description="Status penyelesaian tugas", example=False
    )


class TaskUpdate(BaseModel):
    description: Optional[str] = Field(
        None,
        description="Deskripsi tugas yang diperbarui",
        example="Beli susu dan roti",
    )
    completed: Optional[bool] = Field(
        None, description="Status penyelesaian tugas yang diperbarui", example=True
    )


class TaskResponse(BaseModel):
    id: str = Field(..., description="ID unik tugas", example="taskA1")
    listId: str = Field(
        ..., description="ID daftar tugas tempat tugas ini berada", example="list123"
    )
    description: str = Field(..., description="Deskripsi tugas", example="Beli susu")
    completed: bool = Field(..., description="Status penyelesaian tugas", example=False)
    created_at: Optional[datetime] = Field(None, description="Waktu pembuatan tugas")
    updated_at: Optional[datetime] = Field(None, description="Waktu pembaruan terakhir")

    class Config:
        from_attributes = True
