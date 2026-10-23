import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock,
  ExternalLink,
  Link2,
  RotateCcw,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import {
  AssignmentTypeBadge,
  PublicationBadge,
} from "@/components/common/status";
import { Callout } from "@/components/mentor-content/callout";
import { DetailSkeleton } from "@/components/mentor-content/skeletons";
import {
  type SubmissionRow,
  SubmissionsTable,
} from "@/components/mentor-content/submissions-table";
import { demoIds, getAssignmentForMentor, getViewer } from "@/lib/data/queries";
import { formatDateTime, isPast, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/mentor/teme/[id]">;

export const metadata: Metadata = { title: "Temă" };

export function generateStaticParams() {
  return demoIds.assignments();
}

export default function MentorAssignmentPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const a = await getAssignmentForMentor(me.id, id);
  if (!a) notFound();

  const rows: SubmissionRow[] = a.rows.map((r) => {
    const s = r.submission;
    return {
      student: {
        id: r.student.id,
        name: r.student.displayName,
        avatar: r.student.avatar,
      },
      state: r.state,
      submissionId: s?.id,
      lastAt: s?.attempts.at(-1)?.at,
      attempts: s?.attempts.length ?? 0,
      xp: s ? s.submissionXp + (s.bonusXp ?? 0) : undefined,
      bonusPending: !!s && s.status !== "reviewed" && s.bonusXp === undefined,
    };
  });
  const count = (state: SubmissionRow["state"]) =>
    rows.filter((r) => r.state === state).length;
  const stats = [
    {
      label: "De revizuit",
      value: count("submitted"),
      icon: Clock,
      highlight: true,
    },
    { label: "Revizuite", value: count("reviewed"), icon: CheckCircle2 },
    {
      label: "Corecturi cerute",
      value: count("needs_changes"),
      icon: RotateCcw,
    },
    { label: "Neîncepute", value: count("not_started"), icon: CircleDashed },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title={a.title}
        description={a.summary}
        back={{ href: "/mentor/teme", label: "Teme" }}
        meta={
          <>
            <AssignmentTypeBadge type={a.type} />
            <PublicationBadge status={a.status} />
            <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
              <Users className="size-4" aria-hidden="true" />
              {a.className}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
              <CalendarClock className="size-4" aria-hidden="true" />
              {a.deadline
                ? `${isPast(a.deadline) ? "Termen trecut" : "Termen"}: ${formatDateTime(a.deadline)} (${relativeDays(a.deadline)})`
                : "Fără termen"}
            </span>
          </>
        }
      />

      {a.status === "draft" ? (
        <Callout tone="warning">
          Tema este o ciornă: elevii nu o văd și nu primesc notificări până nu o
          publici.
        </Callout>
      ) : null}

      <ul className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li
            key={s.label}
            className={cn(
              "rounded-xl border bg-card p-4 shadow-xs",
              s.highlight && s.value > 0 && "border-info/40 bg-info-soft",
            )}
          >
            <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <s.icon className="size-4" aria-hidden="true" />
              {s.label}
            </p>
            <p className="mt-1 font-semibold text-2xl tabular-nums">
              {s.value}
            </p>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <Section
          title="Trimiterile elevilor"
          description="Deschide o trimitere ca să lași feedback și să acorzi bonusul de calitate."
        >
          <SubmissionsTable assignmentId={a.id} rows={rows} />
        </Section>

        <div className="grid gap-6">
          <Section title="Instrucțiuni">
            <ol className="grid list-decimal gap-2 pl-5 text-sm marker:text-muted-foreground">
              {a.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {a.attachments.length > 0 ? (
              <div className="mt-4 grid gap-2 border-t pt-4">
                <p className="font-medium text-sm">Linkuri de referință</p>
                <ul className="grid gap-1.5">
                  {a.attachments.map((l) => {
                    const external = /^https?:\/\//.test(l.url);
                    // Materialele din platformă se deschid în zona mentorului.
                    const href = l.url.replace(
                      /^\/invatare\/materiale\//,
                      "/mentor/materiale/",
                    );
                    return (
                      <li key={l.url}>
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
                          {...(external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {external ? (
                            <ExternalLink
                              className="size-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <Link2 className="size-4" aria-hidden="true" />
                          )}
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </Section>
          <Section title="Reguli">
            <ul className="grid gap-2 text-muted-foreground text-sm">
              <li>
                +2 XP pentru o trimitere validă, o singură dată. Retrimiterile
                nu adaugă alte XP pentru trimitere.
              </li>
              <li>
                Bonus de calitate între 0 și {a.maxBonusXp} XP, acordat de tine
                la revizuire.
              </li>
              <li>
                {a.allowResubmit
                  ? "Elevii pot retrimite tema după ce le ceri corecturi."
                  : "Tema nu permite retrimiteri."}
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
