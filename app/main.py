from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, lists, tasks

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="""
    API RESTful untuk mengelola daftar tugas dan tugas-tugas di dalamnya.
    
    ## Authentication
    
    API ini mendukung dua metode autentikasi:
    
    * **Bearer Token Authentication**: Gunakan JWT token yang diperoleh dari endpoint login
    * **Basic Authentication**: Gunakan email dan password langsung (untuk testing dan development)
    
    ## Features
    
    * User registration dengan email dan password validation
    * Secure JWT token authentication
    * CRUD operations untuk lists dan tasks
    * User-specific data isolation
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with API prefix
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(lists.router, prefix=settings.api_v1_prefix)
app.include_router(tasks.router, prefix=settings.api_v1_prefix)


@app.get("/")
def read_root():
    """
    Root endpoint
    """
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": "1.0.0",
        "authentication": {
            "bearer_token": "Use JWT token from /v1/auth/login",
            "basic_auth": "Use email:password for direct authentication",
        },
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=3000, reload=settings.debug)
