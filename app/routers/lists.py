from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.list import ListCreate, ListResponse, ListUpdate
from app.services.lists_service import ListService
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/lists", tags=["lists"])


@router.get("/", response_model=List[ListResponse])
def get_user_lists(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """
    Mendapatkan semua daftar tugas pengguna
    """
    list_service = ListService(db)
    lists = list_service.get_user_lists(current_user)

    # Convert to response format
    response_lists = []
    for list_item in lists:
        response_lists.append(
            ListResponse(
                id=list_item.id,
                name=list_item.name,
                userId=list_item.user_id,
                created_at=list_item.created_at,
                updated_at=list_item.updated_at,
            )
        )

    return response_lists


@router.post("/", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create_list(
    list_data: ListCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Membuat daftar tugas baru
    """
    list_service = ListService(db)
    new_list = list_service.create_list(list_data, current_user)

    return ListResponse(
        id=new_list.id,
        name=new_list.name,
        userId=new_list.user_id,
        created_at=new_list.created_at,
        updated_at=new_list.updated_at,
    )


@router.get("/{listId}", response_model=ListResponse)
def get_list_by_id(
    listId: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Mendapatkan daftar tugas berdasarkan ID
    """
    list_service = ListService(db)
    list_item = list_service.get_list_by_id(listId, current_user)

    if not list_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="List not found"
        )

    return ListResponse(
        id=list_item.id,
        name=list_item.name,
        userId=list_item.user_id,
        created_at=list_item.created_at,
        updated_at=list_item.updated_at,
    )


@router.put("/{listId}", response_model=ListResponse)
def update_list(
    listId: str,
    list_data: ListUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Memperbarui daftar tugas
    """
    list_service = ListService(db)
    updated_list = list_service.update_list(listId, list_data, current_user)

    return ListResponse(
        id=updated_list.id,
        name=updated_list.name,
        userId=updated_list.user_id,
        created_at=updated_list.created_at,
        updated_at=updated_list.updated_at,
    )


@router.delete("/{listId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    listId: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Menghapus daftar tugas
    """
    list_service = ListService(db)
    list_service.delete_list(listId, current_user)

    return None
