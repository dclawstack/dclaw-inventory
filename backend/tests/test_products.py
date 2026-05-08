import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_product(client):
    response = await client.post("/api/v1/products/", json={
        "name": "Widget",
        "sku": "WID-001",
        "description": "A useful widget",
        "category": "electronics",
        "unit_price": 19.99,
        "quantity_in_stock": 100,
        "reorder_level": 10,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
    assert data["sku"] == "WID-001"
    assert data["category"] == "electronics"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_product_duplicate_sku(client):
    payload = {
        "name": "Widget",
        "sku": "WID-002",
        "category": "electronics",
    }
    response1 = await client.post("/api/v1/products/", json=payload)
    assert response1.status_code == 201
    response2 = await client.post("/api/v1/products/", json={**payload, "name": "Widget2"})
    assert response2.status_code == 409


@pytest.mark.asyncio
async def test_list_products(client):
    await client.post("/api/v1/products/", json={"name": "P1", "sku": "SKU-01", "category": "furniture"})
    await client.post("/api/v1/products/", json={"name": "P2", "sku": "SKU-02", "category": "clothing"})
    response = await client.get("/api/v1/products/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_list_products_with_search(client):
    await client.post("/api/v1/products/", json={"name": "Alpha", "sku": "SKU-S1", "category": "food"})
    await client.post("/api/v1/products/", json={"name": "Beta", "sku": "SKU-S2", "category": "food"})
    response = await client.get("/api/v1/products/?search=Alpha")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Alpha"


@pytest.mark.asyncio
async def test_list_products_with_category(client):
    await client.post("/api/v1/products/", json={"name": "P3", "sku": "SKU-C1", "category": "raw_materials"})
    await client.post("/api/v1/products/", json={"name": "P4", "sku": "SKU-C2", "category": "other"})
    response = await client.get("/api/v1/products/?category=raw_materials")
    assert response.status_code == 200
    data = response.json()
    assert all(p["category"] == "raw_materials" for p in data)


@pytest.mark.asyncio
async def test_get_product(client):
    create_resp = await client.post("/api/v1/products/", json={
        "name": "P1", "sku": "SKU-G1", "category": "electronics"
    })
    product_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/products/{product_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "P1"


@pytest.mark.asyncio
async def test_get_product_not_found(client):
    response = await client.get(f"/api/v1/products/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_product(client):
    create_resp = await client.post("/api/v1/products/", json={
        "name": "P1", "sku": "SKU-U1", "category": "electronics"
    })
    product_id = create_resp.json()["id"]
    response = await client.patch(f"/api/v1/products/{product_id}", json={"name": "Updated"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated"
    assert data["sku"] == "SKU-U1"


@pytest.mark.asyncio
async def test_delete_product(client):
    create_resp = await client.post("/api/v1/products/", json={
        "name": "P1", "sku": "SKU-D1", "category": "electronics"
    })
    product_id = create_resp.json()["id"]
    response = await client.delete(f"/api/v1/products/{product_id}")
    assert response.status_code == 204
    get_resp = await client.get(f"/api/v1/products/{product_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_create_product_with_warehouse_and_supplier(client):
    wh_resp = await client.post("/api/v1/warehouses/", json={"name": "WH1", "location": "L1"})
    warehouse_id = wh_resp.json()["id"]
    sup_resp = await client.post("/api/v1/suppliers/", json={"name": "SUP1", "email": "sup1@example.com"})
    supplier_id = sup_resp.json()["id"]

    response = await client.post("/api/v1/products/", json={
        "name": "Linked Product",
        "sku": "LINK-001",
        "category": "furniture",
        "warehouse_id": str(warehouse_id),
        "supplier_id": str(supplier_id),
    })
    assert response.status_code == 201
    data = response.json()
    assert data["warehouse_id"] == str(warehouse_id)
    assert data["supplier_id"] == str(supplier_id)


@pytest.mark.asyncio
async def test_create_product_invalid_warehouse(client):
    response = await client.post("/api/v1/products/", json={
        "name": "Bad Product",
        "sku": "BAD-001",
        "category": "other",
        "warehouse_id": str(uuid4()),
    })
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_low_stock(client):
    await client.post("/api/v1/products/", json={
        "name": "LowStock", "sku": "LOW-001", "category": "food",
        "quantity_in_stock": 2, "reorder_level": 5
    })
    await client.post("/api/v1/products/", json={
        "name": "HighStock", "sku": "HIGH-001", "category": "food",
        "quantity_in_stock": 100, "reorder_level": 5
    })
    response = await client.get("/api/v1/products/low-stock")
    assert response.status_code == 200
    data = response.json()
    assert any(p["sku"] == "LOW-001" for p in data)
    assert all(p["quantity_in_stock"] <= p["reorder_level"] for p in data)
