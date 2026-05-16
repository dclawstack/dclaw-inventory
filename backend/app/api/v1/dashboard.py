from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.supplier import Supplier
from app.models.stock_movement import StockMovement, MovementType
from app.schemas.dashboard import DashboardStats, LowStockProduct, ReorderForecastItem

router = APIRouter()


@router.get("/", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tid = current_user.tenant_id

    total_products = (await db.execute(
        select(func.count()).select_from(Product).where(Product.tenant_id == tid)
    )).scalar() or 0
    total_warehouses = (await db.execute(
        select(func.count()).select_from(Warehouse).where(Warehouse.tenant_id == tid)
    )).scalar() or 0
    total_suppliers = (await db.execute(
        select(func.count()).select_from(Supplier).where(Supplier.tenant_id == tid)
    )).scalar() or 0

    value_result = await db.execute(
        select(func.sum(Product.unit_price * Product.quantity_in_stock)).where(Product.tenant_id == tid)
    )
    total_inventory_value = float(value_result.scalar() or 0.0)

    low_stock_result = await db.execute(
        select(Product).where(
            Product.tenant_id == tid,
            Product.quantity_in_stock <= Product.reorder_level,
        ).limit(50)
    )
    low_stock_products_orm = list(low_stock_result.scalars().all())

    return DashboardStats(
        total_products=total_products,
        total_warehouses=total_warehouses,
        total_suppliers=total_suppliers,
        total_inventory_value=total_inventory_value,
        low_stock_count=len(low_stock_products_orm),
        low_stock_products=[
            LowStockProduct(
                id=p.id,
                name=p.name,
                sku=p.sku,
                category=p.category.value,
                quantity_in_stock=p.quantity_in_stock,
                reorder_level=p.reorder_level,
                warehouse_name=p.warehouse.name if p.warehouse else None,
            )
            for p in low_stock_products_orm
        ],
    )


@router.get("/reorder-forecast", response_model=list[ReorderForecastItem])
async def get_reorder_forecast(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tid = current_user.tenant_id
    products_result = await db.execute(select(Product).where(Product.tenant_id == tid))
    products = list(products_result.scalars().all())
    cutoff = datetime.utcnow() - timedelta(days=30)

    forecast = []
    for product in products:
        burn_result = await db.execute(
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
                    StockMovement.tenant_id == tid,
                    StockMovement.product_id == product.id,
                    StockMovement.created_at >= cutoff,
                )
            )
        )
        total_consumed = burn_result.scalar() or 0
        daily_burn = max(float(total_consumed), 0.0) / 30.0

        days_left: float | None = None
        if daily_burn > 0:
            days_left = round(
                (product.quantity_in_stock - product.reorder_level) / daily_burn, 1
            )

        forecast.append(
            ReorderForecastItem(
                id=product.id,
                name=product.name,
                sku=product.sku,
                current_stock=product.quantity_in_stock,
                daily_burn=round(daily_burn, 2),
                days_until_reorder=days_left,
            )
        )

    forecast.sort(
        key=lambda x: (x.days_until_reorder is None, x.days_until_reorder or 9999)
    )
    return forecast
