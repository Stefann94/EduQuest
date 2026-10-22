import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "./nav-link";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  /** Fără href = pagină care încă nu există; apare ca „în curând”. */
  href?: string;
};

export function AppShell({
  nav,
  user,
  children,
}: {
  nav: NavItem[];
  user: { name: string; initials: string; role: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex flex-col border-b bg-sidebar md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex h-16 items-center justify-between px-4 md:px-5">
          <Logo href={nav[0]?.href ?? "/"} />
          <Avatar className="md:hidden">
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-xs">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {nav.map((item) =>
            item.href ? (
              <NavLink key={item.label} href={item.href}>
                <item.icon /> {item.label}
              </NavLink>
            ) : (
              <span
                key={item.label}
                className="flex shrink-0 cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-muted-foreground/60 text-sm [&_svg]:size-5"
              >
                <item.icon /> {item.label}
                <span className="ml-auto hidden rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide md:inline">
                  curând
                </span>
              </span>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 border-t p-4 md:flex">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.role}</p>
          </div>
          <Link
            href="/"
            aria-label="Ieși din cont"
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
