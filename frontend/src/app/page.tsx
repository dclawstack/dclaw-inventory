"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, AlertTriangle, DollarSign, Warehouse, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getDashboardStats, getReorderForecast, type DashboardStats, type ReorderForecastItem } from "@/lib/api";

function KpiCard({
  title,
  value,
  icon: Icon,
  iconColor,
  valueColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: "var(--dk-fg-2)" }}>
          {title}
        </CardTitle>
        <Icon size={20} style={{ color: iconColor || "var(--dk-fg-muted)" }} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" style={{ color: valueColor || "var(--dk-fg)" }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function urgencyStyle(days: number | null) {
  if (days === null) return {};
  if (days < 7) return { background: "var(--dk-danger-bg)" };
  if (days <= 14) return { background: "var(--dk-warning-bg)" };
  return { background: "var(--dk-bg-muted)" };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [forecast, setForecast] = useState<ReorderForecastItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getReorderForecast()])
      .then(([s, f]) => {
        setStats(s);
        setForecast(f.filter((item) => item.daily_burn > 0).slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "var(--dk-fg-2)" }}>Loading dashboard…</p>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <h2 className="dk-h4">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Products" value={stats.total_products} icon={Package} />
        <KpiCard
          title="Low Stock Alerts"
          value={stats.low_stock_count}
          icon={AlertTriangle}
          iconColor="var(--dk-danger)"
          valueColor={stats.low_stock_count > 0 ? "var(--dk-danger)" : "var(--dk-fg)"}
        />
        <KpiCard
          title="Inventory Value"
          value={`$${stats.total_inventory_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          iconColor="var(--dk-success)"
        />
        <KpiCard title="Warehouses" value={stats.total_warehouses} icon={Warehouse} />
      </div>

      {stats.low_stock_products.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dk-h5">Low Stock Alerts</CardTitle>
            <Link href="/alerts" className="text-sm" style={{ color: "var(--dk-brand)" }}>
              View all →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reorder At</TableHead>
                  <TableHead>Warehouse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.low_stock_products.map((p) => (
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
                      <span style={{ color: "var(--dk-danger)", fontWeight: 600 }}>
                        {p.quantity_in_stock}
                      </span>
                    </TableCell>
                    <TableCell>{p.reorder_level}</TableCell>
                    <TableCell style={{ color: "var(--dk-fg-2)" }}>
                      {p.warehouse_name || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {forecast.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingDown size={18} style={{ color: "var(--dk-warning)" }} />
            <CardTitle className="dk-h5">Reorder Forecast</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Daily Burn</TableHead>
                  <TableHead>Est. Days Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.map((item) => (
                  <TableRow key={item.id} style={urgencyStyle(item.days_until_reorder)}>
                    <TableCell>
                      <Link href={`/products/${item.id}`} style={{ color: "var(--dk-brand)" }}>
                        {item.name}
                      </Link>
                      <span className="ml-2 text-xs" style={{ color: "var(--dk-fg-2)" }}>
                        {item.sku}
                      </span>
                    </TableCell>
                    <TableCell>{item.current_stock}</TableCell>
                    <TableCell>{item.daily_burn.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.days_until_reorder !== null ? (
                        <Badge
                          variant={
                            item.days_until_reorder < 7
                              ? "destructive"
                              : item.days_until_reorder <= 14
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.days_until_reorder}d
                        </Badge>
                      ) : (
                        <span style={{ color: "var(--dk-fg-muted)" }}>—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
