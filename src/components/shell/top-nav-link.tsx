"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav";

/** Un link din bara de sus, ca un paralelogram; secțiunea curentă e magenta. */
export function TopNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "slant flex h-10 items-center gap-2 whitespace-nowrap px-5 font-bold font-heading text-base uppercase tracking-wide outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {item.label}
      {item.badge ? (
        <span className="grid h-5 min-w-5 place-items-center bg-cta px-1.5 font-bold text-xs text-cta-foreground tabular-nums">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
