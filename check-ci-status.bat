@echo off
REM GitHub Actions Status Checker for Windows
REM Usage: check-ci-status.bat

echo 🚀 GitHub Actions CI/CD Pipeline Status
echo ========================================
echo.
echo 📋 Available Workflows:
echo   1. Unit Tests - Runs on every push/PR
echo   2. CI/CD Pipeline - Comprehensive testing and quality checks
echo   3. Dependency Check - Weekly security vulnerability scan
echo   4. Release - Automated release on version tags
echo.
echo 🔗 Links to monitor workflows:
echo   • Actions Page: https://github.com/BINAR-Learning/todo-list-fastapi/actions
echo   • Unit Tests: https://github.com/BINAR-Learning/todo-list-fastapi/actions/workflows/test.yml
echo   • CI/CD Pipeline: https://github.com/BINAR-Learning/todo-list-fastapi/actions/workflows/ci-cd.yml
echo.
echo 📊 Status Badges (add to README.md):
echo   ![Unit Tests](https://github.com/BINAR-Learning/todo-list-fastapi/workflows/Unit%%20Tests/badge.svg)
echo   ![CI/CD Pipeline](https://github.com/BINAR-Learning/todo-list-fastapi/workflows/CI/CD%%20Pipeline/badge.svg)
echo.
echo ⚡ Quick local testing commands:
echo   pytest --cov=app --cov-fail-under=90  # Run tests with coverage
echo   flake8 app --max-line-length=127      # Code linting
echo   pip install -r requirements-dev.txt  # Install dev tools
echo.
echo ✅ Pipeline should now be running automatically!
echo    Check the Actions tab in your GitHub repository.
pause
