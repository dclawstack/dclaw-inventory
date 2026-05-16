from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import (
    products_router,
    warehouses_router,
    suppliers_router,
    movements_router,
    dashboard_router,
    auth_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(warehouses_router, prefix="/api/v1/warehouses", tags=["warehouses"])
app.include_router(suppliers_router, prefix="/api/v1/suppliers", tags=["suppliers"])
app.include_router(movements_router, prefix="/api/v1/movements", tags=["movements"])
