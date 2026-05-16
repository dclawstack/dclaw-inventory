from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.stock_movement import MovementType


class StockMovementCreate(BaseModel):
    movement_type: MovementType
    quantity_delta: int
    warehouse_id: UUID | None = None
    note: str | None = None


class StockTransferCreate(BaseModel):
    from_warehouse_id: UUID
    to_warehouse_id: UUID
    quantity: int


class StockMovementRead(BaseModel):
    id: UUID
    product_id: UUID
    warehouse_id: UUID | None
    movement_type: MovementType
    quantity_delta: int
    note: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
