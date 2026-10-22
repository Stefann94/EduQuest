import { AppShell, type NavItem } from "@/components/app/app-shell";
import { demoStudent } from "@/lib/demo-data";

const nav: NavItem[] = [
  { label: "Acasă", emoji: "🏠", href: "/elev" },
  { label: "Intră cu PIN", emoji: "🎟️", href: "/intra" },
  { label: "Teme", emoji: "📚" },
  { label: "Jocuri", emoji: "🎮" },
  { label: "Clasament", emoji: "🏆" },
  { label: "Insigne", emoji: "🏅" },
];

export default function StudentLayout({ children }: LayoutProps<"/elev">) {
  return (
    <AppShell
      nav={nav}
      user={{
        firstName: demoStudent.firstName,
        role: `Elev · ${demoStudent.group}`,
      }}
    >
      {children}
    </AppShell>
  );
}
