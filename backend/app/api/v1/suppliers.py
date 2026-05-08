from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.supplier_repo import SupplierRepository
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierRead
from app.models.supplier import Supplier

router = APIRouter()


@router.get("/", response_model=list[SupplierRead])
async def list_suppliers(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = SupplierRepository(db)
    items, _ = await repo.list_all(limit=limit, offset=offset)
    return items


@router.get("/{supplier_id}", response_model=SupplierRead)
async def get_supplier(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = SupplierRepository(db)
    item = await repo.get_by_id(supplier_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return item


@router.post("/", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    data: SupplierCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = SupplierRepository(db)
    supplier = Supplier(**data.model_dump())
    return await repo.create(supplier)


@router.patch("/{supplier_id}", response_model=SupplierRead)
async def update_supplier(
    supplier_id: UUID,
    data: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = SupplierRepository(db)
    item = await repo.get_by_id(supplier_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = SupplierRepository(db)
    item = await repo.get_by_id(supplier_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    await repo.delete(item)
    return None
