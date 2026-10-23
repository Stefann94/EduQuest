"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav";

export function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-[18px] [&_svg]:shrink-0",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-semibold text-[11px] text-primary-foreground tabular-nums">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
