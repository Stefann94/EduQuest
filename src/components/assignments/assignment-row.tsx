import { CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  AssignmentTypeBadge,
  SubmissionStatusBadge,
} from "@/components/common/status";
import type { StudentAssignment } from "@/lib/data/queries";
import { formatDay, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

// Dunga din stânga: galben = obligatorie, cyan = opțională, portocaliu = de corectat.
function stripe(a: StudentAssignment) {
  if (a.overdue) return "bg-destructive";
  if (a.submissionState === "needs_changes") return "bg-warning";
  return a.type === "required" ? "bg-xp" : "bg-cyan";
}

/** Un rând de temă pentru elev, ca o „misiune”: tip, titlu, clasă, termen și stare. */
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
      className="group relative flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card py-3.5 pr-4 pl-6 outline-none transition-[translate,background-color] duration-300 ease-out hover:translate-x-1.5 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5 transition-[width] group-hover:w-2.5",
          stripe(a),
        )}
      />
      <div className="min-w-0 flex-1 basis-60">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold font-heading text-lg uppercase leading-tight tracking-wide">
            {a.title}
          </p>
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
