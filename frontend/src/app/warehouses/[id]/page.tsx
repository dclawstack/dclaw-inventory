"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  getWarehouse,
  getWarehouseStats,
  getWarehouseProducts,
  type Warehouse,
  type WarehouseStats,
  type Product,
} from "@/lib/api";

export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([getWarehouse(id), getWarehouseStats(id), getWarehouseProducts(id)])
      .then(([wh, st, prods]) => {
        setWarehouse(wh);
        setStats(st);
        setProducts(prods);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "var(--dk-fg-2)" }}>Loading warehouse…</p>;
  if (error) return <p style={{ color: "var(--dk-danger)" }}>Error: {error}</p>;
  if (!warehouse) return null;

  const capacityPct = stats?.capacity_used_pct;
  const isOverCapacity = capacityPct !== null && capacityPct !== undefined && capacityPct > 90;

  return (
    <div className="space-y-6">
      <Link
        href="/warehouses"
        className="flex items-center gap-2 text-sm"
        style={{ color: "var(--dk-fg-2)" }}
      >
        <ArrowLeft size={16} />
        Back to Warehouses
      </Link>

      <h2 className="dk-h4">{warehouse.name}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="dk-h5">Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span style={{ color: "var(--dk-fg-2)" }}>Location</span>
              <span className="font-medium">{warehouse.location}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--dk-fg-2)" }}>Capacity</span>
              <span className="font-medium">{warehouse.capacity ?? "—"}</span>
            </div>
            {stats && (
              <>
                <div className="flex justify-between">
                  <span style={{ color: "var(--dk-fg-2)" }}>Products</span>
                  <span className="font-medium">{stats.product_count}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--dk-fg-2)" }}>Total Units</span>
                  <span className="font-medium">{stats.total_units}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {stats && warehouse.capacity && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="dk-h5">Capacity Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: "var(--dk-fg-2)" }}>
                  {stats.total_units} / {warehouse.capacity} units
                </span>
                <span
                  className="font-semibold"
                  style={{ color: isOverCapacity ? "var(--dk-danger)" : "var(--dk-success)" }}
                >
                  {capacityPct}%
                </span>
              </div>
              <div
                className="w-full rounded-full h-3 overflow-hidden"
                style={{ background: "var(--dk-border)" }}
              >
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(capacityPct ?? 0, 100)}%`,
                    background: isOverCapacity ? "var(--dk-danger)" : "var(--dk-brand)",
                  }}
                />
              </div>
              {isOverCapacity && (
                <p className="text-sm mt-2 flex items-center gap-1" style={{ color: "var(--dk-danger)" }}>
                  <AlertTriangle size={14} />
                  Over 90% capacity — consider redistributing stock.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="dk-h5">Products in this Warehouse</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const isLow = p.quantity_in_stock <= p.reorder_level;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/products/${p.id}`} style={{ color: "var(--dk-brand)" }}>
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.category.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{p.quantity_in_stock}</TableCell>
                    <TableCell>{p.reorder_level}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}
                        >
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
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                    No products assigned to this warehouse.
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
