"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProduct, type ProductDetail } from "@/lib/api";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading product...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!product) return <p className="text-slate-500">Product not found.</p>;

  const isLow = product.quantity_in_stock <= product.reorder_level;

  return (
    <div>
      <Link href="/products" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={16} />
        Back to Products
      </Link>
      <h2 className="text-2xl font-bold mb-6">{product.name}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">SKU</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <Badge variant="secondary">{product.category.replace("_", " ")}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unit Price</span>
              <span className="font-medium">${product.unit_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantity in Stock</span>
              <span className="font-medium">{product.quantity_in_stock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reorder Level</span>
              <span className="font-medium">{product.reorder_level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              {isLow ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Low Stock
                </Badge>
              ) : (
                <Badge variant="default" className="bg-green-600 text-white">In Stock</Badge>
              )}
            </div>
            {product.description && (
              <div className="pt-2 border-t">
                <span className="text-slate-500 block mb-1">Description</span>
                <p>{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              {product.warehouse ? (
                <div className="space-y-2">
                  <p className="font-medium">{product.warehouse.name}</p>
                  <p className="text-slate-500 text-sm">{product.warehouse.location}</p>
                  {product.warehouse.capacity && (
                    <p className="text-slate-500 text-sm">Capacity: {product.warehouse.capacity}</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">No warehouse assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              {product.supplier ? (
                <div className="space-y-2">
                  <p className="font-medium">{product.supplier.name}</p>
                  <p className="text-slate-500 text-sm">{product.supplier.email}</p>
                  {product.supplier.phone && <p className="text-slate-500 text-sm">{product.supplier.phone}</p>}
                  {product.supplier.address && <p className="text-slate-500 text-sm">{product.supplier.address}</p>}
                </div>
              ) : (
                <p className="text-slate-500">No supplier assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
