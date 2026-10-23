import {
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Radio,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/nav";
import type { SearchItem } from "@/components/shell/search-menu";
import { buttonVariants } from "@/components/ui/button";
import {
  getMentorAssignments,
  getMentorClasses,
  getMentorContent,
  getMentorQuizzes,
  getNotifications,
  getReviewQueue,
  getViewer,
} from "@/lib/data/queries";
import { cn } from "@/lib/utils";

export default async function MentorLayout({
  children,
}: LayoutProps<"/mentor">) {
  const me = await getViewer("mentor");
  const [notifications, classes, assignments, content, quizzes, queue] =
    await Promise.all([
      getNotifications(me.id),
      getMentorClasses(me.id),
      getMentorAssignments(me.id),
      getMentorContent(me.id),
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
        { label: "Clasele mele", href: "/mentor/clase", icon: <Users /> },
        { label: "Materiale", href: "/mentor/materiale", icon: <BookOpen /> },
        {
          label: "Teme",
          href: "/mentor/teme",
          icon: <ClipboardList />,
          badge: queue.length,
        },
        { label: "Quiz-uri", href: "/mentor/quiz", icon: <ListChecks /> },
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
    ...assignments.map((a) => ({
      label: a.title,
      hint: `Temă · ${a.className}`,
      href: `/mentor/teme/${a.id}`,
      kind: "assignment" as const,
    })),
    ...content.materials.map((m) => ({
      label: m.title,
      hint: `Material · ${m.className ?? "Resursă globală"}`,
      href: `/mentor/materiale/${m.id}`,
      kind: "material" as const,
    })),
    ...content.problems.map((p) => ({
      label: p.title,
      hint: `Problemă rezolvată · ${p.topic}`,
      href: `/mentor/materiale/probleme/${p.id}`,
      kind: "problem" as const,
    })),
    ...quizzes.map((q) => ({
      label: q.title,
      hint: `Quiz · ${q.className ?? "Exersare globală"}`,
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
          className={cn(buttonVariants(), "hidden sm:inline-flex")}
        >
          <Radio /> Quiz live
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
