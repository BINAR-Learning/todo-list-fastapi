"""
Unit tests for User model
"""
import pytest
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.utils.security import generate_id


class TestUserModel:
    """Test cases for User model"""

    def test_create_user(self, db_session):
        """Test creating a new user"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password",
            is_verified=False
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.hashed_password == "hashed_password"
        assert user.is_verified is False
        assert user.created_at is not None
        # updated_at is only set on update, not on create

    def test_user_email_unique_constraint(self, db_session):
        """Test that email must be unique"""
        user1 = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser1",
            hashed_password="hashed_password1"
        )
        user2 = User(
            id=generate_id(),
            email="test@example.com",  # Same email
            username="testuser2",
            hashed_password="hashed_password2"
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_username_unique_constraint(self, db_session):
        """Test that username must be unique when provided"""
        user1 = User(
            id=generate_id(),
            email="test1@example.com",
            username="testuser",
            hashed_password="hashed_password1"
        )
        user2 = User(
            id=generate_id(),
            email="test2@example.com",
            username="testuser",  # Same username
            hashed_password="hashed_password2"
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_optional_username(self, db_session):
        """Test that username can be None"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username=None,
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.username is None
        assert user.email == "test@example.com"

    def test_user_relationships(self, db_session):
        """Test user relationships with todo lists"""
        from app.models.list import List
        
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create todo lists for the user
        todo_list1 = List(id=generate_id(), name="List 1", user_id=user.id)
        todo_list2 = List(id=generate_id(), name="List 2", user_id=user.id)
        
        db_session.add_all([todo_list1, todo_list2])
        db_session.commit()
        
        # Refresh user to load relationships
        db_session.refresh(user)
        
        assert len(user.lists) == 2
        assert todo_list1 in user.lists
        assert todo_list2 in user.lists

    def test_user_str_representation(self, db_session):
        """Test string representation of user"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        assert str(user) == "testuser"

    def test_user_with_none_username_str_representation(self, db_session):
        """Test string representation of user with None username"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username=None,
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        assert str(user) == "test@example.com"

    def test_user_is_verified_default(self, db_session):
        """Test that is_verified defaults to False"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.is_verified is False

    def test_user_timestamps(self, db_session):
        """Test that timestamps are set correctly"""
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.created_at is not None
        # updated_at is only set on update, not on create
        assert user.updated_at is None
        
        # Update user and check updated_at is set
        user.is_verified = True
        db_session.commit()
        
        # Now updated_at should be set
        assert user.updated_at is not None
