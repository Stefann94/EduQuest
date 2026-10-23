import { CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  AssignmentTypeBadge,
  SubmissionStatusBadge,
} from "@/components/common/status";
import type { StudentAssignment } from "@/lib/data/queries";
import { formatDay, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Un rând de temă pentru elev: tip, titlu, clasă, termen și stare. */
export function AssignmentRow({
  assignment: a,
  showClass = true,
}: {
  assignment: StudentAssignment;
  showClass?: boolean;
}) {
  return (
    <Link
      href={`/teme/${a.id}`}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3 outline-none transition-colors hover:border-foreground/15 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <div className="min-w-0 flex-1 basis-60">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium group-hover:text-primary">{a.title}</p>
          <AssignmentTypeBadge type={a.type} />
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
          {showClass ? <span>{a.className}</span> : null}
          {showClass ? <span aria-hidden="true">·</span> : null}
          {a.deadline ? (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                a.overdue && "text-destructive",
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Termen {formatDay(a.deadline)} ({relativeDays(a.deadline)})
            </span>
          ) : (
            <span>Fără termen</span>
          )}
        </p>
      </div>
      <SubmissionStatusBadge status={a.submissionState} overdue={a.overdue} />
      <ChevronRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
