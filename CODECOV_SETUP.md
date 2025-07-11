# Codecov Integration Setup Guide

This guide explains how to set up Codecov integration for automated coverage reporting in the Todo List FastAPI project.

## 📊 Codecov Configuration

### Token Setup

The Codecov token has been provided: `a8810a36-5998-46fa-a7cb-468f76d8b997`

### GitHub Secrets Configuration

To enable Codecov uploads, you need to add the token as a GitHub secret:

1. **Navigate to Repository Settings**:
   - Go to your GitHub repository: `https://github.com/BINAR-Learning/todo-list-fastapi`
   - Click on "Settings" tab
   - Click on "Secrets and variables" → "Actions"

2. **Add New Repository Secret**:
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: `a8810a36-5998-46fa-a7cb-468f76d8b997`
   - Click "Add secret"

### Automatic Integration

Once the secret is configured, the following workflows will automatically upload coverage:

#### Unit Tests Workflow (`test.yml`)
```yaml
- name: Upload coverage reports to Codecov
  if: matrix.python-version == '3.11'
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    file: ./coverage.xml
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
    verbose: true
```

#### CI/CD Workflow (`ci-cd.yml`)
```yaml
- name: Upload coverage to Codecov
  if: matrix.python-version == '3.12'
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    file: ./coverage.xml
    flags: integration
    name: codecov-ci-cd
    fail_ci_if_error: false
    verbose: true
```

## 📈 Coverage Reporting Features

### Automated Reports
- **Coverage uploads** on every push to main/develop branches
- **Pull request coverage** comments (when enabled)
- **Coverage status checks** on GitHub
- **Coverage badges** for README

### Coverage Requirements
- **Minimum coverage**: 90%
- **Coverage threshold**: 1% (allows minor decreases)
- **Target paths**: `app/` directory only
- **Ignored paths**: tests, migrations, frontend, cache files

### Codecov Dashboard
Access your coverage reports at:
- **Dashboard**: https://codecov.io/github/BINAR-Learning/todo-list-fastapi
- **Coverage trends**: Track coverage over time
- **File-level coverage**: Detailed per-file coverage analysis
- **Pull request impact**: See coverage changes in PRs

## 🔧 Configuration Files

### `codecov.yml`
```yaml
coverage:
  status:
    project:
      default:
        target: 90%
        threshold: 1%
    patch:
      default:
        target: 90%
        threshold: 1%

flags:
  unittests:
    paths:
      - app/
  integration:
    paths:
      - app/

ignore:
  - "tests/"
  - "**/__pycache__/"
  - "**/migrations/"
  - "frontend/"
  - "htmlcov/"
  - ".github/"
```

## 🎯 Usage Examples

### Local Coverage Generation
```bash
# Generate coverage report
pytest --cov=app --cov-report=xml --cov-report=html --cov-fail-under=90

# View HTML report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### Manual Codecov Upload (if needed)
```bash
# Install codecov
pip install codecov

# Upload coverage (requires CODECOV_TOKEN environment variable)
codecov -f coverage.xml -t a8810a36-5998-46fa-a7cb-468f76d8b997
```

## 📋 Status Badges

Add coverage badges to your README.md:

```markdown
![Coverage](https://codecov.io/github/BINAR-Learning/todo-list-fastapi/branch/main/graph/badge.svg?token=a8810a36-5998-46fa-a7cb-468f76d8b997)
```

## ✅ Verification Steps

After setting up the GitHub secret:

1. **Push to main branch** to trigger workflows
2. **Check GitHub Actions** for successful Codecov uploads
3. **Visit Codecov dashboard** to confirm reports are appearing
4. **Verify coverage status** checks on pull requests

## 🔍 Troubleshooting

### Common Issues

#### Upload Failures
- **Check token**: Ensure `CODECOV_TOKEN` secret is correctly set
- **Check file path**: Verify `coverage.xml` is generated correctly
- **Check permissions**: Ensure repository has Codecov integration enabled

#### Coverage Not Updating
- **Wait for processing**: Codecov may take a few minutes to process uploads
- **Check branch**: Ensure you're pushing to a tracked branch (main/develop)
- **Check file format**: Ensure coverage.xml is valid

#### Missing Coverage Data
- **Check test execution**: Ensure tests are actually running
- **Check coverage command**: Verify pytest coverage flags are correct
- **Check ignored paths**: Review codecov.yml ignore patterns

### Debug Commands
```bash
# Validate codecov.yml
curl -X POST --data-binary @codecov.yml https://codecov.io/validate

# Test coverage generation
pytest --cov=app --cov-report=xml -v

# Verify coverage file
cat coverage.xml | head -20
```

## 📚 Documentation

- **Codecov Docs**: https://docs.codecov.io/
- **GitHub Integration**: https://docs.codecov.io/docs/github-integration
- **YAML Reference**: https://docs.codecov.io/docs/codecov-yaml

---

## Summary

With this setup, your Todo List FastAPI project will have:
- ✅ Automatic coverage uploads to Codecov
- ✅ Coverage status checks on pull requests
- ✅ Detailed coverage analysis and trends
- ✅ Professional coverage reporting and badges
- ✅ 90% minimum coverage enforcement
