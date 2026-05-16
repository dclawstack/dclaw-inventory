"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle, Download, Upload, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  listProducts,
  listWarehouses,
  createProduct,
  exportProductsUrl,
  suggestCategory,
  importProductsCsv,
  type Product,
  type ProductCategory,
  type Warehouse,
} from "@/lib/api";

const categories: ProductCategory[] = ["electronics", "furniture", "clothing", "food", "raw_materials", "other"];

function AddProductDialog({ warehouses, onCreated }: { warehouses: Warehouse[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", category: "other" as ProductCategory,
    unit_price: "0", quantity_in_stock: "0", reorder_level: "10",
    description: "", warehouse_id: "", supplier_id: "",
  });
  const [suggesting, setSuggesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSuggest() {
    if (!form.name) return;
    setSuggesting(true);
    try {
      const result = await suggestCategory(form.name);
      set("category", result.category);
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createProduct({
        name: form.name,
        sku: form.sku,
        category: form.category,
        unit_price: parseFloat(form.unit_price) || 0,
        quantity_in_stock: parseInt(form.quantity_in_stock) || 0,
        reorder_level: parseInt(form.reorder_level) || 10,
        description: form.description || null,
        warehouse_id: form.warehouse_id || null,
        supplier_id: form.supplier_id || null,
      });
      setOpen(false);
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button style={{ background: "var(--dk-brand)", color: "#fff" }}>Add Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {error && <p className="text-sm" style={{ color: "var(--dk-danger)" }}>{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Category *</Label>
            <div className="flex gap-2">
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
                className="flex-1"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSuggest}
                disabled={!form.name || suggesting}
              >
                <Sparkles size={14} className="mr-1" />
                {suggesting ? "…" : "Suggest"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Unit Price</Label>
              <Input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Qty in Stock</Label>
              <Input type="number" min="0" value={form.quantity_in_stock} onChange={(e) => set("quantity_in_stock", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Reorder Level</Label>
              <Input type="number" min="0" value={form.reorder_level} onChange={(e) => set("reorder_level", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Warehouse</Label>
            <Select value={form.warehouse_id} onValueChange={(v) => set("warehouse_id", v)}>
              <option value="">None</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} style={{ background: "var(--dk-brand)", color: "#fff" }}>
            {loading ? "Creating…" : "Create Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { row: number; reason: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await importProductsCsv(file);
      setResult(res);
      onImported();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload size={14} className="mr-1" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm" style={{ color: "var(--dk-fg-2)" }}>
            CSV must have columns: <code>name, sku, category, unit_price, quantity_in_stock, reorder_level</code>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            style={{ background: "var(--dk-brand)", color: "#fff" }}
          >
            {loading ? "Importing…" : "Choose CSV File"}
          </Button>
          {result && (
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "var(--dk-success)" }}>
                ✓ Created {result.created} products
              </p>
              {result.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--dk-danger)" }}>
                    {result.errors.length} errors:
                  </p>
                  <ul className="text-xs space-y-1 mt-1" style={{ color: "var(--dk-fg-2)" }}>
                    {result.errors.map((e) => (
                      <li key={e.row}>Row {e.row}: {e.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    listWarehouses().then(setWarehouses).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function load() {
    setLoading(true);
    listProducts(debounced || undefined, category || undefined, warehouseFilter || undefined)
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [debounced, category, warehouseFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="dk-h4">Products</h2>
        <div className="flex gap-2">
          <ImportDialog onImported={load} />
          <Button variant="outline" size="sm" onClick={() => { window.location.href = exportProductsUrl(); }}>
            <Download size={14} className="mr-1" />
            Export CSV
          </Button>
          <AddProductDialog warehouses={warehouses} onCreated={load} />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--dk-fg-muted)" }} />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory | "")} className="w-44">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </Select>
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter} className="w-44">
          <option value="">All Warehouses</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>{wh.name}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p style={{ color: "var(--dk-fg-2)" }}>Loading products…</p>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLow = product.quantity_in_stock <= product.reorder_level;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>${product.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity_in_stock}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <span
                          className="text-xs font-semibold flex items-center gap-1 w-fit px-2 py-1 rounded-full"
                          style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}
                        >
                          <AlertTriangle size={11} />
                          Low Stock
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full w-fit"
                          style={{ background: "var(--dk-success-bg)", color: "var(--dk-success)" }}
                        >
                          In Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
