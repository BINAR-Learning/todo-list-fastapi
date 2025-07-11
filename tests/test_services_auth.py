"""
Unit tests for AuthService
"""
import pytest
from unittest.mock import Mock, patch
from jose import JWTError
from passlib.context import CryptContext

from app.services.auth_service import AuthService
from app.models.user import User
from app.utils.security import get_password_hash, verify_password, create_access_token, verify_token, generate_id
from app.schemas.user import UserCreate


class TestAuthService:
    """Test cases for AuthService"""

    def test_init_auth_service(self, db_session):
        """Test AuthService initialization"""
        auth_service = AuthService(db_session)
        assert auth_service.db is not None

    def test_verify_password(self, auth_service):
        """Test password verification using utility function"""
        plain_password = "TestPass123!"
        hashed_password = get_password_hash(plain_password)
        
        # Test correct password
        assert verify_password(plain_password, hashed_password) is True
        
        # Test incorrect password
        assert verify_password("wrongpassword", hashed_password) is False

    def test_get_password_hash(self, auth_service):
        """Test password hashing using utility function"""
        password = "TestPass123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True

    def test_create_access_token(self, auth_service):
        """Test access token creation using utility function"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_expires_delta(self, auth_service):
        """Test access token creation with custom expiration"""
        from datetime import timedelta
        
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_verify_token_valid(self, auth_service):
        """Test token verification with valid token"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        payload = verify_token(token)
        assert payload is not None
        assert payload == "test@example.com"

    def test_verify_token_invalid(self, auth_service):
        """Test token verification with invalid token"""
        invalid_token = "invalid.token.here"
        
        payload = verify_token(invalid_token)
        assert payload is None

    def test_verify_token_expired(self, auth_service):
        """Test token verification with expired token"""
        from datetime import timedelta
        
        data = {"sub": "test@example.com"}
        # Create token that expires immediately
        expires_delta = timedelta(seconds=-1)
        token = create_access_token(data, expires_delta)
        
        payload = verify_token(token)
        assert payload is None

    def test_get_user_by_email(self, auth_service, db_session):
        """Test getting user by email"""
        # Create user
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Test getting existing user
        found_user = auth_service.get_user_by_email("test@example.com")
        assert found_user is not None
        assert found_user.email == "test@example.com"
        
        # Test getting non-existing user
        not_found_user = auth_service.get_user_by_email("notfound@example.com")
        assert not_found_user is None

    def test_get_user_by_username(self, auth_service, db_session):
        """Test getting user by username"""
        # Create user
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password"
        )
        db_session.add(user)
        db_session.commit()
        
        # Test getting existing user
        found_user = auth_service.get_user_by_username("testuser")
        assert found_user is not None
        assert found_user.username == "testuser"
        
        # Test getting non-existing user
        not_found_user = auth_service.get_user_by_username("notfounduser")
        assert not_found_user is None

    def test_authenticate_user_with_email(self, auth_service, db_session):
        """Test user authentication with email"""
        password = "TestPass123!"
        hashed_password = get_password_hash(password)
        
        # Create user
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        # Test authentication with email and correct password
        authenticated_user = auth_service.authenticate_user_email("test@example.com", password)
        assert authenticated_user is not None
        assert authenticated_user.email == "test@example.com"
        
        # Test authentication with email and incorrect password
        not_authenticated = auth_service.authenticate_user_email("test@example.com", "wrongpassword")
        assert not_authenticated is None

    def test_authenticate_user_with_username(self, auth_service, db_session):
        """Test user authentication with username"""
        password = "TestPass123!"
        hashed_password = get_password_hash(password)
        
        # Create user
        user = User(
            id=generate_id(),
            email="test@example.com",
            username="testuser",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        # Test authentication with username and correct password
        authenticated_user = auth_service.authenticate_user_username("testuser", password)
        assert authenticated_user is not None
        assert authenticated_user.username == "testuser"
        
        # Test authentication with username and incorrect password
        not_authenticated = auth_service.authenticate_user_username("testuser", "wrongpassword")
        assert not_authenticated is None

    def test_authenticate_nonexistent_user(self, auth_service, db_session):
        """Test authentication with non-existent user"""
        result = auth_service.authenticate_user_email("nonexistent@example.com", "password")
        assert result is None

    def test_create_user(self, auth_service, db_session):
        """Test user creation"""
        email = "test@example.com"
        username = "testuser"
        password = "TestPass123!"
        
        user_data = UserCreate(email=email, username=username, password=password)
        user = auth_service.create_user(user_data)
        
        assert user is not None
        assert user.email == email
        assert user.username == username
        assert user.hashed_password != password  # Should be hashed
        assert verify_password(password, user.hashed_password) is True
        assert user.is_verified is False

    def test_create_user_without_username(self, auth_service, db_session):
        """Test user creation without username"""
        email = "test@example.com"
        password = "TestPass123!"
        
        user_data = UserCreate(email=email, username=None, password=password)
        user = auth_service.create_user(user_data)
        
        assert user is not None
        assert user.email == email
        assert user.username is None
        assert user.hashed_password != password  # Should be hashed
        assert verify_password(password, user.hashed_password) is True

    def test_create_user_duplicate_email(self, auth_service, db_session):
        """Test creating user with duplicate email"""
        email = "test@example.com"
        password = "TestPass123!"
        
        # Create first user
        user_data1 = UserCreate(email=email, username="testuser1", password=password)
        user1 = auth_service.create_user(user_data1)
        assert user1 is not None
        
        # Try to create second user with same email
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            user_data2 = UserCreate(email=email, username="testuser2", password=password)
            auth_service.create_user(user_data2)

    def test_create_user_password_too_short(self, auth_service, db_session):
        """Test creating user with password too short"""
        user_data = UserCreate(
            email="short@example.com",
            username="shortpass",
            password="short"  # Too short
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(db_session, user_data)
        assert exc_info.value.status_code == 400
        assert "at least 10 characters" in exc_info.value.detail

    def test_create_user_password_no_letter(self, auth_service, db_session):
        """Test creating user with password without letters"""
        user_data = UserCreate(
            email="noletter@example.com",
            username="noletter",
            password="1234567890!@#"  # No letters
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(db_session, user_data)
        assert exc_info.value.status_code == 400
        assert "at least one letter" in exc_info.value.detail

    def test_create_user_password_no_digit(self, auth_service, db_session):
        """Test creating user with password without digits"""
        user_data = UserCreate(
            email="nodigit@example.com",
            username="nodigit",
            password="TestPassword!@#"  # No digits
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(db_session, user_data)
        assert exc_info.value.status_code == 400
        assert "at least one digit" in exc_info.value.detail

    def test_create_user_password_no_special_char(self, auth_service, db_session):
        """Test creating user with password without special characters"""
        user_data = UserCreate(
            email="nospecial@example.com",
            username="nospecial",
            password="TestPassword123"  # No special characters
        )
        
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(db_session, user_data)
        assert exc_info.value.status_code == 400
        assert "at least one special character" in exc_info.value.detail

    def test_get_user_by_id(self, auth_service, db_session):
        """Test getting user by ID"""
        password = "TestPassword123!"
        user = create_test_user(db_session, password)
        
        # Test existing user
        found_user = auth_service.get_user_by_id(db_session, user.id)
        assert found_user is not None
        assert found_user.id == user.id
        assert found_user.email == user.email
        
        # Test non-existing user
        non_existing = auth_service.get_user_by_id(db_session, "non-existent-id")
        assert non_existing is None
