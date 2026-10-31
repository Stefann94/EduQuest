import {
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { AssignmentTypeBadge, StatusBadge } from "@/components/common/status";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { placeholderParams } from "@/lib/db/core";
import { getMentorHomeworks } from "@/lib/db/homework";
import { formatDay, isPast, plural, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import { loadMentorClass } from "../load-class";

export const metadata: Metadata = { title: "Temele clasei" };

type Props = PageProps<"/mentor/clase/[id]/teme">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassAssignmentsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Assignments params={params} />
    </Suspense>
  );
}

async function Assignments({ params }: { params: Props["params"] }) {
  const { me, classRoom: c } = await loadMentorClass(params);
  const rows = (await getMentorHomeworks(me.id))
    .filter((h) => !h.archived)
    .flatMap((h) =>
      h.assignments.filter((a) => a.classId === c.id).map((a) => ({ h, a })),
    )
    .sort((x, y) =>
      (y.a.deadline ?? "9999").localeCompare(x.a.deadline ?? "9999"),
    );
  const waiting = rows.reduce((s, r) => s + r.a.waiting, 0);

  const create = (
    <Link href={`/mentor/clase/${c.id}/teme/nou`} className={buttonVariants()}>
      <Plus aria-hidden="true" /> Temă nouă
    </Link>
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl">Teme</h2>
          <p className="text-muted-foreground text-sm">
            {waiting > 0
              ? `${plural(waiting, "problemă trimisă așteaptă", "probleme trimise așteaptă")} evaluarea ta.`
              : "Nicio problemă nu așteaptă evaluarea."}
          </p>
        </div>
        {create}
      </div>

      {rows.length > 0 ? (
        <ul className="stagger grid gap-2">
          {rows.map(({ h, a }) => {
            const overdue = !!a.deadline && isPast(a.deadline);
            return (
              <li key={a.id}>
                <Link
                  href={`/mentor/teme/${h.id}?clasa=${c.id}`}
                  className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                >
                  <div className="min-w-0 flex-1 basis-60">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold font-heading text-lg uppercase leading-tight tracking-wide">
                        {h.title}
                      </p>
                      <AssignmentTypeBadge
                        type={h.required ? "required" : "optional"}
                      />
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
                      <span>
                        {plural(h.problems.length, "problemă", "probleme")}
                      </span>
                      <span aria-hidden="true">·</span>
                      {a.deadline ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          {overdue ? "Termen trecut: " : "Termen "}
                          {formatDay(a.deadline)} ({relativeDays(a.deadline)})
                        </span>
                      ) : (
                        <span>Fără termen</span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">
                    <span className="font-semibold">{a.complete}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      din {a.students} au trimis tot
                    </span>
                  </span>
                  {a.waiting > 0 ? (
                    <StatusBadge icon={Clock} tone="info">
                      {a.waiting} de evaluat
                    </StatusBadge>
                  ) : null}
                  <ChevronRight
                    className={cn(
                      "size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5",
                    )}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Nicio temă dată clasei"
          description="Creează o temă cu una sau mai multe probleme și dă-o acestei clase (sau mai multor clase deodată)."
          action={create}
        />
      )}
    </div>
  );
}
