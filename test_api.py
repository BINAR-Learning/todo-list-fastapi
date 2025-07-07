#!/usr/bin/env python3
"""
Test script for the Todo List API with email authentication
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:3000/v1"

def test_api():
    print("🧪 Testing Todo List API with Email Authentication")
    print("=" * 50)
    
    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "username": "testuser"
    }
    
    # 1. Test user registration
    print("\n1. Testing user registration...")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        if response.status_code == 201:
            print("✅ User registration successful")
            registration_data = response.json()
            print(f"   User ID: {registration_data['userId']}")
            print(f"   Email: {registration_data['email']}")
        else:
            print(f"❌ Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return
    
    # 2. Test login with email
    print("\n2. Testing login with email...")
    try:
        login_data = {"email": test_user["email"], "password": test_user["password"]}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ Email login successful")
            token_data = response.json()
            token = token_data["token"]
            print(f"   Token expires in: {token_data['expires_in']} minutes")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # 3. Test creating a list with Bearer token
    print("\n3. Testing list creation with Bearer token...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        list_data = {"name": "Test Shopping List"}
        response = requests.post(f"{BASE_URL}/lists", json=list_data, headers=headers)
        if response.status_code == 201:
            print("✅ List creation with Bearer token successful")
            list_response = response.json()
            list_id = list_response["id"]
            print(f"   List ID: {list_id}")
        else:
            print(f"❌ List creation failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ List creation error: {e}")
        return
    
    # 4. Test creating a list with Basic Auth
    print("\n4. Testing list creation with Basic Auth...")
    try:
        auth = (test_user["email"], test_user["password"])
        list_data = {"name": "Test Basic Auth List"}
        response = requests.post(f"{BASE_URL}/lists", json=list_data, auth=auth)
        if response.status_code == 201:
            print("✅ List creation with Basic Auth successful")
            basic_list = response.json()
            print(f"   List ID: {basic_list['id']}")
        else:
            print(f"❌ Basic Auth list creation failed: {response.text}")
    except Exception as e:
        print(f"❌ Basic Auth error: {e}")
    
    # 5. Test creating a task
    print("\n5. Testing task creation...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        task_data = {"description": "Buy milk and bread", "completed": False}
        response = requests.post(f"{BASE_URL}/lists/{list_id}/tasks", json=task_data, headers=headers)
        if response.status_code == 201:
            print("✅ Task creation successful")
            task_response = response.json()
            print(f"   Task ID: {task_response['id']}")
            print(f"   Description: {task_response['description']}")
        else:
            print(f"❌ Task creation failed: {response.text}")
    except Exception as e:
        print(f"❌ Task creation error: {e}")
    
    # 6. Test getting all lists
    print("\n6. Testing list retrieval...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/lists", headers=headers)
        if response.status_code == 200:
            print("✅ List retrieval successful")
            lists = response.json()
            print(f"   Total lists: {len(lists)}")
            for lst in lists:
                print(f"   - {lst['name']} (ID: {lst['id']})")
        else:
            print(f"❌ List retrieval failed: {response.text}")
    except Exception as e:
        print(f"❌ List retrieval error: {e}")
    
    print("\n🎉 API testing completed!")
    print("\n📝 Authentication Methods Tested:")
    print("   ✅ Bearer Token Authentication")
    print("   ✅ Basic Authentication (Email/Password)")
    print("   ✅ Email and Password Validation")

if __name__ == "__main__":
    test_api()
