import { Archive } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { AssignmentTypeBadge, StatusBadge } from "@/components/common/status";
import { HomeworkActions } from "@/components/homework/homework-actions";
import { HomeworkAssignments } from "@/components/homework/homework-assignments";
import { HomeworkForm } from "@/components/homework/homework-form";
import { ProgressTable } from "@/components/homework/progress-table";
import { localInputValue } from "@/components/mentor-classes/dates";
import { DetailSkeleton } from "@/components/mentor-content/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { placeholderParams } from "@/lib/db/core";
import { getAssignmentProgress, getHomeworkForMentor } from "@/lib/db/homework";
import { formatDateTime, relativeDays } from "@/lib/format";

export const metadata: Metadata = { title: "Temă" };

type Props = PageProps<"/mentor/teme/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function MentorHomeworkDetailPage({
  params,
  searchParams,
}: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

async function Content({
  params,
  searchParams,
}: Pick<Props, "params" | "searchParams">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const me = await requireUser("mentor");
  const [h, classes] = await Promise.all([
    getHomeworkForMentor(me.id, id),
    getMentorClasses(me.id),
  ]);
  if (!h) notFound();
  const progress = (
    await Promise.all(
      h.assignments.map((a) => getAssignmentProgress(me.id, a.id)),
    )
  ).filter((p) => p !== undefined);
  // Notificarea despre o trimitere deschide clasa respectivă întâi.
  const focus = typeof query.clasa === "string" ? query.clasa : undefined;
  progress.sort(
    (a, b) => Number(b.classId === focus) - Number(a.classId === focus),
  );
  const tab = query.nou
    ? "classes"
    : h.assignments.length === 0
      ? "classes"
      : "progress";
  // Termenul propus pentru o clasă nouă: peste o săptămână, la 22:00.
  const nextWeek = localInputValue(
    new Date(Date.now() + WEEK).toISOString(),
  ).slice(0, 10);

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/teme", label: "Teme" }}
        title={h.title}
        description={h.description || undefined}
        meta={
          <>
            <AssignmentTypeBadge type={h.required ? "required" : "optional"} />
            {h.archived ? (
              <StatusBadge icon={Archive} tone="neutral">
                Arhivată
              </StatusBadge>
            ) : null}
          </>
        }
        actions={
          <HomeworkActions
            homeworkId={h.id}
            title={h.title}
            archived={h.archived}
          />
        }
      />

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="progress">
            Progres ({h.assignments.length})
          </TabsTrigger>
          <TabsTrigger value="classes">Clase și termene</TabsTrigger>
          <TabsTrigger value="edit">
            Problemele temei ({h.problems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4 grid gap-6">
          {progress.length === 0 ? (
            <p className="cut-sm bg-card px-4 py-6 text-center text-muted-foreground text-sm">
              Tema nu e dată încă niciunei clase. Dă-o din „Clase și termene”.
            </p>
          ) : (
            progress.map((p) => (
              <Section
                key={p.id}
                title={p.className}
                description={
                  p.deadline
                    ? `Termen ${formatDateTime(p.deadline)} (${relativeDays(p.deadline)})`
                    : "Fără termen"
                }
                bodyClassName="p-3"
              >
                <ProgressTable
                  problems={p.problems}
                  rows={p.rows}
                  reviewHref={(studentId) =>
                    `/mentor/teme/${h.id}/${p.id}/${studentId}`
                  }
                />
              </Section>
            ))
          )}
        </TabsContent>

        <TabsContent value="classes" className="mt-4">
          <HomeworkAssignments
            homeworkId={h.id}
            assignments={h.assignments.map((a) => ({
              id: a.id,
              classId: a.classId,
              className: a.className,
              deadlineLocal: a.deadline ? localInputValue(a.deadline) : "",
              students: a.students,
              complete: a.complete,
              waiting: a.waiting,
            }))}
            classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
            defaultDeadline={`${nextWeek}T22:00`}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-4 max-w-4xl">
          <HomeworkForm
            draft={{
              id: h.id,
              title: h.title,
              description: h.description,
              required: h.required,
              problems: h.problems.map((p) => ({
                id: p.id,
                title: p.title,
                statement: p.statement,
                language: ([
                  "python",
                  "html",
                  "css",
                  "javascript",
                  "java",
                  "text",
                ].includes(p.language)
                  ? p.language
                  : "text") as "python",
                starter: p.starter ?? "",
                required: p.required,
              })),
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
