"""add tenant_id to existing tables

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-05-16 00:00:01.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "c2d3e4f5a6b7"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001"
TABLES = ["warehouses", "suppliers", "products", "stock_movements"]


def upgrade() -> None:
    # Insert a default tenant so existing rows have something to point at
    op.execute(
        f"INSERT INTO tenants (id, name, created_at) "
        f"VALUES ('{DEFAULT_TENANT_ID}', 'Default Org', now()) "
        f"ON CONFLICT DO NOTHING"
    )

    # Add tenant_id as nullable first so existing rows don't violate NOT NULL
    for table in TABLES:
        op.add_column(table, sa.Column("tenant_id", sa.Uuid(), nullable=True))

    # Backfill all existing rows
    for table in TABLES:
        op.execute(f"UPDATE {table} SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL")

    # Now enforce NOT NULL
    for table in TABLES:
        op.alter_column(table, "tenant_id", nullable=False)

    # Add FK constraints and indexes
    for table in TABLES:
        op.create_foreign_key(
            f"fk_{table}_tenant_id", table,
            "tenants", ["tenant_id"], ["id"],
            ondelete="CASCADE",
        )
        op.create_index(f"ix_{table}_tenant_id", table, ["tenant_id"])

    # Fix SKU uniqueness: drop global unique, add per-tenant unique
    op.drop_constraint("products_sku_key", "products", type_="unique")
    op.create_unique_constraint("uq_product_sku_tenant", "products", ["sku", "tenant_id"])


def downgrade() -> None:
    op.drop_constraint("uq_product_sku_tenant", "products", type_="unique")
    op.create_unique_constraint("products_sku_key", "products", ["sku"])

    for table in TABLES:
        op.drop_index(f"ix_{table}_tenant_id", table_name=table)
        op.drop_constraint(f"fk_{table}_tenant_id", table, type_="foreignkey")
        op.drop_column(table, "tenant_id")
