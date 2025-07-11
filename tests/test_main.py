"""
Tests for main FastAPI application endpoints
"""
import pytest
from starlette.testclient import TestClient


class TestMainApp:
    """Test cases for main application endpoints"""

    def test_read_root(self, client: TestClient):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "authentication" in data
        assert "docs" in data
        assert "redoc" in data
        assert data["version"] == "1.0.0"
        assert "/docs" in data["docs"]
        assert "/redoc" in data["redoc"]

    def test_health_check(self, client: TestClient):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_docs_endpoint_accessible(self, client: TestClient):
        """Test that OpenAPI docs are accessible"""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_redoc_endpoint_accessible(self, client: TestClient):
        """Test that ReDoc docs are accessible"""
        response = client.get("/redoc")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_openapi_json_accessible(self, client: TestClient):
        """Test that OpenAPI JSON schema is accessible"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
