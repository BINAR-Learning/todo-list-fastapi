@echo off
REM Test runner script for Todo List API (Windows)
REM This script runs all tests with different configurations

echo === Todo List API Test Suite ===
echo Running comprehensive test suite...
echo.

REM Set environment variables for testing
set TESTING=true
set DATABASE_URL=sqlite:///:memory:
set PYTHONPATH=%CD%

REM Check if pytest is installed
pytest --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pytest is not installed. Please install it with: pip install pytest
    exit /b 1
)

REM Run tests based on argument or default to all tests
if "%1"=="unit" (
    echo [INFO] Running unit tests only...
    python -m pytest tests\test_models_*.py tests\test_services_*.py -v
    goto :check_results
)

if "%1"=="routes" (
    echo [INFO] Running route tests only...
    python -m pytest tests\test_routes_*.py -v
    goto :check_results
)

if "%1"=="integration" (
    echo [INFO] Running integration tests only...
    python -m pytest tests\test_integration.py -v
    goto :check_results
)

if "%1"=="auth" (
    echo [INFO] Running authentication tests only...
    python -m pytest tests\test_routes_auth.py tests\test_services_auth.py -v
    goto :check_results
)

if "%1"=="models" (
    echo [INFO] Running model tests only...
    python -m pytest tests\test_models_*.py -v
    goto :check_results
)

if "%1"=="coverage" (
    echo [INFO] Running all tests with coverage report...
    python -m pytest --cov=app --cov-report=term-missing --cov-report=html:htmlcov --cov-fail-under=80
    echo [INFO] Coverage report generated in htmlcov\ directory
    goto :check_results
)

if "%1"=="fast" (
    echo [INFO] Running fast tests only (excluding slow tests)...
    python -m pytest -m "not slow" -v
    goto :check_results
)

if "%1"=="debug" (
    echo [INFO] Running tests in debug mode...
    python -m pytest -v -s --tb=long
    goto :check_results
)

if "%1"=="clean" (
    echo [INFO] Cleaning test artifacts...
    if exist .pytest_cache rmdir /s /q .pytest_cache
    if exist htmlcov rmdir /s /q htmlcov
    if exist .coverage del /q .coverage
    for /d /r %%i in (__pycache__) do if exist "%%i" rmdir /s /q "%%i"
    for /r %%i in (*.pyc) do if exist "%%i" del /q "%%i"
    echo [INFO] Test artifacts cleaned
    goto :end
)

if "%1"=="help" (
    echo Usage: %0 [option]
    echo.
    echo Options:
    echo   unit        Run unit tests only (models, services)
    echo   routes      Run route/endpoint tests only
    echo   integration Run integration tests only
    echo   auth        Run authentication-related tests only
    echo   models      Run model tests only
    echo   coverage    Run all tests with coverage report
    echo   fast        Run fast tests only (exclude slow tests)
    echo   debug       Run tests in debug mode with verbose output
    echo   clean       Clean test artifacts and cache
    echo   help        Show this help message
    echo.
    echo Default: Run all tests
    goto :end
)

REM Default: run all tests
echo [INFO] Running all tests...
python -m pytest tests\ -v

:check_results
if errorlevel 1 (
    echo [ERROR] Some tests failed! ❌
    exit /b 1
) else (
    echo [INFO] All tests passed! ✅
)

:end
