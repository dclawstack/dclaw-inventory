# Feature Plan v1.2 — DClaw Inventory

> Full plan: [[../PLAN-v1.2.md]] | Design tokens: [[Design System]]

## Priority Queue

| # | Feature | Priority | Depends On | Status |
|---|---|---|---|---|
| 1 | Dashboard live stats | P0 | — | [ ] |
| 2 | Stock movement audit trail | P0 | — | [ ] |
| 3 | Low stock alerts panel | P0 | #2 | [ ] |
| 4 | Product search + category filter | P0 | — | [ ] |
| 5 | Warehouse inventory view | P1 | — | [ ] |
| 6 | Supplier catalog view | P1 | — | [ ] |
| 7 | Warehouse stock transfer | P1 | #2 | [ ] |
| 8 | CSV export | P1 | — | [ ] |
| 9 | Inline edit on product detail | P1 | — | [ ] |
| 10 | AI category auto-suggest | P2 | — | [ ] |
| 11 | AI reorder forecast | P2 | #2 | [ ] |
| 12 | Pagination on all list endpoints | P2 | — | [ ] |
| 13 | Bulk CSV import | P2 | — | [ ] |

## New API Routes (v1.2)

| Method | Route | Feature |
|---|---|---|
| GET | `/api/v1/dashboard` | #1 Live stats |
| POST | `/api/v1/products/{id}/movements` | #2 Record movement |
| GET | `/api/v1/products/{id}/movements` | #2 Per-product log |
| GET | `/api/v1/movements` | #2 Global audit log |
| GET | `/api/v1/products?low_stock=true` | #3 Low stock filter |
| GET | `/api/v1/products?search=&category=` | #4 Search/filter |
| GET | `/api/v1/warehouses/{id}/products` | #5 Warehouse inventory |
| GET | `/api/v1/suppliers/{id}/products` | #6 Supplier catalog |
| POST | `/api/v1/products/{id}/transfer` | #7 Stock transfer |
| GET | `/api/v1/products/export?format=csv` | #8 CSV export |
| POST | `/api/v1/products/suggest-category` | #10 AI suggest |
| GET | `/api/v1/dashboard/reorder-forecast` | #11 AI forecast |

## Navigation (v1.2)

```
/ → Dashboard
/products → List (search + filter)
/products/[id] → Detail + movements + transfer
/warehouses → Card grid
/warehouses/[id] → Capacity + products
/suppliers → Table
/suppliers/[id] → Detail + products
/movements → Global audit log
/alerts → Low stock panel (with nav badge count)
```
