"""
Test configuration and fixtures for Todo List API
"""
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.models.user import User
from app.models.list import List
from app.models.task import Task
from app.services.auth_service import AuthService
from app.routers import auth, lists, tasks


# Use SQLite in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_test_app():
    """Create FastAPI app instance for testing"""
    app = FastAPI(title="Todo List API - Test")
    app.include_router(auth.router, tags=["auth"])
    app.include_router(lists.router, tags=["lists"])
    app.include_router(tasks.router, tags=["tasks"])
    
    # Add root endpoints for testing
    @app.get("/")
    def read_root():
        """Root endpoint"""
        return {
            "message": "Welcome to Todo List API - Test",
            "version": "1.0.0",
            "authentication": {
                "bearer_token": "Use JWT token from /auth/login",
                "basic_auth": "Use email:password for direct authentication"
            },
            "docs": "/docs",
            "redoc": "/redoc"
        }

    @app.get("/health")
    def health_check():
        """Health check endpoint"""
        return {"status": "healthy"}
    
    return app


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def override_get_db(db_session):
    """Override the get_db dependency"""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass
    return _override_get_db


@pytest.fixture
def client(override_get_db):
    """Create a test client"""
    from fastapi.testclient import TestClient
    
    app = create_test_app()
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
def auth_service(db_session):
    """Create AuthService instance for testing"""
    return AuthService(db_session)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPassword123!"
    }


@pytest.fixture
def sample_list_data():
    """Sample todo list data for testing"""
    return {
        "name": "Test List"
    }


@pytest.fixture
def sample_task_data():
    """Sample task data for testing"""
    return {
        "description": "A test task",
        "completed": False
    }


@pytest.fixture
def authenticated_user(client: TestClient, sample_user_data, db_session):
    """Create and authenticate a test user"""
    # Register user
    register_response = client.post("/auth/register", json=sample_user_data)
    assert register_response.status_code == 201
    
    # Login user
    login_data = {
        "email": sample_user_data["email"],
        "password": sample_user_data["password"]
    }
    login_response = client.post("/auth/login", json=login_data)
    assert login_response.status_code == 200
    
    token_data = login_response.json()
    access_token = token_data["token"]
    
    # Get user from database
    user = db_session.query(User).filter(User.email == sample_user_data["email"]).first()
    
    return {
        "user": user,
        "token": access_token,
        "headers": {"Authorization": f"Bearer {access_token}"}
    }


@pytest.fixture
def todo_list_with_tasks(client: TestClient, authenticated_user, sample_list_data, sample_task_data, db_session):
    """Create a todo list with sample tasks"""
    headers = authenticated_user["headers"]
    
    # Create todo list
    list_response = client.post("/lists", json=sample_list_data, headers=headers)
    assert list_response.status_code == 201
    todo_list = list_response.json()
    
    # Create sample tasks
    tasks = []
    for i in range(3):
        task_data = {
            **sample_task_data,
            "description": f"Description for task {i+1}"
        }
        task_response = client.post(
            f"/lists/{todo_list['id']}/tasks", 
            json=task_data, 
            headers=headers
        )
        assert task_response.status_code == 201
        tasks.append(task_response.json())
    
    return {
        "list": todo_list,
        "tasks": tasks,
        "user": authenticated_user["user"],
        "headers": headers
    }


# Event loop fixture for async tests
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    try:
        loop = asyncio.new_event_loop()
        yield loop
    finally:
        loop.close()
