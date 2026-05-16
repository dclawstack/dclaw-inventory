import csv
import io
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.repositories.product_repo import ProductRepository
from app.repositories.warehouse_repo import WarehouseRepository
from app.repositories.supplier_repo import SupplierRepository
from app.repositories.stock_movement_repo import StockMovementRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead, ProductReadDetail, ProductCategory
from app.schemas.stock_movement import StockMovementCreate, StockTransferCreate, StockMovementRead
from app.models.product import Product
from app.models.stock_movement import StockMovement, MovementType

router = APIRouter()


@router.get("/", response_model=list[ProductRead])
async def list_products(
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
    category: ProductCategory | None = None,
    warehouse_id: UUID | None = None,
    low_stock: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    if search or category or warehouse_id or low_stock:
        stmt = select(Product).where(Product.tenant_id == current_user.tenant_id)
        if search:
            stmt = stmt.where(Product.name.ilike(f"%{search}%"))
        if category:
            stmt = stmt.where(Product.category == category)
        if warehouse_id:
            stmt = stmt.where(Product.warehouse_id == warehouse_id)
        if low_stock:
            stmt = stmt.where(Product.quantity_in_stock <= Product.reorder_level)
        stmt = stmt.limit(limit).offset(offset)
        result = await db.execute(stmt)
        return list(result.scalars().all())
    items, _ = await repo.list_all(limit=limit, offset=offset)
    return items


@router.get("/low-stock", response_model=list[ProductRead])
async def list_low_stock(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    items, _ = await repo.list_low_stock(limit=limit, offset=offset)
    return items


@router.get("/export")
async def export_products_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Product).where(Product.tenant_id == current_user.tenant_id)
    )
    products = list(result.scalars().all())

    def generate():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "id", "name", "sku", "category", "description",
            "unit_price", "quantity_in_stock", "reorder_level",
            "warehouse_id", "supplier_id",
        ])
        for p in products:
            writer.writerow([
                str(p.id), p.name, p.sku, p.category.value,
                p.description or "", p.unit_price, p.quantity_in_stock,
                p.reorder_level,
                str(p.warehouse_id) if p.warehouse_id else "",
                str(p.supplier_id) if p.supplier_id else "",
            ])
        yield buf.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.post("/suggest-category")
async def suggest_category(
    body: dict,
    current_user: User = Depends(get_current_user),
):
    from app.services.ai_service import suggest_category as _suggest
    name = body.get("name", "")
    if not name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="name is required")
    return await _suggest(name)


@router.post("/import")
async def import_products_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    created = 0
    errors: list[dict] = []

    for i, row in enumerate(reader, start=2):
        try:
            name = row.get("name", "").strip()
            sku = row.get("sku", "").strip()
            category_str = row.get("category", "").strip()
            unit_price = float(row.get("unit_price", 0) or 0)
            quantity_in_stock = int(row.get("quantity_in_stock", 0) or 0)
            reorder_level = int(row.get("reorder_level", 10) or 10)

            if not name or not sku or not category_str:
                errors.append({"row": i, "reason": "name, sku, and category are required"})
                continue

            try:
                category = ProductCategory(category_str)
            except ValueError:
                errors.append({"row": i, "reason": f"invalid category: {category_str}"})
                continue

            existing = await repo.get_by_sku(sku)
            if existing:
                errors.append({"row": i, "reason": f"SKU {sku} already exists"})
                continue

            product = Product(
                tenant_id=current_user.tenant_id,
                name=name,
                sku=sku,
                category=category,
                unit_price=unit_price,
                quantity_in_stock=quantity_in_stock,
                reorder_level=reorder_level,
            )
            db.add(product)
            created += 1
        except Exception as e:
            errors.append({"row": i, "reason": str(e)})

    await db.commit()
    return {"created": created, "errors": errors}


