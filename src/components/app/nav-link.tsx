"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  emoji,
  tile,
  children,
}: {
  href: string;
  emoji: string;
  tile: string;
  children: React.ReactNode;
}) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex shrink-0 items-center gap-3 rounded-2xl border-2 px-2 py-1.5 font-bold font-heading text-base outline-none transition-all focus-visible:ring-4 focus-visible:ring-ring/40",
        active
          ? "border-primary bg-primary-soft text-foreground shadow-[0_3px_0_0_var(--primary)]"
          : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 place-items-center rounded-xl text-lg transition-transform group-hover:-rotate-6 group-hover:scale-110",
          tile,
        )}
      >
        {emoji}
      </span>
      <span className="pr-2">{children}</span>
    </Link>
  );
}
