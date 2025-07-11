# Testing Documentation

Comprehensive testing guide for the Todo List API project.

## Overview

This project uses **pytest** as the primary testing framework with support for async operations, database testing, and comprehensive coverage reporting.

## Test Architecture

### Test Categories

1. **Unit Tests** - Test individual components in isolation
   - Model validation and relationships
   - Service layer business logic
   - Authentication mechanisms

2. **Route Tests** - Test API endpoints
   - HTTP request/response handling
   - Authentication and authorization
   - Data validation and error handling

3. **Integration Tests** - Test complete workflows
   - End-to-end user scenarios
   - Multi-user interactions
   - Error handling across layers

### Test Structure

```
tests/
├── __init__.py
├── conftest.py                    # Test configuration and fixtures
├── test_models_user.py           # User model tests
├── test_models_todo_list.py      # TodoList model tests
├── test_models_task.py           # Task model tests
├── test_services_auth.py         # Authentication service tests
├── test_routes_auth.py           # Authentication endpoint tests
├── test_routes_lists.py          # Todo lists endpoint tests
├── test_routes_tasks.py          # Tasks endpoint tests
└── test_integration.py           # Integration and workflow tests
```

## Test Configuration

### pytest.ini

The project uses `pytest.ini` for configuration:

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --disable-warnings
    --color=yes
    --durations=10
    --cov=app
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-fail-under=80
filterwarnings =
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    auth: marks tests related to authentication
    models: marks tests related to database models
    routes: marks tests related to API routes
    services: marks tests related to service layer
asyncio_mode = auto
```

### Test Database

Tests use an in-memory SQLite database for:
- **Isolation**: Each test gets a fresh database
- **Speed**: Fast test execution
- **Simplicity**: No external database setup required

Configuration in `conftest.py`:

```python
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
```

## Running Tests

### Basic Commands

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_models_user.py

# Run specific test class
pytest tests/test_models_user.py::TestUserModel

# Run specific test method
pytest tests/test_models_user.py::TestUserModel::test_create_user

# Run tests matching pattern
pytest -k "test_create" -v
```

### Test Categories

```bash
# Unit tests only
pytest tests/test_models_*.py tests/test_services_*.py -v

# Route tests only
pytest tests/test_routes_*.py -v

# Integration tests only
pytest tests/test_integration.py -v

# Authentication tests only
pytest tests/test_routes_auth.py tests/test_services_auth.py -v

# Fast tests only (exclude slow tests)
pytest -m "not slow" -v
```

### Coverage Reports

```bash
# Basic coverage report
pytest --cov=app

# Detailed coverage report
pytest --cov=app --cov-report=term-missing

# HTML coverage report
pytest --cov=app --cov-report=html:htmlcov

# Multiple report formats
pytest --cov=app --cov-report=term-missing --cov-report=html:htmlcov
```

### Test Runner Scripts

Use the provided scripts for common test scenarios:

**Windows:**
```cmd
run_tests.bat [option]
```

**Linux/Mac:**
```bash
./run_tests.sh [option]
```

Available options:
- `unit` - Run unit tests only
- `routes` - Run route tests only
- `integration` - Run integration tests only
- `auth` - Run authentication tests only
- `models` - Run model tests only
- `coverage` - Run with coverage report
- `fast` - Run fast tests only
- `debug` - Run in debug mode
- `clean` - Clean test artifacts

## Test Fixtures

### Database Fixtures

- `db_session` - Fresh database session for each test
- `override_get_db` - Override database dependency
- `client` - Async HTTP client for API testing

### Authentication Fixtures

- `auth_service` - AuthService instance
- `authenticated_user` - User with valid JWT token
- `sample_user_data` - Sample user registration data

### Data Fixtures

- `sample_list_data` - Sample todo list data
- `sample_task_data` - Sample task data
- `todo_list_with_tasks` - Pre-populated list with tasks

## Test Patterns

### Model Testing

```python
def test_create_user(self, db_session):
    """Test creating a new user"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.email == "test@example.com"
```

### Service Testing

