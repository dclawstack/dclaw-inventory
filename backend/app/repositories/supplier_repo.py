from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.supplier import Supplier
from app.repositories.base_repo import BaseRepository


class SupplierRepository(BaseRepository[Supplier]):
    def __init__(self, db: AsyncSession, tenant_id: UUID):
        super().__init__(db, Supplier, tenant_id)

    async def get_by_email(self, email: str) -> Supplier | None:
        result = await self.db.execute(
            select(Supplier).where(Supplier.email == email, Supplier.tenant_id == self.tenant_id)
        )
        return result.scalar_one_or_none()
