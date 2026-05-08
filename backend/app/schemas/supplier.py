from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SupplierBase(BaseModel):
    name: str
    email: str
    phone: str | None = None
    address: str | None = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class SupplierRead(SupplierBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
