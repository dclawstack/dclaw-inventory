# DClaw Inventory — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

---

## Market Context

Benchmarked against YC-backed and modern inventory/ops SaaS:
- **Stord** (YC W19) — supply chain + fulfillment, real-time stock visibility
- **Flieber** — AI-driven inventory optimization, demand forecasting
- **Craftybase** — SMB inventory with full audit trail
- **Shipbob** — multi-warehouse fulfillment with PO workflows
- **Linear / Notion** — design patterns: clean tables, keyboard shortcuts, contextual actions

**Key insight:** Modern inventory SaaS wins on (1) stock movement audit trail, (2) actionable low-stock intelligence, (3) supplier PO lifecycle, (4) zero-latency UI feedback. This roadmap prioritizes those axes.

---

## Design System — Strict Rules for All Frontend Work

Source of truth: `colors_and_type.css` (DKube design system). All frontend work MUST use only the `--dk-*` CSS variables defined there. No hardcoded hex values, no Tailwind arbitrary colors.

### Colors

| Token | Value | Use Case |
|---|---|---|
| `var(--dk-bg)` | `#FFFFFF` | Page background |
| `var(--dk-bg-muted)` | `#F8F8FA` | Sidebar, table zebra rows |
| `var(--dk-bg-tint)` | `#F8F6FB` | Highlighted sections, hover states |
| `var(--dk-brand)` | `#7660A8` | Primary buttons, links, active nav |
| `var(--dk-brand-hover)` | `#5C4A8E` | Button hover |
| `var(--dk-brand-press)` | `#4A3878` | Button active/press |
| `var(--dk-brand-soft)` | `#F1EEF8` | Badge backgrounds, tag fills |
| `var(--dk-fg)` | `#0F0F12` | Headlines |
| `var(--dk-fg-1)` | `#404049` | Body copy |
| `var(--dk-fg-2)` | `#7A7A85` | Meta text, timestamps, secondary labels |
| `var(--dk-fg-muted)` | `#A3A3AC` | Placeholder text, disabled |
| `var(--dk-border)` | `#E8E8EC` | All borders, dividers |
| `var(--dk-border-strong)` | `#D6D6D6` | Table header borders, section dividers |
| `var(--dk-border-brand)` | `#C9C0DE` | Focus rings, selected row borders |

### Semantic / Status Colors

| State | Text Color | Background |
|---|---|---|
| Success (in stock) | `var(--dk-success)` `#2E8B57` | `var(--dk-success-bg)` `#E6F4EC` |
| Warning (low stock) | `var(--dk-warning)` `#C28A00` | `var(--dk-warning-bg)` `#FBF1DC` |
| Danger (out of stock / delete) | `var(--dk-danger)` `#B3261E` | `var(--dk-danger-bg)` `#FBE9E7` |
| Info | `var(--dk-info)` `#2C6CB0` | `var(--dk-info-bg)` `#E5EFF9` |

### Typography

**Font:** Poppins (all weights, locally bundled). Apply via `var(--dk-font-sans)`.

| Class / Usage | Size | Weight | Use Case |
|---|---|---|---|
| `.dk-h3` | 32px | 700 | Page titles |
| `.dk-h4` | 24px | 600 | Section headers, card titles |
| `.dk-h5` | 20px | 600 | Sub-section headers |
| `.dk-lead` | 18px | 400 | Intro / summary text |
| `.dk-body` | 16px | 400 | Default body copy |
| `.dk-meta` | 14px | 500 | Table cells, form labels, badges |
| `.dk-caption` | 12px | 500 | Timestamps, helper text |
| `.dk-eyebrow` | 14px, uppercase | 600 | Section labels, category tags |

### Radii & Elevation

| Token | Value | Use Case |
|---|---|---|
| `var(--dk-radius-sm)` | 8px | Badges, inputs, small buttons |
| `var(--dk-radius-md)` | 12px | Dropdowns, tooltips |
| `var(--dk-radius-lg)` | 16px | Cards, panels |
| `var(--dk-radius-pill)` | 999px | Primary CTA buttons |
| `var(--dk-shadow-sm)` | soft 6px | Resting card elevation |
| `var(--dk-shadow-md)` | soft 20px | Hover lift on cards |
| `var(--dk-shadow-brand)` | purple-tinted 28px | Primary button glow |

