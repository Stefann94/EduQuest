import {
  ArrowRight,
  ChevronRight,
  Clock,
  FileQuestion,
  GraduationCap,
  type LucideIcon,
  PauseCircle,
  Presentation,
  School,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { ApplicationStatusBadge } from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import { getAdminStats } from "@/lib/data/admin-queries";
import { getMentorApplications, getViewer } from "@/lib/data/queries";
import {
  formatDate,
  formatWeekday,
  now,
  plural,
  relativeDays,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Prezentare generală" };

export default async function AdminOverviewPage() {
  const me = await getViewer("admin");
  const [stats, applications] = await Promise.all([
    getAdminStats(me),
    getMentorApplications(),
  ]);

  const toReview = applications.filter(
    (a) => a.status === "pending" || a.status === "needs_info",
  );
  const oldestPending = applications
    .filter((a) => a.status === "pending")
    .at(-1);

  const tiles: Tile[] = [
    {
      label: "Aplicații în așteptare",
      value: stats.pendingApplications,
      hint: oldestPending
        ? `Cea mai veche: trimisă ${relativeDays(oldestPending.submittedAt)}`
        : "Nicio aplicație nouă",
      icon: Clock,
      href: "/admin/aplicatii",
      highlight: stats.pendingApplications > 0,
    },
    {
      label: "Informații cerute",
      value: stats.needsInfoApplications,
      hint: "Așteaptă răspunsul aplicantului",
      icon: FileQuestion,
      href: "/admin/aplicatii",
    },
    {
      label: "Mentori activi",
      value: stats.activeMentors,
      hint: "Conturi aprobate și activate",
      icon: Presentation,
      href: "/admin/utilizatori",
    },
    {
      label: "Elevi",
      value: stats.totalStudents,
      hint: `${stats.activeStudents} cu cont activ`,
      icon: GraduationCap,
      href: "/admin/utilizatori",
    },
    {
      label: "Clase active",
      value: stats.activeClasses,
      hint: `${plural(stats.archivedClasses, "clasă arhivată", "clase arhivate")}`,
      icon: School,
    },
    {
      label: "Conturi suspendate",
      value: stats.suspendedAccounts,
      hint:
        stats.deactivatedAccounts > 0
          ? `${plural(stats.deactivatedAccounts, "cont dezactivat", "conturi dezactivate")}`
          : "Niciun cont dezactivat",
      icon: PauseCircle,
      href: "/admin/utilizatori",
    },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Prezentare generală"
        description={
          <>
            {formatWeekday(now().toISOString())} ·{" "}
            {toReview.length > 0
              ? `${plural(toReview.length, "aplicație de mentor", "aplicații de mentor")} de verificat.`
              : "Nicio aplicație de verificat."}
          </>
        }
        actions={
          <Link href="/admin/aplicatii" className={buttonVariants()}>
            <UserCheck /> Verifică aplicațiile
          </Link>
        }
      />

      <ul className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <StatTile tile={t} />
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="Aplicații recente"
          description="Cele mai noi aplicații pentru conturi de mentor"
          className="lg:col-span-2"
          bodyClassName="p-2"
          actions={
            <Link
              href="/admin/aplicatii"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Toate aplicațiile <ArrowRight />
            </Link>
          }
        >
          {applications.length > 0 ? (
            <ul className="stagger grid">
              {applications.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/aplicatii/${a.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.fullName}</p>
                      <p className="truncate text-muted-foreground text-sm">
                        Trimisă pe {formatDate(a.submittedAt)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={a.status} />
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Nicio aplicație încă"
              description="Când cineva aplică pentru un cont de mentor, aplicația apare aici."
              className="border-0"
            />
          )}
        </Section>

        <Section title="Acțiuni rapide" bodyClassName="p-2">
          <ul className="grid">
            {QUICK_LINKS.map(({ href, label, text, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-accent-foreground">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-sm">{label}</span>
                    <span className="block text-muted-foreground text-sm">
                      {text}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  {
    href: "/admin/aplicatii",
    label: "Aplicații mentori",
    text: "Aprobă, respinge sau cere informații.",
    icon: UserCheck,
  },
  {
    href: "/admin/utilizatori",
    label: "Utilizatori",
    text: "Suspendă sau reactivează conturi.",
    icon: Users,
  },
  {
    href: "/admin/setari",
    label: "Setări platformă",
    text: "Reguli XP, coduri de invitație, securitate.",
    icon: Settings,
  },
] as const;

type Tile = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href?: string;
  highlight?: boolean;
};

function StatTile({ tile }: { tile: Tile }) {
  const { label, value, hint, icon: Icon, href, highlight } = tile;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-muted-foreground text-sm">{label}</p>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            highlight
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-1 font-semibold text-3xl tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-muted-foreground text-xs">{hint}</p>
    </>
  );
  const cls =
    "block h-full rounded-xl border bg-card p-5 shadow-xs outline-none transition-colors";
  return href ? (
    <Link
      href={href}
      className={cn(
        cls,
        "hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/40",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
