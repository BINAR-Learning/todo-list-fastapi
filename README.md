# Todo List API

![Unit Tests](https://github.com/BINAR-Learning/todo-list-fastapi/workflows/Unit%20Tests/badge.svg)
![CI/CD Pipeline](https://github.com/BINAR-Learning/todo-list-fastapi/workflows/CI/CD%20Pipeline/badge.svg)
![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)
![Test Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen.svg)
![Codecov](https://codecov.io/github/BINAR-Learning/todo-list-fastapi/branch/main/graph/badge.svg?token=a8810a36-5998-46fa-a7cb-468f76d8b997)

API RESTful untuk mengelola daftar tugas dan tugas-tugas di dalamnya, dibangun dengan FastAPI dan Python.

## Fitur

- **Authentication & Authorization**
  - User registration dengan email dan password validation
  - User login dengan JWT token
  - Bearer token authentication
  - Basic authentication (email/password) untuk testing
  - Dual authentication support (Bearer token atau Basic auth)

- **Lists Management**
  - Membuat, membaca, mengupdate, dan menghapus daftar tugas
  - Daftar tugas spesifik per user

- **Tasks Management**
  - CRUD operations untuk tugas dalam daftar
  - Status penyelesaian tugas
  - Tugas terikat pada daftar tertentu

## Teknologi

- **FastAPI** - Modern, fast web framework untuk building APIs dengan Python
- **SQLAlchemy** - SQL toolkit dan Object-Relational Mapping (ORM)
- **PostgreSQL/SQLite** - Database
- **JWT** - JSON Web Tokens untuk authentication
- **Pydantic** - Data validation menggunakan Python type hints
- **Uvicorn** - ASGI web server
- **Email Validator** - Email format validation

## Authentication Methods

API ini mendukung dua metode autentikasi:

### 1. Bearer Token Authentication (Recommended)
- Dapatkan JWT token dari endpoint `/v1/auth/login`
- Gunakan token di header: `Authorization: Bearer YOUR_JWT_TOKEN`

### 2. Basic Authentication (Testing/Development)
- Gunakan email dan password langsung
- Format: `Authorization: Basic base64(email:password)`

## Password Requirements

Password harus memenuhi kriteria berikut:
- **Minimum 10 karakter**
- **Mengandung huruf** (A-Z, a-z)
- **Mengandung angka** (0-9)
- **Mengandung minimal 1 karakter spesial** (!@#$%^&*(),.?":{}|<>)

## Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd todo-list-api
   ```

2. **Buat virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   
   Copy `.env` file dan sesuaikan konfigurasi:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   DATABASE_URL=sqlite:///./todo.db
   SECRET_KEY=your-super-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Jalankan aplikasi**
   ```bash
   # Development mode
   uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
   
   # Production mode
   python app/main.py
   ```

## API Documentation

Setelah aplikasi berjalan, Anda dapat mengakses:

- **Swagger UI**: `http://localhost:3000/docs`
- **ReDoc**: `http://localhost:3000/redoc`
- **OpenAPI JSON**: `http://localhost:3000/openapi.json`

## Endpoints

### Authentication

- `POST /v1/auth/register` - Mendaftarkan pengguna baru dengan email dan password
- `POST /v1/auth/login` - Login dengan email dan password, mendapatkan JWT token
- `POST /v1/auth/login-username` - Login dengan username dan password (backward compatibility)

### Lists

- `GET /v1/lists` - Mendapatkan semua daftar tugas user
- `POST /v1/lists` - Membuat daftar tugas baru
- `GET /v1/lists/{listId}` - Mendapatkan daftar tugas berdasarkan ID
- `PUT /v1/lists/{listId}` - Memperbarui daftar tugas
- `DELETE /v1/lists/{listId}` - Menghapus daftar tugas

### Tasks

- `GET /v1/lists/{listId}/tasks` - Mendapatkan semua tugas dalam daftar
- `POST /v1/lists/{listId}/tasks` - Menambahkan tugas baru ke daftar
- `GET /v1/tasks/{taskId}` - Mendapatkan tugas berdasarkan ID
- `PUT /v1/tasks/{taskId}` - Memperbarui tugas
- `DELETE /v1/tasks/{taskId}` - Menghapus tugas

## Contoh Penggunaan

### 1. Register User dengan Email

```bash
curl -X POST "http://localhost:3000/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass123!",
    "username": "testuser"
  }'
```

### 2. Login dengan Email

```bash
curl -X POST "http://localhost:3000/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass123!"
  }'
```

### 3. Create List dengan Bearer Token

```bash
curl -X POST "http://localhost:3000/v1/lists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Shopping List"
  }'
```

### 4. Create List dengan Basic Auth (Email/Password)

```bash
curl -X POST "http://localhost:3000/v1/lists" \
  -H "Content-Type: application/json" \
  -u "user@example.com:StrongPass123!" \
  -d '{
    "name": "Shopping List"
  }'
```

### 5. Add Task to List

```bash
curl -X POST "http://localhost:3000/v1/lists/{listId}/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Buy groceries",
    "completed": false
  }'
```

## Struktur Project

```
todo-list-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Entry point FastAPI
│   ├── config.py              # Konfigurasi aplikasi
│   ├── database.py            # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py           # User model
│   │   ├── list.py           # List model
│   │   └── task.py           # Task model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py           # User Pydantic schemas
│   │   ├── list.py           # List Pydantic schemas
│   │   └── task.py           # Task Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── lists.py          # Lists CRUD endpoints
│   │   └── tasks.py          # Tasks CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py   # Authentication logic
│   │   ├── list_service.py   # List business logic
│   │   └── task_service.py   # Task business logic
│   └── utils/
│       ├── __init__.py
│       ├── security.py       # JWT & password hashing
│       └── dependencies.py   # Common dependencies
├── requirements.txt           # Python dependencies
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## Testing

### Automated Testing
Untuk menjalankan unit tests:

```bash
pytest
```

### Manual API Testing
Untuk testing manual API dengan email authentication:

```bash
# Install requests library first
pip install requests

# Run test script
python test_api.py
```

### Testing dengan Swagger UI
1. Jalankan aplikasi: `uvicorn app.main:app --reload --port 3000`
2. Buka: http://localhost:3000/docs
3. Klik "Authorize" dan pilih salah satu metode:
   - **Bearer Token**: Masukkan JWT token dari login
   - **Basic Auth**: Masukkan email dan password langsung

## Continuous Integration & Deployment (CI/CD)

Proyek ini menggunakan GitHub Actions untuk automasi CI/CD pipeline yang komprehensif.

### Workflows yang Tersedia

#### 1. Unit Tests (`test.yml`)
- **Trigger**: Setiap push dan pull request ke branch `main` dan `develop`
- **Matrix Testing**: Python 3.9, 3.10, 3.11, 3.12
- **Features**:
  - Dependency caching untuk performa optimal
  - Code linting dengan flake8
  - Unit testing dengan coverage minimum 90%
  - Upload coverage reports ke Codecov
  - Generate coverage badge
  - Automated coverage status checks

#### 2. CI/CD Pipeline (`ci-cd.yml`)
- **Security Scan**: Bandit dan Safety check untuk vulnerability
- **Code Quality**: Black, isort, MyPy, dan PyLint
- **Integration Tests**: Test API endpoints secara real-time
- **Coverage Reports**: Detailed coverage analysis

#### 3. Release Automation (`release.yml`)
- **Trigger**: Pada tag version (v*.*.*)
- **Features**:
  - Full test suite execution
  - Documentation generation
  - Automatic changelog creation
  - GitHub release creation
  - Coverage report attachment

#### 4. Dependency Check (`dependency-check.yml`)
- **Schedule**: Setiap Senin pukul 9 AM UTC
- **Features**:
  - Vulnerability scanning dengan pip-audit
  - Outdated packages detection
  - Security reports generation

### Status Badges

Pipeline status dapat dilihat melalui badges di bagian atas README:
- **Unit Tests**: Status testing terbaru
- **CI/CD Pipeline**: Status build dan deployment
- **Test Coverage**: Persentase coverage (target: >90%)

### Development Tools

Untuk development lokal dengan code quality tools:

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Setup pre-commit hooks (optional)
pre-commit install

# Run code formatting (Black-compatible)
isort --profile black app/
black app/

# Run linting
flake8 app/
pylint app/

# Run security scan
bandit -r app/
safety check

# All-in-one quality check
isort --profile black --check-only app/ && black --check app/ && flake8 app/
```

### Konfigurasi Editor

Untuk pengalaman development yang optimal, konfigurasikan editor Anda:

**VS Code (`settings.json`)**:
```json
{
    "python.formatting.provider": "black",
    "python.sortImports.path": "isort",
    "python.sortImports.args": ["--profile", "black"],
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "[python]": {
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": true
        }
    }
}
```

**PyCharm/IntelliJ**:
- File → Settings → Tools → External Tools
- Add isort: `isort --profile black $FilePath$`
- Add Black: `black $FilePath$`

### Coverage Reporting

Proyek ini terintegrasi dengan Codecov untuk analisis coverage yang mendalam:

```bash
# Generate coverage dengan upload ke Codecov (otomatis di CI)
pytest --cov=app --cov-report=xml --cov-report=html --cov-fail-under=90

# View detailed coverage report
open htmlcov/index.html  # Local HTML report

# Codecov dashboard untuk analisis lanjutan:
# https://codecov.io/github/BINAR-Learning/todo-list-fastapi
```

### Running Tests Locally

```bash
# Run all tests dengan coverage
pytest --cov=app --cov-report=html --cov-fail-under=90

# Run specific test categories
pytest tests/test_routes_auth.py -v
pytest tests/test_integration.py -v

# Parallel test execution (dengan pytest-xdist)
pytest -n auto --cov=app
```

## Database Migration

Jika Anda mengupgrade dari versi sebelumnya, jalankan migration script:

```bash
python migrate_db.py
```

## Production Deployment

1. **Setup database** (PostgreSQL recommended)
2. **Update environment variables** untuk production
3. **Generate secure SECRET_KEY**:
   ```python
   import secrets
   print(secrets.token_urlsafe(32))
   ```
4. **Deploy menggunakan** Docker, Heroku, atau cloud provider lainnya

### Docker Deployment

```dockerfile
# Dockerfile example
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
```

### Environment Variables untuk Production

```env
DATABASE_URL=postgresql://user:password@db:5432/todoapi
SECRET_KEY=your-super-secure-secret-key-here
DEBUG=False
API_V1_PREFIX=/v1
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

## Changes Committed (2025-07-07):

## 1. Enhanced Authentication System

Our authentication system has been significantly upgraded to provide stronger security and more flexible user management.

* **Dual Authentication Support:** Now supports both **Bearer Token** and **Basic Authentication**, offering more options for secure access.
* **Email-Based User Model:** The user model has been updated to use **email addresses** for authentication, streamlining the login process.
* **Stronger Password Validation:** Passwords now require a minimum of **10 characters**, including a mix of **alphanumeric characters and special symbols**, to enhance security.
* **Auth Service Refinements:** The authentication service and its dependencies have been modified to support these new features seamlessly.

---

## 2. Updated Documentation

Comprehensive documentation updates ensure that all new features and changes are clearly explained and easy to understand.

* **OpenAPI Specification Updates:** The `openapi.json` file has been thoroughly updated to reflect all changes in the API, providing accurate and up-to-date API specifications.
* **Enhanced `README.md`:** This `README.md` file now includes **detailed information about the new authentication methods** and other key updates.
* **Comprehensive API Documentation:** We've added **extensive API documentation** to help developers integrate with our services more efficiently.

---

## 3. Complete Frontend Application

A fully functional and responsive frontend application has been developed and integrated.

* **Responsive Web Pages:** All web pages are now **responsive**, ensuring an optimal viewing experience across various devices. The frontend code is located in the `frontend/` directory.
* **Corporate Branding:** The application fully implements **PT Erajaya Swasembada corporate branding**, providing a consistent and professional user interface.
* **Modular Architecture:** Built with a **modular, component-based architecture**, allowing for easier maintenance and scalability.
* **Extensive Frontend Files:** Over **25 new frontend files** have been added, including:
    * HTML, CSS, and JavaScript files
    * Reusable UI components
    * Page controllers
    * Configuration files
    * Build and deployment scripts
    * Comprehensive frontend documentation

---

## 4. Testing and Development Tools

New tools have been introduced to streamline testing, database management, and code quality.

* **Automated Testing Scripts:** Added `test_api.py` for **robust API testing**, ensuring reliability and performance.
* **Database Migration Script:** A new `migrate_db.py` script simplifies **database schema updates and management**.
* **Frontend Build Script:** Implemented a **frontend build script with environment support**, facilitating development and deployment across different environments.
* **Linting and Code Quality Tools:** Integrated **linting and code quality tools** to maintain high coding standards and reduce errors.

---

