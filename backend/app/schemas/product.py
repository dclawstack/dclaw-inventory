from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.product import ProductCategory


class ProductBase(BaseModel):
    name: str
    sku: str
    description: str | None = None
    category: ProductCategory
    unit_price: float = 0
    quantity_in_stock: int = 0
    reorder_level: int = 10
    warehouse_id: UUID | None = None
    supplier_id: UUID | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    description: str | None = None
    category: ProductCategory | None = None
    unit_price: float | None = None
    quantity_in_stock: int | None = None
    reorder_level: int | None = None
    warehouse_id: UUID | None = None
    supplier_id: UUID | None = None


class ProductRead(ProductBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class ProductReadDetail(ProductRead):
    warehouse: "WarehouseRead | None" = None
    supplier: "SupplierRead | None" = None
    model_config = ConfigDict(from_attributes=True)


# Forward reference resolution
from app.schemas.warehouse import WarehouseRead
from app.schemas.supplier import SupplierRead

ProductReadDetail.model_rebuild()
