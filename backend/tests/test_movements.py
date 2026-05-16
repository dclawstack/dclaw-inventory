import pytest
from uuid import uuid4


async def create_product(client, sku="P-001", qty=100, reorder=10):
    resp = await client.post("/api/v1/products/", json={
        "name": "Test Product", "sku": sku, "category": "electronics",
        "unit_price": 10.0, "quantity_in_stock": qty, "reorder_level": reorder,
    })
    assert resp.status_code == 201
    return resp.json()


async def create_warehouse(client, name="WH1"):
    resp = await client.post("/api/v1/warehouses/", json={"name": name, "location": "L1"})
    assert resp.status_code == 201
    return resp.json()


@pytest.mark.asyncio
async def test_record_restock(client):
    product = await create_product(client, qty=50)
    product_id = product["id"]

    resp = await client.post(f"/api/v1/products/{product_id}/movements", json={
        "movement_type": "restock", "quantity_delta": 20, "note": "weekly restock",
    })
    assert resp.status_code == 201
    mv = resp.json()
    assert mv["movement_type"] == "restock"
    assert mv["quantity_delta"] == 20

    product_resp = await client.get(f"/api/v1/products/{product_id}")
    assert product_resp.json()["quantity_in_stock"] == 70


@pytest.mark.asyncio
async def test_record_sale(client):
    product = await create_product(client, qty=100)
    product_id = product["id"]

    resp = await client.post(f"/api/v1/products/{product_id}/movements", json={
        "movement_type": "sale", "quantity_delta": -10,
    })
    assert resp.status_code == 201
    product_resp = await client.get(f"/api/v1/products/{product_id}")
    assert product_resp.json()["quantity_in_stock"] == 90


@pytest.mark.asyncio
async def test_list_product_movements(client):
    product = await create_product(client)
    product_id = product["id"]

    for delta in [10, -5, 3]:
        await client.post(f"/api/v1/products/{product_id}/movements", json={
            "movement_type": "adjustment", "quantity_delta": delta,
        })

    resp = await client.get(f"/api/v1/products/{product_id}/movements")
    assert resp.status_code == 200
    assert len(resp.json()) == 3


@pytest.mark.asyncio
async def test_list_global_movements(client):
    p1 = await create_product(client, sku="P-001")
    p2 = await create_product(client, sku="P-002")

    await client.post(f"/api/v1/products/{p1['id']}/movements", json={
        "movement_type": "sale", "quantity_delta": -5,
    })
    await client.post(f"/api/v1/products/{p2['id']}/movements", json={
        "movement_type": "restock", "quantity_delta": 50,
    })

    resp = await client.get("/api/v1/movements/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_movement_not_found_product(client):
    resp = await client.post(f"/api/v1/products/{uuid4()}/movements", json={
        "movement_type": "restock", "quantity_delta": 10,
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_transfer_stock(client):
    wh1 = await create_warehouse(client, "WH1")
    wh2 = await create_warehouse(client, "WH2")
    product = await create_product(client, qty=100)
    product_id = product["id"]

    resp = await client.post(f"/api/v1/products/{product_id}/transfer", json={
        "from_warehouse_id": wh1["id"],
        "to_warehouse_id": wh2["id"],
        "quantity": 40,
    })
    assert resp.status_code == 201
    movements = resp.json()
    assert len(movements) == 2
    types = {m["movement_type"] for m in movements}
    assert types == {"transfer_out", "transfer_in"}

    product_resp = await client.get(f"/api/v1/products/{product_id}")
    assert product_resp.json()["warehouse_id"] == wh2["id"]
    assert product_resp.json()["quantity_in_stock"] == 100


@pytest.mark.asyncio
async def test_transfer_insufficient_stock(client):
    wh1 = await create_warehouse(client, "WH1")
    wh2 = await create_warehouse(client, "WH2")
    product = await create_product(client, qty=10)
    product_id = product["id"]

    resp = await client.post(f"/api/v1/products/{product_id}/transfer", json={
        "from_warehouse_id": wh1["id"],
        "to_warehouse_id": wh2["id"],
        "quantity": 50,
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_movements_csv_export(client):
    product = await create_product(client)
    await client.post(f"/api/v1/products/{product['id']}/movements", json={
        "movement_type": "sale", "quantity_delta": -5,
    })
    resp = await client.get("/api/v1/movements/export")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    lines = resp.text.strip().split("\n")
    assert len(lines) == 2


@pytest.mark.asyncio
async def test_movements_filter_by_type(client):
    product = await create_product(client)
    product_id = product["id"]
    await client.post(f"/api/v1/products/{product_id}/movements", json={
        "movement_type": "restock", "quantity_delta": 10,
    })
    await client.post(f"/api/v1/products/{product_id}/movements", json={
        "movement_type": "sale", "quantity_delta": -3,
    })

    resp = await client.get("/api/v1/movements/?movement_type=restock")
    assert resp.status_code == 200
    data = resp.json()
    assert all(m["movement_type"] == "restock" for m in data)
    assert len(data) == 1
