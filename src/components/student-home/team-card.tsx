import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import type { AvatarId } from "@/lib/data/types";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

// Culoarea fiecărei clase, pe rând: muștar, verde, teracotă, portocaliu.
const ACCENTS = [
  { badge: "bg-cta text-cta-foreground", bar: "bg-cta" },
  { badge: "bg-cyan text-cyan-foreground", bar: "bg-cyan" },
  { badge: "bg-primary text-primary-foreground", bar: "bg-primary" },
  { badge: "bg-warning text-white", bar: "bg-warning" },
];

export const teamAccent = (index: number) => ACCENTS[index % ACCENTS.length];

/** O clasă ca „echipă”: program, nume, mentor, colegi și prezența. */
export function TeamCard({
  href,
  index,
  badge,
  title,
  subtitle,
  members,
  memberCount,
  progress,
}: {
  href: string;
  index: number;
  badge: string;
  title: string;
  subtitle: string;
  members?: { name: string; avatar?: AvatarId }[];
  memberCount?: number;
  /** Segmente pline din total (ex. prezențe din întâlniri). */
  progress?: { done: number; total: number; label: string };
}) {
  const accent = teamAccent(index);
  return (
    <Link
      href={href}
      className="group flex h-full cut flex-col bg-card p-5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset"
    >
      <span
        className={cn(
          "slant w-fit px-3 py-0.5 font-bold font-heading text-[13px] uppercase tracking-widest",
          accent.badge,
        )}
      >
        {badge}
      </span>
      <h3 className="mt-3 font-extrabold text-[26px] leading-none">{title}</h3>
      <p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>

      {members && memberCount ? (
        <div className="mt-4 flex items-center">
          {members.map((m) => (
            <UserAvatar
              key={m.name}
              name={m.name}
              avatar={m.avatar}
              size="sm"
              className="-mr-1.5"
            />
          ))}
          {memberCount > members.length ? (
            <span className="hex -mr-1.5 grid size-8 place-items-center bg-warning font-extrabold font-heading text-white text-xs">
              +{memberCount - members.length}
            </span>
          ) : null}
          <span className="ml-4 text-muted-foreground text-sm">
            {plural(memberCount, "elev", "elevi")}
          </span>
        </div>
      ) : null}

      {progress ? (
        <div className="mt-auto pt-4">
          <p className="mb-1.5 text-muted-foreground text-xs">
            {progress.label}
          </p>
          <div className="flex gap-[3px]" aria-hidden="true">
            {Array.from({ length: progress.total }, (_, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: segmente fixe
                key={i}
                className={cn(
                  "h-2 flex-1 -skew-x-12",
                  i < progress.done ? accent.bar : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </Link>
  );
}
