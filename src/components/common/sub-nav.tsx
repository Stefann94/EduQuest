"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SubNavItem = {
  label: string;
  href: string;
  /** Activ doar pe adresa exactă (nu și pe sub-pagini). */
  exact?: boolean;
  /** Un număr mic lângă etichetă (ex. câte sesiuni sunt deschise). */
  count?: number;
};

/** Navigarea între secțiunile unei pagini (file sub titlu), cu secțiunea curentă evidențiată. */
export function SubNav({
  label,
  items,
  className,
}: {
  label: string;
  items: SubNavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={cn("-mx-1 overflow-x-auto", className)}>
      <ul className="flex min-w-max gap-1 border-b px-1">
        {items.map((s) => {
          const active = s.exact
            ? pathname === s.href
            : pathname === s.href || pathname.startsWith(`${s.href}/`);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-10 items-center gap-1.5 rounded-t-md border-b-2 px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {s.label}
                {s.count ? (
                  <span
                    className={cn(
                      "min-w-5 px-1.5 text-center font-bold font-heading text-xs tabular-nums",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {s.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
