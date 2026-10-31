import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Radio,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/nav";
import type { SearchItem } from "@/components/shell/search-menu";
import { ShellFallback } from "@/components/shell/shell-fallback";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getMentorHomeworks, getReviewQueue } from "@/lib/db/homework";
import { getMentorLessons } from "@/lib/db/lessons";
import { getNotifications } from "@/lib/db/notifications";
import { getMentorQuizzes } from "@/lib/db/quizzes";
import { cn } from "@/lib/utils";

// Sesiunea se citește în interiorul unui <Suspense>, ca restul paginii să nu aștepte
// (cerință Cache Components). Vezi lib/auth.ts.
export default function Layout({ children }: LayoutProps<"/mentor">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <MentorShell>{children}</MentorShell>
    </Suspense>
  );
}

async function MentorShell({ children }: { children: React.ReactNode }) {
  const me = await requireUser("mentor");
  const [notifications, classes, homeworks, lessons, quizzes, queue] =
    await Promise.all([
      getNotifications(me.id),
      getMentorClasses(me.id),
      getMentorHomeworks(me.id),
      getMentorLessons(me.id),
      getMentorQuizzes(me.id),
      getReviewQueue(me.id),
    ]);
  const unread = notifications.filter((n) => !n.read).length;

  const nav: NavGroup[] = [
    {
      items: [
        {
          label: "Panou",
          href: "/mentor",
          icon: <LayoutDashboard />,
          exact: true,
        },
        { label: "Clase", href: "/mentor/clase", icon: <Users /> },
        { label: "Materiale", href: "/mentor/materiale", icon: <BookOpen /> },
        {
          label: "Teme",
          href: "/mentor/teme",
          icon: <ClipboardList />,
          badge: queue.length,
        },
        { label: "Quiz-uri", href: "/mentor/quiz", icon: <ListChecks /> },
        {
          label: "Învățare",
          href: "/mentor/invatare",
          icon: <GraduationCap />,
        },
      ],
    },
    {
      label: "Cont",
      items: [
        {
          label: "Notificări",
          href: "/mentor/notificari",
          icon: <Bell />,
          badge: unread,
        },
        { label: "Setări cont", href: "/mentor/setari", icon: <Settings /> },
      ],
    },
  ];

  const search: SearchItem[] = [
    ...nav.flatMap((g) =>
      g.items.map((i) => ({
        label: i.label,
        hint: "Pagină",
        href: i.href,
        kind: "page" as const,
      })),
    ),
    ...[...classes.active, ...classes.archived].map((c) => ({
      label: c.name,
      hint: `Clasă · ${c.studentIds.length} elevi`,
      href: `/mentor/clase/${c.id}`,
      kind: "class" as const,
    })),
    ...homeworks.map((h) => ({
      label: h.title,
      hint: `Temă · ${h.assignments.map((a) => a.className).join(", ") || "neatribuită"}`,
      href: `/mentor/teme/${h.id}`,
      kind: "assignment" as const,
    })),
    ...lessons.map((l) => ({
      label: l.title,
      hint: `Lecție · ${l.items.length} materiale`,
      href: `/mentor/materiale/${l.id}`,
      kind: "material" as const,
    })),
    ...quizzes.map((q) => ({
      label: q.title,
      hint: `Quiz · ${q.classes.map((c) => c.name).join(", ") || "neatribuit"}`,
      href: `/mentor/quiz/${q.id}`,
      kind: "quiz" as const,
    })),
  ];

  return (
    <AppShell
      nav={nav}
      home="/mentor"
      user={{ name: me.displayName, roleLabel: "Mentor", avatar: me.avatar }}
      notifications={notifications}
      notificationsHref="/mentor/notificari"
      settingsHref="/mentor/setari"
      search={search}
      quickAction={
        <Link
          href="/mentor/live"
          className={cn(
            buttonVariants({ variant: "cta" }),
            "hidden sm:inline-flex",
          )}
        >
          <Radio /> Quiz live
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
