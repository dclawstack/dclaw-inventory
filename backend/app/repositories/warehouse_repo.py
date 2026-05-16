from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.warehouse import Warehouse
from app.repositories.base_repo import BaseRepository


class WarehouseRepository(BaseRepository[Warehouse]):
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        super().__init__(db, Warehouse, tenant_id)

    async def get_by_name(self, name: str) -> Warehouse | None:
        result = await self.db.execute(
            select(Warehouse).where(Warehouse.name == name, Warehouse.tenant_id == self.tenant_id)
        )
        return result.scalar_one_or_none()
