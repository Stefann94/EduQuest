import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { UserAvatar } from "@/components/personalize/user-avatar";
import { NavLink } from "./nav-link";

export type NavItem = {
  label: string;
  emoji: string;
  /** Fără href = pagină care încă nu există; apare ca „în curând”. */
  href?: string;
};

export type ShellUser = { firstName: string; role: string };

// Conținutul meniului lateral: același pe desktop și în meniul de pe telefon.
export function SidebarContent({
  nav,
  user,
  onNavigate,
}: {
  nav: NavItem[];
  user: ShellUser;
  onNavigate?: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-25 [--primary:var(--primary-foreground)]" />
      <Logo
        href={nav[0]?.href ?? "/"}
        inverted
        className="relative px-2 pt-2"
      />

      <nav className="relative flex flex-col gap-1.5">
        {nav.map((item) =>
          item.href ? (
            <NavLink
              key={item.label}
              href={item.href}
              emoji={item.emoji}
              onNavigate={onNavigate}
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 font-bold font-heading text-lg text-primary-foreground/55"
            >
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-xl bg-primary-foreground/10 text-xl opacity-70"
              >
                {item.emoji}
              </span>
              {item.label}
              <span className="ml-auto -rotate-3 rounded-full bg-primary-foreground/20 px-2 py-0.5 font-bold font-sans text-[10px] text-primary-foreground uppercase tracking-wide">
                curând
              </span>
            </span>
          ),
        )}
      </nav>

      <div className="relative mt-auto flex items-center gap-3 rounded-3xl bg-primary-foreground/15 p-2.5">
        <UserAvatar className="size-11 bg-card text-2xl shadow-none" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold font-heading text-lg leading-tight">
            {user.firstName}
          </p>
          <p className="truncate font-semibold text-xs opacity-85">
            {user.role}
          </p>
        </div>
        <Link
          href="/autentificare"
          onClick={onNavigate}
          title="Ieși din cont"
          className="grid size-10 shrink-0 place-items-center rounded-2xl text-lg transition-transform hover:rotate-12 hover:bg-primary-foreground/20"
        >
          <span aria-hidden="true">👋</span>
          <span className="sr-only">Ieși din cont</span>
        </Link>
      </div>
    </div>
  );
}
