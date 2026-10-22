import {
  AppShell,
  type NavItem,
  type TopBarConfig,
} from "@/components/app/app-shell";
import {
  demoExercises,
  demoHomework,
  demoStudent,
  demoStudentNotifications,
} from "@/lib/demo-data";

const nav: NavItem[] = [
  { label: "Acasă", emoji: "🏠", href: "/" },
  { label: "Quiz-uri", emoji: "⚡", href: "/quiz" },
  { label: "Teme", emoji: "📚", href: "/teme" },
  { label: "Exerciții", emoji: "💻", href: "/exercitii" },
];

const topBar: TopBarConfig = {
  quick: "pin",
  searchPlaceholder: "Caută exerciții, teme…",
  status: [
    { emoji: "🔥", label: `${demoStudent.streakDays} zile`, href: "/" },
    {
      emoji: "⭐",
      label: `${demoStudent.xp} XP`,
      href: "/",
    },
  ],
  notifications: demoStudentNotifications,
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
    ...demoHomework.map((h) => ({
      label: h.title,
      hint: `Temă · termen ${h.due}`,
      emoji: "📚",
      href: `/exercitii/${h.exerciseId}`,
      group: "Teme",
    })),
    ...demoExercises.map((e) => ({
      label: e.title,
      hint: `Exercițiu · ${e.topic}`,
      emoji: e.emoji,
      href: `/exercitii/${e.id}`,
      group: "Exerciții",
    })),
  ],
};

export default function StudentLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      nav={nav}
      topBar={topBar}
      user={{
        firstName: demoStudent.firstName,
        role: `Elev · ${demoStudent.group}`,
      }}
    >
      {children}
    </AppShell>
  );
}
