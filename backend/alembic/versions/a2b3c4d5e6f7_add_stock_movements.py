"""add stock movements

Revision ID: a2b3c4d5e6f7
Revises: 35ce3a1f000e
Create Date: 2026-05-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a2b3c4d5e6f7"
down_revision: Union[str, None] = "35ce3a1f000e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

movement_type_enum = sa.Enum(
    "restock", "sale", "adjustment", "transfer_in", "transfer_out",
    name="movementtype",
)


def upgrade() -> None:
    movement_type_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "stock_movements",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("product_id", sa.Uuid(), nullable=False),
        sa.Column("warehouse_id", sa.Uuid(), nullable=True),
        sa.Column("movement_type", movement_type_enum, nullable=False),
        sa.Column("quantity_delta", sa.Integer(), nullable=False),
        sa.Column("note", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_stock_movements_product_id", "stock_movements", ["product_id"])
    op.create_index("ix_stock_movements_created_at", "stock_movements", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_stock_movements_created_at", "stock_movements")
    op.drop_index("ix_stock_movements_product_id", "stock_movements")
    op.drop_table("stock_movements")
    movement_type_enum.drop(op.get_bind(), checkfirst=True)
