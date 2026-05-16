import enum
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.warehouse import Warehouse
    from app.models.supplier import Supplier


class ProductCategory(str, enum.Enum):
    electronics = "electronics"
    furniture = "furniture"
    clothing = "clothing"
    food = "food"
    raw_materials = "raw_materials"
    other = "other"


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (UniqueConstraint("sku", "tenant_id", name="uq_product_sku_tenant"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(nullable=False)
    sku: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(nullable=True)
    category: Mapped[ProductCategory] = mapped_column(nullable=False)
    unit_price: Mapped[float] = mapped_column(nullable=False, default=0)
    quantity_in_stock: Mapped[int] = mapped_column(nullable=False, default=0)
    reorder_level: Mapped[int] = mapped_column(nullable=False, default=10)
    warehouse_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("warehouses.id", ondelete="SET NULL"),
        nullable=True,
    )
    supplier_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("suppliers.id", ondelete="SET NULL"),
        nullable=True,
    )

    warehouse: Mapped["Warehouse | None"] = relationship(
        back_populates="products",
        lazy="selectin",
    )
    supplier: Mapped["Supplier | None"] = relationship(
        back_populates="products",
        lazy="selectin",
    )
