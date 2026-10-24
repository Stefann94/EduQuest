"use client";

import {
  CheckCircle2,
  Clock,
  Hourglass,
  Radio,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { answerLive, getLiveState, joinLive } from "@/app/live/actions";
import { XpBadge } from "@/components/common/status";
import { AVATARS } from "@/components/common/user-avatar";
import { RichText } from "@/components/learning/rich-text";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvatarId } from "@/lib/data/types";
import { type LiveState, liveXpForRank, secondsLeft } from "@/lib/live";
import { cn } from "@/lib/utils";
import { ANSWER_STYLES, AnswerShape } from "./answer-shape";
import { QuestionCode } from "./question-code";

const STORE = "eduquest:live";
const POLL_MS = 1000;

/** Quiz-ul live pentru elev: codul → sala de așteptare → întrebări → clasamentul final. */
export function LiveGame({ me }: { me: { id: string; name: string } }) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // După o reîncărcare a paginii, elevul rămâne în sesiunea în care intrase.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setSessionId(saved);
    } catch {}
  }, []);

  function enter(id: string | null) {
    setSessionId(id);
    try {
      if (id) sessionStorage.setItem(STORE, id);
      else sessionStorage.removeItem(STORE);
    } catch {}
  }

  return sessionId ? (
    <Game sessionId={sessionId} meId={me.id} onLeave={() => enter(null)} />
  ) : (
    <JoinForm onJoined={enter} />
  );
}

function JoinForm({ onJoined }: { onJoined: (id: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 py-6">
      <div className="text-center">
        <span className="mx-auto grid size-14 hex place-items-center bg-primary text-primary-foreground">
          <Radio className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-4xl">Intră în quiz-ul live</h1>
        <p className="mt-1 text-muted-foreground">
          Scrie codul de 6 cifre afișat de mentor. Intri cu contul tău.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await joinLive(code);
            if (r.ok) onJoined(r.sessionId);
            else setError(r.message);
          });
        }}
        className="grid cut gap-4 bg-card p-6"
      >
        <div className="grid gap-2">
          <Label htmlFor="live-code">Codul sesiunii</Label>
          <Input
            id="live-code"
            inputMode="numeric"
            autoComplete="off"
            maxLength={7}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/[^\d ]/g, ""));
              setError(null);
            }}
            placeholder="000000"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "live-code-error" : undefined}
            className="h-14 text-center font-extrabold font-heading text-3xl tracking-[0.4em]"
            autoFocus
          />
          {error ? (
            <p
              id="live-code-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {error}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          variant="cta"
          size="lg"
          disabled={pending || code.replace(/\s/g, "").length !== 6}
        >
          {pending ? "Se verifică…" : "Intră"}
        </Button>
      </form>
    </div>
  );
}

function Game({
  sessionId,
  meId,
  onLeave,
}: {
  sessionId: string;
  meId: string;
  onLeave: () => void;
}) {
  const [state, setState] = useState<LiveState | null>(null);
  const [lost, setLost] = useState(false);
  const skew = useRef(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    let failures = 0;
    async function poll() {
      const sentAt = Date.now();
      const s = await getLiveState(sessionId);
      if (!alive) return;
      if (!s) {
        failures++;
        if (failures >= 3) setLost(true);
        return;
      }
      failures = 0;
      // Ceasul serverului: diferența față de ceasul dispozitivului (jumătate din drum).
      skew.current = Date.parse(s.now) - (sentAt + (Date.now() - sentAt) / 2);
      setState(s);
    }
    void poll();
    const timer = setInterval(poll, POLL_MS);
    // Cronometrul se actualizează mai des decât starea.
    const tick = setInterval(() => setTick((t) => t + 1), 250);
    return () => {
      alive = false;
      clearInterval(timer);
      clearInterval(tick);
    };
  }, [sessionId]);

  if (lost)
    return (
      <Panel>
        <h1 className="text-3xl">Sesiunea nu mai e disponibilă</h1>
        <p className="text-muted-foreground">
          Poate s-a încheiat sau ai fost scos din clasă.
        </p>
        <Button onClick={onLeave}>Intră cu alt cod</Button>
      </Panel>
    );
  if (!state)
    return (
      <Panel>
        <p className="text-muted-foreground">Se conectează…</p>
      </Panel>
    );

  if (state.status === "ended")
    return <Final state={state} meId={meId} onLeave={onLeave} />;
  if (state.status !== "running" || !state.question)
    return (
      <Panel>
        <span className="mx-auto grid size-14 hex place-items-center bg-primary-soft text-primary">
          <Hourglass className="size-6" aria-hidden="true" />
        </span>
        <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Ești în sesiune
        </p>
        <h1 className="text-4xl">{state.title}</h1>
        <p className="text-muted-foreground" aria-live="polite">
          Așteaptă ca mentorul să pornească jocul ·{" "}
          <span className="inline-flex items-center gap-1">
            <Users className="size-4" aria-hidden="true" />
            {state.players === 1 ? "1 jucător" : `${state.players} jucători`}
          </span>
        </p>
      </Panel>
    );

  return (
    <Question
      key={state.current}
      state={state}
      sessionId={sessionId}
      skew={skew.current}
    />
  );
}

