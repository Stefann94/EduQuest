import {
  Archive,
  ChevronRight,
  ClipboardList,
  Clock,
  Inbox,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { AssignmentTypeBadge, StatusBadge } from "@/components/common/status";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { SubmissionRow } from "@/components/mentor-classes/submission-row";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import {
  getMentorHomeworks,
  getReviewQueue,
  type MentorHomework,
} from "@/lib/db/homework";
import { formatDay, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Teme" };

export default function MentorHomeworkPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Teme"
        description="Temele tale sunt refolosibile: au una sau mai multe probleme și le poți da mai multor clase, fiecare cu termenul ei."
        actions={
          <Link
            href="/mentor/teme/nou"
            className={buttonVariants({ variant: "cta" })}
          >
            <Plus aria-hidden="true" /> Temă nouă
          </Link>
        }
      />
      <Suspense fallback={<SectionSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const me = await requireUser("mentor");
  const [homeworks, queue] = await Promise.all([
    getMentorHomeworks(me.id),
    getReviewQueue(me.id),
  ]);
  const active = homeworks.filter((h) => !h.archived);
  const archived = homeworks.filter((h) => h.archived);

  return (
    <div className="grid gap-6">
      <Section
        title="De evaluat"
        description={
          queue.length > 0
            ? `${plural(queue.length, "problemă trimisă", "probleme trimise")}, cele mai vechi primele`
            : undefined
        }
        bodyClassName="p-2"
      >
        {queue.length > 0 ? (
          <ul className="stagger">
            {queue.slice(0, 8).map((r) => (
              <li key={r.submissionId}>
                <SubmissionRow
                  href={`/mentor/teme/${r.homeworkId}/${r.assignmentId}/${r.student.id}`}
                  student={r.student}
                  title={r.title}
                  problemTitle={r.problemTitle}
                  className={r.className}
                  at={r.at}
                  isResubmission={r.isResubmission}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Nimic de evaluat"
            description="Când elevii trimit probleme, le găsești aici, în ordinea în care au sosit."
            className="border-0"
          />
        )}
      </Section>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">
            Arhivate ({archived.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {active.length > 0 ? (
            <HomeworkList items={active} />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Nicio temă activă"
              description="Creează o temă cu una sau mai multe probleme și dă-o claselor tale."
            />
          )}
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          {archived.length > 0 ? (
            <HomeworkList items={archived} />
          ) : (
            <EmptyState
              icon={Archive}
              title="Nicio temă arhivată"
              description="Temele arhivate dispar din panou, dar elevii le văd în continuare în arhiva lor."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HomeworkList({ items }: { items: MentorHomework[] }) {
  return (
    <ul className="stagger grid gap-3 lg:grid-cols-2">
      {items.map((h) => {
        const waiting = h.assignments.reduce((s, a) => s + a.waiting, 0);
        return (
          <li key={h.id}>
            <Link
              href={`/mentor/teme/${h.id}`}
              className="group grid h-full cut gap-3 bg-card p-5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl leading-tight">{h.title}</h2>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {plural(h.problems.length, "problemă", "probleme")}
                    {h.problems.some((p) => !p.required)
                      ? ` (${h.problems.filter((p) => !p.required).length} opționale)`
                      : ""}
                  </p>
                </div>
                <ChevronRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <AssignmentTypeBadge
                  type={h.required ? "required" : "optional"}
                />
                {waiting > 0 ? (
                  <StatusBadge icon={Clock} tone="info">
                    {waiting} de evaluat
                  </StatusBadge>
                ) : null}
              </div>
              {h.assignments.length > 0 ? (
                <ul className="grid gap-1 border-t pt-3 text-sm">
                  {h.assignments.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="font-medium">{a.className}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {a.deadline ? `termen ${formatDay(a.deadline)} · ` : ""}
                        {a.complete}/{a.students} au trimis
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-t pt-3 text-muted-foreground text-sm">
                  Nedată încă niciunei clase.
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
