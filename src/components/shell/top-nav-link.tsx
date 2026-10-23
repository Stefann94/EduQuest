"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav";

/** Un link din bara de navigare de sus; secțiunea curentă e subliniată. */
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
        "relative flex h-16 items-center gap-2 whitespace-nowrap px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset [&_svg]:size-4 [&_svg]:shrink-0",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className={active ? "text-primary" : undefined}>{item.icon}</span>
      {item.label}
      {item.badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-semibold text-[11px] text-primary-foreground tabular-nums">
          {item.badge}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-transparent",
        )}
      />
    </Link>
  );
}
