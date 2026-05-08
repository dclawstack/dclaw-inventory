import type { Metadata } from "next";
import Link from "next/link";
import { Package, Warehouse, Truck, LayoutDashboard } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw Inventory",
  description: "DClaw Inventory Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-6">
            <h1 className="text-xl font-bold">DClaw Inventory</h1>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 transition">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link href="/products" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 transition">
                <Package size={18} />
                Products
              </Link>
              <Link href="/warehouses" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 transition">
                <Warehouse size={18} />
                Warehouses
              </Link>
              <Link href="/suppliers" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 transition">
                <Truck size={18} />
                Suppliers
              </Link>
            </nav>
          </aside>
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
