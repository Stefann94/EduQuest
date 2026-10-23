import {
  CalendarDays,
  FileQuestion,
  Lock,
  Mail,
  MessageSquareText,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApplicationReview } from "@/components/admin/application-review";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { ApplicationStatusBadge } from "@/components/common/status";
import { Skeleton } from "@/components/ui/skeleton";
import { demoIds, getMentorApplication, getViewer } from "@/lib/data/queries";
import type { MentorApplication } from "@/lib/data/types";
import { formatDate, formatTime, relativeDays } from "@/lib/format";

type Props = PageProps<"/admin/aplicatii/[id]">;

export const metadata: Metadata = { title: "Verificare aplicație" };

export function generateStaticParams() {
  return demoIds.applications();
}

export default function ApplicationReviewPage({ params }: Props) {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  await getViewer("admin");
  const application = await getMentorApplication(id);
  if (!application) notFound();
  const a = application;
  const open = a.status === "pending" || a.status === "needs_info";

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/admin/aplicatii", label: "Aplicații mentori" }}
        title={a.fullName}
        description="Aplicație pentru un cont de mentor"
        meta={
          <>
            <ApplicationStatusBadge status={a.status} />
            <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="size-4" aria-hidden="true" />
              Trimisă pe {formatDate(a.submittedAt)}, ora{" "}
              {formatTime(a.submittedAt)} ({relativeDays(a.submittedAt)})
            </span>
          </>
        }
      />

      <p className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning-soft px-4 py-3 text-sm">
        <Lock
          className="mt-0.5 size-4 shrink-0 text-warning"
          aria-hidden="true"
        />
        <span>
          <span className="font-medium">Date confidențiale.</span> Informațiile
          din aplicație sunt vizibile doar administratorilor și se folosesc
          numai pentru verificarea mentorului. Nu le copia și nu le trimite în
          afara platformei.
        </span>
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Section title="Date de contact">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail icon={Mail} label="Email">
                <a
                  href={`mailto:${a.email}`}
                  className="break-all text-primary hover:underline"
                >
                  {a.email}
                </a>
              </Detail>
              <Detail icon={Phone} label="Telefon">
                <a
                  href={`tel:${a.phone.replace(/\s/g, "")}`}
                  className="hover:underline"
                >
                  {a.phone}
                </a>
              </Detail>
            </dl>
          </Section>
          <TextSection
            title="Experiența educațională sau profesională"
            text={a.background}
          />
          <TextSection
            title="Cum vrea să folosească platforma"
            text={a.intendedUse}
          />
          <TextSection
            title="Informații care susțin aplicația"
            text={a.evidence}
            empty="Aplicantul nu a adăugat informații suplimentare. Dacă ai nevoie de ele pentru decizie, folosește „Cere informații”."
          />
        </div>

        <div className="grid gap-6 lg:sticky lg:top-24">
          <Section title="Decizie">
            <div className="grid gap-5">
              <ReviewNote application={a} />
              {open ? (
                <ApplicationReview
                  applicant={{ id: a.id, fullName: a.fullName, email: a.email }}
                  status={a.status}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Aplicația are o decizie finală, așa că nu mai sunt acțiuni
                  disponibile.
                </p>
              )}
            </div>
          </Section>
          {open ? (
            <p className="px-1 text-muted-foreground text-xs leading-relaxed">
              La fiecare schimbare de stare, aplicantul primește automat un
              email. La aprobare, contul se activează doar după ce mentorul își
              setează parola din linkul primit.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReviewNote({ application: a }: { application: MentorApplication }) {
  if (!a.reviewNote)
    return (
      <p className="text-muted-foreground text-sm">
        Aplicația nu a fost încă verificată.
      </p>
    );
  const asked = a.status === "needs_info";
  return (
    <div className="grid gap-2">
      <p className="flex items-center gap-1.5 font-medium text-sm">
        {asked ? (
          <FileQuestion className="size-4 text-warning" aria-hidden="true" />
        ) : (
          <MessageSquareText
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        {asked ? "Informații cerute aplicantului" : "Notă de verificare"}
      </p>
      <blockquote className="whitespace-pre-line rounded-lg border-l-2 bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
        {a.reviewNote}
      </blockquote>
      {asked ? (
        <p className="text-muted-foreground text-xs">
          Aplicantul nu a răspuns încă.
        </p>
      ) : null}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <dt className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

function TextSection({
  title,
  text,
  empty,
}: {
  title: string;
  text: string;
  empty?: string;
}) {
  return (
    <Section title={title}>
      {text ? (
        <p className="whitespace-pre-line leading-relaxed">{text}</p>
      ) : (
        <p className="text-muted-foreground text-sm">{empty}</p>
      )}
    </Section>
  );
}

function ReviewSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <span className="sr-only">Se încarcă aplicația…</span>
      <div className="grid gap-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-80" />
      </div>
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
