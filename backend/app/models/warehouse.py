from uuid import UUID, uuid4
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.product import Product


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    location: Mapped[str] = mapped_column(nullable=False)
    capacity: Mapped[int | None] = mapped_column(nullable=True)

    products: Mapped[list["Product"]] = relationship(
        back_populates="warehouse",
        lazy="selectin",
    )
