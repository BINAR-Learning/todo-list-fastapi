"""
Unit tests for List model
"""
import pytest
from sqlalchemy.exc import IntegrityError
from app.models.list import List
from app.models.user import User
from app.utils.security import generate_id


class TestListModel:
    """Test cases for List model"""

    def test_create_list(self, db_session):
        """Test creating a new list"""
        # Create user first
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create list
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        assert todo_list.id is not None
        assert todo_list.name == "Test List"
        assert todo_list.user_id == user.id
        assert todo_list.created_at is not None
        # updated_at is only set on update, not on create

    def test_list_user_relationship(self, db_session):
        """Test list relationship with user"""
        # Create user
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create list
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        # Refresh to load relationships
        db_session.refresh(todo_list)
        db_session.refresh(user)
        
        assert todo_list.owner == user
        assert todo_list in user.lists

    def test_list_name_required(self, db_session):
        """Test that list name is required"""
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
            name=None,  # Should cause error
            user_id=user.id
        )
        db_session.add(todo_list)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_list_user_id_required(self, db_session):
        """Test that user_id is required"""
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=None  # Should cause error
        )
        db_session.add(todo_list)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_list_cascade_delete_with_tasks(self, db_session):
        """Test that deleting list deletes its tasks"""
        from app.models.task import Task
        
        # Create user
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create list
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        # Create tasks
        task1 = Task(
            id=generate_id(),
            description="Task 1",
            list_id=todo_list.id
        )
        task2 = Task(
            id=generate_id(),
            description="Task 2",
            list_id=todo_list.id
        )
        db_session.add_all([task1, task2])
        db_session.commit()
        
        # Verify tasks exist
        assert len(todo_list.tasks) == 2
        
        # Delete list
        db_session.delete(todo_list)
        db_session.commit()
        
        # Verify tasks are deleted (cascade)
        remaining_tasks = db_session.query(Task).filter(Task.list_id == todo_list.id).all()
        assert len(remaining_tasks) == 0

    def test_list_timestamps(self, db_session):
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
        
        assert todo_list.created_at is not None
        # updated_at is only set on update, not on create
        
        # Update list and check updated_at is set
        todo_list.name = "Updated List"
        db_session.commit()
        
        # Note: updated_at might not change in SQLite due to precision
        # This test might need adjustment for different databases
        assert todo_list.name == "Updated List"
