"use client";

import {
  CheckCircle2,
  Clock,
  Hourglass,
  Radio,
  Star,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { answerLive, getLiveState, joinLive } from "@/app/live/actions";
import { RichText } from "@/components/learning/rich-text";
import {
  LiveAnswerShape,
  liveAnswerStyle,
  optionCellClass,
  optionGridClass,
} from "@/components/live/answer-styles";
import { LiveBoard } from "@/components/live/live-board";
import { OptionCounts } from "@/components/live/option-counts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type LivePhase,
  type LiveState,
  livePhase,
  playerXp,
  secondsLeft,
} from "@/lib/live";
import { cn } from "@/lib/utils";
import { QuestionCode } from "./question-code";

const STORE = "eduquest:live";
const POLL_MS = 1000;

/**
 * Quiz-ul live pentru elev: codul → sala de așteptare → pentru fiecare întrebare:
 * variantele, apoi câți au ales fiecare variantă, apoi clasamentul → clasamentul final și XP-ul.
 */
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
    // Răspunsurile vechi, sosite după unele mai noi, nu suprascriu starea.
    let seq = 0;
    let applied = 0;
    async function poll() {
      const id = ++seq;
      const sentAt = Date.now();
      const s = await getLiveState(sessionId);
      if (!alive) return;
      if (!s) {
        failures++;
        if (failures >= 3) setLost(true);
        return;
      }
      failures = 0;
      if (id < applied) return;
      applied = id;
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

  const phase = livePhase(state);
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announce(state, phase, meId)}
      </p>
      {phase === "ended" ? (
        <Final state={state} meId={meId} onLeave={onLeave} />
      ) : phase === "lobby" ? (
        <Panel>
          <span className="mx-auto grid size-14 hex place-items-center bg-primary-soft text-primary">
            <Hourglass className="size-6" aria-hidden="true" />
          </span>
          <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-[0.2em]">
            Ești în sesiune
          </p>
          <h1 className="text-4xl">{state.title}</h1>
          <p className="text-muted-foreground">
            Așteaptă ca mentorul să pornească jocul ·{" "}
            <span className="inline-flex items-center gap-1">
              <Users className="size-4" aria-hidden="true" />
              {state.players === 1 ? "1 jucător" : `${state.players} jucători`}
            </span>
          </p>
        </Panel>
      ) : (
        <Round
          key={state.current}
          state={state}
          phase={phase}
          sessionId={sessionId}
          meId={meId}
          skew={skew.current}
        />
      )}
    </>
  );
}

/** Ce aude un cititor de ecran când se schimbă etapa jocului. */
function announce(state: LiveState, phase: LivePhase, meId: string) {
  if (phase === "lobby") return "Ești în sala de așteptare.";
  if (phase === "question")
    return `Întrebarea ${state.current} din ${state.total}.`;
  if (phase === "reveal") {
    const m = state.mine;
    if (!m) return "Răspunsul corect e afișat. N-ai răspuns.";
    return m.correct
      ? `Corect! Plus ${m.points ?? 0} puncte.`
      : "Greșit. Răspunsul corect e afișat.";
  }
  const me = state.board.find((p) => p.id === meId);
  if (phase === "board")
    return me
      ? `Clasament: ești pe locul ${me.rank} din ${state.board.length}.`
      : "Clasamentul e afișat.";
  return me
    ? `Jocul s-a încheiat. Locul ${me.rank}. Ai primit ${playerXp(me)} XP.`
    : "Jocul s-a încheiat.";
}

