"""
Unit tests for Tasks routes
"""
import pytest
from fastapi.testclient import TestClient


class TestTasksRoutes:
    """Test cases for tasks endpoints"""

    def test_create_task_success(self, client: TestClient, todo_list_with_tasks, sample_task_data):
        """Test successful task creation"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        
        new_task_data = {
            "description": "A new test task",
            "completed": False
        }
        
        response = client.post(f"/lists/{list_id}/tasks", json=new_task_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["description"] == new_task_data["description"]
        assert data["completed"] is False
        assert data["listId"] == list_id

    def test_create_task_without_authentication(self, client: TestClient, sample_task_data):
        """Test creating task without authentication"""
        response = client.post("/lists/1/tasks", json=sample_task_data)
        
        assert response.status_code == 401

    def test_create_task_list_not_found(self, client: TestClient, authenticated_user, sample_task_data):
        """Test creating task for non-existent list"""
        headers = authenticated_user["headers"]
        
        response = client.post("/lists/999/tasks", json=sample_task_data, headers=headers)
        
        assert response.status_code == 404

    def test_create_task_not_list_owner(self, client: TestClient, sample_user_data, sample_list_data, sample_task_data):
        """Test creating task for list owned by another user"""
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
        
        # Try to create task in list owned by user1 as user2
        response = client.post(f"/lists/{list_id}/tasks", json=sample_task_data, headers=user2_headers)
        
        assert response.status_code == 404

    def test_create_task_without_description(self, client: TestClient, todo_list_with_tasks):
        """Test creating task without description"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        
        task_data = {"completed": False}  # Missing required description
        
        response = client.post(f"/lists/{list_id}/tasks", json=task_data, headers=headers)
        
        assert response.status_code == 422

    def test_create_task_missing_title(self, client: TestClient, todo_list_with_tasks):
        """Test creating task without title (should succeed since title not required)"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        
        task_data = {"description": "Task without title"}
        
        response = client.post(f"/lists/{list_id}/tasks", json=task_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Task without title"
        assert data["completed"] is False

    def test_get_tasks_success(self, client: TestClient, todo_list_with_tasks):
        """Test getting tasks from a todo list"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        
        response = client.get(f"/lists/{list_id}/tasks", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3  # From fixture
        assert all("id" in task for task in data)
        assert all("description" in task for task in data)

    def test_get_tasks_without_authentication(self, client: TestClient):
        """Test getting tasks without authentication"""
        response = client.get("/lists/1/tasks")
        
        assert response.status_code == 401

    def test_get_tasks_list_not_found(self, client: TestClient, authenticated_user):
        """Test getting tasks from non-existent list"""
        headers = authenticated_user["headers"]
        
        response = client.get("/lists/999/tasks", headers=headers)
        
        assert response.status_code == 404

    def test_get_tasks_empty_list(self, client: TestClient, authenticated_user, sample_list_data):
        """Test getting tasks from empty list"""
        headers = authenticated_user["headers"]
        
        # Create empty list
        create_response = client.post("/lists", json=sample_list_data, headers=headers)
        list_id = create_response.json()["id"]
        
        response = client.get(f"/lists/{list_id}/tasks", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_task_by_id_success(self, client: TestClient, todo_list_with_tasks):
        """Test getting a specific task by ID"""
        headers = todo_list_with_tasks["headers"]
        task_id = todo_list_with_tasks["tasks"][0]["id"]
        
        response = client.get(f"/tasks/{task_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert "description" in data
        assert "listId" in data

    def test_get_task_by_id_not_found(self, client: TestClient, todo_list_with_tasks):
        """Test getting non-existent task"""
        headers = todo_list_with_tasks["headers"]
        
        response = client.get(f"/tasks/999", headers=headers)
        
        assert response.status_code == 404

    def test_get_task_wrong_list(self, client: TestClient, todo_list_with_tasks, authenticated_user, sample_list_data):
        """Test getting task from wrong list"""
        headers = todo_list_with_tasks["headers"]
        task_id = todo_list_with_tasks["tasks"][0]["id"]
        
        # Create another list
        create_response = client.post("/lists", json=sample_list_data, headers=headers)
        other_list_id = create_response.json()["id"]
        
        # Try to get task from wrong list
        response = client.get(f"/lists/{other_list_id}/tasks/{task_id}", headers=headers)
        
        assert response.status_code == 404

    def test_update_task_success(self, client: TestClient, todo_list_with_tasks):
        """Test updating a task"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        task_id = todo_list_with_tasks["tasks"][0]["id"]
        
        update_data = {
            "description": "Updated description",
            "completed": True
        }
        
        response = client.put(f"/tasks/{task_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == update_data["description"]
        assert data["completed"] is True

    def test_update_task_not_found(self, client: TestClient, todo_list_with_tasks):
        """Test updating non-existent task"""
        headers = todo_list_with_tasks["headers"]
        
        update_data = {"description": "Updated description"}
        
        response = client.put(f"/tasks/999", json=update_data, headers=headers)
        
        assert response.status_code == 404

    def test_toggle_task_completion(self, client: TestClient, todo_list_with_tasks):
        """Test toggling task completion status"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        task_id = todo_list_with_tasks["tasks"][0]["id"]
        
        # Mark as completed
        update_data = {"completed": True}
        response = client.put(f"/tasks/{task_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["completed"] is True
        
        # Mark as not completed
        update_data = {"completed": False}
        response = client.put(f"/tasks/{task_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["completed"] is False

    def test_delete_task_success(self, client: TestClient, todo_list_with_tasks):
        """Test deleting a task"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        task_id = todo_list_with_tasks["tasks"][0]["id"]
        
        response = client.delete(f"/tasks/{task_id}", headers=headers)
        
        assert response.status_code == 204
        
        # Verify task is deleted
        get_response = client.get(f"/tasks/{task_id}", headers=headers)
        assert get_response.status_code == 404

    def test_delete_task_not_found(self, client: TestClient, todo_list_with_tasks):
        """Test deleting non-existent task"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        
        response = client.delete(f"/tasks/999", headers=headers)
        
        assert response.status_code == 404

    def test_delete_all_tasks_on_list_deletion(self, client: TestClient, todo_list_with_tasks):
        """Test that all tasks are deleted when list is deleted"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        task_ids = [task["id"] for task in todo_list_with_tasks["tasks"]]
        
        # Delete the list
        response = client.delete(f"/lists/{list_id}", headers=headers)
        assert response.status_code == 204
        
        # Verify all tasks are deleted
        for task_id in task_ids:
            get_response = client.get(f"/tasks/{task_id}", headers=headers)
            assert get_response.status_code == 404

    def test_filter_completed_tasks(self, client: TestClient, todo_list_with_tasks):
        """Test filtering tasks by completion status"""
        headers = todo_list_with_tasks["headers"]
        list_id = todo_list_with_tasks["list"]["id"]
        
        # Mark first task as completed
        task_id = todo_list_with_tasks["tasks"][0]["id"]
        client.put(f"/tasks/{task_id}", 
                        json={"completed": True}, headers=headers)
        
        # Get all tasks
        response = client.get(f"/lists/{list_id}/tasks", headers=headers)
        all_tasks = response.json()
        
        completed_tasks = [task for task in all_tasks if task["completed"]]
        incomplete_tasks = [task for task in all_tasks if not task["completed"]]
        
        assert len(completed_tasks) == 1
        assert len(incomplete_tasks) == 2
        assert completed_tasks[0]["id"] == task_id
