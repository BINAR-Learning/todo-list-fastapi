"""Simple async test to verify the setup"""
import pytest
from httpx import AsyncClient
from fastapi import FastAPI

# Simple FastAPI app for testing
app = FastAPI()

@app.get("/test")
def test_endpoint():
    return {"message": "Hello, World!"}

@pytest.mark.asyncio
async def test_simple_async():
    """Test that async client works"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/test")
        assert response.status_code == 200
        assert response.json() == {"message": "Hello, World!"}
