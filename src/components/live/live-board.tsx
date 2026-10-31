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
  showGain = false,
  limit,
  large = false,
}: {
  board: LivePlayer[];
  meId?: string;
  showXp?: boolean;
  /** După o rundă: câte puncte a luat fiecare la ultima întrebare („+x”). */
  showGain?: boolean;
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
            showGain={showGain}
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
          <Row p={me} me showXp={showXp} showGain={showGain} large={large} />
        </ol>
      ) : null}
    </div>
  );
}

function Row({
  p,
  me,
  showXp,
  showGain,
  large,
}: {
  p: LivePlayer;
  me: boolean;
  showXp: boolean;
  showGain: boolean;
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
      {showGain ? (
        <span
          className={cn(
            "pop-in shrink-0 px-2 py-0.5 font-bold font-heading text-sm tabular-nums",
            p.gained
              ? "bg-success-soft text-success"
              : "bg-muted text-muted-foreground",
          )}
        >
          +{p.gained ?? 0}
          <span className="sr-only"> puncte la ultima întrebare</span>
        </span>
      ) : null}
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

const PODIUM = [
  {
    place: 2,
    height: "h-24",
    color: "bg-secondary-foreground text-background",
    delay: "150ms",
  },
  { place: 1, height: "h-36", color: "bg-xp text-white", delay: "0ms" },
  {
    place: 3,
    height: "h-16",
    color: "bg-primary text-primary-foreground",
    delay: "300ms",
  },
];

/** Podiumul de la finalul quiz-ului live: primii trei, cu personajele lor. */
export function LivePodium({
  board,
  meId,
}: {
  board: LivePlayer[];
  meId?: string;
}) {
  if (board.length === 0) return null;
  return (
    <ol
      aria-label="Podium"
      className="mx-auto grid w-full max-w-xl grid-cols-3 items-end gap-2 sm:gap-4"
    >
      {PODIUM.map(({ place, height, color, delay }) => {
        // La egalitate, mai mulți elevi pot avea același loc: luăm al n-lea din clasament.
        const p = board[place - 1];
        if (!p) return <li key={place} aria-hidden="true" />;
        return (
          <li
            key={place}
            className="podium-rise grid justify-items-center gap-2 text-center"
            style={{ animationDelay: delay }}
          >
            <span
              aria-hidden="true"
              className={cn(place === 1 ? "text-6xl" : "text-5xl")}
            >
              {AVATARS[(p.avatar ?? "fox") as AvatarId]?.emoji ?? "🙂"}
            </span>
            <span
              className={cn(
                "w-full truncate font-bold font-heading",
                p.id === meId && "text-primary",
              )}
            >
              {p.name}
              {p.id === meId ? " (tu)" : ""}
            </span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {p.score} p
            </span>
            <span
              className={cn(
                "grid w-full cut-sm place-items-center font-extrabold font-heading text-4xl",
                height,
                color,
              )}
            >
              <span className="sr-only">Locul </span>
              {p.rank}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
