from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import TypeVar, Generic

from app.models.base import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    def __init__(self, db: AsyncSession, model: type[T], tenant_id: UUID):
        self.db = db
        self.model = model
        self.tenant_id = tenant_id

    def _base_query(self):
        return select(self.model).where(self.model.tenant_id == self.tenant_id)

    async def list_all(self, limit: int = 20, offset: int = 0) -> tuple[list[T], int]:
        result = await self.db.execute(self._base_query().limit(limit).offset(offset))
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(self.model).where(self.model.tenant_id == self.tenant_id)
        )
        total = count_result.scalar() or 0
        return items, total

    async def get_by_id(self, item_id: UUID) -> T | None:
        result = await self.db.execute(
            self._base_query().where(self.model.id == item_id)
        )
        return result.scalar_one_or_none()

    async def create(self, obj: T) -> T:
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: T) -> None:
        await self.db.delete(obj)
        await self.db.commit()

    async def count(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(self.model).where(self.model.tenant_id == self.tenant_id)
        )
        return result.scalar() or 0
