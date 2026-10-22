import {
  AppShell,
  type NavItem,
  type TopBarConfig,
} from "@/components/app/app-shell";
import {
  demoGroups,
  demoMentor,
  demoMentorNotifications,
  demoQuizzes,
  demoToGrade,
} from "@/lib/demo-data";

const nav: NavItem[] = [
  { label: "Panou", emoji: "📊", href: "/mentor" },
  { label: "Sesiune live", emoji: "⚡", href: "/mentor/sesiune" },
  { label: "Quiz-uri", emoji: "📝" },
  { label: "Teme", emoji: "📚" },
  { label: "Exerciții", emoji: "💻" },
  { label: "Grupe", emoji: "👥" },
];

const nextGroup = demoGroups[0];

const topBar: TopBarConfig = {
  quick: "live",
  searchPlaceholder: "Caută quiz-uri, grupe…",
  status: [
    {
      emoji: "🗓️",
      label: nextGroup.schedule,
      href: "/mentor",
    },
    {
      emoji: "📬",
      label: `${demoToGrade.length} de corectat`,
      href: "/mentor",
    },
  ],
  notifications: demoMentorNotifications,
  search: [
    ...nav.flatMap((n) =>
      n.href
        ? [
            {
              label: n.label,
              hint: "Pagină",
              emoji: n.emoji,
              href: n.href,
              group: "Pagini",
            },
          ]
        : [],
    ),
    ...demoQuizzes.map((q) => ({
      label: q.title,
      hint: `Quiz · ${q.questions} întrebări`,
      emoji: "📝",
      href: "/mentor/sesiune",
      group: "Quiz-uri",
    })),
    ...demoGroups.map((g) => ({
      label: g.name,
      hint: `Grupă · ${g.schedule}`,
      emoji: g.emoji,
      href: "/mentor",
      group: "Grupe",
    })),
  ],
};

export default function MentorLayout({ children }: LayoutProps<"/mentor">) {
  return (
    <AppShell
      nav={nav}
      topBar={topBar}
      user={{ firstName: demoMentor.name, role: "Mentor" }}
    >
      {children}
    </AppShell>
  );
}
