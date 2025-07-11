"""
Integration tests for Todo List API
Tests complete workflows and end-to-end scenarios
"""
import pytest
from starlette.testclient import TestClient


class TestIntegrationWorkflows:
    """Integration test cases for complete workflows"""

    def test_complete_user_workflow(self, client: TestClient):
        """Test complete user workflow from registration to todo management"""
        # 1. Register user
        user_data = {
            "email": "integration@example.com",
            "username": "integrationuser",
            "password": "TestPassword123!"
        }
        register_response = client.post("/auth/register", json=user_data)
        assert register_response.status_code == 201
        user = register_response.json()
        
        # 2. Login user
        login_response = client.post("/auth/login", json={
            "email": user_data["email"],
            "password": user_data["password"]
        })
        assert login_response.status_code == 200
        token_data = login_response.json()
        headers = {"Authorization": f"Bearer {token_data['token']}"}
        
        # 3. Verify authenticated user
        me_response = client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200
        assert me_response.json()["email"] == user_data["email"]
        
        # 4. Create todo lists
        list1_data = {"name": "Work Tasks", "description": "Tasks for work"}
        list1_response = client.post("/lists", json=list1_data, headers=headers)
        assert list1_response.status_code == 201
        list1 = list1_response.json()
        
        list2_data = {"name": "Personal Tasks", "description": "Personal tasks"}
        list2_response = client.post("/lists", json=list2_data, headers=headers)
        assert list2_response.status_code == 201
        list2 = list2_response.json()
        
        # 5. Verify lists are created
        lists_response = client.get("/lists", headers=headers)
        assert lists_response.status_code == 200
        lists = lists_response.json()
        assert len(lists) == 2
        
        # 6. Add tasks to first list
        task1_data = {"description": "Review PR #123"}
        task1_response = client.post(f"/lists/{list1['id']}/tasks", 
                                         json=task1_data, headers=headers)
        assert task1_response.status_code == 201
        task1 = task1_response.json()
        
        task2_data = {"description": "Write unit tests"}
        task2_response = client.post(f"/lists/{list1['id']}/tasks", 
                                         json=task2_data, headers=headers)
        assert task2_response.status_code == 201
        task2 = task2_response.json()
        
        # 7. Add task to second list
        task3_data = {"description": "Milk, bread, eggs"}
        task3_response = client.post(f"/lists/{list2['id']}/tasks", 
                                         json=task3_data, headers=headers)
        assert task3_response.status_code == 201
        task3 = task3_response.json()
        
        # 8. Verify tasks are in correct lists
        list1_tasks_response = client.get(f"/lists/{list1['id']}/tasks", headers=headers)
        assert list1_tasks_response.status_code == 200
        list1_tasks = list1_tasks_response.json()
        assert len(list1_tasks) == 2
        
        list2_tasks_response = client.get(f"/lists/{list2['id']}/tasks", headers=headers)
        assert list2_tasks_response.status_code == 200
        list2_tasks = list2_tasks_response.json()
        assert len(list2_tasks) == 1
        
        # 9. Complete some tasks
        complete_response = client.put(f"/tasks/{task1['id']}", 
                                           json={"completed": True}, headers=headers)
        assert complete_response.status_code == 200
        assert complete_response.json()["completed"] is True
        
        # 10. Update task
        update_response = client.put(f"/tasks/{task3['id']}", 
                                         json={"description": "Buy groceries and snacks"}, 
                                         headers=headers)
        assert update_response.status_code == 200
        assert update_response.json()["description"] == "Buy groceries and snacks"
        
        # 11. Delete a task
        delete_task_response = client.delete(f"/tasks/{task2['id']}", 
                                                 headers=headers)
        assert delete_task_response.status_code == 204
        
        # 12. Verify task is deleted
        get_deleted_task_response = client.get(f"/tasks/{task2['id']}", 
                                                   headers=headers)
        assert get_deleted_task_response.status_code == 404
        
        # 13. Delete a list (and its tasks)
        delete_list_response = client.delete(f"/lists/{list2['id']}", headers=headers)
        assert delete_list_response.status_code == 204
        
        # 14. Verify list and its tasks are deleted
        get_deleted_list_response = client.get(f"/lists/{list2['id']}", headers=headers)
        assert get_deleted_list_response.status_code == 404
        
        get_deleted_list_task_response = client.get(f"/tasks/{task3['id']}", 
                                                        headers=headers)
        assert get_deleted_list_task_response.status_code == 404
        
        # 15. Final verification
        final_lists_response = client.get("/lists", headers=headers)
        assert final_lists_response.status_code == 200
        final_lists = final_lists_response.json()
        assert len(final_lists) == 1
        assert final_lists[0]["id"] == list1["id"]

    def test_multi_user_isolation(self, client: TestClient):
        """Test that users cannot access each other's data"""
        # Create first user
        user1_data = {
            "email": "user1@example.com",
            "username": "user1",
            "password": "TestPassword123!"
        }
        client.post("/auth/register", json=user1_data)
        login1_response = client.post("/auth/login", json={
            "email": user1_data["email"],
            "password": user1_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {login1_response.json()['token']}"}
        
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
        
        # User1 creates a list and task
        list_data = {"name": "User1's List", "description": "Private list"}
        list_response = client.post("/lists", json=list_data, headers=user1_headers)
        user1_list = list_response.json()
        
        task_data = {"description": "Private task"}
        task_response = client.post(f"/lists/{user1_list['id']}/tasks", 
                                        json=task_data, headers=user1_headers)
        user1_task = task_response.json()
        
        # User2 should not see User1's lists
        user2_lists_response = client.get("/lists", headers=user2_headers)
        assert user2_lists_response.status_code == 200
        user2_lists = user2_lists_response.json()
        assert len(user2_lists) == 0
        
        # User2 should not be able to access User1's list
        access_list_response = client.get(f"/lists/{user1_list['id']}", headers=user2_headers)
        assert access_list_response.status_code == 404
        
        # User2 should not be able to access User1's tasks
        access_tasks_response = client.get(f"/lists/{user1_list['id']}/tasks", headers=user2_headers)
        assert access_tasks_response.status_code == 404
        
        access_task_response = client.get(f"/tasks/{user1_task['id']}", 
                                              headers=user2_headers)
        assert access_task_response.status_code == 404
        
        # User2 should not be able to modify User1's list
        update_list_response = client.put(f"/lists/{user1_list['id']}", 
                                               json={"name": "Hacked"}, 
                                               headers=user2_headers)
        assert update_list_response.status_code == 404
        
        # User2 should not be able to modify User1's task
        update_task_response = client.put(f"/tasks/{user1_task['id']}", 
                                               json={"description": "Hacked task"}, 
                                               headers=user2_headers)
        assert update_task_response.status_code == 404
        
        # User2 should not be able to delete User1's data
        delete_task_response = client.delete(f"/tasks/{user1_task['id']}", 
                                                  headers=user2_headers)
        assert delete_task_response.status_code == 404
        
        delete_list_response = client.delete(f"/lists/{user1_list['id']}", headers=user2_headers)
        assert delete_list_response.status_code == 404

    def test_authentication_methods_workflow(self, client: TestClient):
        """Test different authentication methods work consistently"""
        # Register user
        user_data = {
            "email": "auth@example.com",
            "username": "authuser",
            "password": "TestPassword123!"
        }
        client.post("/auth/register", json=user_data)
        
        # Test Bearer token authentication
        login_response = client.post("/auth/login", json={
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_response.json()["token"]
        bearer_headers = {"Authorization": f"Bearer {token}"}
        
        # Test Basic authentication
        import base64
        credentials = f"{user_data['email']}:{user_data['password']}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        basic_headers = {"Authorization": f"Basic {encoded_credentials}"}
        
        # Test both auth methods work for getting user info
        bearer_response = client.get("/auth/me", headers=bearer_headers)
        assert bearer_response.status_code == 200
        
        basic_response = client.get("/auth/me", headers=basic_headers)
        assert basic_response.status_code == 200
        
        # Both should return same user data
        assert bearer_response.json()["email"] == basic_response.json()["email"]
        
        # Test both auth methods work for creating lists
        list_data = {"name": "Test List", "description": "Auth test"}
        
        bearer_list_response = client.post("/lists", json=list_data, headers=bearer_headers)
        assert bearer_list_response.status_code == 201
        bearer_list = bearer_list_response.json()
        
        basic_list_response = client.post("/lists", json={
            "name": "Basic Auth List", 
            "description": "Created with Basic auth"
        }, headers=basic_headers)
        assert basic_list_response.status_code == 201
        basic_list = basic_list_response.json()
        
        # Both users should see both lists (same user, different auth methods)
        bearer_lists_response = client.get("/lists", headers=bearer_headers)
        basic_lists_response = client.get("/lists", headers=basic_headers)
        
        assert bearer_lists_response.status_code == 200
        assert basic_lists_response.status_code == 200
        assert len(bearer_lists_response.json()) == 2
        assert len(basic_lists_response.json()) == 2

    def test_error_handling_workflow(self, client: TestClient):
        """Test various error scenarios and proper error handling"""
        # Test unauthenticated access
        unauth_response = client.get("/lists")
        assert unauth_response.status_code == 401
        
        # Test invalid token
        invalid_headers = {"Authorization": "Bearer invalid.token.here"}
        invalid_response = client.get("/auth/me", headers=invalid_headers)
        assert invalid_response.status_code == 401
        
        # Create valid user for further tests
        user_data = {
            "email": "error@example.com",
            "username": "erroruser",
            "password": "TestPassword123!"
        }
        client.post("/auth/register", json=user_data)
        login_response = client.post("/auth/login", json={
            "email": user_data["email"],
            "password": user_data["password"]
        })
        headers = {"Authorization": f"Bearer {login_response.json()['token']}"}
        
        # Test accessing non-existent resources
        not_found_list_response = client.get("/lists/999", headers=headers)
        assert not_found_list_response.status_code == 404
        
        not_found_task_response = client.get("/tasks/999", headers=headers)
        assert not_found_task_response.status_code == 404
        
        # Test validation errors
        invalid_list_response = client.post("/lists", json={}, headers=headers)
        assert invalid_list_response.status_code == 422
        
        invalid_task_response = client.post("/lists/1/tasks", json={}, headers=headers)
        assert invalid_task_response.status_code == 422
        
        # Test duplicate registration
        duplicate_response = client.post("/auth/register", json=user_data)
        assert duplicate_response.status_code == 400
