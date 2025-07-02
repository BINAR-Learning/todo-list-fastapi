# Todo List API

API RESTful untuk mengelola daftar tugas dan tugas-tugas di dalamnya, dibangun dengan FastAPI dan Python.

## Fitur

- **Authentication & Authorization**
  - User registration
  - User login dengan JWT token
  - Bearer token authentication

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

- `POST /v1/auth/register` - Mendaftarkan pengguna baru
- `POST /v1/auth/login` - Login dan mendapatkan JWT token

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

### 1. Register User

```bash
curl -X POST "http://localhost:3000/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword123"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:3000/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword123"
  }'
```

### 3. Create List (dengan Bearer token)

```bash
curl -X POST "http://localhost:3000/v1/lists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Shopping List"
  }'
```

### 4. Add Task to List

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

Untuk menjalankan tests:

```bash
pytest
```

## Production Deployment

1. **Setup database** (PostgreSQL recommended)
2. **Update environment variables** untuk production
3. **Deploy menggunakan** Docker, Heroku, atau cloud provider lainnya

### Docker Deployment

```dockerfile
# Dockerfile example
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
