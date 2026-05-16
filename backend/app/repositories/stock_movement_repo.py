from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case

from app.models.stock_movement import StockMovement, MovementType
from app.repositories.base_repo import BaseRepository


class StockMovementRepository(BaseRepository[StockMovement]):
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        super().__init__(db, StockMovement, tenant_id)

    async def list_for_product(
        self, product_id: UUID, limit: int = 50, offset: int = 0
    ) -> tuple[list[StockMovement], int]:
        stmt = self._base_query().where(StockMovement.product_id == product_id)
        result = await self.db.execute(
            stmt.order_by(StockMovement.created_at.desc()).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(StockMovement).where(
                StockMovement.tenant_id == self.tenant_id,
                StockMovement.product_id == product_id,
            )
        )
        total = count_result.scalar() or 0
        return items, total

    async def list_all_movements(
        self,
        limit: int = 50,
        offset: int = 0,
        movement_type: MovementType | None = None,
        warehouse_id: UUID | None = None,
    ) -> tuple[list[StockMovement], int]:
        stmt = self._base_query()
        count_stmt = select(func.count()).select_from(StockMovement).where(
            StockMovement.tenant_id == self.tenant_id
        )
        if movement_type:
            stmt = stmt.where(StockMovement.movement_type == movement_type)
            count_stmt = count_stmt.where(StockMovement.movement_type == movement_type)
        if warehouse_id:
            stmt = stmt.where(StockMovement.warehouse_id == warehouse_id)
            count_stmt = count_stmt.where(StockMovement.warehouse_id == warehouse_id)
        stmt = stmt.order_by(StockMovement.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        items = list(result.scalars().all())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        return items, total

    async def get_daily_burn(self, product_id: UUID, days: int = 30) -> float:
        cutoff = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(
                func.sum(
                    case(
                        (
                            StockMovement.movement_type.in_(
                                [MovementType.sale, MovementType.transfer_out]
                            ),
                            -StockMovement.quantity_delta,
                        ),
                        else_=0,
                    )
                )
            ).where(
                and_(
                    StockMovement.tenant_id == self.tenant_id,
                    StockMovement.product_id == product_id,
                    StockMovement.created_at >= cutoff,
                )
            )
        )
        total_consumed = result.scalar() or 0
        return max(total_consumed, 0) / days
