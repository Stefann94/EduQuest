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
        "slant flex h-9 xl:h-10 items-center gap-1.5 xl:gap-2 whitespace-nowrap px-2.5 xl:px-4 font-bold font-heading text-xs xl:text-sm uppercase tracking-wide outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {item.label}
      {item.badge ? (
        <span className="grid h-4.5 min-w-4.5 xl:h-5 xl:min-w-5 place-items-center bg-cta px-1 font-bold text-[11px] xl:text-xs text-cta-foreground tabular-nums">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
