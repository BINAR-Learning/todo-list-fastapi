"""Simplified test to debug the fixture issue"""
import pytest
from httpx import AsyncClient
from tests.conftest import create_test_app

@pytest.fixture
async def simple_client():
    """Simple client fixture without dependency override"""
    app = create_test_app()
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio 
async def test_with_simple_client(simple_client):
    """Test with simplified client"""
    response = await simple_client.get("/auth/register")  # This will fail but we want to see the error
    # We expect this to fail but want to see if the client is accessible
