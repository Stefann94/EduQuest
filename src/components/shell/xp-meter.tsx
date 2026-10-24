import Link from "next/link";
import { cn } from "@/lib/utils";

const STEP = 50;
const SEGMENTS = 10;

/**
 * XP-ul elevului în bara de sus, cu o bară segmentată până la următorul
 * prag de 50 XP (un segment = 5 XP).
 */
export function XpMeter({ xp, href }: { xp: number; href: string }) {
  const next = (Math.floor(xp / STEP) + 1) * STEP;
  const filled = Math.floor(((xp % STEP) / STEP) * SEGMENTS);
  return (
    <Link
      href={href}
      title={`${xp} XP · încă ${next - xp} până la ${next}`}
      className="hidden items-center gap-2.5 px-2 py-1 font-bold font-heading text-[15px] outline-none hover:text-cyan focus-visible:ring-3 focus-visible:ring-ring/70 md:flex"
    >
      <span className="whitespace-nowrap tabular-nums">{xp} XP</span>
      <span className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: segmente fixe
            key={i}
            className={cn(
              "h-4 w-[9px] -skew-x-12",
              i < filled ? "bg-cyan" : "bg-muted",
            )}
          />
        ))}
      </span>
    </Link>
  );
}
