from app.api.v1.products import router as products_router
from app.api.v1.warehouses import router as warehouses_router
from app.api.v1.suppliers import router as suppliers_router

__all__ = ["products_router", "warehouses_router", "suppliers_router"]
