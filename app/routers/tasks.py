from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(tags=["tasks"])


@router.get("/lists/{listId}/tasks", response_model=List[TaskResponse])
def get_tasks_in_list(
    listId: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mendapatkan semua tugas dalam daftar
    """
    task_service = TaskService(db)
    tasks = task_service.get_tasks_by_list(listId, current_user)
    
    # Convert to response format
    response_tasks = []
    for task in tasks:
        response_tasks.append(TaskResponse(
            id=task.id,
            listId=task.list_id,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at
        ))
    
    return response_tasks


@router.post("/lists/{listId}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    listId: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Menambahkan tugas baru ke daftar
    """
    task_service = TaskService(db)
    new_task = task_service.create_task(listId, task_data, current_user)
    
    return TaskResponse(
        id=new_task.id,
        listId=new_task.list_id,
        description=new_task.description,
        completed=new_task.completed,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at
    )


@router.get("/tasks/{taskId}", response_model=TaskResponse)
def get_task_by_id(
    taskId: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mendapatkan tugas berdasarkan ID
    """
    task_service = TaskService(db)
    task = task_service.get_task_by_id(taskId, current_user)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return TaskResponse(
        id=task.id,
        listId=task.list_id,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


@router.put("/tasks/{taskId}", response_model=TaskResponse)
def update_task(
    taskId: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Memperbarui tugas
    """
    task_service = TaskService(db)
    updated_task = task_service.update_task(taskId, task_data, current_user)
    
    return TaskResponse(
        id=updated_task.id,
        listId=updated_task.list_id,
        description=updated_task.description,
        completed=updated_task.completed,
        created_at=updated_task.created_at,
        updated_at=updated_task.updated_at
    )


@router.delete("/tasks/{taskId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    taskId: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Menghapus tugas
    """
    task_service = TaskService(db)
    task_service.delete_task(taskId, current_user)
    
    return None
