from uuid import UUID, uuid4
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.product import Product


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False)
    phone: Mapped[str | None] = mapped_column(nullable=True)
    address: Mapped[str | None] = mapped_column(nullable=True)

    products: Mapped[list["Product"]] = relationship(
        back_populates="supplier",
        lazy="selectin",
    )
