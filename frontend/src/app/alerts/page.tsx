"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getDashboardStats, recordMovement, type LowStockProduct } from "@/lib/api";

function RestockDialog({ product, onDone }: { product: LowStockProduct; onDone: () => void }) {
  const [qty, setQty] = useState("0");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await recordMovement(product.id, {
        movement_type: "restock",
        quantity_delta: parseInt(qty, 10),
        note: note || undefined,
      });
      setOpen(false);
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ background: "var(--dk-brand)", color: "#fff" }}>
          Restock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Restock — {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Quantity to add</Label>
            <Input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="PO #, supplier…" />
          </div>
          <Button type="submit" disabled={loading} style={{ background: "var(--dk-brand)", color: "#fff" }}>
            {loading ? "Saving…" : "Record Restock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AlertsPage() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    getDashboardStats()
      .then((s) => setProducts(s.low_stock_products))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle size={24} style={{ color: "var(--dk-danger)" }} />
        <h2 className="dk-h4">Low Stock Alerts</h2>
        {products.length > 0 && (
          <span
            className="text-sm font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}
          >
            {products.length} items
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--dk-fg-2)" }}>Loading…</p>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder At</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>
                    <Link href={`/products/${p.id}`} style={{ color: "var(--dk-brand)" }}>
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wide"
                      style={{ background: "var(--dk-brand-soft)", color: "var(--dk-brand)" }}
                    >
                      {p.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold" style={{ color: "var(--dk-danger)" }}>
                      {p.quantity_in_stock}
                    </span>
                  </TableCell>
                  <TableCell>{p.reorder_level}</TableCell>
                  <TableCell style={{ color: "var(--dk-fg-2)" }}>{p.warehouse_name || "—"}</TableCell>
                  <TableCell>
                    <RestockDialog product={p} onDone={load} />
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                    No low stock items. Everything looks good!
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
