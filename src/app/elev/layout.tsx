import {
  Award,
  BookOpenCheck,
  Gamepad2,
  House,
  KeyRound,
  Trophy,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { demoStudent } from "@/lib/demo-data";

const nav: NavItem[] = [
  { label: "Acasă", icon: House, href: "/elev" },
  { label: "Intră cu PIN", icon: KeyRound, href: "/intra" },
  { label: "Teme", icon: BookOpenCheck },
  { label: "Jocuri", icon: Gamepad2 },
  { label: "Clasament", icon: Trophy },
  { label: "Insigne", icon: Award },
];

export default function StudentLayout({ children }: LayoutProps<"/elev">) {
  return (
    <AppShell
      nav={nav}
      user={{
        name: demoStudent.name,
        initials: demoStudent.initials,
        role: `Elev · ${demoStudent.group}`,
      }}
    >
      {children}
    </AppShell>
  );
}
