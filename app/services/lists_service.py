from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.list import List
from app.models.user import User
from app.schemas.list import ListCreate, ListUpdate
from app.utils.security import generate_id
from typing import List as ListType, Optional


class ListService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_list(self, list_data: ListCreate, user: User) -> List:
        """
        Membuat list baru untuk user
        """
        db_list = List(
            id=generate_id(),
            name=list_data.name,
            user_id=user.id
        )
        
        self.db.add(db_list)
        self.db.commit()
        self.db.refresh(db_list)
        
        return db_list
    
    def get_user_lists(self, user: User) -> ListType[List]:
        """
        Mendapatkan semua list milik user
        """
        return self.db.query(List).filter(List.user_id == user.id).all()
    
    def get_list_by_id(self, list_id: str, user: User) -> Optional[List]:
        """
        Mendapatkan list berdasarkan ID dan memastikan user memiliki akses
        """
        return self.db.query(List).filter(
            List.id == list_id,
            List.user_id == user.id
        ).first()
    
    def update_list(self, list_id: str, list_data: ListUpdate, user: User) -> List:
        """
        Update list berdasarkan ID
        """
        db_list = self.get_list_by_id(list_id, user)
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )
        
        db_list.name = list_data.name
        
        self.db.commit()
        self.db.refresh(db_list)
        
        return db_list
    
    def delete_list(self, list_id: str, user: User) -> bool:
        """
        Hapus list berdasarkan ID (beserta semua tasks di dalamnya)
        """
        db_list = self.get_list_by_id(list_id, user)
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )
        
        self.db.delete(db_list)
        self.db.commit()
        
        return True