```python
def test_authenticate_user(self, auth_service, db_session):
    """Test user authentication"""
    # Setup
    password = "testpassword123"
    user = create_test_user(db_session, password)
    
    # Test
    result = auth_service.authenticate_user(
        db_session, user.email, password
    )
    
    # Assert
    assert result == user
```

### Route Testing

```python
async def test_create_todo_list(self, client, authenticated_user):
    """Test creating a todo list"""
    headers = authenticated_user["headers"]
    list_data = {"title": "Test List"}
    
    response = await client.post("/lists", json=list_data, headers=headers)
    
    assert response.status_code == 201
    assert response.json()["title"] == "Test List"
```

### Integration Testing

```python
async def test_complete_user_workflow(self, client):
    """Test complete user workflow"""
    # 1. Register user
    user_data = {"email": "test@example.com", "password": "pass123"}
    register_response = await client.post("/auth/register", json=user_data)
    assert register_response.status_code == 201
    
    # 2. Login user
    login_response = await client.post("/auth/login", json=user_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create todo list
    list_response = await client.post("/lists", 
                                    json={"title": "Test List"}, 
                                    headers=headers)
    assert list_response.status_code == 201
    
    # ... continue workflow
```

## Best Practices

### Test Organization

1. **One test class per component** - Keep tests organized
2. **Descriptive test names** - Use clear, descriptive names
3. **Arrange-Act-Assert** - Structure tests clearly
4. **Test isolation** - Each test should be independent

### Test Data

1. **Use fixtures** - Create reusable test data
2. **Avoid hardcoded values** - Use variables for test data
3. **Test edge cases** - Include boundary conditions
4. **Test error scenarios** - Verify error handling

### Authentication Testing

1. **Test both auth methods** - Bearer token and Basic auth
2. **Test unauthorized access** - Verify protection
3. **Test token expiration** - Handle expired tokens
4. **Test user isolation** - Verify data access controls

### Database Testing

1. **Fresh database per test** - Use `db_session` fixture
2. **Test relationships** - Verify model associations
3. **Test constraints** - Verify database rules
4. **Test cascading** - Verify deletion behavior

## Coverage Goals

- **Minimum coverage**: 80%
- **Target coverage**: 90%+
- **Critical paths**: 100% coverage for auth and security

### Coverage Analysis

```bash
# Generate coverage report
pytest --cov=app --cov-report=html:htmlcov

# View coverage report
open htmlcov/index.html
```

Coverage areas to focus on:
- Authentication and authorization logic
- Database operations and relationships
- API endpoint validation
- Error handling and edge cases

## Continuous Integration

Tests are designed to run in CI/CD environments:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure `PYTHONPATH` includes project root
2. **Database errors**: Check database connection settings
3. **Async errors**: Use `pytest-asyncio` for async tests
4. **Authentication errors**: Verify JWT token generation

### Debug Mode

```bash
# Run tests in debug mode
pytest -v -s --tb=long

# Run single test with debugging
pytest tests/test_models_user.py::TestUserModel::test_create_user -v -s
```

### Performance

```bash
# Show test durations
pytest --durations=10

# Run only fast tests
pytest -m "not slow"

# Parallel execution (requires pytest-xdist)
pip install pytest-xdist
pytest -n auto
```

## Test Maintenance

### Adding New Tests

1. **Create test file** - Follow naming convention `test_*.py`
2. **Add test class** - Use `Test*` naming convention
3. **Write test methods** - Use `test_*` naming convention
4. **Use fixtures** - Leverage existing fixtures
5. **Update documentation** - Document new test scenarios

### Updating Tests

1. **Keep tests current** - Update tests when code changes
2. **Maintain coverage** - Ensure new code is tested
3. **Review test output** - Check for warnings or deprecations
4. **Update fixtures** - Modify fixtures as needed

### Test Performance

1. **Monitor test duration** - Keep tests fast
2. **Use appropriate fixtures** - Don't over-engineer test setup
3. **Optimize database operations** - Use efficient queries
4. **Parallel execution** - Use pytest-xdist for large test suites
