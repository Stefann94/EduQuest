"use client";

import { ChevronRight, Inbox, SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import {
  SUBMISSION_STATUS,
  SubmissionStatusBadge,
  XpBadge,
} from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AvatarId, SubmissionStatus } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";
import { FilterBar, FilterSelect } from "./filter-select";

export type SubmissionRow = {
  student: { id: string; name: string; avatar: AvatarId };
  state: SubmissionStatus;
  submissionId?: string;
  lastAt?: string;
  attempts: number;
  /** XP acordat până acum (trimitere + bonus); lipsă dacă nu a trimis. */
  xp?: number;
  bonusPending: boolean;
};

const ORDER: SubmissionStatus[] = [
  "submitted",
  "needs_changes",
  "reviewed",
  "not_started",
];

export function SubmissionsTable({
  assignmentId,
  rows,
}: {
  assignmentId: string;
  rows: SubmissionRow[];
}) {
  const [filter, setFilter] = useState("all");
  const sorted = [...rows].sort(
    (a, b) =>
      ORDER.indexOf(a.state) - ORDER.indexOf(b.state) ||
      a.student.name.localeCompare(b.student.name),
  );
  const shown = sorted.filter((r) => filter === "all" || r.state === filter);

  if (rows.length === 0)
    return (
      <EmptyState
        icon={Inbox}
        title="Clasa nu are încă elevi"
        description="Trimiterile apar aici după ce elevii se alătură clasei."
      />
    );

  return (
    <div className="grid gap-4">
      <FilterBar summary={`${shown.length} din ${rows.length} elevi`}>
        <FilterSelect
          label="Filtrează după stare"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Toți elevii" },
            ...ORDER.map((s) => ({
              value: s,
              label: SUBMISSION_STATUS[s].label,
            })),
          ]}
        />
      </FilterBar>

      {shown.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Niciun elev în această stare"
          description="Alege altă stare ca să vezi restul clasei."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-4">Elev</TableHead>
                <TableHead>Stare</TableHead>
                <TableHead>Ultima trimitere</TableHead>
                <TableHead className="text-right">Încercări</TableHead>
                <TableHead>XP acordat</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Acțiuni</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="stagger">
              {shown.map((r) => (
                <TableRow key={r.student.id}>
                  <TableCell className="py-2.5 pl-4">
                    <span className="flex items-center gap-2.5">
                      <UserAvatar
                        name={r.student.name}
                        avatar={r.student.avatar}
                      />
                      <span className="font-medium">{r.student.name}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={r.state} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.lastAt ? formatDateTime(r.lastAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.attempts > 0 ? r.attempts : "—"}
                  </TableCell>
                  <TableCell>
                    {r.xp !== undefined ? (
                      <span className="flex items-center gap-2">
                        <XpBadge amount={r.xp} />
                        {r.bonusPending ? (
                          <span className="text-muted-foreground text-xs">
                            bonus după revizuire
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {r.submissionId ? (
                      <Link
                        href={`/mentor/teme/${assignmentId}/${r.submissionId}`}
                        className={buttonVariants({
                          variant:
                            r.state === "submitted" ? "default" : "outline",
                          size: "sm",
                        })}
                        aria-label={`${r.state === "submitted" ? "Revizuiește" : "Vezi"} trimiterea lui ${r.student.name}`}
                      >
                        {r.state === "submitted" ? "Revizuiește" : "Vezi"}
                        <ChevronRight aria-hidden="true" />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Nu a trimis încă
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
