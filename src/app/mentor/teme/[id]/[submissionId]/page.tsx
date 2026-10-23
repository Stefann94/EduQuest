import { ExternalLink, FileCode2, Link2, RotateCcw, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeBlock } from "@/components/common/code-block";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { AssignmentTypeBadge, StatusBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import { ReviewForm } from "@/components/mentor-content/review-form";
import { DetailSkeleton } from "@/components/mentor-content/skeletons";
import {
  codeLanguageForClass,
  submissionParams,
} from "@/lib/data/mentor-content-queries";
import { getSubmissionForMentor, getViewer } from "@/lib/data/queries";
import type { SubmissionAttempt } from "@/lib/data/types";
import { formatDateTime, formatFileSize, isPast } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/mentor/teme/[id]/[submissionId]">;

export const metadata: Metadata = { title: "Revizuiește trimiterea" };

export function generateStaticParams() {
  return submissionParams();
}

export default function ReviewSubmissionPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id, submissionId } = await params;
  const me = await getViewer("mentor");
  const found = await getSubmissionForMentor(me.id, submissionId);
  if (!found || found.assignment.id !== id) notFound();

  const { submission: s, assignment: a, student, className } = found;
  const language = codeLanguageForClass(a.classId);
  // Cea mai nouă încercare prima.
  const attempts = s.attempts
    .map((attempt, i) => ({ attempt, number: i + 1 }))
    .reverse();
  const isResubmission = s.attempts.length > 1;
  const last = s.attempts.at(-1);
  const late = !!(
    a.deadline &&
    last &&
    new Date(last.at).getTime() > new Date(a.deadline).getTime()
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Trimiterea lui ${student.displayName}`}
        description={
          <>
            {a.title} · {className}
          </>
        }
        back={{ href: `/mentor/teme/${a.id}`, label: a.title }}
        meta={
          <>
            <span className="inline-flex items-center gap-2 font-medium text-sm">
              <UserAvatar
                name={student.displayName}
                avatar={student.avatar}
                size="xs"
              />
              {student.displayName}
            </span>
            <AssignmentTypeBadge type={a.type} />
            {isResubmission ? (
              <StatusBadge icon={RotateCcw} tone="info">
                Retrimitere · încercarea {s.attempts.length}
              </StatusBadge>
            ) : null}
            {late ? (
              <StatusBadge tone="warning">După termen</StatusBadge>
            ) : null}
            <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
              <Users className="size-4" aria-hidden="true" />
              {className}
            </span>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="grid min-w-0 gap-6">
          <Section
            title="Istoricul trimiterilor"
            description={
              isResubmission
                ? "Cea mai nouă încercare este prima. Compar-o cu cele anterioare."
                : "Ce a trimis elevul."
            }
          >
            <ol className="stagger grid gap-5">
              {attempts.map(({ attempt, number }, i) => (
                <li key={attempt.at}>
                  <Attempt
                    attempt={attempt}
                    number={number}
                    latest={i === 0}
                    language={language}
                  />
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Cerința temei">
            <p className="text-sm">{a.summary}</p>
            <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-muted-foreground text-sm marker:text-muted-foreground">
              {a.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {a.deadline ? (
              <p className="mt-3 text-muted-foreground text-xs">
                {isPast(a.deadline) ? "Termenul a fost" : "Termen"}:{" "}
                {formatDateTime(a.deadline)}
              </p>
            ) : null}
          </Section>
        </div>

        <Section
          title="Revizuire"
          description="Fără note: feedback scris și XP pentru efort și calitate."
          className="lg:sticky lg:top-20"
        >
          <ReviewForm
            submissionId={s.id}
            assignmentId={a.id}
            studentName={student.displayName}
            status={s.status}
            submissionXp={s.submissionXp}
            currentBonus={s.bonusXp}
            maxBonusXp={a.maxBonusXp}
            allowResubmit={a.allowResubmit}
            isResubmission={isResubmission}
            previousFeedback={s.feedback}
          />
        </Section>
      </div>
    </div>
  );
}

function Attempt({
  attempt,
  number,
  latest,
  language,
}: {
  attempt: SubmissionAttempt;
  number: number;
  latest: boolean;
  language: string;
}) {
  return (
    <article
      className={cn(
        "grid gap-3 rounded-lg border p-4",
        latest ? "border-primary/40 bg-primary-soft/40" : "bg-muted/20",
      )}
      aria-label={`Încercarea ${number}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-sm">
          Încercarea {number}
          <span className="font-normal text-muted-foreground">
            {" "}
            · {formatDateTime(attempt.at)}
          </span>
        </p>
        {latest ? (
          <StatusBadge tone="primary">Ultima trimitere</StatusBadge>
        ) : (
          <StatusBadge>Anterioară</StatusBadge>
        )}
      </header>

      {attempt.text ? (
        <CodeBlock code={attempt.text} language={language} />
      ) : null}

      {attempt.files.length > 0 ? (
        <div className="grid gap-2">
          <p className="font-medium text-muted-foreground text-xs">Fișiere</p>
          <ul className="grid gap-1.5">
            {attempt.files.map((f) => (
              <li
                key={f.name}
                className="flex items-center gap-2.5 rounded-md border bg-card px-3 py-2 text-sm"
              >
                <FileCode2
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate font-mono text-[13px]">
                  {f.name}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatFileSize(f.sizeKb)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">
            Demo: descărcarea fișierelor va funcționa după conectarea stocării
            securizate. Doar tu și elevul aveți acces la ele.
          </p>
        </div>
      ) : null}

      {attempt.link ? (
        <a
          href={attempt.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-primary text-sm hover:underline"
        >
          <Link2 className="size-4" aria-hidden="true" />
          {attempt.link}
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(se deschide într-o filă nouă)</span>
        </a>
      ) : null}

      {!attempt.text && attempt.files.length === 0 && !attempt.link ? (
        <p className="text-muted-foreground text-sm">
          Încercarea nu conține text, fișiere sau linkuri.
        </p>
      ) : null}
    </article>
  );
}
