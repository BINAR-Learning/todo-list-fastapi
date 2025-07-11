"""
Unit tests for Todo Lists routes
"""
import pytest
from fastapi.testclient import TestClient


class TestListsRoutes:
    """Test cases for todo lists endpoints"""

    def test_create_todo_list_success(self, client: TestClient, authenticated_user, sample_list_data):
        """Test successful todo list creation"""
        headers = authenticated_user["headers"]
        
        response = client.post("/lists", json=sample_list_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == sample_list_data["name"]
        assert data["userId"] == authenticated_user["user"].id

    def test_create_todo_list_without_authentication(self, client: TestClient, sample_list_data):
        """Test creating todo list without authentication"""
        response = client.post("/lists", json=sample_list_data)
        
        assert response.status_code == 401

    def test_create_todo_list_without_description(self, client: TestClient, authenticated_user):
        """Test creating todo list without description"""
        headers = authenticated_user["headers"]
        list_data = {"name": "Test List"}
        
        response = client.post("/lists", json=list_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test List"

    def test_create_todo_list_missing_name(self, client: TestClient, authenticated_user):
        """Test creating todo list without name"""
        headers = authenticated_user["headers"]
        list_data = {}  # Empty data, missing required name field
        
        response = client.post("/lists", json=list_data, headers=headers)
        
        assert response.status_code == 422

    def test_get_todo_lists_success(self, client: TestClient, authenticated_user, sample_list_data):
        """Test getting user's todo lists"""
        headers = authenticated_user["headers"]
        
        # Create some todo lists
        client.post("/lists", json=sample_list_data, headers=headers)
        client.post("/lists", json={
            "name": "Second List",
            "description": "Another test list"
        }, headers=headers)
        
        # Get lists
        response = client.get("/lists", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all("id" in item for item in data)
        assert all("name" in item for item in data)

    def test_get_todo_lists_without_authentication(self, client: TestClient):
        """Test getting todo lists without authentication"""
        response = client.get("/lists")
        
        assert response.status_code == 401

    def test_get_todo_lists_empty(self, client: TestClient, authenticated_user):
        """Test getting todo lists when user has none"""
        headers = authenticated_user["headers"]
        
        response = client.get("/lists", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_todo_list_by_id_success(self, client: TestClient, authenticated_user, sample_list_data):
        """Test getting a specific todo list by ID"""
        headers = authenticated_user["headers"]
        
        # Create todo list
        create_response = client.post("/lists", json=sample_list_data, headers=headers)
        list_id = create_response.json()["id"]
        
        # Get specific list
        response = client.get(f"/lists/{list_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == list_id
        assert data["name"] == sample_list_data["name"]

    def test_get_todo_list_by_id_not_found(self, client: TestClient, authenticated_user):
        """Test getting non-existent todo list"""
        headers = authenticated_user["headers"]
        
        response = client.get("/lists/999", headers=headers)
        
        assert response.status_code == 404

    def test_get_todo_list_by_id_not_owner(self, client: TestClient, sample_user_data, sample_list_data):
        """Test getting todo list owned by another user"""
        # Create first user and list
        user1_response = client.post("/auth/register", json=sample_user_data)
        assert user1_response.status_code == 201
        
        login1_response = client.post("/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {login1_response.json()['token']}"}
        
        create_response = client.post("/lists", json=sample_list_data, headers=user1_headers)
        list_id = create_response.json()["id"]
        
        # Create second user
        user2_data = {
            "email": "user2@example.com",
            "username": "user2",
            "password": "TestPassword123!"
        }
        client.post("/auth/register", json=user2_data)
        login2_response = client.post("/auth/login", json={
            "email": user2_data["email"],
            "password": user2_data["password"]
        })
        user2_headers = {"Authorization": f"Bearer {login2_response.json()['token']}"}
        
        # Try to get list owned by user1 as user2
        response = client.get(f"/lists/{list_id}", headers=user2_headers)
        
        assert response.status_code == 404

    def test_update_todo_list_success(self, client: TestClient, authenticated_user, sample_list_data):
        """Test updating a todo list"""
        headers = authenticated_user["headers"]
        
        # Create todo list
        create_response = client.post("/lists", json=sample_list_data, headers=headers)
        list_id = create_response.json()["id"]
        
        # Update list
        update_data = {
            "name": "Updated Name"
        }
        response = client.put(f"/lists/{list_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]

    def test_update_todo_list_not_found(self, client: TestClient, authenticated_user):
        """Test updating non-existent todo list"""
        headers = authenticated_user["headers"]
        update_data = {"name": "Updated Title"}
        
        response = client.put("/lists/999", json=update_data, headers=headers)
        
        assert response.status_code == 404

    def test_update_todo_list_not_owner(self, client: TestClient, sample_user_data, sample_list_data):
        """Test updating todo list owned by another user"""
        # Create first user and list
        user1_response = client.post("/auth/register", json=sample_user_data)
        login1_response = client.post("/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {login1_response.json()['token']}"}
        
        create_response = client.post("/lists", json=sample_list_data, headers=user1_headers)
        list_id = create_response.json()["id"]
        
        # Create second user
        user2_data = {
            "email": "user2@example.com",
            "username": "user2",
            "password": "TestPassword123!"
        }
        client.post("/auth/register", json=user2_data)
        login2_response = client.post("/auth/login", json={
            "email": user2_data["email"],
            "password": user2_data["password"]
        })
        user2_headers = {"Authorization": f"Bearer {login2_response.json()['token']}"}
        
        # Try to update list owned by user1 as user2
        update_data = {"name": "Hacked Title"}
        response = client.put(f"/lists/{list_id}", json=update_data, headers=user2_headers)
        
        assert response.status_code == 404

    def test_delete_todo_list_success(self, client: TestClient, authenticated_user, sample_list_data):
        """Test deleting a todo list"""
        headers = authenticated_user["headers"]
        
        # Create todo list
        create_response = client.post("/lists", json=sample_list_data, headers=headers)
        list_id = create_response.json()["id"]
        
        # Delete list
        response = client.delete(f"/lists/{list_id}", headers=headers)
        
        assert response.status_code == 204
        
        # Verify list is deleted
        get_response = client.get(f"/lists/{list_id}", headers=headers)
        assert get_response.status_code == 404

    def test_delete_todo_list_not_found(self, client: TestClient, authenticated_user):
        """Test deleting non-existent todo list"""
        headers = authenticated_user["headers"]
        
        response = client.delete("/lists/999", headers=headers)
        
        assert response.status_code == 404

    def test_delete_todo_list_not_owner(self, client: TestClient, sample_user_data, sample_list_data):
        """Test deleting todo list owned by another user"""
        # Create first user and list
        user1_response = client.post("/auth/register", json=sample_user_data)
        login1_response = client.post("/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {login1_response.json()['token']}"}
        
        create_response = client.post("/lists", json=sample_list_data, headers=user1_headers)
        list_id = create_response.json()["id"]
        
        # Create second user
        user2_data = {
            "email": "user2@example.com",
            "username": "user2",
            "password": "TestPassword123!"
        }
        client.post("/auth/register", json=user2_data)
        login2_response = client.post("/auth/login", json={
            "email": user2_data["email"],
            "password": user2_data["password"]
        })
        user2_headers = {"Authorization": f"Bearer {login2_response.json()['token']}"}
        
        # Try to delete list owned by user1 as user2
        response = client.delete(f"/lists/{list_id}", headers=user2_headers)
        
        assert response.status_code == 404
