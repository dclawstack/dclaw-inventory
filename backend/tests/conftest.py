from uuid import uuid4
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import NullPool

from app.api.main import app
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token
from app.models.base import Base
from app.models.tenant import Tenant
from app.models.user import User

TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_app_test"

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)


async def override_get_db():
    async with AsyncSession(test_engine, expire_on_commit=False) as session:
        try:
            yield session
        finally:
            await session.close()


# Stable test IDs for deterministic fixtures
TEST_TENANT_ID = uuid4()
TEST_USER_ID = uuid4()

test_user = User(
    id=TEST_USER_ID,
    email="test@example.com",
    hashed_password="hashed",
    tenant_id=TEST_TENANT_ID,
    is_active=True,
)

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = lambda: test_user


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Insert the test tenant so FK constraints are satisfied
    async with AsyncSession(test_engine, expire_on_commit=False) as session:
        tenant = Tenant(id=TEST_TENANT_ID, name="Test Org")
        session.add(tenant)
        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
