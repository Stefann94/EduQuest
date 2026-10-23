"use client";

import { History } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { XpBadge } from "@/components/common/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { XpSource } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { XpSourceLabel } from "./xp-source";

export type XpHistoryRow = {
  id: string;
  dateLabel: string;
  label: string;
  source: XpSource;
  classId: string | null;
  className?: string;
  amount: number;
};

/** Istoricul de XP, cu filtru pe clasă (starea filtrului rămâne în browser). */
export function XpHistoryTable({
  rows,
  classes,
}: {
  rows: XpHistoryRow[];
  classes: { id: string; name: string }[];
}) {
  const [classId, setClassId] = useState<string>("all");
  const visible =
    classId === "all" ? rows : rows.filter((r) => r.classId === classId);
  const total = visible.reduce((s, r) => s + r.amount, 0);

  const filters = [{ id: "all", name: "Toate clasele" }, ...classes];

  return (
    <div className="grid gap-4">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Filtrează după clasă</legend>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={classId === f.id}
            onClick={() => setClassId(f.id)}
            className={cn(
              "h-8 rounded-full border px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              classId === f.id
                ? "border-primary bg-primary-soft text-accent-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {f.name}
          </button>
        ))}
      </fieldset>

      {visible.length > 0 ? (
        <>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {visible.length === 1
              ? "1 activitate"
              : `${visible.length} activități`}{" "}
            · {total} XP
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Data</TableHead>
                  <TableHead>Activitate</TableHead>
                  <TableHead>Sursă</TableHead>
                  <TableHead>Clasa</TableHead>
                  <TableHead className="pr-4 text-right">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">
                      {r.dateLabel}
                    </TableCell>
                    <TableCell className="max-w-72 truncate font-medium">
                      {r.label}
                    </TableCell>
                    <TableCell>
                      <XpSourceLabel source={r.source} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.className ?? "—"}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <XpBadge amount={r.amount} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <EmptyState
          icon={History}
          title="Încă nu ai XP în această clasă"
          description="Participă la întâlniri, trimite teme și intră în quiz-urile live ca să strângi XP."
        />
      )}
    </div>
  );
}
