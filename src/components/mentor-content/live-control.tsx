"use client";

import { ArrowRight, Eye, Flag, Play, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { getLiveState } from "@/app/live/actions";
import { controlLive } from "@/app/mentor/live/actions";
import { XpBadge } from "@/components/common/status";
import { AVATARS } from "@/components/common/user-avatar";
import { RichText } from "@/components/learning/rich-text";
import { ANSWER_STYLES, AnswerShape } from "@/components/quiz/answer-shape";
import { QuestionCode } from "@/components/quiz/question-code";
import { Button } from "@/components/ui/button";
import type { AvatarId } from "@/lib/data/types";
import { type LiveState, liveXpForRank, secondsLeft } from "@/lib/live";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";

/**
 * Panoul de control al mentorului, de proiectat în clasă: codul mare, jucătorii,
 * întrebarea curentă cu cronometrul, câți au răspuns și clasamentul.
 */
export function LiveControl({
  sessionId,
  className,
}: {
  sessionId: string;
  className: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<LiveState | null>(null);
  const [pending, startTransition] = useTransition();
  const skew = useRef(0);
  const [, setTick] = useState(0);
  const autoRevealed = useRef(0);

  async function refresh() {
    const sentAt = Date.now();
    const s = await getLiveState(sessionId);
    if (!s) return;
    skew.current = Date.parse(s.now) - (sentAt + (Date.now() - sentAt) / 2);
    setState(s);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: interogarea depinde doar de sesiune
  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 1000);
    const tick = setInterval(() => setTick((t) => t + 1), 250);
    return () => {
      clearInterval(timer);
      clearInterval(tick);
    };
  }, [sessionId]);

  function command(action: "start" | "reveal" | "next" | "finish") {
    startTransition(async () => {
      const r = await controlLive(sessionId, action);
      if (!r.ok) toast.error(r.message);
      await refresh();
      if (action === "finish") router.refresh();
    });
  }

  const left = state ? secondsLeft(state, skew.current) : 0;
  // Când expiră timpul sau au răspuns toți, răspunsul corect se arată singur.
  useEffect(() => {
    if (!state || state.status !== "running" || state.reveal || pending) return;
    const everyone = state.players > 0 && state.answered >= state.players;
    if ((left === 0 || everyone) && autoRevealed.current !== state.current) {
      autoRevealed.current = state.current;
      command("reveal");
    }
  });

  if (!state)
    return <p className="text-muted-foreground">Se încarcă sesiunea…</p>;
  const last = state.current >= state.total;

  return (
    <div className="grid gap-6">
      <section className="grid cut gap-4 bg-foreground p-6 text-background lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-bold font-heading text-background/70 text-sm uppercase tracking-[0.2em]">
            {className} ·{" "}
            {state.status === "ended"
              ? "încheiat"
              : state.status === "running"
                ? `întrebarea ${state.current} din ${state.total}`
                : "sala de așteptare"}
          </p>
          <h2 className="mt-1 text-4xl">{state.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-background/80">
            <Users className="size-4" aria-hidden="true" />
            {state.players === 1
              ? "1 jucător a intrat"
              : `${state.players} jucători au intrat`}
          </p>
        </div>
        {state.status !== "ended" && state.code ? (
          <div className="text-center">
            <p className="font-bold font-heading text-background/70 text-xs uppercase tracking-[0.2em]">
              Codul jocului · eduquest › Quiz live
            </p>
            <p className="font-extrabold font-heading text-7xl tabular-nums tracking-[0.15em]">
              {state.code}
            </p>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2">
        {state.status === "lobby" || state.status === "scheduled" ? (
          <Button
            variant="cta"
            size="lg"
            disabled={pending || state.players === 0}
            onClick={() => command("start")}
          >
            <Play /> Începe jocul
          </Button>
        ) : null}
        {state.status === "running" && !state.reveal ? (
          <Button
            size="lg"
            disabled={pending}
            onClick={() => command("reveal")}
          >
            <Eye /> Arată răspunsul
          </Button>
        ) : null}
        {state.status === "running" && state.reveal ? (
          <Button
            variant="cta"
            size="lg"
            disabled={pending}
            onClick={() => command("next")}
          >
            {last ? <Flag /> : <ArrowRight />}
            {last ? "Vezi clasamentul final" : "Următoarea întrebare"}
          </Button>
        ) : null}
        {state.status !== "ended" ? (
          <ConfirmDialog
            title="Închei jocul acum?"
            description="Clasamentul se calculează din răspunsurile de până acum, iar fiecare jucător primește XP-ul locului său."
            confirmLabel="Încheie"
            onConfirm={() => command("finish")}
            trigger={
              <Button variant="ghost" size="lg">
                Încheie jocul
              </Button>
            }
          />
        ) : null}
        {state.status === "lobby" && state.players === 0 ? (
          <p className="self-center text-muted-foreground text-sm">
            Aștept primul jucător…
          </p>
        ) : null}
      </div>

      {state.status === "running" && state.question ? (
        <section className="grid cut gap-4 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-wide">
              Au răspuns {state.answered} din {state.players}
            </p>
            {!state.reveal ? (
              <span
                role="timer"
                className={cn(
                  "slant px-4 py-1 font-extrabold font-heading text-3xl tabular-nums",
                  left <= 5
                    ? "bg-destructive text-white"
                    : "bg-foreground text-background",
                )}
              >
                {left}
              </span>
            ) : null}
          </div>
          <h3 className="text-3xl leading-tight">
            <RichText text={state.question.prompt} />
          </h3>
          {state.question.code ? (
            <QuestionCode code={state.question.code} />
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {state.question.options.map((opt, i) => {
              const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
              const correct = state.reveal && state.question?.correct === i;
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
                <li key={i}>
                  <div
                    className={cn(
                      "flex min-h-16 cut-sm items-center gap-3 px-4 py-3 font-mono text-lg",
                      style.className,
                      state.reveal && !correct && "opacity-40",
                      correct && "ring-4 ring-success ring-offset-2",
                    )}
                  >
                    <AnswerShape index={i} className="size-7" />
                    <span className="min-w-0 flex-1">
                      <RichText text={opt} />
                    </span>
                    {correct ? (
                      <span className="font-bold font-sans text-sm">
                        Corect
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {state.reveal && state.question.explanation ? (
            <p className="text-muted-foreground">
              <RichText text={state.question.explanation} />
            </p>
          ) : null}
        </section>
      ) : null}

      <section aria-labelledby="clasament-live" className="grid gap-3">
        <h3 id="clasament-live" className="flex items-center gap-2 text-2xl">
          <Trophy className="size-5 text-xp-foreground" aria-hidden="true" />
          {state.status === "ended"
            ? "Clasamentul final"
            : state.status === "running"
              ? "Clasament"
              : "Jucători"}
        </h3>
        {state.board.length === 0 ? (
          <p className="text-muted-foreground">
            Niciun jucător încă. Elevii intră din „Quiz live”, cu codul de mai
            sus.
          </p>
        ) : (
          <ol
            className={cn(
              "grid gap-1.5",
              state.status === "lobby" && "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {state.board.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 bg-card px-4 py-2.5"
              >
                {state.status !== "lobby" ? (
                  <span className="w-8 font-extrabold font-heading text-xl tabular-nums">
                    {p.rank}
                  </span>
                ) : null}
                <span aria-hidden="true" className="text-xl">
                  {AVATARS[(p.avatar ?? "fox") as AvatarId]?.emoji ?? "🙂"}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {p.name}
                </span>
                {state.status !== "lobby" ? (
                  <span className="tabular-nums">{p.score} p</span>
                ) : null}
                {state.status === "ended" ? (
                  <XpBadge amount={liveXpForRank(p.rank)} />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
