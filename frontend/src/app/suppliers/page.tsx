"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { listSuppliers, type Supplier } from "@/lib/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSuppliers()
      .then(setSuppliers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "var(--dk-fg-2)" }}>Loading suppliers…</p>;

  return (
    <div className="space-y-6">
      <h2 className="dk-h4">Suppliers</h2>
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <Link href={`/suppliers/${supplier.id}`} className="font-medium" style={{ color: "var(--dk-brand)" }}>
                    {supplier.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail size={14} style={{ color: "var(--dk-fg-muted)" }} />
                    {supplier.email}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: "var(--dk-fg-muted)" }} />
                      {supplier.phone}
                    </div>
                  ) : (
                    <span style={{ color: "var(--dk-fg-muted)" }}>—</span>
                  )}
                </TableCell>
                <TableCell>
                  {supplier.address ? (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} style={{ color: "var(--dk-fg-muted)" }} />
                      {supplier.address}
                    </div>
                  ) : (
                    <span style={{ color: "var(--dk-fg-muted)" }}>—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
