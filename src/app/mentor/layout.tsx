import {
  BookOpenCheck,
  ChartColumn,
  LayoutDashboard,
  ListChecks,
  Radio,
  Users,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { demoMentor } from "@/lib/demo-data";

const nav: NavItem[] = [
  { label: "Panou", icon: LayoutDashboard, href: "/mentor" },
  { label: "Sesiune live", icon: Radio, href: "/mentor/sesiune" },
  { label: "Quiz-uri", icon: ListChecks },
  { label: "Teme", icon: BookOpenCheck },
  { label: "Grupe și elevi", icon: Users },
  { label: "Rapoarte", icon: ChartColumn },
];

export default function MentorLayout({ children }: LayoutProps<"/mentor">) {
  return (
    <AppShell
      nav={nav}
      user={{
        name: demoMentor.name,
        initials: demoMentor.initials,
        role: "Mentor",
      }}
    >
      {children}
    </AppShell>
  );
}
