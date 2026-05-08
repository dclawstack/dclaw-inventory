import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_supplier(client):
    response = await client.post("/api/v1/suppliers/", json={
        "name": "Acme Corp",
        "email": "acme@example.com",
        "phone": "555-1234",
        "address": "123 Main St",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Corp"
    assert data["email"] == "acme@example.com"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_suppliers(client):
    await client.post("/api/v1/suppliers/", json={"name": "S1", "email": "s1@example.com"})
    await client.post("/api/v1/suppliers/", json={"name": "S2", "email": "s2@example.com"})
    response = await client.get("/api/v1/suppliers/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_get_supplier(client):
    create_resp = await client.post("/api/v1/suppliers/", json={"name": "S1", "email": "s1@example.com"})
    supplier_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/suppliers/{supplier_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "S1"


@pytest.mark.asyncio
async def test_get_supplier_not_found(client):
    response = await client.get(f"/api/v1/suppliers/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_supplier(client):
    create_resp = await client.post("/api/v1/suppliers/", json={"name": "S1", "email": "s1@example.com"})
    supplier_id = create_resp.json()["id"]
    response = await client.patch(f"/api/v1/suppliers/{supplier_id}", json={"name": "Updated"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated"
    assert data["email"] == "s1@example.com"


@pytest.mark.asyncio
async def test_delete_supplier(client):
    create_resp = await client.post("/api/v1/suppliers/", json={"name": "S1", "email": "s1@example.com"})
    supplier_id = create_resp.json()["id"]
    response = await client.delete(f"/api/v1/suppliers/{supplier_id}")
    assert response.status_code == 204
    get_resp = await client.get(f"/api/v1/suppliers/{supplier_id}")
    assert get_resp.status_code == 404
