"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Warehouse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listWarehouses, type Warehouse as WarehouseType } from "@/lib/api";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listWarehouses()
      .then(setWarehouses)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "var(--dk-fg-2)" }}>Loading warehouses…</p>;

  return (
    <div className="space-y-6">
      <h2 className="dk-h4">Warehouses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <Link key={wh.id} href={`/warehouses/${wh.id}`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 rounded-md" style={{ background: "var(--dk-brand-soft)" }}>
                  <Warehouse size={20} style={{ color: "var(--dk-brand)" }} />
                </div>
                <div>
                  <CardTitle className="text-lg">{wh.name}</CardTitle>
                  <CardDescription>{wh.location}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {wh.capacity ? (
                  <Badge variant="outline">Capacity: {wh.capacity}</Badge>
                ) : (
                  <Badge variant="outline">No capacity set</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        {warehouses.length === 0 && (
          <p style={{ color: "var(--dk-fg-2)" }} className="col-span-full">No warehouses found.</p>
        )}
      </div>
    </div>
  );
}
