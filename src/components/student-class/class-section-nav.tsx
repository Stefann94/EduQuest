"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { label: "Prezentare", path: "" },
  { label: "Lecții", path: "/lectii" },
  { label: "Teme", path: "/teme" },
  { label: "Quiz-uri", path: "/quiz" },
  { label: "Prezență", path: "/prezenta" },
  { label: "Clasament", path: "/clasament" },
  { label: "Informații", path: "/informatii" },
] as const;

/** Navigarea între secțiunile unei clase. Pe telefon se derulează orizontal. */
export function ClassSectionNav({ classId }: { classId: string }) {
  const pathname = usePathname();
  const base = `/clase/${classId}`;

  return (
    <nav aria-label="Secțiunile clasei">
      <ul className="flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--border)]">
        {SECTIONS.map((s) => {
          const href = `${base}${s.path}`;
          const active =
            s.path === ""
              ? pathname === base
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={s.label} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center whitespace-nowrap rounded-t-md border-b-2 px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
