import { AppShell, type NavItem } from "@/components/app/app-shell";
import { demoMentor } from "@/lib/demo-data";

const nav: NavItem[] = [
  { label: "Panou", emoji: "📊", href: "/mentor" },
  { label: "Sesiune live", emoji: "⚡", href: "/mentor/sesiune" },
  { label: "Quiz-uri", emoji: "📝" },
  { label: "Teme", emoji: "📚" },
  { label: "Grupe și elevi", emoji: "👥" },
  { label: "Rapoarte", emoji: "📈" },
];

export default function MentorLayout({ children }: LayoutProps<"/mentor">) {
  return (
    <AppShell nav={nav} user={{ firstName: demoMentor.name, role: "Mentor" }}>
      {children}
    </AppShell>
  );
}
