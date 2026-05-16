from uuid import UUID
from pydantic import BaseModel


class LowStockProduct(BaseModel):
    id: UUID
    name: str
    sku: str
    category: str
    quantity_in_stock: int
    reorder_level: int
    warehouse_name: str | None = None


class ReorderForecastItem(BaseModel):
    id: UUID
    name: str
    sku: str
    current_stock: int
    daily_burn: float
    days_until_reorder: float | None


class DashboardStats(BaseModel):
    total_products: int
    total_warehouses: int
    total_suppliers: int
    total_inventory_value: float
    low_stock_count: int
    low_stock_products: list[LowStockProduct]
