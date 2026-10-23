import {
  CalendarClock,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  Clock,
  Plus,
  RotateCcw,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import {
  AssignmentTypeBadge,
  PublicationBadge,
} from "@/components/common/status";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  demoIds,
  getClass,
  getMentorAssignments,
  getViewer,
} from "@/lib/data/queries";
import { formatDay, isPast, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Temele clasei" };

type Props = PageProps<"/mentor/clase/[id]/teme">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassAssignmentsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Assignments params={params} />
    </Suspense>
  );
}

async function Assignments({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();
  const assignments = (await getMentorAssignments(me.id))
    .filter((a) => a.classId === c.id)
    .sort((a, b) => (b.deadline ?? "").localeCompare(a.deadline ?? ""));
  const toReview = assignments.reduce((s, a) => s + a.counts.submitted, 0);

  const create = (
    <Link href="/mentor/teme/nou" className={buttonVariants()}>
      <Plus aria-hidden="true" /> Creează temă
    </Link>
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Teme</h2>
          <p className="text-muted-foreground text-sm">
            {toReview > 0
              ? `${toReview === 1 ? "O trimitere așteaptă" : `${toReview} trimiteri așteaptă`} feedback-ul tău.`
              : "Nicio trimitere nu așteaptă review."}
          </p>
        </div>
        {create}
      </div>

      {assignments.length > 0 ? (
        <ul className="stagger grid gap-3">
          {assignments.map((a) => {
            const overdue =
              a.status === "published" && !!a.deadline && isPast(a.deadline);
            return (
              <li key={a.id}>
                <Link
                  href={`/mentor/teme/${a.id}`}
                  className="group block rounded-xl border bg-card p-4 shadow-xs outline-none transition-[box-shadow,border-color] hover:border-foreground/15 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium group-hover:text-primary">
                      {a.title}
                    </p>
                    <AssignmentTypeBadge type={a.type} />
                    {a.status === "draft" ? (
                      <PublicationBadge status="draft" />
                    ) : null}
                    <ChevronRight
                      className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                    <CalendarClock className="size-3.5" aria-hidden="true" />
                    {a.deadline
                      ? `Termen ${formatDay(a.deadline)} (${overdue ? "încheiat" : relativeDays(a.deadline)})`
                      : "Fără termen"}
                  </p>
                  {a.status === "published" ? (
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t pt-3 text-sm">
                      <Count
                        icon={Clock}
                        label="de revizuit"
                        value={a.counts.submitted}
                        highlight
                      />
                      <Count
                        icon={ClipboardList}
                        label="revizuite"
                        value={a.counts.reviewed}
                      />
                      <Count
                        icon={RotateCcw}
                        label="cu corecturi cerute"
                        value={a.counts.needsChanges}
                      />
                      <Count
                        icon={CircleDashed}
                        label="netrimise"
                        value={a.counts.notStarted}
                      />
                    </ul>
                  ) : (
                    <p className="mt-3 border-t pt-3 text-muted-foreground text-sm">
                      Ciornă: elevii nu o văd până nu o publici.
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Nicio temă în această clasă"
          description="Creează o temă obligatorie sau un exercițiu opțional pentru elevi."
          action={create}
        />
      )}
    </div>
  );
}

function Count({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5",
        highlight && value > 0
          ? "font-medium text-primary"
          : "text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span>
        <span className="tabular-nums">{value}</span> {label}
      </span>
    </li>
  );
}
