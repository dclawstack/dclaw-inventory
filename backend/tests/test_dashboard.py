import pytest


@pytest.mark.asyncio
async def test_dashboard_empty(client):
    response = await client.get("/api/v1/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_products"] == 0
    assert data["total_warehouses"] == 0
    assert data["total_suppliers"] == 0
    assert data["total_inventory_value"] == 0.0
    assert data["low_stock_count"] == 0
    assert data["low_stock_products"] == []


@pytest.mark.asyncio
async def test_dashboard_with_data(client):
    await client.post("/api/v1/warehouses/", json={"name": "WH1", "location": "Loc1"})
    await client.post("/api/v1/suppliers/", json={"name": "SUP1", "email": "s@example.com"})
    await client.post("/api/v1/products/", json={
        "name": "Widget", "sku": "W-001", "category": "electronics",
        "unit_price": 10.0, "quantity_in_stock": 100, "reorder_level": 5,
    })
    await client.post("/api/v1/products/", json={
        "name": "LowItem", "sku": "L-001", "category": "food",
        "unit_price": 5.0, "quantity_in_stock": 2, "reorder_level": 10,
    })

    response = await client.get("/api/v1/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_products"] == 2
    assert data["total_warehouses"] == 1
    assert data["total_suppliers"] == 1
    assert data["total_inventory_value"] == pytest.approx(10.0 * 100 + 5.0 * 2)
    assert data["low_stock_count"] == 1
    assert len(data["low_stock_products"]) == 1
    assert data["low_stock_products"][0]["sku"] == "L-001"


@pytest.mark.asyncio
async def test_reorder_forecast_empty(client):
    response = await client.get("/api/v1/dashboard/reorder-forecast")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_reorder_forecast_with_movements(client):
    p_resp = await client.post("/api/v1/products/", json={
        "name": "Widget", "sku": "W-001", "category": "electronics",
        "unit_price": 10.0, "quantity_in_stock": 100, "reorder_level": 10,
    })
    product_id = p_resp.json()["id"]
    await client.post(f"/api/v1/products/{product_id}/movements", json={
        "movement_type": "sale", "quantity_delta": -30,
    })

    response = await client.get("/api/v1/dashboard/reorder-forecast")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["daily_burn"] > 0
