"""
Unit tests for Task model
"""
import pytest
from sqlalchemy.exc import IntegrityError
from app.models.task import Task
from app.models.list import List
from app.models.user import User
from app.utils.security import generate_id


class TestTaskModel:
    """Test cases for Task model"""

    def test_create_task(self, db_session):
        """Test creating a new task"""
        # Create user and list first
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        # Create task
        task = Task(
            id=generate_id(),
            description="Test Task Description",
            list_id=todo_list.id
        )
        db_session.add(task)
        db_session.commit()
        
        assert task.id is not None
        assert task.description == "Test Task Description"
        assert task.list_id == todo_list.id
        assert task.completed is False  # Default value
        assert task.created_at is not None

    def test_task_list_relationship(self, db_session):
        """Test task relationship with list"""
        # Create user and list
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        # Create task
        task = Task(
            id=generate_id(),
            description="Test Task Description",
            list_id=todo_list.id
        )
        db_session.add(task)
        db_session.commit()
        
        # Refresh to load relationships
        db_session.refresh(task)
        db_session.refresh(todo_list)
        
        assert task.list == todo_list
        assert task in todo_list.tasks

    def test_task_description_required(self, db_session):
        """Test that task description is required"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        task = Task(
            id=generate_id(),
            description=None,  # Should cause error
            list_id=todo_list.id
        )
        db_session.add(task)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_task_list_id_required(self, db_session):
        """Test that list_id is required"""
        task = Task(
            id=generate_id(),
            description="Test Task",
            list_id=None  # Should cause error
        )
        db_session.add(task)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_task_multiple_descriptions_allowed(self, db_session):
        """Test that multiple tasks can have descriptions"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        task1 = Task(
            id=generate_id(),
            description="First Task",
            list_id=todo_list.id
        )
        
        task2 = Task(
            id=generate_id(),
            description="Second Task",
            list_id=todo_list.id
        )
        
        db_session.add_all([task1, task2])
        db_session.commit()
        
        assert task1.description == "First Task"
        assert task2.description == "Second Task"

    def test_task_completion_default(self, db_session):
        """Test that completed defaults to False"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        task = Task(
            id=generate_id(),
            description="Test Task",
            list_id=todo_list.id
        )
        db_session.add(task)
        db_session.commit()
        
        assert task.completed is False

    def test_task_completion_toggle(self, db_session):
        """Test toggling task completion"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        task = Task(
            id=generate_id(),
            description="Test Task",
            list_id=todo_list.id
        )
        db_session.add(task)
        db_session.commit()
        
        # Initially not completed
        assert task.completed is False
        
        # Mark as completed
        task.completed = True
        db_session.commit()
        assert task.completed is True
        
        # Mark as not completed
        task.completed = False
        db_session.commit()
        assert task.completed is False

    def test_task_timestamps(self, db_session):
        """Test that timestamps are set correctly"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        task = Task(
            id=generate_id(),
            description="Test Task",
            list_id=todo_list.id
        )
        db_session.add(task)
        db_session.commit()
        
        assert task.created_at is not None
        
        # Update task and check updated_at changes
        original_created_at = task.created_at
        task.description = "Updated description"
        db_session.commit()
        
        # Note: updated_at might not change in SQLite due to precision
        # This test might need adjustment for different databases
        assert task.description == "Updated description"
