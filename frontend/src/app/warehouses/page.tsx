"use client";

import { useEffect, useState } from "react";
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

  if (loading) return <p className="text-slate-500">Loading warehouses...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Warehouses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <Card key={wh.id}>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-md">
                <Warehouse size={20} className="text-slate-600" />
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
        ))}
        {warehouses.length === 0 && (
          <p className="text-slate-500 col-span-full">No warehouses found.</p>
        )}
      </div>
    </div>
  );
}
