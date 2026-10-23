import {
  CalendarClock,
  Info,
  Link2,
  MessageSquareText,
  Paperclip,
  RotateCcw,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import {
  AssignmentTypeBadge,
  SubmissionStatusBadge,
  XpBadge,
} from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import { AttemptsTimeline } from "@/components/student-activity/attempts-timeline";
import { SubmissionPanel } from "@/components/student-activity/submission-panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  demoIds,
  getAssignmentForStudent,
  getViewer,
} from "@/lib/data/queries";
import { formatDate, formatDateTime, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/teme/[id]">;

export function generateStaticParams() {
  return demoIds.assignments();
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const me = await getViewer("student");
  const a = await getAssignmentForStudent(me.id, id);
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
  const me = await getViewer("student");
  const a = await getAssignmentForStudent(me.id, id);
  if (!a) notFound();

  const sub = a.submission;
  const needsChanges = a.submissionState === "needs_changes";
  const firstName = a.mentor.displayName.split(" ")[0];

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: `/clase/${a.classId}`, label: a.className }}
        title={a.title}
        description={a.summary}
        meta={
          <>
            <AssignmentTypeBadge type={a.type} />
            <SubmissionStatusBadge
              status={a.submissionState}
              overdue={a.overdue}
            />
          </>
        }
      />

      <dl className="grid gap-3 rounded-xl border bg-card p-5 shadow-xs sm:grid-cols-3">
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
              {a.overdue ? (
                <span className="block text-sm">
                  Termenul a trecut. Poți trimite în continuare, iar mentorul
                  vede data trimiterii.
                </span>
              ) : null}
            </span>
          ) : (
            "Fără termen"
          )}
        </MetaItem>
      </dl>

      {needsChanges && sub?.feedback ? (
        <section
          aria-labelledby="corecturi-title"
          className="rounded-xl border border-warning/40 bg-warning-soft p-5"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-warning">
              <RotateCcw className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="corecturi-title" className="font-semibold">
                Mentorul a cerut corecturi
              </h2>
              <p className="mt-1 text-sm">
                Citește feedback-ul de mai jos, îmbunătățește soluția și
                trimite-o din nou. {firstName} va revizui varianta nouă și poate
                acorda bonusul de calitate.
              </p>
              <a
                href="#trimitere"
                className="mt-2 inline-block font-medium text-sm underline-offset-4 hover:underline"
              >
                Mergi la formularul de trimitere
              </a>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Section title="Cerințe">
            <ol className="stagger grid list-decimal gap-2 pl-5 marker:text-muted-foreground">
              {a.instructions.map((step) => (
                <li key={step} className="pl-1 leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
            {a.attachments.length > 0 ? (
              <div className="mt-5 border-t pt-4">
                <h3 className="flex items-center gap-1.5 font-medium text-sm">
                  <Paperclip
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Atașamente
                </h3>
                <ul className="mt-2 grid gap-1.5">
                  {a.attachments.map((att) => (
                    <li key={att.url}>
                      <Link
                        href={att.url}
                        className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
                      >
                        <Link2 className="size-4" aria-hidden="true" />
                        {att.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          {sub?.feedback ? (
            <section
              aria-labelledby="feedback-title"
              className={cn(
                "rounded-xl border bg-card shadow-xs",
                needsChanges && "border-warning/40",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
                <h2
                  id="feedback-title"
                  className="flex items-center gap-2 font-semibold text-base"
                >
                  <MessageSquareText
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Feedback de la mentor
                </h2>
                {sub.bonusXp ? (
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    Bonus de calitate <XpBadge amount={sub.bonusXp} />
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    name={a.mentor.displayName}
                    avatar={a.mentor.avatar}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {a.mentor.displayName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(sub.feedback.at)}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-3 border-primary/30 border-l-2 pl-4 leading-relaxed">
                  {sub.feedback.text}
                </blockquote>
                <p className="mt-3 text-muted-foreground text-xs">
                  Feedback-ul este privat: îl vezi doar tu și mentorii clasei.
                </p>
              </div>
            </section>
          ) : null}

          <div id="trimitere" className="scroll-mt-24">
            <SubmissionPanel
              assignmentId={a.id}
              state={a.submissionState}
              allowResubmit={a.allowResubmit}
              hasSubmission={!!sub}
            />
          </div>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="flex items-center gap-2 font-semibold">
              <Star className="size-4 fill-xp text-xp" aria-hidden="true" />
              Cum primești XP
            </h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              +2 XP pentru o trimitere validă (o singură dată) și până la +
              {a.maxBonusXp} XP bonus de la mentor, în funcție de calitate.
              Temele nu primesc note.
            </p>
            {sub ? (
              <ul className="mt-4 grid gap-2 border-t pt-4 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span>Trimitere validă</span>
                  <XpBadge amount={sub.submissionXp} />
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>Bonus de calitate</span>
                  {sub.bonusXp ? (
                    <XpBadge amount={sub.bonusXp} />
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {a.submissionState === "reviewed"
                        ? "Neacordat"
                        : "După review"}
                    </span>
                  )}
                </li>
              </ul>
            ) : null}
          </section>

          {a.allowResubmit ? (
            <p className="flex gap-2 rounded-xl border bg-card p-4 text-muted-foreground text-sm shadow-xs">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Mentorul permite retrimiterea. Retrimiterile nu mai aduc +2 XP,
                dar mentorul poate actualiza bonusul după ce vede corecturile.
              </span>
            </p>
          ) : null}

          <Section title="Istoricul trimiterilor" bodyClassName="p-5">
            <AttemptsTimeline attempts={sub?.attempts ?? []} />
          </Section>

          <p className="text-muted-foreground text-xs">
            Publicată pe {formatDate(a.publishedAt)}
          </p>
        </div>
      </div>
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
    <div className="flex min-w-0 gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="mt-0.5 font-medium text-sm">{children}</dd>
      </div>
    </div>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    </div>
  );
}
