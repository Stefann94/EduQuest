"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { label: "Prezentare", slug: "" },
  { label: "Membri", slug: "membri" },
  { label: "Lecții", slug: "lectii" },
  { label: "Teme", slug: "teme" },
  { label: "Quiz-uri", slug: "quiz" },
  { label: "Prezență", slug: "prezenta" },
  { label: "Clasament", slug: "clasament" },
  { label: "Setări", slug: "setari" },
] as const;

/** Navigarea între secțiunile unei clase, cu secțiunea curentă evidențiată. */
export function ClassNav({ classId }: { classId: string }) {
  const pathname = usePathname();
  const base = `/mentor/clase/${classId}`;

  return (
    <nav aria-label="Secțiunile clasei" className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 border-b px-1">
        {SECTIONS.map((s) => {
          const href = s.slug ? `${base}/${s.slug}` : base;
          const active = s.slug
            ? pathname === href || pathname.startsWith(`${href}/`)
            : pathname === base;
          return (
            <li key={s.slug || "overview"}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-10 items-center rounded-t-md border-b-2 px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
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
