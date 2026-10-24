import Link from "next/link";
import type { LeaderboardRow } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

/** Primii din clasament, plus elevul (dacă nu e printre ei). */
export function LeaderboardCard({
  title,
  subtitle,
  href,
  rows,
  meId,
}: {
  title: string;
  subtitle?: string;
  href: string;
  rows: LeaderboardRow[];
  meId: string;
}) {
  const top = rows.slice(0, 3);
  const mine = rows.find((r) => r.student.id === meId);
  const shown =
    mine && !top.some((r) => r.student.id === meId) ? [...top, mine] : top;

  return (
    <section className="cut-sm bg-card px-5 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-extrabold text-lg leading-tight">{title}</h2>
          {subtitle ? (
            <p className="truncate text-muted-foreground text-xs">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href={href}
          className="shrink-0 font-bold font-heading text-cyan text-sm uppercase tracking-wide hover:underline"
        >
          Tot clasamentul
        </Link>
      </div>
      <ol>
        {shown.map((r) => {
          const me = r.student.id === meId;
          return (
            <li
              key={r.student.id}
              className={cn(
                "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center border-t py-2.5",
                me && "text-cyan",
              )}
            >
              {r.rank === 1 ? (
                <span className="grid size-6 place-items-center bg-xp font-extrabold font-heading text-cta-foreground text-sm [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]">
                  1
                </span>
              ) : (
                <span
                  className={cn(
                    "font-extrabold font-heading text-xl",
                    me ? "text-cyan" : "text-muted-foreground",
                  )}
                >
                  {r.rank}
                </span>
              )}
              <span className={cn("truncate", me && "font-bold")}>
                {me ? "Tu" : r.student.displayName}
              </span>
              <span className="font-bold font-heading text-lg tabular-nums">
                {r.xp} XP
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
