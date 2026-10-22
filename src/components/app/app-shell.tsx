import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PersonalizeButton } from "@/components/personalize/personalize-button";
import { NavLink } from "./nav-link";

export type NavItem = {
  label: string;
  emoji: string;
  /** Fără href = pagină care încă nu există; apare ca „în curând”. */
  href?: string;
};

// Fiecare buton din meniu are plăcuța lui colorată.
const TILES = [
  "bg-fun-purple/15",
  "bg-fun-pink/15",
  "bg-fun-blue/15",
  "bg-fun-green/15",
  "bg-fun-yellow/25",
  "bg-fun-orange/15",
];

export function AppShell({
  nav,
  user,
  children,
}: {
  nav: NavItem[];
  user: { firstName: string; role: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row md:gap-2 md:p-4">
      <aside className="sticker flex flex-col rounded-none border-x-0 border-t-0 md:sticky md:top-4 md:h-[calc(100dvh-2rem)] md:w-64 md:shrink-0 md:rounded-3xl md:border-2">
        <div className="flex h-18 items-center justify-between px-4 md:px-5">
          <Logo href={nav[0]?.href ?? "/"} />
          <div className="md:hidden">
            <PersonalizeButton name={user.firstName} compact />
          </div>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {nav.map((item, i) =>
            item.href ? (
              <NavLink
                key={item.label}
                href={item.href}
                emoji={item.emoji}
                tile={TILES[i % TILES.length]}
              >
                {item.label}
              </NavLink>
            ) : (
              <span
                key={item.label}
                className="flex shrink-0 cursor-not-allowed items-center gap-3 rounded-2xl border-2 border-transparent px-2 py-1.5 font-bold font-heading text-base text-muted-foreground/60"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-xl bg-muted text-lg grayscale"
                >
                  {item.emoji}
                </span>
                {item.label}
                <span className="ml-auto hidden -rotate-3 rounded-full bg-fun-yellow/30 px-2 py-0.5 font-bold font-sans text-[10px] text-foreground/70 uppercase tracking-wide md:inline">
                  curând
                </span>
              </span>
            ),
          )}
        </nav>

        <div className="hidden p-4 md:block">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-2 font-bold text-muted-foreground text-sm hover:bg-secondary hover:text-foreground"
          >
            👋 Ieși din cont
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-2">
          <div className="mb-5 hidden items-center justify-end gap-3 md:flex">
            <span className="font-semibold text-muted-foreground text-sm">
              {user.role}
            </span>
            <PersonalizeButton name={user.firstName} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
