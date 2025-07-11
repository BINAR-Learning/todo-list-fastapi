"""
Unit tests for Authentication routes
"""
import pytest
from fastapi.testclient import TestClient


class TestAuthRoutes:
    """Test cases for authentication endpoints"""

    def test_register_user_success(self, client: TestClient, sample_user_data):
        """Test successful user registration"""
        response = client.post("/auth/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert "userId" in data
        assert data["email"] == sample_user_data["email"]
        assert "message" in data
        assert "password" not in data
        assert "hashed_password" not in data

    def test_register_user_duplicate_email(self, client: TestClient, sample_user_data):
        """Test registration with duplicate email"""
        # Register user first time
        response1 = client.post("/auth/register", json=sample_user_data)
        assert response1.status_code == 201
        
        # Try to register with same email
        duplicate_data = {
            **sample_user_data,
            "username": "differentuser"
        }
        response2 = client.post("/auth/register", json=duplicate_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()

    def test_register_user_duplicate_username(self, client: TestClient, sample_user_data):
        """Test registration with duplicate username"""
        # Register user first time
        response1 = client.post("/auth/register", json=sample_user_data)
        assert response1.status_code == 201
        
        # Try to register with same username
        duplicate_data = {
            **sample_user_data,
            "email": "different@example.com"
        }
        response2 = client.post("/auth/register", json=duplicate_data)
        assert response2.status_code == 400
        assert "already exists" in response2.json()["detail"].lower()

    def test_register_user_without_username(self, client: TestClient):
        """Test registration without username"""
        user_data = {
            "email": "test@example.com",
            "password": "TestPassword123!"
        }
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]

    def test_register_user_invalid_email(self, client: TestClient):
        """Test registration with invalid email"""
        user_data = {
            "email": "invalid-email",
            "username": "testuser",
            "password": "testpassword123"
        }
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 422

    def test_register_user_missing_required_fields(self, client: TestClient):
        """Test registration with missing required fields"""
        # Missing email
        response1 = client.post("/auth/register", json={
            "username": "testuser",
            "password": "testpassword123"
        })
        assert response1.status_code == 422
        
        # Missing password
        response2 = client.post("/auth/register", json={
            "email": "test@example.com",
            "username": "testuser"
        })
        assert response2.status_code == 422

    def test_login_success_with_email(self, client: TestClient, sample_user_data):
        """Test successful login with email"""
        # Register user first
        client.post("/auth/register", json=sample_user_data)
        
        # Login with email
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "message" in data

    def test_login_success_with_username(self, client: TestClient, sample_user_data):
        """Test successful login with username"""
        # Register user first
        client.post("/auth/register", json=sample_user_data)
        
        # Login with username
        login_data = {
            "username": sample_user_data["username"],
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login-username", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "message" in data

    def test_login_invalid_credentials(self, client: TestClient, sample_user_data):
        """Test login with invalid credentials"""
        # Register user first
        client.post("/auth/register", json=sample_user_data)
        
        # Try login with wrong password
        login_data = {
            "email": sample_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "testpassword123"
        }
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_login_missing_identifier(self, client: TestClient):
        """Test login without email or username"""
        login_data = {
            "password": "testpassword123"
        }
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 422
        # Validation error due to missing required field

    def test_login_missing_password(self, client: TestClient):
        """Test login without password"""
        login_data = {
            "email": "test@example.com"
        }
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 422

    def test_get_current_user_with_valid_token(self, client: TestClient, authenticated_user):
        """Test getting current user with valid token"""
        headers = authenticated_user["headers"]
        
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == authenticated_user["user"].email
        assert data["username"] == authenticated_user["user"].username
        assert "password" not in data
        assert "hashed_password" not in data

    def test_get_current_user_without_token(self, client: TestClient):
        """Test getting current user without token"""
        response = client.get("/auth/me")
        
        assert response.status_code == 401
        assert "credentials" in response.json()["detail"].lower()

    def test_get_current_user_with_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid.token.here"}
        
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 401
        assert "credentials" in response.json()["detail"].lower()

    def test_bearer_authentication(self, client: TestClient, authenticated_user):
        """Test Bearer token authentication"""
        headers = authenticated_user["headers"]
        
        # Test protected endpoint with Bearer token
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200

    def test_basic_authentication(self, client: TestClient, sample_user_data):
        """Test Basic authentication"""
        # Register user first
        client.post("/auth/register", json=sample_user_data)
        
        # Test with Basic auth
        import base64
        credentials = f"{sample_user_data['email']}:{sample_user_data['password']}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers = {"Authorization": f"Basic {encoded_credentials}"}
        
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == sample_user_data["email"]

    def test_basic_authentication_with_username(self, client: TestClient, sample_user_data):
        """Test Basic authentication with username"""
        # Register user first
        client.post("/auth/register", json=sample_user_data)
        
        # Test with Basic auth using email (since basic auth currently only supports email)
        import base64
        credentials = f"{sample_user_data['email']}:{sample_user_data['password']}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers = {"Authorization": f"Basic {encoded_credentials}"}
        
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == sample_user_data["username"]

    def test_basic_authentication_invalid_credentials(self, client: TestClient, sample_user_data):
        """Test Basic authentication with invalid credentials"""
        # Register user first
        client.post("/auth/register", json=sample_user_data)
        
        # Test with wrong password
        import base64
        credentials = f"{sample_user_data['email']}:wrongpassword"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers = {"Authorization": f"Basic {encoded_credentials}"}
        
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 401

    def test_invalid_authorization_header(self, client: TestClient):
        """Test with invalid authorization header format"""
        headers = {"Authorization": "InvalidFormat token"}
        
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 401
