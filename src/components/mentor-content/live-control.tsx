"use client";

import {
  ArrowRight,
  BarChart3,
  Eye,
  Flag,
  Play,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { getLiveState } from "@/app/live/actions";
import { controlLive } from "@/app/mentor/live/actions";
import { AVATARS } from "@/components/common/user-avatar";
import { RichText } from "@/components/learning/rich-text";
import {
  LiveAnswerShape,
  liveAnswerStyle,
  optionCellClass,
  optionGridClass,
} from "@/components/live/answer-styles";
import { LiveBoard } from "@/components/live/live-board";
import {
  MultiAnswerLabel,
  OptionCounts,
} from "@/components/live/option-counts";
import { QuestionCode } from "@/components/quiz/question-code";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AvatarId } from "@/lib/data/types";
import {
  type LivePhase,
  type LiveState,
  livePhase,
  secondsLeft,
} from "@/lib/live";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";

type Action = "start" | "reveal" | "board" | "next" | "finish";

/**
 * Panoul de control al mentorului, de proiectat în clasă. Pentru fiecare întrebare:
 * cronometrul și câți au răspuns → răspunsul corect cu câți au ales fiecare variantă
 * (se arată singur când expiră timpul sau au răspuns toți) → clasamentul de până acum
 * → următoarea întrebare. La final: clasamentul cu punctele și XP-ul primit.
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
  // O singură comandă odată, iar dezvăluirea automată o singură dată pe întrebare.
  const inflight = useRef(false);
  const autoRevealed = useRef(0);
  // Răspunsurile vechi, sosite după unele mai noi, nu suprascriu starea.
  const seq = useRef(0);
  const applied = useRef(0);

  async function refresh() {
    const id = ++seq.current;
    const sentAt = Date.now();
    const s = await getLiveState(sessionId);
    if (!s || id < applied.current) return;
    applied.current = id;
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

  function command(action: Action) {
    if (inflight.current) return;
    inflight.current = true;
    const ends =
      action === "finish" ||
      (action === "next" && !!state && state.current >= state.total);
    startTransition(async () => {
      try {
        const r = await controlLive(sessionId, action);
        if (!r.ok) toast.error(r.message);
        await refresh();
        if (ends) router.refresh();
      } finally {
        inflight.current = false;
      }
    });
  }

  const phase: LivePhase | null = state ? livePhase(state) : null;
  const left = state ? secondsLeft(state, skew.current) : 0;

  // Când expiră timpul sau au răspuns toți, răspunsul corect se arată singur (o dată).
  useEffect(() => {
    if (!state || phase !== "question") return;
    const everyone = state.players > 0 && state.answered >= state.players;
    if ((left === 0 || everyone) && autoRevealed.current !== state.current) {
      autoRevealed.current = state.current;
      command("reveal");
    }
  });

  if (!state || !phase)
    return <p className="text-muted-foreground">Se încarcă sesiunea…</p>;
  const last = state.current >= state.total;

  return (
    <div className="grid gap-6">
      <p className="sr-only" aria-live="polite">
        {announce(state, phase)}
      </p>

      <Header state={state} phase={phase} className={className} />

      <div className="flex flex-wrap items-center gap-2">
        {phase === "lobby" ? (
          <Button
            variant="cta"
            size="lg"
            disabled={pending || state.players === 0}
            onClick={() => command("start")}
          >
            <Play /> Începe jocul
          </Button>
        ) : null}
        {phase === "question" ? (
          <Button
            size="lg"
            disabled={pending}
            onClick={() => command("reveal")}
          >
            <Eye /> Arată răspunsul acum
          </Button>
        ) : null}
        {phase === "reveal" ? (
          <Button
            variant="cta"
            size="lg"
            disabled={pending}
            onClick={() => command("board")}
          >
            <BarChart3 /> Arată clasamentul
          </Button>
        ) : null}
        {phase === "board" ? (
          <Button
            variant="cta"
            size="lg"
            disabled={pending}
            onClick={() => command("next")}
          >
            {last ? <Flag /> : <ArrowRight />}
            {last ? "Încheie și dă XP-ul" : "Următoarea întrebare"}
          </Button>
        ) : null}
        {phase !== "ended" ? (
          <ConfirmDialog
            title="Închei jocul acum?"
            description="Clasamentul se calculează din răspunsurile de până acum, iar fiecare jucător primește XP-ul locului său (5, 4, 3, 2, apoi 1 XP)."
            confirmLabel="Încheie"
            onConfirm={() => command("finish")}
            trigger={
              <Button variant="ghost" size="lg" disabled={pending}>
                Încheie acum
              </Button>
            }
          />
        ) : null}
        {phase === "lobby" && state.players === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aștept primul jucător…
          </p>
        ) : null}
        {phase === "question" ? (
          <p className="text-muted-foreground text-sm">
            Răspunsul se arată singur când expiră timpul sau au răspuns toți.
          </p>
        ) : null}
      </div>

      {phase === "lobby" ? <Lobby state={state} /> : null}
      {phase === "question" ? (
        <QuestionStage state={state} left={left} />
      ) : null}
      {phase === "reveal" ? <RevealStage state={state} /> : null}
      {phase === "board" ? (
        <section aria-labelledby="clasament-live" className="grid gap-3">
          <h3 id="clasament-live" className="flex items-center gap-2 text-3xl">
            <Trophy className="size-6 text-xp-foreground" aria-hidden="true" />
            Clasamentul după întrebarea {state.current} din {state.total}
          </h3>
          <p className="text-muted-foreground">
            Puncte din acest quiz: 500 pentru răspunsul corect, plus până la 500
            pentru viteză. XP-ul se dă la final, după loc.
          </p>
          <LiveBoard board={state.board} limit={10} large />
        </section>
      ) : null}
      {phase === "ended" ? <Ended state={state} /> : null}
    </div>
  );
}

function announce(state: LiveState, phase: LivePhase) {
  if (phase === "lobby")
    return `Sala de așteptare: ${state.players} jucători au intrat.`;
  if (phase === "question")
    return `Întrebarea ${state.current} din ${state.total}.`;
  if (phase === "reveal") return "Răspunsul corect e afișat.";
  if (phase === "board") return "Clasamentul de până acum e afișat.";
  return "Jocul s-a încheiat. Clasamentul final e afișat.";
}

function Header({
  state,
  phase,
  className,
}: {
  state: LiveState;
  phase: LivePhase;
  className: string;
}) {
  const label =
    phase === "ended"
      ? "încheiat"
      : phase === "lobby"
        ? "sala de așteptare"
        : `întrebarea ${state.current} din ${state.total}`;
  return (
    <section className="grid cut gap-4 bg-foreground p-6 text-background lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="font-bold font-heading text-background/70 text-sm uppercase tracking-[0.2em]">
          {className} · {label}
        </p>
        <h2 className="mt-1 text-4xl">{state.title}</h2>
        <p className="mt-2 flex items-center gap-2 text-background/80">
          <Users className="size-4" aria-hidden="true" />
          {state.players === 1
            ? "1 jucător a intrat"
            : `${state.players} jucători au intrat`}
        </p>
      </div>
      {phase !== "ended" && state.code ? (
        <div className="text-center">
          <p className="font-bold font-heading text-background/70 text-xs uppercase tracking-[0.2em]">
            Codul jocului · EduQuest › Quiz live
          </p>
          <p
            className={cn(
              "font-extrabold font-heading tabular-nums tracking-[0.15em]",
              phase === "lobby" ? "text-7xl sm:text-8xl" : "text-3xl",
            )}
          >
            {state.code}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Lobby({ state }: { state: LiveState }) {
  return (
    <section aria-labelledby="jucatori-live" className="grid gap-3">
      <h3 id="jucatori-live" className="flex items-center gap-2 text-2xl">
        <Users className="size-5 text-primary" aria-hidden="true" />
        Jucători ({state.players})
      </h3>
      {state.board.length === 0 ? (
        <p className="text-muted-foreground">
          Niciun jucător încă. Elevii intră din „Quiz live”, cu codul de mai
          sus.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {state.board.map((p) => (
            <li
              key={p.id}
              className="flex cut-sm items-center gap-3 bg-card px-4 py-3 motion-safe:animate-in motion-safe:fade-in"
            >
              <span aria-hidden="true" className="text-2xl">
                {AVATARS[(p.avatar ?? "fox") as AvatarId]?.emoji ?? "🙂"}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {p.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function QuestionStage({ state, left }: { state: LiveState; left: number }) {
  const q = state.question;
  if (!q) return null;
  const answeredPct = state.players
    ? Math.min(100, (state.answered / state.players) * 100)
    : 0;
  const timePct = state.seconds
    ? Math.min(100, (left / state.seconds) * 100)
    : 0;
  return (
    <section className="grid cut gap-5 bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <span
          role="timer"
          aria-label={`Timp rămas: ${left} secunde`}
          className={cn(
            "slant grid min-w-28 place-items-center px-6 py-2 font-extrabold font-heading text-5xl tabular-nums",
            left <= 5
              ? "bg-destructive text-white"
              : "bg-foreground text-background",
          )}
        >
          {left}
        </span>
        <div className="grid gap-2">
          <div className="h-2 bg-muted" aria-hidden="true">
            <div
              className={cn(
                "h-full transition-[width] duration-300 ease-linear motion-reduce:transition-none",
                left <= 5 ? "bg-destructive" : "bg-foreground",
              )}
              style={{ width: `${timePct}%` }}
            />
          </div>
          <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-wide">
            Au răspuns {state.answered} din {state.players}
          </p>
          <div className="h-3 bg-muted" aria-hidden="true">
            <div
              className="h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${answeredPct}%` }}
            />
          </div>
        </div>
      </div>
      <h3 className="text-3xl leading-tight sm:text-4xl">
        <RichText text={q.prompt} />
      </h3>
      {q.code ? <QuestionCode code={q.code} /> : null}
      {q.multi ? <MultiAnswerLabel className="text-sm" /> : null}
      <ul className={cn("grid gap-3", optionGridClass(q.options.length))}>
        {q.options.map((opt, i) => {
          const style = liveAnswerStyle(i);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
            <li key={i} className={optionCellClass(q.options.length, i)}>
              <div
                className={cn(
                  "flex h-full min-h-16 cut-sm items-center gap-3 px-4 py-3 font-mono text-lg",
                  style.className,
                )}
              >
                <LiveAnswerShape index={i} className="size-7" />
                <span className="sr-only">{style.shapeLabel}: </span>
                <span className="min-w-0 flex-1">
                  <RichText text={opt} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RevealStage({ state }: { state: LiveState }) {
  const q = state.question;
  if (!q) return null;
  // La o întrebare cu mai multe răspunsuri, numărătorile sunt pe variante, nu pe elevi.
  const right =
    q.correct !== undefined && !q.multi
      ? (q.counts?.[q.correct] ?? 0)
      : undefined;
  return (
    <section className="grid cut gap-4 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Răspunsul corect
        </p>
        {right !== undefined ? (
          <p className="font-bold font-heading text-lg">
            {right} din {state.players} au răspuns corect
          </p>
        ) : q.multi ? (
          <p className="font-bold font-heading text-lg">
            Au răspuns {state.answered} din {state.players}
          </p>
        ) : null}
      </div>
      <h3 className="text-2xl leading-tight sm:text-3xl">
        <RichText text={q.prompt} />
      </h3>
      {q.code ? <QuestionCode code={q.code} /> : null}
      {q.multi ? <MultiAnswerLabel className="text-sm" /> : null}
      <OptionCounts
        options={q.options}
        counts={q.counts}
        correct={q.correct}
        multi={!!q.multi}
        answered={state.answered}
        large
      />
      {q.explanation ? (
        <p className="text-lg text-muted-foreground">
          <RichText text={q.explanation} />
        </p>
      ) : null}
    </section>
  );
}

function Ended({ state }: { state: LiveState }) {
  return (
    <section aria-labelledby="clasament-final" className="grid gap-4">
      <div className="grid cut gap-2 bg-xp-soft p-6">
        <h3
          id="clasament-final"
          className="flex items-center gap-2 text-3xl text-xp-foreground"
        >
          <Trophy className="size-7" aria-hidden="true" />
          Clasamentul final
        </h3>
        <p className="flex items-start gap-2">
          <Star
            className="mt-1 size-4 shrink-0 fill-xp text-xp"
            aria-hidden="true"
          />
          Punctele sunt doar ale acestui quiz. Fiecare elev a primit XP după
          locul final (locul 1: 5 XP, 2: 4, 3: 3, 4: 2, restul 1 XP), adăugat la
          XP-ul lui din clasă.
        </p>
      </div>
      {state.board.length === 0 ? (
        <p className="text-muted-foreground">Niciun jucător n-a intrat.</p>
      ) : (
        <LiveBoard board={state.board} showXp large />
      )}
      <div>
        <Link
          href="/mentor/quiz/live"
          className={buttonVariants({ variant: "outline" })}
        >
          Înapoi la sesiunile live
        </Link>
      </div>
    </section>
  );
}
