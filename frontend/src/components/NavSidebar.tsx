"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Warehouse, Truck, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/api";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/movements", label: "Movements", icon: ArrowLeftRight },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle, badge: true },
];

export default function NavSidebar() {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    getDashboardStats()
      .then((s) => setLowStockCount(s.low_stock_count))
      .catch(() => {});
  }, []);

  return (
    <aside
      className="w-64 flex flex-col gap-6 p-6"
      style={{
        background: "var(--dk-fg)",
        color: "var(--dk-fg-inverse)",
        minHeight: "100vh",
      }}
    >
      <div>
        <p className="dk-eyebrow" style={{ color: "var(--dk-brand)", marginBottom: 4 }}>
          DClaw
        </p>
        <h1 className="text-lg font-semibold" style={{ color: "var(--dk-fg-inverse)" }}>
          Inventory
        </h1>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              style={{
                background: isActive ? "var(--dk-brand)" : "transparent",
                color: isActive ? "var(--dk-fg-inverse)" : "var(--dk-fg-muted)",
              }}
            >
              <span className="flex items-center gap-2">
                <Icon size={16} />
                {label}
              </span>
              {badge && lowStockCount > 0 && (
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--dk-danger)", color: "var(--dk-fg-inverse)" }}
                >
                  {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
