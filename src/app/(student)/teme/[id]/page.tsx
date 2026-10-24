import { CalendarClock, Sparkles, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { AssignmentTypeBadge, XpBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import {
  HomeworkProgress,
  HomeworkState,
} from "@/components/homework/homework-row";
import {
  HomeworkWorkspace,
  type WorkspaceProblem,
} from "@/components/homework/homework-workspace";
import { RichText } from "@/components/learning/content-blocks";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth";
import { placeholderParams } from "@/lib/db/core";
import { getStudentAssignment, getStudentHomework } from "@/lib/db/homework";
import { formatDateTime, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/teme/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const me = await requireUser("student");
  const a = await getStudentAssignment(me.id, id);
  return { title: a?.title ?? "Temă" };
}

export default function AssignmentPage({ params }: Props) {
  return (
    <Suspense fallback={<AssignmentSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await requireUser("student");
  const [a, list] = await Promise.all([
    getStudentAssignment(me.id, id),
    getStudentHomework(me.id),
  ]);
  if (!a) notFound();
  const summary = list.find((h) => h.id === a.id);

  const problems: WorkspaceProblem[] = a.problems.map((p) => ({
    id: p.id,
    title: p.title,
    required: p.required,
    language: p.language,
    starter: p.starter,
    state: p.state,
    feedback: p.feedback,
    attempts: p.attempts,
    statement: p.statement.split(/\n{2,}/).map((para) => (
      <p key={para}>
        <RichText text={para} />
      </p>
    )),
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/teme", label: "Teme" }}
        title={a.title}
        description={a.description || undefined}
        meta={
          <>
            <AssignmentTypeBadge type={a.required ? "required" : "optional"} />
            {summary ? <HomeworkState homework={summary} /> : null}
          </>
        }
      />

      <dl className="grid cut gap-4 bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetaItem icon={Users} label="Clasa">
          <Link
            href={`/clase/${a.classId}`}
            className="hover:text-primary hover:underline"
          >
            {a.className}
          </Link>
        </MetaItem>
        <MetaItem icon={UserRound} label="Mentor">
          <span className="flex items-center gap-2">
            <UserAvatar
              name={a.mentor.displayName}
              avatar={a.mentor.avatar}
              size="xs"
            />
            {a.mentor.displayName}
          </span>
        </MetaItem>
        <MetaItem icon={CalendarClock} label="Termen">
          {a.deadline ? (
            <span className={cn(a.overdue && "text-destructive")}>
              {formatDateTime(a.deadline)}{" "}
              <span
                className={cn(
                  "text-muted-foreground",
                  a.overdue && "text-destructive",
                )}
              >
                ({relativeDays(a.deadline)})
              </span>
            </span>
          ) : (
            "Fără termen"
          )}
        </MetaItem>
        <MetaItem icon={Sparkles} label="Progres și XP">
          <span className="flex flex-wrap items-center gap-3">
            <HomeworkProgress done={a.progress.done} total={a.progress.total} />
            {a.review ? <XpBadge amount={a.review.bonusXp} /> : null}
          </span>
        </MetaItem>
      </dl>

      {a.review?.note ? (
        <div className="cut-sm bg-xp-soft px-4 py-3 text-sm">
          <p className="font-semibold">
            Bonus de calitate: {a.review.bonusXp} din {a.maxBonusXp} XP
          </p>
          <p className="mt-1 whitespace-pre-line">{a.review.note}</p>
        </div>
      ) : null}

      <HomeworkWorkspace
        assignmentId={a.id}
        problems={problems}
        canSubmit={!a.classArchived}
        deadlinePassed={a.overdue}
      />
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm">{children}</dd>
      </div>
    </div>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-24" />
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
