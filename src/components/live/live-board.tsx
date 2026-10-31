import { XpBadge } from "@/components/common/status";
import { AVATARS } from "@/components/common/user-avatar";
import type { AvatarId } from "@/lib/data/types";
import { type LivePlayer, playerXp } from "@/lib/live";
import { cn } from "@/lib/utils";

const RANK_STYLES = [
  "bg-xp text-white",
  "bg-secondary-foreground text-background",
  "bg-primary text-primary-foreground",
];

/**
 * Clasamentul quiz-ului live, după punctele din quiz (nu după XP). La final arată și
 * XP-ul primit de fiecare. Rândul elevului e evidențiat; dacă e sub limită, apare la sfârșit.
 */
export function LiveBoard({
  board,
  meId,
  showXp = false,
  limit,
  large = false,
}: {
  board: LivePlayer[];
  meId?: string;
  showXp?: boolean;
  limit?: number;
  large?: boolean;
}) {
  const shown = limit ? board.slice(0, limit) : board;
  const me = meId ? board.find((p) => p.id === meId) : undefined;
  const meHidden = me && !shown.some((p) => p.id === me.id);
  const rest = board.length - shown.length - (meHidden ? 1 : 0);

  return (
    <div className="grid gap-1.5">
      <ol className="grid gap-1.5">
        {shown.map((p) => (
          <Row
            key={p.id}
            p={p}
            me={p.id === meId}
            showXp={showXp}
            large={large}
          />
        ))}
      </ol>
      {meHidden || rest > 0 ? (
        <p className="px-4 text-muted-foreground text-sm">
          {rest > 0
            ? `… încă ${rest === 1 ? "un jucător" : `${rest} jucători`}`
            : "…"}
        </p>
      ) : null}
      {meHidden && me ? (
        <ol>
          <Row p={me} me showXp={showXp} large={large} />
        </ol>
      ) : null}
    </div>
  );
}

function Row({
  p,
  me,
  showXp,
  large,
}: {
  p: LivePlayer;
  me: boolean;
  showXp: boolean;
  large: boolean;
}) {
  return (
    <li
      aria-current={me ? "true" : undefined}
      className={cn(
        "flex items-center gap-3 px-4",
        large ? "py-3 text-lg" : "py-2.5",
        me
          ? "bg-primary-soft font-semibold ring-2 ring-primary ring-inset"
          : "bg-card",
      )}
    >
      <span
        className={cn(
          "grid shrink-0 cut-xs place-items-center font-extrabold font-heading tabular-nums",
          large ? "size-10 text-xl" : "size-8 text-lg",
          RANK_STYLES[p.rank - 1] ?? "bg-muted text-foreground",
        )}
      >
        <span className="sr-only">Locul </span>
        {p.rank}
      </span>
      <span aria-hidden="true" className="text-xl">
        {AVATARS[(p.avatar ?? "fox") as AvatarId]?.emoji ?? "🙂"}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {p.name}
        {me ? <span className="text-muted-foreground"> (tu)</span> : null}
      </span>
      <span className="font-bold font-heading tabular-nums">
        {p.score}
        <span aria-hidden="true" className="text-muted-foreground text-sm">
          {" "}
          p
        </span>
        <span className="sr-only"> puncte</span>
      </span>
      {showXp ? <XpBadge amount={playerXp(p)} /> : null}
    </li>
  );
}
