"use client";

import { useEffect, useState } from "react";
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

  if (loading) return <p className="text-slate-500">Loading suppliers...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Suppliers</h2>
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
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    {supplier.email}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {supplier.phone}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {supplier.address ? (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      {supplier.address}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-8">
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
