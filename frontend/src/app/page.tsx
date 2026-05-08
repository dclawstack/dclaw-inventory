"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle, DollarSign, Warehouse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0, inventoryValue: 0, warehouseCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Package className="text-slate-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Low Stock Alerts</CardTitle>
            <AlertTriangle className="text-red-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Inventory Value</CardTitle>
            <DollarSign className="text-green-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Warehouses</CardTitle>
            <Warehouse className="text-slate-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.warehouseCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