/** O întrebare: variantele → răspunsul corect cu câți au ales fiecare → clasamentul. */
function Round({
  state,
  phase,
  sessionId,
  meId,
  skew,
}: {
  state: LiveState;
  phase: LivePhase;
  sessionId: string;
  meId: string;
  skew: number;
}) {
  const q = state.question;
  const [picked, setPicked] = useState<number | null>(
    state.mine?.answer ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const left = secondsLeft(state, skew);
  if (!q) return null;

  const answered = picked !== null || state.mine !== null;
  const closed = phase !== "question" || left === 0;
  const mineAnswer = state.mine?.answer ?? picked;

  function answer(i: number) {
    if (answered || closed) return;
    setPicked(i);
    setError(null);
    startTransition(async () => {
      const r = await answerLive(sessionId, state.current, i);
      if (!r.ok) {
        setError(r.message);
        setPicked(null);
      }
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold font-heading text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Întrebarea {state.current} din {state.total}
        </p>
        {phase === "question" ? (
          <span
            role="timer"
            aria-label={`Timp rămas: ${left} secunde`}
            className={cn(
              "slant inline-flex h-10 items-center gap-1.5 px-4 font-extrabold font-heading text-2xl tabular-nums",
              left <= 5
                ? "bg-destructive text-white"
                : "bg-foreground text-background",
            )}
          >
            <Clock className="size-4" aria-hidden="true" />
            {left}
          </span>
        ) : (
          <span className="slant inline-flex h-8 items-center bg-secondary px-4 font-bold font-heading text-secondary-foreground text-xs uppercase tracking-wide">
            {phase === "board" ? "Clasament" : "Răspunsul corect"}
          </span>
        )}
      </div>

      {phase === "question" ? (
        <>
          <h1 className="text-3xl leading-tight sm:text-4xl">
            <RichText text={q.prompt} />
          </h1>
          {q.code ? <QuestionCode code={q.code} /> : null}
          <ul className={cn("grid gap-3", optionGridClass(q.options.length))}>
            {q.options.map((opt, i) => {
              const style = liveAnswerStyle(i);
              const isMine = mineAnswer === i;
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
                <li key={i} className={optionCellClass(q.options.length, i)}>
                  <button
                    type="button"
                    disabled={answered || closed || pending}
                    onClick={() => answer(i)}
                    aria-pressed={isMine}
                    className={cn(
                      "flex h-full min-h-20 w-full cut-sm items-center gap-3 px-4 py-3 text-left font-mono text-lg outline-none transition-[opacity,transform] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset",
                      style.className,
                      !answered && !closed && "hover:-translate-y-0.5",
                      (answered || closed) && !isMine && "opacity-35",
                    )}
                  >
                    <LiveAnswerShape index={i} className="size-7" />
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
          <div className="min-h-14">
            {error ? (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            ) : null}
            {answered ? (
              <p className="flex items-center gap-2 font-medium text-lg">
                <Hourglass
                  className="size-5 text-primary motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                Răspuns trimis, așteaptă…
              </p>
            ) : closed ? (
              <p className="font-medium text-lg">
                Timpul a expirat pentru această întrebare.
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      {phase === "reveal" ? (
        <>
          <ResultBanner state={state} />
          <h1 className="text-2xl leading-tight sm:text-3xl">
            <RichText text={q.prompt} />
          </h1>
          {q.code ? <QuestionCode code={q.code} /> : null}
          <OptionCounts
            options={q.options}
            counts={q.counts}
            correct={q.correct}
            mine={mineAnswer}
          />
          {q.explanation ? (
            <p className="text-muted-foreground">
              <RichText text={q.explanation} />
            </p>
          ) : null}
          <p className="flex items-center gap-2 text-muted-foreground">
            <Hourglass className="size-4" aria-hidden="true" />
            Urmează clasamentul…
          </p>
        </>
      ) : null}

      {phase === "board" ? <BoardView state={state} meId={meId} /> : null}
    </div>
  );
}

function ResultBanner({ state }: { state: LiveState }) {
  const mine = state.mine;
  if (!mine)
    return (
      <div className="flex cut items-center gap-3 bg-muted p-5">
        <Clock className="size-8 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-extrabold font-heading text-2xl uppercase">
            N-ai răspuns
          </p>
          <p className="text-muted-foreground">
            0 puncte la această întrebare.
          </p>
        </div>
      </div>
    );
  return mine.correct ? (
    <div className="flex cut flex-wrap items-center gap-3 bg-success p-5 text-white">
      <CheckCircle2 className="size-9 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold font-heading text-3xl uppercase">
          Corect!
        </p>
        <p className="text-white/85">
          Cu cât răspunzi mai repede, cu atât primești mai multe puncte.
        </p>
      </div>
      <p className="font-extrabold font-heading text-4xl tabular-nums">
        +{mine.points ?? 0}
        <span className="text-lg text-white/80"> puncte</span>
      </p>
    </div>
  ) : (
    <div className="flex cut items-center gap-3 bg-destructive p-5 text-white">
      <XCircle className="size-9 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold font-heading text-3xl uppercase">Greșit</p>
        <p className="text-white/85">
          0 puncte la această întrebare. Varianta corectă e marcată mai jos.
        </p>
      </div>
    </div>
  );
}

function BoardView({ state, meId }: { state: LiveState; meId: string }) {
  const me = state.board.find((p) => p.id === meId);
  return (
    <section aria-labelledby="clasament-acum" className="grid gap-4">
      <h1 id="clasament-acum" className="flex items-center gap-2 text-3xl">
        <Trophy className="size-6 text-xp-foreground" aria-hidden="true" />
        Clasamentul de până acum
      </h1>
      {me ? (
        <div className="grid cut gap-2 bg-foreground p-5 text-background sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-bold font-heading text-background/70 text-xs uppercase tracking-[0.2em]">
              Locul tău
            </p>
            <p className="font-extrabold font-heading text-5xl tabular-nums">
              {me.rank}
              <span className="text-2xl text-background/70">
                {" "}
                din {state.board.length}
              </span>
            </p>
          </div>
          <p className="font-extrabold font-heading text-3xl tabular-nums">
            {me.score}
            <span className="text-background/70 text-lg"> puncte</span>
          </p>
        </div>
      ) : null}
      <LiveBoard board={state.board} meId={meId} limit={10} />
      <p className="text-muted-foreground text-sm">
        Punctele sunt doar ale acestui quiz, nu XP. XP-ul îl primești la final,
        după locul tău.
      </p>
    </section>
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
          {state.title} · clasamentul final
        </p>
        {mine ? (
          <>
            <h1 className="text-5xl">Locul {mine.rank}</h1>
            <p className="text-background/80">
              {mine.score} puncte ·{" "}
              {state.board.length === 1
                ? "1 jucător"
                : `${state.board.length} jucători`}
            </p>
          </>
        ) : (
          <h1 className="text-4xl">Jocul s-a încheiat</h1>
        )}
      </div>

      {mine ? (
        <div className="grid cut gap-2 bg-xp-soft p-6 text-center">
          <p className="flex items-center justify-center gap-2 font-extrabold font-heading text-4xl text-xp-foreground tabular-nums">
            <Star className="size-8 fill-xp text-xp" aria-hidden="true" />
            Ai primit +{playerXp(mine)} XP
          </p>
          <p className="text-muted-foreground text-sm">
            Punctele din clasament ({mine.score}) sunt doar ale acestui quiz.
            XP-ul se dă după locul final (5 pentru locul 1, apoi 4, 3, 2 și 1)
            și s-a adăugat la XP-ul tău din clasă.
          </p>
        </div>
      ) : null}

      <LiveBoard board={state.board} meId={meId} showXp />

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
