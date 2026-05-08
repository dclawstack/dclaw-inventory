from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.product import Product
from app.repositories.base_repo import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Product)

    async def get_by_sku(self, sku: str) -> Product | None:
        result = await self.db.execute(
            select(Product).where(Product.sku == sku)
        )
        return result.scalar_one_or_none()

    async def list_low_stock(self, limit: int = 20, offset: int = 0) -> tuple[list[Product], int]:
        result = await self.db.execute(
            select(Product).where(Product.quantity_in_stock <= Product.reorder_level).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(Product).where(Product.quantity_in_stock <= Product.reorder_level)
        )
        total = count_result.scalar() or 0
        return items, total

    async def total_inventory_value(self) -> float:
        result = await self.db.execute(
            select(func.sum(Product.unit_price * Product.quantity_in_stock))
        )
        return result.scalar() or 0.0
