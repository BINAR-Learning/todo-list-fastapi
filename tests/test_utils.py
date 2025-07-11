"""
Tests for utility functions and dependencies
"""
import pytest
from fastapi import HTTPException
from starlette.testclient import TestClient
from app.utils.security import generate_id, verify_password, get_password_hash, create_access_token, verify_token
from app.utils.dependencies import get_current_user, get_current_active_user, get_basic_auth_user
from datetime import timedelta


class TestSecurity:
    """Test cases for security utilities"""

    def test_generate_id(self):
        """Test ID generation"""
        id1 = generate_id()
        id2 = generate_id()
        
        assert id1 != id2  # Should be unique
        assert len(id1) > 20  # Should be reasonably long
        assert isinstance(id1, str)
        assert isinstance(id2, str)

    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = "TestPassword123!"
        
        # Test hashing
        hashed = get_password_hash(password)
        assert hashed != password  # Should be different from original
        assert len(hashed) > 50  # Should be reasonably long hash
        
        # Test verification
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False

    def test_create_access_token(self):
        """Test JWT token creation"""
        data = {"sub": "test@example.com"}
        
        # Test with default expiration
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 50  # JWT tokens are long
        
        # Test with custom expiration
        custom_token = create_access_token(data, expires_delta=timedelta(minutes=30))
        assert isinstance(custom_token, str)
        assert custom_token != token  # Should be different

    def test_verify_token(self):
        """Test JWT token verification"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        # Test valid token
        payload = verify_token(token)
        assert payload is not None
        assert payload.get("sub") == "test@example.com"
        
        # Test invalid token
        invalid_payload = verify_token("invalid.token.here")
        assert invalid_payload is None


class TestDependencies:
    """Test cases for FastAPI dependencies"""

    def test_basic_auth_extraction(self, client: TestClient, sample_user_data):
        """Test basic authentication credential extraction"""
        # Register a user first
        client.post("/auth/register", json=sample_user_data)
        
        # Test with valid basic auth
        import base64
        credentials = f"{sample_user_data['email']}:{sample_user_data['password']}"
        encoded = base64.b64encode(credentials.encode()).decode()
        
        response = client.get("/auth/me", headers={"Authorization": f"Basic {encoded}"})
        assert response.status_code == 200
        assert response.json()["email"] == sample_user_data["email"]

    def test_bearer_auth_extraction(self, client: TestClient, sample_user_data):
        """Test Bearer token authentication"""
        # Register and login a user
        client.post("/auth/register", json=sample_user_data)
        login_response = client.post("/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        token = login_response.json()["token"]
        
        # Test with valid bearer token
        response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["email"] == sample_user_data["email"]

    def test_invalid_auth_header(self, client: TestClient):
        """Test invalid authorization headers"""
        # Test with malformed header
        response = client.get("/auth/me", headers={"Authorization": "InvalidHeader"})
        assert response.status_code == 401
        
        # Test with empty bearer token
        response = client.get("/auth/me", headers={"Authorization": "Bearer "})
        assert response.status_code == 401
        
        # Test with empty basic auth
        response = client.get("/auth/me", headers={"Authorization": "Basic "})
        assert response.status_code == 401

    def test_no_auth_header(self, client: TestClient):
        """Test requests without authentication"""
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_expired_token_handling(self, client: TestClient, sample_user_data):
        """Test handling of expired tokens"""
        # Create a token with very short expiration
        data = {"sub": sample_user_data["email"]}
        expired_token = create_access_token(data, expires_delta=timedelta(seconds=-1))
        
        response = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert response.status_code == 401
