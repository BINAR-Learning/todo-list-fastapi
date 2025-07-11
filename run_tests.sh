#!/bin/bash

# Test runner script for Todo List API
# This script runs all tests with different configurations

echo "=== Todo List API Test Suite ==="
echo "Running comprehensive test suite..."
echo

# Set environment variables for testing
export TESTING=true
export DATABASE_URL="sqlite:///:memory:"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    print_error "pytest is not installed. Please install it with: pip install pytest"
    exit 1
fi

# Run tests based on argument or default to all tests
case "$1" in
    "unit")
        print_status "Running unit tests only..."
        pytest tests/test_models_*.py tests/test_services_*.py -v
        ;;
    "routes")
        print_status "Running route tests only..."
        pytest tests/test_routes_*.py -v
        ;;
    "integration")
        print_status "Running integration tests only..."
        pytest tests/test_integration.py -v
        ;;
    "auth")
        print_status "Running authentication tests only..."
        pytest tests/test_routes_auth.py tests/test_services_auth.py -v
        ;;
    "models")
        print_status "Running model tests only..."
        pytest tests/test_models_*.py -v
        ;;
    "coverage")
        print_status "Running all tests with coverage report..."
        pytest --cov=app --cov-report=term-missing --cov-report=html:htmlcov --cov-fail-under=80
        print_status "Coverage report generated in htmlcov/ directory"
        ;;
    "fast")
        print_status "Running fast tests only (excluding slow tests)..."
        pytest -m "not slow" -v
        ;;
    "slow")
        print_status "Running slow tests only..."
        pytest -m "slow" -v
        ;;
    "debug")
        print_status "Running tests in debug mode..."
        pytest -v -s --tb=long
        ;;
    "parallel")
        print_status "Running tests in parallel..."
        if command -v pytest-xdist &> /dev/null; then
            pytest -n auto
        else
            print_warning "pytest-xdist not installed. Running sequentially..."
            pytest
        fi
        ;;
    "watch")
        print_status "Running tests in watch mode..."
        if command -v pytest-watch &> /dev/null; then
            ptw
        else
            print_warning "pytest-watch not installed. Running once..."
            pytest
        fi
        ;;
    "clean")
        print_status "Cleaning test artifacts..."
        rm -rf .pytest_cache/
        rm -rf htmlcov/
        rm -rf .coverage
        rm -rf __pycache__/
        find . -name "*.pyc" -delete
        find . -name "__pycache__" -type d -exec rm -rf {} +
        print_status "Test artifacts cleaned"
        ;;
    "help")
        echo "Usage: $0 [option]"
        echo
        echo "Options:"
        echo "  unit        Run unit tests only (models, services)"
        echo "  routes      Run route/endpoint tests only"
        echo "  integration Run integration tests only"
        echo "  auth        Run authentication-related tests only"
        echo "  models      Run model tests only"
        echo "  coverage    Run all tests with coverage report"
        echo "  fast        Run fast tests only (exclude slow tests)"
        echo "  slow        Run slow tests only"
        echo "  debug       Run tests in debug mode with verbose output"
        echo "  parallel    Run tests in parallel (requires pytest-xdist)"
        echo "  watch       Run tests in watch mode (requires pytest-watch)"
        echo "  clean       Clean test artifacts and cache"
        echo "  help        Show this help message"
        echo
        echo "Default: Run all tests"
        ;;
    *)
        print_status "Running all tests..."
        pytest -v
        ;;
esac

# Check test results
if [ $? -eq 0 ]; then
    print_status "All tests passed! ✅"
else
    print_error "Some tests failed! ❌"
    exit 1
fi
