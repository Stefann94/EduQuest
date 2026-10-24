import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { AssignmentTypeBadge, StatusBadge } from "@/components/common/status";
import type { StudentHomework } from "@/lib/db/homework";
import { formatDay, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

// Dunga din stânga: galben = obligatorie, cyan = opțională, portocaliu = de refăcut.
function stripe(h: StudentHomework) {
  if (h.overdue) return "bg-destructive";
  if (h.problems.some((p) => p.state === "needs_changes")) return "bg-warning";
  if (h.complete) return "bg-success";
  return h.required ? "bg-xp" : "bg-cyan";
}

/** Starea temei pe scurt: gata, de refăcut, termen depășit sau „2 din 4”. */
export function HomeworkState({ homework: h }: { homework: StudentHomework }) {
  if (h.problems.some((p) => p.state === "needs_changes"))
    return (
      <StatusBadge icon={RotateCcw} tone="warning">
        De refăcut
      </StatusBadge>
    );
  if (h.complete)
    return (
      <StatusBadge icon={CheckCircle2} tone="success">
        Trimisă
      </StatusBadge>
    );
  if (h.overdue)
    return (
      <StatusBadge icon={CircleAlert} tone="danger">
        Termen depășit
      </StatusBadge>
    );
  return null;
}

/** Bara de progres „2 din 4 probleme”. */
export function HomeworkProgress({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={cn("grid gap-1", className)}>
      <p className="font-bold font-heading text-sm tabular-nums uppercase tracking-wide">
        {done} din {total}
        <span className="sr-only"> probleme trimise</span>
      </p>
      <div
        aria-hidden="true"
        className="slant h-2 w-24 overflow-hidden bg-secondary"
      >
        <div
          className={cn("h-full", done === total ? "bg-success" : "bg-xp")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Un rând de temă pentru elev, ca o „misiune”: tip, titlu, clasă, termen și progres. */
export function HomeworkRow({
  homework: h,
  showClass = true,
}: {
  homework: StudentHomework;
  showClass?: boolean;
}) {
  return (
    <Link
      href={`/teme/${h.id}`}
      className="group relative flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card py-3.5 pr-4 pl-6 outline-none transition-[translate,background-color] duration-300 ease-out hover:translate-x-1.5 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5 transition-[width] group-hover:w-2.5",
          stripe(h),
        )}
      />
      <div className="min-w-0 flex-1 basis-60">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold font-heading text-lg uppercase leading-tight tracking-wide">
            {h.title}
          </p>
          <AssignmentTypeBadge type={h.required ? "required" : "optional"} />
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
          {showClass ? <span>{h.className}</span> : null}
          {showClass ? <span aria-hidden="true">·</span> : null}
          {h.deadline ? (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                h.overdue && "text-destructive",
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Termen {formatDay(h.deadline)} ({relativeDays(h.deadline)})
            </span>
          ) : (
            <span>Fără termen</span>
          )}
        </p>
      </div>
      <HomeworkState homework={h} />
      <HomeworkProgress done={h.progress.done} total={h.progress.total} />
      <ChevronRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