function Question({
  state,
  sessionId,
  skew,
}: {
  state: LiveState;
  sessionId: string;
  skew: number;
}) {
  const q = state.question;
  const [picked, setPicked] = useState<number | null>(
    state.mine?.answer ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const left = secondsLeft(state, skew);
  const answered = picked !== null || state.mine !== null;
  const closed = state.reveal || left === 0;
  if (!q) return null;

  function answer(i: number) {
    if (answered || closed) return;
    setPicked(i);
    startTransition(async () => {
      const r = await answerLive(sessionId, state.current, i);
      if (!r.ok) {
        setError(r.message);
        setPicked(null);
      }
    });
  }

  const mineAnswer = state.mine?.answer ?? picked;
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Întrebarea {state.current} din {state.total}
        </p>
        {state.reveal ? null : (
          <span
            role="timer"
            aria-label={`Timp rămas: ${left} secunde`}
            className={cn(
              "slant inline-flex h-9 items-center gap-1.5 px-4 font-extrabold font-heading text-xl tabular-nums",
              left <= 5
                ? "bg-destructive text-white"
                : "bg-foreground text-background",
            )}
          >
            <Clock className="size-4" aria-hidden="true" />
            {left}
          </span>
        )}
      </div>

      <h1 className="text-3xl leading-tight sm:text-4xl">
        <RichText text={q.prompt} />
      </h1>
      {q.code ? <QuestionCode code={q.code} /> : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
          const isCorrect = state.reveal && q.correct === i;
          const isMine = mineAnswer === i;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
            <li key={i}>
              <button
                type="button"
                disabled={answered || closed || pending}
                onClick={() => answer(i)}
                aria-pressed={isMine}
                className={cn(
                  "flex min-h-20 w-full cut-sm items-center gap-3 px-4 py-3 text-left font-mono text-lg outline-none transition-[opacity,transform] focus-visible:ring-4 focus-visible:ring-ring",
                  style.className,
                  !answered && !closed && "hover:-translate-y-0.5",
                  (answered || closed) && !isMine && !isCorrect && "opacity-40",
                  isCorrect && "ring-4 ring-success ring-offset-2",
                )}
              >
                <AnswerShape index={i} className="size-7" />
                <span className="sr-only">{style.shapeLabel}: </span>
                <span className="min-w-0 flex-1">
                  <RichText text={opt} />
                </span>
                {isMine ? (
                  <span className="font-bold font-sans text-sm">
                    Răspunsul tău
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="min-h-14">
        {error ? <p className="text-destructive">{error}</p> : null}
        {state.reveal ? (
          <RevealNote state={state} />
        ) : answered ? (
          <p className="font-medium">
            Răspuns trimis. Așteaptă să vezi dacă e corect.
          </p>
        ) : closed ? (
          <p className="font-medium">
            Timpul a expirat pentru această întrebare.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RevealNote({ state }: { state: LiveState }) {
  const mine = state.mine;
  return (
    <div className="grid gap-2">
      {mine ? (
        mine.correct ? (
          <p className="flex items-center gap-2 font-bold text-lg text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" /> Corect! +
            {mine.points} puncte
          </p>
        ) : (
          <p className="flex items-center gap-2 font-bold text-destructive text-lg">
            <XCircle className="size-5" aria-hidden="true" /> Greșit. 0 puncte
            la întrebarea asta.
          </p>
        )
      ) : (
        <p className="font-medium text-muted-foreground">
          N-ai răspuns la această întrebare.
        </p>
      )}
      {state.question?.explanation ? (
        <p className="text-muted-foreground">
          <RichText text={state.question.explanation} />
        </p>
      ) : null}
    </div>
  );
}

function Final({
  state,
  meId,
  onLeave,
}: {
  state: LiveState;
  meId: string;
  onLeave: () => void;
}) {
  const mine = state.board.find((p) => p.id === meId);
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div className="grid cut gap-3 bg-foreground p-6 text-center text-background">
        <Trophy className="mx-auto size-10 text-xp" aria-hidden="true" />
        <p className="font-bold font-heading text-background/70 text-sm uppercase tracking-[0.2em]">
          {state.title}
        </p>
        {mine ? (
          <>
            <h1 className="text-5xl">Locul {mine.rank}</h1>
            <p className="text-background/80">
              {mine.score} puncte din{" "}
              {state.board.length === 1
                ? "1 jucător"
                : `${state.board.length} jucători`}
            </p>
            <XpBadge amount={liveXpForRank(mine.rank)} className="mx-auto" />
          </>
        ) : (
          <h1 className="text-4xl">Jocul s-a încheiat</h1>
        )}
      </div>
      <ol className="grid gap-1.5">
        {state.board.map((p) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5",
              p.id === meId ? "bg-primary-soft font-semibold" : "bg-card",
            )}
          >
            <span className="w-8 font-extrabold font-heading text-xl tabular-nums">
              {p.rank}
            </span>
            <span aria-hidden="true" className="text-xl">
              {AVATARS[(p.avatar ?? "fox") as AvatarId]?.emoji ?? "🙂"}
            </span>
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span className="tabular-nums">{p.score} p</span>
            <XpBadge amount={liveXpForRank(p.rank)} />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "cta" })}>
          Înapoi acasă
        </Link>
        <Button variant="outline" onClick={onLeave}>
          Intră în alt joc
        </Button>
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-xl justify-items-center gap-4 cut bg-card p-8 text-center">
      {children}
    </div>
  );
}
