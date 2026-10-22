"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  emoji,
  onNavigate,
  children,
}: {
  href: string;
  emoji: string;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // „Acasă” (/) e activ doar pe /, celelalte și pe subpagini (ex. /exercitii/salut).
  const active =
    href === "/" || href === "/mentor"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex shrink-0 items-center gap-3 rounded-2xl px-2 py-1.5 font-bold font-heading text-lg outline-none transition-all focus-visible:ring-4 focus-visible:ring-primary-foreground/50",
        active
          ? "bg-card text-foreground shadow-[0_4px_0_0_var(--primary-shadow)]"
          : "text-primary-foreground hover:bg-primary-foreground/15",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 place-items-center rounded-xl text-xl transition-transform group-hover:-rotate-6 group-hover:scale-110",
          active ? "bg-primary-soft" : "bg-primary-foreground/20",
        )}
      >
        {emoji}
      </span>
      <span className="pr-2">{children}</span>
    </Link>
  );
}
