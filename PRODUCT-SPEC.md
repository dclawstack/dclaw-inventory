# PRODUCT-SPEC: Inventory

## Overview

**App Name:** Inventory
**Domain:** Stock tracking, warehouses, suppliers
**Target User:** Warehouse managers, procurement teams

## Core Entities

### Product
```
Product
├── id: UUID (PK)
├── name: str (required)
├── sku: str (unique, required)
├── description: str (optional)
├── category: enum ["electronics", "furniture", "clothing", "food", "raw_materials", "other"] (required)
├── unit_price: float (required, default 0)
├── quantity_in_stock: int (required, default 0)
├── reorder_level: int (default 10)
├── warehouse_id: UUID (FK → Warehouse, optional)
├── supplier_id: UUID (FK → Supplier, optional)
├── created_at: datetime
└── updated_at: datetime
```

### Warehouse
```
Warehouse
├── id: UUID (PK)
├── name: str (required)
├── location: str (required)
├── capacity: int (optional)
├── created_at: datetime
└── updated_at: datetime
```

### Supplier
```
Supplier
├── id: UUID (PK)
├── name: str (required)
├── email: str (required)
├── phone: str (optional)
├── address: str (optional)
├── created_at: datetime
└── updated_at: datetime
```

## User Stories / Screens

### Screen 1: Dashboard
- Summary cards: total products, low stock alerts, total inventory value, warehouse count
- Low stock products table
- Recent inventory movements (mock for v1.0)

### Screen 2: Products
- Table view with pagination, search by name/SKU
- Category filter
- Stock level indicator (green/yellow/red)
- "Add Product" form with warehouse and supplier dropdowns

### Screen 3: Product Detail
- Product info card with edit/delete
- Stock level bar
- Related warehouse and supplier info

### Screen 4: Warehouses
- Card grid showing warehouse name, location, capacity utilization
- "Add Warehouse" form

### Screen 5: Suppliers
- Table view with contact info
- "Add Supplier" form

## AI Features

- **Stock prediction:** Predict when products will hit reorder level based on historical data (mock)
- **Category auto-suggest:** Suggest category based on product name

## API Endpoints (v1.0)

```
GET    /api/v1/products           → List products
POST   /api/v1/products           → Create product
GET    /api/v1/products/{id}      → Get product
PUT    /api/v1/products/{id}      → Update product
DELETE /api/v1/products/{id}      → Delete product
GET    /api/v1/warehouses         → List warehouses
POST   /api/v1/warehouses         → Create warehouse
GET    /api/v1/warehouses/{id}    → Get warehouse
PUT    /api/v1/warehouses/{id}    → Update warehouse
DELETE /api/v1/warehouses/{id}    → Delete warehouse
GET    /api/v1/suppliers          → List suppliers
POST   /api/v1/suppliers          → Create supplier
GET    /api/v1/suppliers/{id}     → Get supplier
PUT    /api/v1/suppliers/{id}     → Update supplier
DELETE /api/v1/suppliers/{id}     → Delete supplier
GET    /api/v1/dashboard          → Dashboard stats
```

## Non-Functional Requirements

- Backend tests: 70%+ coverage
- Frontend: Responsive, Tailwind + pre-built UI components
- Docker: All services start with `docker compose up -d`
- No mock data — everything persisted to PostgreSQL
