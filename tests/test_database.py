"""
Tests for database configuration and utilities
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import get_db, SQLALCHEMY_DATABASE_URL, engine, Base
from app.models.user import User
from app.models.list import List
from app.models.task import Task


class TestDatabase:
    """Test cases for database configuration"""

    def test_database_url_format(self):
        """Test that database URL is properly formatted"""
        assert SQLALCHEMY_DATABASE_URL is not None
        assert isinstance(SQLALCHEMY_DATABASE_URL, str)
        # Should be SQLite for testing
        assert "sqlite" in SQLALCHEMY_DATABASE_URL.lower()

    def test_engine_creation(self):
        """Test that database engine is properly created"""
        assert engine is not None
        assert hasattr(engine, 'execute')
        assert hasattr(engine, 'connect')

    def test_base_metadata(self):
        """Test that Base metadata contains our models"""
        table_names = list(Base.metadata.tables.keys())
        assert "users" in table_names
        assert "lists" in table_names
        assert "tasks" in table_names

    def test_get_db_generator(self):
        """Test get_db dependency function"""
        db_gen = get_db()
        assert hasattr(db_gen, '__next__')  # It's a generator
        
        # Test we can get a session
        db = next(db_gen)
        assert hasattr(db, 'query')
        assert hasattr(db, 'add')
        assert hasattr(db, 'commit')
        
        # Clean up
        try:
            next(db_gen)
        except StopIteration:
            pass  # Expected

    def test_models_can_be_created(self, db_session):
        """Test that models can be instantiated and saved"""
        # Create a user
        from app.utils.security import generate_id
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create a list
        todo_list = List(
            id=generate_id(),
            name="Test List",
            user_id=user.id
        )
        db_session.add(todo_list)
        db_session.commit()
        
        # Create a task
        task = Task(
            id=generate_id(),
            description="Test task",
            list_id=todo_list.id
        )
        db_session.add(task)
        db_session.commit()
        
        # Verify all were created
        assert db_session.query(User).count() == 1
        assert db_session.query(List).count() == 1
        assert db_session.query(Task).count() == 1

    def test_database_isolation(self, db_session):
        """Test that database sessions are properly isolated"""
        from app.utils.security import generate_id
        
        # Create user in this session
        user = User(
            id=generate_id(),
            email="isolated@example.com",
            username="isolated",
            hashed_password="hashed"
        )
        db_session.add(user)
        db_session.commit()
        
        # Verify it exists in this session
        assert db_session.query(User).filter(User.email == "isolated@example.com").first() is not None
