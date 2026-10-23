import {
  Bell,
  BookOpen,
  House,
  ListChecks,
  Radio,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/nav";
import type { SearchItem } from "@/components/shell/search-menu";
import { buttonVariants } from "@/components/ui/button";
import {
  getNotifications,
  getStudentAssignments,
  getStudentClasses,
  getStudentMaterials,
  getStudentQuizzes,
  getStudentWorkedProblems,
  getViewer,
} from "@/lib/data/queries";
import { cn } from "@/lib/utils";

export default async function StudentLayout({ children }: LayoutProps<"/">) {
  const me = await getViewer("student");
  const [notifications, classes, assignments, materials, problems, quizzes] =
    await Promise.all([
      getNotifications(me.id),
      getStudentClasses(me.id),
      getStudentAssignments(me.id),
      getStudentMaterials(me.id),
      getStudentWorkedProblems(me.id),
      getStudentQuizzes(me.id),
    ]);
  const unread = notifications.filter((n) => !n.read).length;

  const nav: NavGroup[] = [
    {
      items: [
        { label: "Acasă", href: "/", icon: <House />, exact: true },
        { label: "Clasele mele", href: "/clase", icon: <Users /> },
        { label: "Învățare", href: "/invatare", icon: <BookOpen /> },
        { label: "Quiz-uri", href: "/quiz", icon: <ListChecks /> },
        { label: "Progresul meu", href: "/progres", icon: <TrendingUp /> },
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
    ...assignments.map((a) => ({
      label: a.title,
      hint: `Temă · ${a.className}`,
      href: `/teme/${a.id}`,
      kind: "assignment" as const,
    })),
    ...materials.map((m) => ({
      label: m.title,
      hint: `Material · ${m.topic}`,
      href: `/invatare/materiale/${m.id}`,
      kind: "material" as const,
    })),
    ...problems.map((p) => ({
      label: p.title,
      hint: `Problemă rezolvată · ${p.topic}`,
      href: `/invatare/probleme/${p.id}`,
      kind: "problem" as const,
    })),
    ...[...quizzes.assigned, ...quizzes.practice].map((q) => ({
      label: q.title,
      hint: `Quiz · ${q.topic}`,
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
      quickAction={
        <Link
          href="/live"
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
