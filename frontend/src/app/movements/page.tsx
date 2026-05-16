"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { listAllMovements, exportMovementsUrl, type StockMovement, type MovementType } from "@/lib/api";

const MOVEMENT_TYPES: MovementType[] = ["restock", "sale", "adjustment", "transfer_in", "transfer_out"];

const movementBadgeStyle: Record<MovementType, React.CSSProperties> = {
  restock: { background: "var(--dk-success-bg)", color: "var(--dk-success)" },
  sale: { background: "var(--dk-info-bg)", color: "var(--dk-info)" },
  adjustment: { background: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  transfer_in: { background: "var(--dk-brand-soft)", color: "var(--dk-brand)" },
  transfer_out: { background: "var(--dk-bg-muted)", color: "var(--dk-fg-2)" },
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [typeFilter, setTypeFilter] = useState<MovementType | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAllMovements(200, typeFilter || undefined)
      .then(setMovements)
      .finally(() => setLoading(false));
  }, [typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="dk-h4">Stock Movement Log</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { window.location.href = exportMovementsUrl(); }}
        >
          <Download size={14} className="mr-1" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as MovementType | "")}
          className="w-48"
        >
          <option value="">All Types</option>
          {MOVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p style={{ color: "var(--dk-fg-2)" }}>Loading movements…</p>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs" style={{ color: "var(--dk-fg-2)" }}>
                    {new Date(m.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={movementBadgeStyle[m.movement_type]}
                    >
                      {m.movement_type.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs" style={{ color: "var(--dk-fg-2)" }}>
                    {m.product_id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-semibold"
                      style={{
                        color: m.quantity_delta >= 0 ? "var(--dk-success)" : "var(--dk-danger)",
                      }}
                    >
                      {m.quantity_delta >= 0 ? `+${m.quantity_delta}` : m.quantity_delta}
                    </span>
                  </TableCell>
                  <TableCell style={{ color: "var(--dk-fg-2)" }}>{m.note || "—"}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                    No movements found.
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
