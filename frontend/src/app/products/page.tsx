"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { listProducts, type Product, type ProductCategory } from "@/lib/api";

const categories: ProductCategory[] = ["electronics", "furniture", "clothing", "food", "raw_materials", "other"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listProducts(search || undefined, category || undefined)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory | "")} className="w-48">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading products...</p>
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
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>${product.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity_in_stock}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600 text-white w-fit">In Stock</Badge>
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
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
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
