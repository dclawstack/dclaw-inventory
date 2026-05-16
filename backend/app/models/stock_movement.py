import enum
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.warehouse import Warehouse


class MovementType(str, enum.Enum):
    restock = "restock"
    sale = "sale"
    adjustment = "adjustment"
    transfer_in = "transfer_in"
    transfer_out = "transfer_out"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    warehouse_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True
    )
    movement_type: Mapped[MovementType] = mapped_column(nullable=False)
    quantity_delta: Mapped[int] = mapped_column(nullable=False)
    note: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )

    product: Mapped["Product"] = relationship(lazy="selectin")
    warehouse: Mapped["Warehouse | None"] = relationship(lazy="selectin")
