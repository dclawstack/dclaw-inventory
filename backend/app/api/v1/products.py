from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.repositories.product_repo import ProductRepository
from app.repositories.warehouse_repo import WarehouseRepository
from app.repositories.supplier_repo import SupplierRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead, ProductReadDetail, ProductCategory
from app.models.product import Product

router = APIRouter()


@router.get("/", response_model=list[ProductRead])
async def list_products(
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
    category: ProductCategory | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    if search or category:
        stmt = select(Product)
        if search:
            stmt = stmt.where(Product.name.ilike(f"%{search}%"))
        if category:
            stmt = stmt.where(Product.category == category)
        stmt = stmt.limit(limit).offset(offset)
        result = await db.execute(stmt)
        items = list(result.scalars().all())
        return items
    items, _ = await repo.list_all(limit=limit, offset=offset)
    return items


@router.get("/low-stock", response_model=list[ProductRead])
async def list_low_stock(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    items, _ = await repo.list_low_stock(limit=limit, offset=offset)
    return items


@router.get("/{product_id}", response_model=ProductReadDetail)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    item = await repo.get_by_id(product_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return item


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    if data.warehouse_id:
        wh_repo = WarehouseRepository(db)
        wh = await wh_repo.get_by_id(data.warehouse_id)
        if not wh:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    if data.supplier_id:
        sup_repo = SupplierRepository(db)
        sup = await sup_repo.get_by_id(data.supplier_id)
        if not sup:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    existing = await repo.get_by_sku(data.sku)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    product = Product(**data.model_dump())
    return await repo.create(product)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    item = await repo.get_by_id(product_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    update_data = data.model_dump(exclude_unset=True)
    if "sku" in update_data:
        existing = await repo.get_by_sku(update_data["sku"])
        if existing and existing.id != product_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    if update_data.get("warehouse_id"):
        wh_repo = WarehouseRepository(db)
        wh = await wh_repo.get_by_id(update_data["warehouse_id"])
        if not wh:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    if update_data.get("supplier_id"):
        sup_repo = SupplierRepository(db)
        sup = await sup_repo.get_by_id(update_data["supplier_id"])
        if not sup:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    for field, value in update_data.items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    item = await repo.get_by_id(product_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await repo.delete(item)
    return None
