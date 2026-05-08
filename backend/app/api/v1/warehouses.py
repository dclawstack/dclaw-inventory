from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.warehouse_repo import WarehouseRepository
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseRead
from app.models.warehouse import Warehouse

router = APIRouter()


@router.get("/", response_model=list[WarehouseRead])
async def list_warehouses(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = WarehouseRepository(db)
    items, _ = await repo.list_all(limit=limit, offset=offset)
    return items


@router.get("/{warehouse_id}", response_model=WarehouseRead)
async def get_warehouse(
    warehouse_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = WarehouseRepository(db)
    item = await repo.get_by_id(warehouse_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return item


@router.post("/", response_model=WarehouseRead, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    data: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = WarehouseRepository(db)
    warehouse = Warehouse(**data.model_dump())
    return await repo.create(warehouse)


@router.patch("/{warehouse_id}", response_model=WarehouseRead)
async def update_warehouse(
    warehouse_id: UUID,
    data: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = WarehouseRepository(db)
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
):
    repo = WarehouseRepository(db)
    item = await repo.get_by_id(warehouse_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    await repo.delete(item)
    return None
