import csv
import io
from uuid import UUID
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.repositories.stock_movement_repo import StockMovementRepository
from app.schemas.stock_movement import StockMovementRead
from app.models.stock_movement import MovementType

router = APIRouter()


@router.get("/export")
async def export_movements_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = StockMovementRepository(db, current_user.tenant_id)
    items, _ = await repo.list_all_movements(limit=10000, offset=0)

    def generate():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "id", "product_id", "warehouse_id",
            "movement_type", "quantity_delta", "note", "created_at",
        ])
        for m in items:
            writer.writerow([
                str(m.id), str(m.product_id), str(m.warehouse_id) if m.warehouse_id else "",
                m.movement_type.value, m.quantity_delta,
                m.note or "", m.created_at.isoformat(),
            ])
        yield buf.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=movements.csv"},
    )


@router.get("/", response_model=list[StockMovementRead])
async def list_movements(
    limit: int = 50,
    offset: int = 0,
    movement_type: MovementType | None = None,
    warehouse_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = StockMovementRepository(db, current_user.tenant_id)
    items, _ = await repo.list_all_movements(
        limit=limit, offset=offset,
        movement_type=movement_type, warehouse_id=warehouse_id,
    )
    return items