@router.get("/{product_id}", response_model=ProductReadDetail)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    item = await repo.get_by_id(product_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return item


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    if data.warehouse_id:
        wh_repo = WarehouseRepository(db, current_user.tenant_id)
        if not await wh_repo.get_by_id(data.warehouse_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    if data.supplier_id:
        sup_repo = SupplierRepository(db, current_user.tenant_id)
        if not await sup_repo.get_by_id(data.supplier_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    if await repo.get_by_sku(data.sku):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    product = Product(tenant_id=current_user.tenant_id, **data.model_dump())
    return await repo.create(product)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    item = await repo.get_by_id(product_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    update_data = data.model_dump(exclude_unset=True)
    if "sku" in update_data:
        existing = await repo.get_by_sku(update_data["sku"])
        if existing and existing.id != product_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    if update_data.get("warehouse_id"):
        wh_repo = WarehouseRepository(db, current_user.tenant_id)
        if not await wh_repo.get_by_id(update_data["warehouse_id"]):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    if update_data.get("supplier_id"):
        sup_repo = SupplierRepository(db, current_user.tenant_id)
        if not await sup_repo.get_by_id(update_data["supplier_id"]):
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
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    item = await repo.get_by_id(product_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await repo.delete(item)
    return None


@router.get("/{product_id}/movements", response_model=list[StockMovementRead])
async def list_product_movements(
    product_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    if not await repo.get_by_id(product_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    mv_repo = StockMovementRepository(db, current_user.tenant_id)
    items, _ = await mv_repo.list_for_product(product_id, limit=limit, offset=offset)
    return items


@router.post("/{product_id}/movements", response_model=StockMovementRead, status_code=status.HTTP_201_CREATED)
async def record_movement(
    product_id: UUID,
    data: StockMovementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if data.warehouse_id:
        wh_repo = WarehouseRepository(db, current_user.tenant_id)
        if not await wh_repo.get_by_id(data.warehouse_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    new_qty = product.quantity_in_stock + data.quantity_delta
    if new_qty < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Insufficient stock: have {product.quantity_in_stock}, movement would result in {new_qty}",
        )
    movement = StockMovement(
        tenant_id=current_user.tenant_id,
        product_id=product_id,
        warehouse_id=data.warehouse_id,
        movement_type=data.movement_type,
        quantity_delta=data.quantity_delta,
        note=data.note,
    )
    db.add(movement)
    product.quantity_in_stock = new_qty
    await db.commit()
    await db.refresh(movement)
    return movement


@router.post("/{product_id}/transfer", response_model=list[StockMovementRead], status_code=status.HTTP_201_CREATED)
async def transfer_stock(
    product_id: UUID,
    data: StockTransferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = ProductRepository(db, current_user.tenant_id)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if data.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="quantity must be positive")
    if product.quantity_in_stock < data.quantity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Insufficient stock: have {product.quantity_in_stock}, need {data.quantity}",
        )
    wh_repo = WarehouseRepository(db, current_user.tenant_id)
    if not await wh_repo.get_by_id(data.from_warehouse_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source warehouse not found")
    if not await wh_repo.get_by_id(data.to_warehouse_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination warehouse not found")

    out_movement = StockMovement(
        tenant_id=current_user.tenant_id,
        product_id=product_id,
        warehouse_id=data.from_warehouse_id,
        movement_type=MovementType.transfer_out,
        quantity_delta=-data.quantity,
        note=f"Transfer to warehouse {data.to_warehouse_id}",
    )
    in_movement = StockMovement(
        tenant_id=current_user.tenant_id,
        product_id=product_id,
        warehouse_id=data.to_warehouse_id,
        movement_type=MovementType.transfer_in,
        quantity_delta=data.quantity,
        note=f"Transfer from warehouse {data.from_warehouse_id}",
    )
    db.add(out_movement)
    db.add(in_movement)
    product.warehouse_id = data.to_warehouse_id
    await db.commit()
    await db.refresh(out_movement)
    await db.refresh(in_movement)
    return [out_movement, in_movement]
