from app.api.v1.products import router as products_router
from app.api.v1.warehouses import router as warehouses_router
from app.api.v1.suppliers import router as suppliers_router
from app.api.v1.movements import router as movements_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.auth import router as auth_router

__all__ = [
    "products_router",
    "warehouses_router",
    "suppliers_router",
    "movements_router",
    "dashboard_router",
    "auth_router",
]
