"use client";

import { Radio, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    href: "/mentor/quiz/live",
    label: "Live",
    hint: "Jucate împreună, cu cod",
    icon: Radio,
    active: "bg-quiz-red text-white",
    idle: "text-quiz-red",
  },
  {
    href: "/mentor/quiz/clase",
    label: "Pentru clase",
    hint: "Rezolvate oricând, cu XP",
    icon: Users,
    active: "bg-cyan text-cyan-foreground",
    idle: "text-cyan",
  },
] as const;

/** Cele două feluri de quiz-uri: live și pentru clase (prima treaptă de navigare). */
export function QuizSectionSwitch() {
  const pathname = usePathname();
  return (
    <nav aria-label="Felul quiz-urilor">
      <ul className="grid gap-2 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const on = pathname === s.href || pathname.startsWith(`${s.href}/`);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "group flex cut items-center gap-3 px-4 py-3 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset",
                  on ? s.active : "bg-card hover:bg-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-10 shrink-0 cut-xs place-items-center",
                    on ? "bg-black/15" : cn("bg-secondary", s.idle),
                  )}
                >
                  <s.icon className="size-5" />
                </span>
                <span className="grid min-w-0">
                  <span className="font-extrabold font-heading text-xl uppercase leading-tight tracking-wide">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "truncate text-sm",
                      on ? "opacity-85" : "text-muted-foreground",
                    )}
                  >
                    {s.hint}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
