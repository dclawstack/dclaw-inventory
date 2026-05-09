# Directory Structure — dclaw-inventory

> GitHub: [JagadeeshAvas/dclaw-inventory](https://github.com/JagadeeshAvas/dclaw-inventory)

```
dclaw-inventory/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 35ce3a1f000e_add_products_warehouses_suppliers.py
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py
│   │   │   ├── routes/
│   │   │   │   └── health.py
│   │   │   └── v1/
│   │   │       ├── products.py
│   │   │       ├── suppliers.py
│   │   │       └── warehouses.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── base.py
│   │   │   ├── product.py
│   │   │   ├── supplier.py
│   │   │   └── warehouse.py
│   │   ├── repositories/
│   │   │   ├── base_repo.py
│   │   │   ├── product_repo.py
│   │   │   ├── supplier_repo.py
│   │   │   └── warehouse_repo.py
│   │   ├── schemas/
│   │   │   ├── product.py
│   │   │   ├── supplier.py
│   │   │   └── warehouse.py
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_health.py
│   │   ├── test_products.py
│   │   ├── test_suppliers.py
│   │   └── test_warehouses.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── suppliers/
│   │   │   │   └── page.tsx
│   │   │   └── warehouses/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       └── tabs.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       └── utils.ts
│   ├── Dockerfile
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── helm/
│   ├── templates/
│   │   ├── _helpers.tpl
│   │   ├── deployment.yaml
│   │   ├── NOTES.txt
│   │   ├── secrets.yaml
│   │   └── service.yaml
│   ├── Chart.yaml
│   └── values.yaml
├── .github/
│   └── workflows/
│       └── ci.yml
├── vault/                        ← Obsidian vault (this file)
├── docker-compose.yml
├── .env.example
├── AGENT-PROMPTS.md
├── AGENTS.md
├── PLAN-v1.2.md
├── PRODUCT-SPEC.md
├── README.md
├── SCALING-PLAYBOOK.md
└── TEAM-ONBOARDING-GUIDE.md
```

## Key Areas

| Path | Purpose |
|---|---|
| `backend/app/api/v1/` | FastAPI route handlers for products, suppliers, warehouses |
| `backend/app/models/` | SQLAlchemy ORM models |
| `backend/app/repositories/` | Data access layer (repository pattern) |
| `backend/app/schemas/` | Pydantic request/response schemas |
| `backend/alembic/versions/` | Database migration scripts |
| `frontend/src/app/` | Next.js App Router pages |
| `frontend/src/components/ui/` | Reusable UI components (shadcn/ui) |
| `helm/` | Kubernetes Helm chart for deployment |
| `.github/workflows/` | CI pipeline |
