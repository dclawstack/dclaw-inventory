"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getSupplier, getSupplierProducts, type Supplier, type Product } from "@/lib/api";

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([getSupplier(id), getSupplierProducts(id)])
      .then(([sup, prods]) => {
        setSupplier(sup);
        setProducts(prods);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "var(--dk-fg-2)" }}>Loading supplier…</p>;
  if (error) return <p style={{ color: "var(--dk-danger)" }}>Error: {error}</p>;
  if (!supplier) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/suppliers"
        className="flex items-center gap-2 text-sm"
        style={{ color: "var(--dk-fg-2)" }}
      >
        <ArrowLeft size={16} />
        Back to Suppliers
      </Link>

      <h2 className="dk-h4">{supplier.name}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="dk-h5">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: "var(--dk-fg-2)" }} />
              <a href={`mailto:${supplier.email}`} style={{ color: "var(--dk-brand)" }}>
                {supplier.email}
              </a>
            </div>
            {supplier.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} style={{ color: "var(--dk-fg-2)" }} />
                <span>{supplier.phone}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-start gap-2">
                <MapPin size={14} style={{ color: "var(--dk-fg-2)", marginTop: 2 }} />
                <span style={{ color: "var(--dk-fg-1)" }}>{supplier.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="dk-h5">
              Products Sourced ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
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
                      <TableCell>${p.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">{p.quantity_in_stock}</TableCell>
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
                      No products linked to this supplier.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
