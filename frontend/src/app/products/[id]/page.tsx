"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Pencil, Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  getProduct,
  updateProduct,
  listProductMovements,
  recordMovement,
  transferStock,
  listWarehouses,
  type ProductDetail,
  type StockMovement,
  type MovementType,
  type Warehouse,
} from "@/lib/api";

const MOVEMENT_TYPES: MovementType[] = ["restock", "sale", "adjustment", "transfer_in", "transfer_out"];

const movementBadgeStyle: Record<MovementType, React.CSSProperties> = {
  restock: { background: "var(--dk-success-bg)", color: "var(--dk-success)" },
  sale: { background: "var(--dk-info-bg)", color: "var(--dk-info)" },
  adjustment: { background: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  transfer_in: { background: "var(--dk-brand-soft)", color: "var(--dk-brand)" },
  transfer_out: { background: "var(--dk-bg-muted)", color: "var(--dk-fg-2)" },
};

function RecordMovementDialog({
  productId,
  warehouses,
  onDone,
}: {
  productId: string;
  warehouses: Warehouse[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [movType, setMovType] = useState<MovementType>("restock");
  const [qty, setQty] = useState("0");
  const [warehouseId, setWarehouseId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await recordMovement(productId, {
        movement_type: movType,
        quantity_delta: parseInt(qty, 10),
        warehouse_id: warehouseId || undefined,
        note: note || undefined,
      });
      setOpen(false);
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ background: "var(--dk-brand)", color: "#fff" }}>
          Record Movement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Stock Movement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm" style={{ color: "var(--dk-danger)" }}>{error}</p>}
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={movType} onValueChange={(v) => setMovType(v as MovementType)}>
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace("_", " ")}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Quantity (positive to add, negative to subtract)</Label>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Warehouse (optional)</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <option value="">None</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="PO #, reason…" />
          </div>
          <Button type="submit" disabled={loading} style={{ background: "var(--dk-brand)", color: "#fff" }}>
            {loading ? "Saving…" : "Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  productId,
  warehouses,
  onDone,
}: {
  productId: string;
  warehouses: Warehouse[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [fromWh, setFromWh] = useState("");
  const [toWh, setToWh] = useState("");
  const [qty, setQty] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromWh || !toWh) return setError("Select both warehouses");
    if (fromWh === toWh) return setError("Source and destination must differ");
    setLoading(true);
    setError("");
    try {
      await transferStock(productId, {
        from_warehouse_id: fromWh,
        to_warehouse_id: toWh,
        quantity: parseInt(qty, 10),
      });
      setOpen(false);
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Transfer Stock</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm" style={{ color: "var(--dk-danger)" }}>{error}</p>}
          <div className="space-y-1">
            <Label>From Warehouse</Label>
            <Select value={fromWh} onValueChange={setFromWh}>
              <option value="">Select…</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>To Warehouse</Label>
            <Select value={toWh} onValueChange={setToWh}>
              <option value="">Select…</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} style={{ background: "var(--dk-brand)", color: "#fff" }}>
            {loading ? "Transferring…" : "Transfer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProductDetail>>({});
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    if (!id) return;
    const [prod, movs, whs] = await Promise.all([
      getProduct(id),
      listProductMovements(id),
      listWarehouses(),
    ]);
    setProduct(prod);
    setMovements(movs);
    setWarehouses(whs);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadAll()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function startEdit() {
    if (!product) return;
    setEditForm({
      name: product.name,
      sku: product.sku,
      unit_price: product.unit_price,
      quantity_in_stock: product.quantity_in_stock,
      reorder_level: product.reorder_level,
      description: product.description ?? undefined,
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!id || !product) return;
    setSaving(true);
    try {
      const updated = await updateProduct(id, editForm);
      setProduct({ ...product, ...updated });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--dk-fg-2)" }}>Loading product…</p>;
  if (error) return <p style={{ color: "var(--dk-danger)" }}>Error: {error}</p>;
  if (!product) return <p style={{ color: "var(--dk-fg-2)" }}>Product not found.</p>;

  const isLow = product.quantity_in_stock <= product.reorder_level;

  function field(key: keyof ProductDetail) {
    if (editing && key in editForm) {
      return (
        <Input
          value={String(editForm[key] ?? "")}
          onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
          className="h-7 text-sm"
        />
      );
    }
    return <span className="font-medium">{String(product![key] ?? "—")}</span>;
  }

  return (
    <div className="space-y-6">
      <Link href="/products" className="flex items-center gap-2 text-sm" style={{ color: "var(--dk-fg-2)" }}>
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="dk-h4">{product.name}</h2>
        <div className="flex gap-2">
          <RecordMovementDialog productId={id} warehouses={warehouses} onDone={loadAll} />
          <TransferDialog productId={id} warehouses={warehouses} onDone={loadAll} />
          {!editing ? (
            <Button size="sm" variant="outline" onClick={startEdit}>
              <Pencil size={14} className="mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} disabled={saving} style={{ background: "var(--dk-brand)", color: "#fff" }}>
                <Check size={14} className="mr-1" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                <X size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="dk-h5">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>Name</span>
              {field("name")}
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>SKU</span>
              {field("sku")}
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>Category</span>
              <Badge variant="secondary">{product.category.replace("_", " ")}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>Unit Price</span>
              {editing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={String(editForm.unit_price ?? "")}
                  onChange={(e) => setEditForm((f) => ({ ...f, unit_price: parseFloat(e.target.value) }))}
                  className="h-7 text-sm w-28"
                />
              ) : (
                <span className="font-medium">${product.unit_price.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>Quantity in Stock</span>
              {editing ? (
                <Input
                  type="number"
                  value={String(editForm.quantity_in_stock ?? "")}
                  onChange={(e) => setEditForm((f) => ({ ...f, quantity_in_stock: parseInt(e.target.value) }))}
                  className="h-7 text-sm w-28"
                />
              ) : (
                <span className="font-medium">{product.quantity_in_stock}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>Reorder Level</span>
              {editing ? (
                <Input
                  type="number"
                  value={String(editForm.reorder_level ?? "")}
                  onChange={(e) => setEditForm((f) => ({ ...f, reorder_level: parseInt(e.target.value) }))}
                  className="h-7 text-sm w-28"
                />
              ) : (
                <span className="font-medium">{product.reorder_level}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--dk-fg-2)" }}>Status</span>
              {isLow ? (
                <span
                  className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}
                >
                  <AlertTriangle size={11} />
                  Low Stock
                </span>
              ) : (
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: "var(--dk-success-bg)", color: "var(--dk-success)" }}
                >
                  In Stock
                </span>
              )}
            </div>
            {product.description && (
              <div className="pt-2 border-t">
                <span style={{ color: "var(--dk-fg-2)" }} className="block mb-1">Description</span>
                {editing ? (
                  <Input
                    value={editForm.description ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                ) : (
                  <p style={{ color: "var(--dk-fg-1)" }}>{product.description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="dk-h5">Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              {product.warehouse ? (
                <div className="space-y-2">
                  <Link href={`/warehouses/${product.warehouse.id}`} className="font-medium" style={{ color: "var(--dk-brand)" }}>
                    {product.warehouse.name}
                  </Link>
                  <p className="text-sm" style={{ color: "var(--dk-fg-2)" }}>{product.warehouse.location}</p>
                  {product.warehouse.capacity && (
                    <p className="text-sm" style={{ color: "var(--dk-fg-2)" }}>Capacity: {product.warehouse.capacity}</p>
                  )}
                </div>
              ) : (
                <p style={{ color: "var(--dk-fg-muted)" }}>No warehouse assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="dk-h5">Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              {product.supplier ? (
                <div className="space-y-2">
                  <Link href={`/suppliers/${product.supplier.id}`} className="font-medium" style={{ color: "var(--dk-brand)" }}>
                    {product.supplier.name}
                  </Link>
                  <p className="text-sm" style={{ color: "var(--dk-fg-2)" }}>{product.supplier.email}</p>
                  {product.supplier.phone && <p className="text-sm" style={{ color: "var(--dk-fg-2)" }}>{product.supplier.phone}</p>}
                </div>
              ) : (
                <p style={{ color: "var(--dk-fg-muted)" }}>No supplier assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dk-h5">Movement History</CardTitle>
          <RecordMovementDialog productId={id} warehouses={warehouses} onDone={loadAll} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs" style={{ color: "var(--dk-fg-2)" }}>
                    {new Date(m.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={movementBadgeStyle[m.movement_type]}
                    >
                      {m.movement_type.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-semibold"
                      style={{ color: m.quantity_delta >= 0 ? "var(--dk-success)" : "var(--dk-danger)" }}
                    >
                      {m.quantity_delta >= 0 ? `+${m.quantity_delta}` : m.quantity_delta}
                    </span>
                  </TableCell>
                  <TableCell style={{ color: "var(--dk-fg-2)" }}>{m.note || "—"}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                    No movements recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