### Spacing

4px base grid. Use `var(--dk-space-*)` tokens: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px`.

### Light Mode Only

Do not add dark mode variants in v1.2. The `globals.css` Tailwind tokens (`--background`, `--primary`, etc.) should be remapped to the DKube palette when wiring components.

---

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [ ] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

---

## v1.0 Feature Inventory (Completed)

- [x] Product CRUD — model, schema, repository, router, tests
- [x] Warehouse CRUD — model, schema, repository, router, tests
- [x] Supplier CRUD — model, schema, repository, router, tests
- [x] Alembic migration for all three entities
- [x] Docker + docker-compose with healthchecks
- [x] GitHub Actions CI
- [x] Next.js pages: `/products`, `/products/[id]`, `/warehouses`, `/suppliers`
- [ ] Dashboard (`/api/v1/dashboard` endpoint + `/` frontend page with real data)

---

## v1.2 Roadmap

### P0 — Must Have

#### 1. Dashboard with Live Stats
**Description:** The `/` page shows real-time KPI cards and a low-stock alert table. Currently renders mock/empty data. This is the first screen every user sees — it must be real.
- **Backend:**
  - `GET /api/v1/dashboard` — returns `{ total_products, total_warehouses, total_suppliers, total_inventory_value, low_stock_count, low_stock_products[] }`
  - Query: `SUM(unit_price * quantity_in_stock)` for value, filter `quantity_in_stock <= reorder_level` for low stock
  - Files: `backend/app/api/v1/dashboard.py`, `backend/app/schemas/dashboard.py`, register router in `main.py`
  - Tests: `backend/tests/test_dashboard.py`
- **Frontend:**
  - 4 KPI cards (total products, low stock count, inventory value, warehouse count) using `Card` component
  - Low stock table using `Table` component — columns: SKU, Name, Category, Stock, Reorder Level, Warehouse
  - Stock badge using semantic color rules above
  - Files: `frontend/src/app/page.tsx`, `frontend/src/lib/api.ts` (add `getDashboardStats()`)

#### 2. Stock Movement Audit Trail
**Description:** Every stock change (restock, sale, adjustment, transfer) is logged as an immutable event. This is the core differentiator for any serious inventory tool — without it, users cannot answer "why is my stock wrong?"
- **Backend:**
  - New model `StockMovement`: `id`, `product_id` (FK), `warehouse_id` (FK, nullable), `movement_type` (enum: `restock`, `sale`, `adjustment`, `transfer_in`, `transfer_out`), `quantity_delta` (int, positive or negative), `note` (str, optional), `created_at`
  - `POST /api/v1/products/{id}/movements` — record a movement, auto-update `product.quantity_in_stock`
  - `GET /api/v1/products/{id}/movements` — list movements for a product (paginated)
  - `GET /api/v1/movements` — global movement log (paginated, filterable by type/warehouse)
  - Alembic migration required
  - Files: `backend/app/models/stock_movement.py`, `backend/app/schemas/stock_movement.py`, `backend/app/repositories/stock_movement_repo.py`, `backend/app/api/v1/movements.py`
  - Tests: `backend/tests/test_movements.py`
- **Frontend:**
  - Movement log table on `/products/[id]` page — columns: Date, Type (badge), Delta, Note
  - "Record Movement" button opens `Dialog` with fields: type (Select), quantity, note
  - Global `/movements` page with full audit log + type filter using `Tabs`
  - Files: `frontend/src/app/movements/page.tsx`, `frontend/src/app/products/[id]/page.tsx` (add movement section)

#### 3. Low Stock Alerts Panel
**Description:** Dedicated view of all products at or below their reorder level. Warehouse managers need to action these immediately. Shown on dashboard and as a standalone page.
- **Backend:**
  - `GET /api/v1/products?low_stock=true` — add `low_stock` query param filter to existing products endpoint
  - Files: `backend/app/repositories/product_repo.py` (add filter), `backend/app/api/v1/products.py`
  - Tests: add test case to `backend/tests/test_products.py`
- **Frontend:**
  - `/alerts` page — table of low-stock products with inline "Record Restock" action
  - Nav badge showing low-stock count (fetched from dashboard stats)
  - Files: `frontend/src/app/alerts/page.tsx`, update nav in `layout.tsx`

#### 4. Product Search and Category Filter
**Description:** The `/products` list page currently has no search or filter. Users cannot find products in a large catalog without it.
- **Backend:**
  - `GET /api/v1/products?search=<term>&category=<cat>&warehouse_id=<id>` — add query params to list endpoint
  - Files: `backend/app/repositories/product_repo.py` (add `ilike` filter), `backend/app/api/v1/products.py`
  - Tests: add filter test cases
- **Frontend:**
  - Search `Input` + category `Select` + warehouse `Select` filter bar above the products table
  - Debounced search (300ms) using `useState` + `useEffect`
  - Files: `frontend/src/app/products/page.tsx`

---

### P1 — Should Have

#### 5. Warehouse Inventory View
**Description:** Show all products stored in a specific warehouse, with total capacity utilization. Essential for warehouse managers who think in physical locations.
- **Backend:**
  - `GET /api/v1/warehouses/{id}/products` — list products in a warehouse with stock levels
  - `GET /api/v1/warehouses/{id}/stats` — `{ product_count, total_units, capacity_used_pct }`
  - Files: `backend/app/api/v1/warehouses.py`, `backend/app/repositories/warehouse_repo.py`
  - Tests: `backend/tests/test_warehouses.py`
- **Frontend:**
  - `/warehouses/[id]` detail page — capacity bar, product table, recent movements
  - Capacity bar: `bg-primary` fill on `bg-muted` track, color shifts to `bg-destructive` when > 90%
  - Files: `frontend/src/app/warehouses/[id]/page.tsx`

#### 6. Supplier Product Catalog View
**Description:** Show all products sourced from a supplier. Procurement teams need to see exposure per supplier for risk management.
- **Backend:**
  - `GET /api/v1/suppliers/{id}/products` — products linked to this supplier
  - Files: `backend/app/api/v1/suppliers.py`
  - Tests: `backend/tests/test_suppliers.py`
- **Frontend:**
  - `/suppliers/[id]` detail page — supplier info card, products table with stock levels
  - Files: `frontend/src/app/suppliers/[id]/page.tsx`

#### 7. Warehouse Stock Transfer
**Description:** Move quantity of a product from one warehouse to another as a single atomic operation. Creates two `StockMovement` records (`transfer_out` + `transfer_in`).
- **Backend:**
  - `POST /api/v1/products/{id}/transfer` — body: `{ from_warehouse_id, to_warehouse_id, quantity }`
  - Validates sufficient stock in source warehouse, creates two movement records in a single transaction
  - Files: `backend/app/api/v1/products.py`, `backend/app/repositories/stock_movement_repo.py`
  - Tests: test transfer success + insufficient stock 422
- **Frontend:**
  - "Transfer Stock" button on `/products/[id]` opens `Dialog` with warehouse selects + quantity input
  - Files: `frontend/src/app/products/[id]/page.tsx`

#### 8. CSV Export
**Description:** Export products or movements to CSV. Required for finance/ops teams who live in spreadsheets. YC-backed ops tools always include this.
- **Backend:**
  - `GET /api/v1/products/export?format=csv` — streams CSV response
  - `GET /api/v1/movements/export?format=csv` — streams movement log as CSV
  - Use Python's `csv` module + `StreamingResponse`
  - Files: `backend/app/api/v1/products.py`, `backend/app/api/v1/movements.py`
  - Tests: assert `Content-Type: text/csv` and row count
- **Frontend:**
  - "Export CSV" `Button` (variant: outline) on products and movements pages
  - Triggers `window.location.href` to download endpoint
  - Files: `frontend/src/app/products/page.tsx`, `frontend/src/app/movements/page.tsx`

#### 9. Inline Edit on Product Detail
**Description:** Edit product fields inline on `/products/[id]` without navigating to a separate edit page. Reduces clicks for warehouse managers doing spot corrections.
- **Frontend only** (existing PUT endpoint is already wired):
  - Toggle "Edit" mode on product detail card — inputs replace text, "Save" / "Cancel" buttons appear
  - Uses existing `PUT /api/v1/products/{id}`
  - Files: `frontend/src/app/products/[id]/page.tsx`

---

### P2 — Could Have

#### 10. AI: Category Auto-Suggest
**Description:** When creating a product, suggest a category based on the product name using Claude Haiku. Reduces mis-categorization. Inspired by Flieber's auto-tagging.
- **Backend:**
  - `POST /api/v1/products/suggest-category` — body: `{ name: str }` → returns `{ category: str, confidence: float }`
  - Uses `anthropic` SDK with Claude Haiku (`claude-haiku-4-5-20251001`) — fast, cheap, accurate for classification
  - Prompt: classify product name into one of the 6 category enum values
  - Files: `backend/app/api/v1/products.py`, `backend/app/services/ai_service.py`
  - Env: `ANTHROPIC_API_KEY` must be in `.env.example`
- **Frontend:**
  - "Suggest" button next to Category field in "Add Product" form — shows spinner, then pre-fills Select
  - Files: `frontend/src/app/products/page.tsx`

#### 11. AI: Reorder Suggestions
**Description:** Analyze movement history to predict which products will hit reorder level within 14 days. Surfaces on dashboard as "Action Required" panel.
- **Backend:**
  - `GET /api/v1/dashboard/reorder-forecast` — for each product with movements, compute avg daily consumption from last 30 days, estimate days until reorder level hit
  - Returns products sorted by `days_until_reorder` ascending
  - No external AI needed — pure math. AI narrative summary optional via Claude.
  - Files: `backend/app/api/v1/dashboard.py`, `backend/app/repositories/stock_movement_repo.py`
- **Frontend:**
  - "Reorder Forecast" card on dashboard — table: Product, Current Stock, Daily Burn, Est. Days Left
  - Color-code by urgency: < 7 days = `bg-destructive/10`, 7–14 = `bg-yellow-100/50`, > 14 = `bg-muted`
  - Files: `frontend/src/app/page.tsx`

#### 12. Pagination on All List Endpoints
**Description:** All list endpoints currently return unbounded results. Pagination is required at scale (> 1000 products).
- **Backend:**
  - Add `skip: int = 0, limit: int = 50` query params to all list endpoints
  - Return `{ items: [...], total: int, skip: int, limit: int }` envelope
  - Files: all `v1/*.py` routers and corresponding repos
- **Frontend:**
  - "Load more" button or simple prev/next pagination using `Badge` + `Button` components
  - Files: all list pages

#### 13. Bulk Product Import via CSV
**Description:** Upload a CSV of products (name, sku, category, unit_price, quantity_in_stock) and create them in bulk. Essential for onboarding new warehouses.
- **Backend:**
  - `POST /api/v1/products/import` — multipart file upload, parses CSV, validates rows, bulk inserts
  - Returns `{ created: int, errors: [{ row, reason }] }`
  - Files: `backend/app/api/v1/products.py`
  - Tests: test with valid CSV, test with invalid rows
- **Frontend:**
  - "Import CSV" button → file picker → upload → result summary `Dialog`
  - Files: `frontend/src/app/products/page.tsx`

---

## Navigation Structure

```
/ (Dashboard)
├── /products (Product list + search/filter)
│   └── /products/[id] (Detail + movements + transfer)
├── /warehouses (Warehouse cards)
│   └── /warehouses/[id] (Capacity + products)
├── /suppliers (Supplier table)
│   └── /suppliers/[id] (Supplier detail + products)
├── /movements (Global audit log)
└── /alerts (Low stock panel)
```

Nav sidebar items (in order): Dashboard, Products, Warehouses, Suppliers, Movements, Alerts (with count badge).

---

## Implementation Priority

1. **Dashboard live stats** — #1: highest visibility, unblocks stakeholder demo
2. **Stock movement trail** — #2: core domain feature, required by #3, #7, #11
3. **Low stock alerts** — #3: depends on movements + dashboard
4. **Product search/filter** — #4: usability blocker for large catalogs
5. **Warehouse inventory view** — #5: core operational screen
6. **Supplier catalog view** — #6: procurement workflow
7. **Stock transfer** — #7: depends on movements (#2)
8. **CSV export** — #8: finance/ops requirement
9. **Inline edit** — #9: UX polish
10. **Pagination** — #12: scale readiness
11. **AI category suggest** — #10: differentiation
12. **Reorder forecast** — #11: intelligence layer
13. **Bulk CSV import** — #13: onboarding workflow
