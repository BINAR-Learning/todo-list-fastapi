from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.task import Task
from app.models.list import List
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate
from app.utils.security import generate_id
from typing import List as ListType, Optional


class TaskService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_task(self, list_id: str, task_data: TaskCreate, user: User) -> Task:
        """
        Membuat task baru dalam list
        """
        # Verify list exists and belongs to user
        db_list = self.db.query(List).filter(
            List.id == list_id,
            List.user_id == user.id
        ).first()
        
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )
        
        db_task = Task(
            id=generate_id(),
            list_id=list_id,
            description=task_data.description,
            completed=task_data.completed or False
        )
        
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        
        return db_task
    
    def get_tasks_by_list(self, list_id: str, user: User) -> ListType[Task]:
        """
        Mendapatkan semua task dalam list
        """
        # Verify list belongs to user
        db_list = self.db.query(List).filter(
            List.id == list_id,
            List.user_id == user.id
        ).first()
        
        if not db_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )
        
        return self.db.query(Task).filter(Task.list_id == list_id).all()
    
    def get_task_by_id(self, task_id: str, user: User) -> Optional[Task]:
        """
        Mendapatkan task berdasarkan ID dan memastikan user memiliki akses
        """
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return None
        
        # Verify user owns the list that contains this task
        db_list = self.db.query(List).filter(
            List.id == task.list_id,
            List.user_id == user.id
        ).first()
        
        if not db_list:
            return None
        
        return task
    
    def update_task(self, task_id: str, task_data: TaskUpdate, user: User) -> Optional[Task]:
        """
        Update task berdasarkan ID
        """
        db_task = self.get_task_by_id(task_id, user)
        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        if task_data.description is not None:
            db_task.description = task_data.description
        if task_data.completed is not None:
            db_task.completed = task_data.completed
        
        self.db.commit()
        self.db.refresh(db_task)
        
        return db_task
    
    def delete_task(self, task_id: str, user: User) -> bool:
        """
        Hapus task berdasarkan ID
        """
        db_task = self.get_task_by_id(task_id, user)
        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        self.db.delete(db_task)
        self.db.commit()
        
        return True
