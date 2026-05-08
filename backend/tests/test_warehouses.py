import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_warehouse(client):
    response = await client.post("/api/v1/warehouses/", json={
        "name": "Main Warehouse",
        "location": "New York",
        "capacity": 1000,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Main Warehouse"
    assert data["location"] == "New York"
    assert data["capacity"] == 1000
    assert "id" in data


@pytest.mark.asyncio
async def test_list_warehouses(client):
    await client.post("/api/v1/warehouses/", json={"name": "W1", "location": "L1"})
    await client.post("/api/v1/warehouses/", json={"name": "W2", "location": "L2"})
    response = await client.get("/api/v1/warehouses/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_get_warehouse(client):
    create_resp = await client.post("/api/v1/warehouses/", json={"name": "W1", "location": "L1"})
    warehouse_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/warehouses/{warehouse_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "W1"


@pytest.mark.asyncio
async def test_get_warehouse_not_found(client):
    response = await client.get(f"/api/v1/warehouses/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_warehouse(client):
    create_resp = await client.post("/api/v1/warehouses/", json={"name": "W1", "location": "L1"})
    warehouse_id = create_resp.json()["id"]
    response = await client.patch(f"/api/v1/warehouses/{warehouse_id}", json={"name": "Updated"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated"
    assert data["location"] == "L1"


@pytest.mark.asyncio
async def test_delete_warehouse(client):
    create_resp = await client.post("/api/v1/warehouses/", json={"name": "W1", "location": "L1"})
    warehouse_id = create_resp.json()["id"]
    response = await client.delete(f"/api/v1/warehouses/{warehouse_id}")
    assert response.status_code == 204
    get_resp = await client.get(f"/api/v1/warehouses/{warehouse_id}")
    assert get_resp.status_code == 404
