import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Radio,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status";
import type { LiveSession } from "@/lib/db/quizzes";
import { formatDateTime, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

// Nu există sesiuni programate: o sesiune e deschisă (sala de așteptare), în joc sau încheiată.
const STATUS = {
  scheduled: { label: "Deschisă", icon: Clock, tone: "primary" },
  lobby: { label: "Se așteaptă jucătorii", icon: Clock, tone: "primary" },
  running: { label: "În joc", icon: CircleDot, tone: "danger" },
  ended: { label: "Încheiată", icon: CheckCircle2, tone: "success" },
} as const;

/** Sesiunile live: cele deschise sus (cu codul mare), apoi cele încheiate (cu câștigătorul). */
export function LiveSessionList({
  sessions,
  showClass,
  empty,
}: {
  sessions: LiveSession[];
  showClass?: boolean;
  empty?: { title: string; description: string; action?: React.ReactNode };
}) {
  if (sessions.length === 0)
    return (
      <EmptyState
        icon={Radio}
        title={empty?.title ?? "Nicio sesiune live"}
        description={
          empty?.description ??
          "Deschide o sesiune dintr-un quiz live: primești un cod unic, elevii intră cu el, iar cei rapizi și corecți urcă în clasament."
        }
        action={empty?.action}
      />
    );
  const open = sessions.filter((s) => s.status !== "ended");
  const ended = sessions.filter((s) => s.status === "ended");
  return (
    <ul className="stagger grid gap-2">
      {[...open, ...ended].map((s) => {
        const st = STATUS[s.status];
        const live = s.status !== "ended";
        const winner = s.results[0];
        return (
          <li key={s.id}>
            <Link
              href={`/mentor/live/${s.id}`}
              className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-10 shrink-0 hex place-items-center",
                  live
                    ? "bg-quiz-red text-white"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Radio className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-bold font-heading text-lg uppercase tracking-wide">
                  {s.title}
                </p>
                <p className="truncate text-muted-foreground text-sm">
                  {showClass ? `${s.className} · ` : ""}
                  {formatDateTime(s.endedAt ?? s.createdAt)}
                  {live
                    ? null
                    : ` · ${plural(s.results.length, "jucător", "jucători")}`}
                </p>
              </div>
              {live ? (
                <span className="font-extrabold font-heading text-2xl tabular-nums tracking-[0.2em]">
                  <span className="sr-only">Cod: </span>
                  {s.code}
                </span>
              ) : winner ? (
                <span className="inline-flex min-w-0 items-center gap-1.5 text-sm">
                  <Trophy
                    className="size-4 shrink-0 text-xp"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Primul loc: </span>
                  <span className="truncate font-medium">
                    {winner.student.displayName}
                  </span>
                </span>
              ) : null}
              <StatusBadge icon={st.icon} tone={st.tone}>
                {st.label}
              </StatusBadge>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
