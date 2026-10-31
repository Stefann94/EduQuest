import {
  Bell,
  BookOpen,
  ClipboardList,
  House,
  ListChecks,
  Radio,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/nav";
import type { SearchItem } from "@/components/shell/search-menu";
import { ShellFallback } from "@/components/shell/shell-fallback";
import { XpMeter } from "@/components/shell/xp-meter";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getStudentClasses } from "@/lib/db/classes";
import { getStudentHomework } from "@/lib/db/homework";
import { getNotifications } from "@/lib/db/notifications";
import { getStudentQuizzes } from "@/lib/db/quizzes";
import { getXpTotal } from "@/lib/db/xp";
import { cn } from "@/lib/utils";

// Sesiunea se citește în interiorul unui <Suspense>, ca restul paginii să nu aștepte
// (cerință Cache Components). Vezi lib/auth.ts.
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <StudentShell>{children}</StudentShell>
    </Suspense>
  );
}

async function StudentShell({ children }: { children: React.ReactNode }) {
  const me = await requireUser("student");
  const [notifications, classes, homework, quizzes, xp] = await Promise.all([
    getNotifications(me.id),
    getStudentClasses(me.id),
    getStudentHomework(me.id),
    getStudentQuizzes(me.id),
    getXpTotal(me.id),
  ]);
  const unread = notifications.filter((n) => !n.read).length;
  const toDo = homework.filter(
    (h) => h.required && !h.complete && !h.overdue,
  ).length;

  const nav: NavGroup[] = [
    {
      items: [
        { label: "Acasă", href: "/", icon: <House />, exact: true },
        { label: "Clase", href: "/clase", icon: <Users /> },
        { label: "Teme", href: "/teme", icon: <ClipboardList />, badge: toDo },
        { label: "Învățare", href: "/invatare", icon: <BookOpen /> },
        { label: "Quiz-uri", href: "/quiz", icon: <ListChecks /> },
        { label: "Progres", href: "/progres", icon: <TrendingUp /> },
      ],
    },
    {
      label: "Cont",
      items: [
        {
          label: "Notificări",
          href: "/notificari",
          icon: <Bell />,
          badge: unread,
        },
        { label: "Setări cont", href: "/setari", icon: <Settings /> },
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
      hint: `Clasă · ${c.mentor.displayName}`,
      href: `/clase/${c.id}`,
      kind: "class" as const,
    })),
    ...[...classes.active, ...classes.archived].map((c) => ({
      label: `Lecțiile: ${c.name}`,
      hint: "Lecții și materiale",
      href: `/clase/${c.id}/lectii`,
      kind: "material" as const,
    })),
    ...homework.map((h) => ({
      label: h.title,
      hint: `Temă · ${h.className}`,
      href: `/teme/${h.id}`,
      kind: "assignment" as const,
    })),
    ...quizzes.map((q) => ({
      label: q.title,
      hint: `Quiz · ${q.classNames.join(", ")}${q.archived ? " · arhivat" : ""}`,
      href: `/quiz/${q.id}`,
      kind: "quiz" as const,
    })),
  ];

  return (
    <AppShell
      nav={nav}
      home="/"
      user={{ name: me.displayName, roleLabel: "Elev", avatar: me.avatar }}
      notifications={notifications}
      notificationsHref="/notificari"
      settingsHref="/setari"
      search={search}
      status={<XpMeter xp={xp} href="/progres" />}
      quickAction={
        <Link
          href="/live"
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
