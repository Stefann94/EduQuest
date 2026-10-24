import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  PROBLEM_STATUS,
  StatusBadge,
  XpBadge,
} from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import type {
  HomeworkProblem,
  ProblemState,
  StudentProgressRow,
} from "@/lib/db/homework";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const CELL: Record<ProblemState, string> = {
  not_started: "bg-muted text-muted-foreground",
  submitted: "bg-info-soft text-info",
  accepted: "bg-success-soft text-success",
  needs_changes: "bg-warning-soft text-warning",
};

/** Elevi × probleme: starea fiecărei probleme, cu legătură spre evaluarea elevului. */
export function ProgressTable({
  problems,
  rows,
  reviewHref,
}: {
  problems: HomeworkProblem[];
  rows: StudentProgressRow[];
  reviewHref: (studentId: string) => string;
}) {
  if (rows.length === 0)
    return (
      <p className="text-muted-foreground text-sm">Clasa nu are încă elevi.</p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-separate border-spacing-y-1 text-sm">
        <caption className="sr-only">
          Starea fiecărei probleme pentru fiecare elev
        </caption>
        <thead>
          <tr className="text-left">
            <th
              scope="col"
              className="px-3 py-2 font-bold font-heading uppercase tracking-wide"
            >
              Elev
            </th>
            {problems.map((p, i) => (
              <th
                key={p.id}
                scope="col"
                className="px-2 py-2 text-center font-medium"
                title={p.title}
              >
                P{i + 1}
                {p.required ? null : (
                  <span className="block font-normal text-muted-foreground text-xs">
                    opț.
                  </span>
                )}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 font-medium">
              Progres
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Bonus
            </th>
            <th scope="col" className="sr-only">
              Evaluare
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.student.id} className="bg-card">
              <th scope="row" className="px-3 py-2 text-left font-normal">
                <span className="flex items-center gap-2">
                  <UserAvatar
                    name={r.student.displayName}
                    avatar={r.student.avatar}
                    size="sm"
                  />
                  <span>
                    <span className="block font-medium">
                      {r.student.displayName}
                    </span>
                    {r.lastAt ? (
                      <span className="block text-muted-foreground text-xs">
                        ultima trimitere {formatDay(r.lastAt)}
                        {r.late ? " · după termen" : ""}
                      </span>
                    ) : null}
                  </span>
                </span>
              </th>
              {problems.map((p) => {
                const s = r.problems[p.id];
                return (
                  <td key={p.id} className="px-2 py-2 text-center">
                    <span
                      className={cn(
                        "inline-grid size-8 place-items-center",
                        CELL[s],
                      )}
                      title={`${p.title}: ${PROBLEM_STATUS[s].label}`}
                    >
                      {(() => {
                        const Icon = PROBLEM_STATUS[s].icon;
                        return <Icon className="size-4" aria-hidden="true" />;
                      })()}
                      <span className="sr-only">{PROBLEM_STATUS[s].label}</span>
                    </span>
                  </td>
                );
              })}
              <td className="px-3 py-2 tabular-nums">
                {r.done === r.total ? (
                  <StatusBadge tone="success">
                    {r.done} din {r.total}
                  </StatusBadge>
                ) : (
                  <span>
                    {r.done} din {r.total}
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                {r.bonusXp !== null ? <XpBadge amount={r.bonusXp} /> : "–"}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={reviewHref(r.student.id)}
                  className="inline-flex items-center gap-1 font-bold font-heading text-primary text-sm uppercase tracking-wide hover:underline"
                >
                  {r.lastAt ? "Evaluează" : "Vezi"}
                  <span className="sr-only">
                    {" "}
                    lucrarea lui {r.student.displayName}
                  </span>
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
