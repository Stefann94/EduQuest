import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status";
import type { LiveSession } from "@/lib/db/quizzes";
import { formatDateTime, plural } from "@/lib/format";

const STATUS = {
  scheduled: { label: "Deschisă", icon: Clock, tone: "primary" },
  lobby: { label: "Se așteaptă jucătorii", icon: Clock, tone: "primary" },
  running: { label: "În desfășurare", icon: CircleDot, tone: "primary" },
  ended: { label: "Încheiată", icon: CheckCircle2, tone: "success" },
} as const;

/** Sesiunile live: cele deschise sus (cu codul mare), apoi cele încheiate. */
export function LiveSessionList({
  sessions,
  showClass,
}: {
  sessions: LiveSession[];
  showClass?: boolean;
}) {
  if (sessions.length === 0)
    return (
      <EmptyState
        icon={Radio}
        title="Nicio sesiune live"
        description="Pornește un quiz live în timpul întâlnirii: baza de date generează un cod unic, elevii intră cu el, iar primii primesc mai mult XP."
      />
    );
  const open = sessions.filter((s) => s.status !== "ended");
  const ended = sessions.filter((s) => s.status === "ended");
  return (
    <ul className="stagger grid gap-2">
      {[...open, ...ended].map((s) => {
        const st = STATUS[s.status];
        return (
          <li key={s.id}>
            <Link
              href={`/mentor/live/${s.id}`}
              className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 hex place-items-center bg-secondary text-muted-foreground"
              >
                <Radio className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-medium">{s.title}</p>
                <p className="truncate text-muted-foreground text-sm">
                  {showClass ? `${s.className} · ` : ""}
                  {formatDateTime(s.createdAt)}
                  {s.status === "ended"
                    ? ` · ${plural(s.results.length, "participant", "participanți")}`
                    : null}
                </p>
              </div>
              {s.status !== "ended" ? (
                <span className="font-extrabold font-heading text-2xl tabular-nums tracking-[0.2em]">
                  <span className="sr-only">Cod: </span>
                  {s.code}
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
