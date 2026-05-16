from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.repositories.warehouse_repo import WarehouseRepository
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseRead
from app.schemas.product import ProductRead
from app.models.warehouse import Warehouse
from app.models.product import Product

router = APIRouter()


@router.get("/", response_model=list[WarehouseRead])
async def list_warehouses(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    items, _ = await repo.list_all(limit=limit, offset=offset)
    return items


@router.get("/{warehouse_id}/stats")
async def get_warehouse_stats(
    warehouse_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    wh = await repo.get_by_id(warehouse_id)
    if not wh:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    product_count_result = await db.execute(
        select(func.count()).select_from(Product).where(
            Product.warehouse_id == warehouse_id,
            Product.tenant_id == current_user.tenant_id,
        )
    )
    product_count = product_count_result.scalar() or 0

    total_units_result = await db.execute(
        select(func.sum(Product.quantity_in_stock)).where(
            Product.warehouse_id == warehouse_id,
            Product.tenant_id == current_user.tenant_id,
        )
    )
    total_units = int(total_units_result.scalar() or 0)

    capacity_used_pct: float | None = None
    if wh.capacity and wh.capacity > 0:
        capacity_used_pct = round(total_units / wh.capacity * 100, 1)

    return {
        "product_count": product_count,
        "total_units": total_units,
        "capacity_used_pct": capacity_used_pct,
    }


@router.get("/{warehouse_id}/products", response_model=list[ProductRead])
async def get_warehouse_products(
    warehouse_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    if not await repo.get_by_id(warehouse_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    result = await db.execute(
        select(Product)
        .where(Product.warehouse_id == warehouse_id, Product.tenant_id == current_user.tenant_id)
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


@router.get("/{warehouse_id}", response_model=WarehouseRead)
async def get_warehouse(
    warehouse_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    item = await repo.get_by_id(warehouse_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return item


@router.post("/", response_model=WarehouseRead, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    data: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    warehouse = Warehouse(tenant_id=current_user.tenant_id, **data.model_dump())
    return await repo.create(warehouse)


@router.patch("/{warehouse_id}", response_model=WarehouseRead)
async def update_warehouse(
    warehouse_id: UUID,
    data: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    item = await repo.get_by_id(warehouse_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(
    warehouse_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WarehouseRepository(db, current_user.tenant_id)
    item = await repo.get_by_id(warehouse_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    await repo.delete(item)
    return None
