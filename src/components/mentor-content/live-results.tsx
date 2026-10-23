import { Database, Trophy } from "lucide-react";
import { XpBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import type { AvatarId } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";

export type LiveResultRow = {
  studentId: string;
  name: string;
  avatar: AvatarId;
  score: number;
  rank: number;
  xp: number;
  correct?: number;
};

/** Clasamentul final al unei sesiuni live (încheiate acum sau salvate). */
export function LiveResults({
  rows,
  totalQuestions,
}: {
  rows: LiveResultRow[];
  totalQuestions?: number;
}) {
  return (
    <div className="grid gap-4">
      <ol className="stagger grid gap-2" aria-label="Clasament final">
        {rows.map((r) => (
          <li
            key={r.studentId}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5",
              r.rank <= 3 && "border-xp/40 bg-xp-soft/50",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full font-semibold text-sm tabular-nums",
                r.rank <= 3
                  ? "bg-xp text-xp-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              <span className="sr-only">Locul </span>
              {r.rank}
            </span>
            <UserAvatar name={r.name} avatar={r.avatar} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatPoints(r.score)} puncte
                {r.correct !== undefined && totalQuestions
                  ? ` · ${r.correct} din ${totalQuestions} corecte`
                  : ""}
              </p>
            </div>
            {r.rank === 1 ? (
              <Trophy className="size-4 text-xp" aria-hidden="true" />
            ) : null}
            <XpBadge amount={r.xp} />
          </li>
        ))}
      </ol>
      <LiveRules />
    </div>
  );
}

/** Regulile de XP pentru sesiunile live, explicate pe scurt. */
export function LiveRules() {
  return (
    <div className="grid gap-2">
      <Callout tone="neutral">
        <p>
          <strong className="font-medium text-foreground">XP:</strong> locul 1
          primește +5, locul 2 +4, locul 3 +3, locul 4 +2, iar ceilalți
          participanți +1, chiar dacă nu au răspuns corect.
        </p>
        <p className="mt-1">
          <strong className="font-medium text-foreground">Egalitate:</strong> la
          punctaj egal, elevii împart locul și primesc același XP; locul următor
          se sare (de exemplu 1, 2, 2, 4).
        </p>
        <p className="mt-1">
          <strong className="font-medium text-foreground">
            Sesiune încheiată mai devreme:
          </strong>{" "}
          clasamentul se calculează din întrebările la care ai arătat răspunsul
          corect.
        </p>
      </Callout>
      <Callout icon={Database} tone="neutral">
        Punctajele din sesiune și XP-ul se salvează separat: punctajul rămâne în
        istoricul sesiunii, iar XP-ul intră în istoricul de XP al fiecărui elev,
        o singură dată.
      </Callout>
    </div>
  );
}

/** „5.420” (separatorul de mii românesc, identic pe server și în browser). */
export function formatPoints(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
