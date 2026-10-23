"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock,
  Hourglass,
  Info,
  Play,
  Radio,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { answerLive, type JoinLiveState, joinLive } from "@/app/live/actions";
import { XpBadge } from "@/components/common/status";
import { AVATARS } from "@/components/common/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  LiveAnswer,
  LiveRoundResult,
  LiveSessionInfo,
  LiveStanding,
} from "@/lib/data/student-activity-queries";
import type { AvatarId } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ANSWER_STYLES, AnswerShape } from "./answer-shape";
import { QuestionCode } from "./question-code";

const QUESTION_MS = 20_000;
type Round = Extract<LiveRoundResult, { ok: true }>;
type Phase = "lobby" | "question" | "waiting" | "reveal" | "results";

const INITIAL: JoinLiveState = { status: "idle" };

/** Quiz-ul live pentru elev: cod → lobby → întrebări → rezultate. */
export function LiveGame({ me }: { me: { name: string; avatar: AvatarId } }) {
  const [state, join, pending] = useActionState(joinLive, INITIAL);
  const [code, setCode] = useState("");

  if (state.status === "joined")
    return <Session session={state.session} me={me} />;

  const error = state.status === "error" ? state.message : null;
  return (
    <div className="mx-auto grid w-full max-w-md gap-6 py-6">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <Radio className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-semibold text-2xl tracking-tight">
          Intră în quiz-ul live
        </h1>
        <p className="mt-1 text-muted-foreground">
          Introdu codul afișat de mentor. Intri cu contul tău, fără alt cont
          separat.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData();
          data.set("code", code);
          startTransition(() => join(data));
        }}
        className="grid gap-4 rounded-xl border bg-card p-6 shadow-xs"
      >
        <div className="grid gap-2">
          <Label htmlFor="live-code">Codul sesiunii</Label>
          <Input
            id="live-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder="000000"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "live-code-error" : "live-code-hint"}
            className="h-14 text-center font-mono text-2xl tracking-[0.4em] md:text-2xl"
          />
          {error ? (
            <p
              id="live-code-error"
              role="alert"
              className="flex items-start gap-1.5 text-destructive text-sm"
            >
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {error}
            </p>
          ) : (
            <p id="live-code-hint" className="text-muted-foreground text-xs">
              6 cifre. Demo: încearcă 264817.
            </p>
          )}
        </div>
        <Button type="submit" size="lg" disabled={code.length !== 6 || pending}>
          {pending ? "Se verifică…" : "Intră în sesiune"}
        </Button>
      </form>
    </div>
  );
}

function Session({
  session,
  me,
}: {
  session: LiveSessionInfo;
  me: { name: string; avatar: AvatarId };
}) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [avatar, setAvatar] = useState<AvatarId>(me.avatar);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<LiveAnswer[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  function lock(answer: number | null, msLeft: number) {
    const next = [...answers, { answer, msLeft }];
    setAnswers(next);
    setPhase("waiting");
    setAnnounce(
      answer === null
        ? "Timpul a expirat."
        : "Răspuns înregistrat. Așteptăm ceilalți participanți.",
    );
    const shownAt = Date.now();
    startTransition(async () => {
      const r = await answerLive(session.code, avatar, next);
      if (!r.ok) {
        setError(
          "Răspunsul nu a putut fi trimis. Reîncarcă pagina și intră din nou.",
        );
        return;
      }
      // În demo, ceilalți participanți „termină” la scurt timp după tine.
      const wait = Math.max(0, 1500 - (Date.now() - shownAt));
      setTimeout(() => {
        setRound(r);
        setPhase("reveal");
        setAnnounce(
          `${r.isCorrect ? "Corect" : "Răspunsul corect"}: ${session.questions[r.questionIndex].options[r.correct]}.`,
        );
      }, wait);
    });
  }

  function next() {
    if (round?.finished) {
      setPhase("results");
      return;
    }
    setIndex(index + 1);
    setRound(null);
    setPhase("question");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">
            {session.className} · {session.mentorName}
          </p>
          <h1 className="font-semibold text-xl tracking-tight sm:text-2xl">
            {session.title}
          </h1>
        </div>
        {phase !== "lobby" && phase !== "results" ? (
          <p className="font-medium text-muted-foreground text-sm">
            Întrebarea {index + 1} din {session.questionCount}
          </p>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-danger-soft p-3 text-destructive text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {phase === "lobby" ? (
        <Lobby
          session={session}
          me={me}
          avatar={avatar}
          onAvatar={setAvatar}
          onStart={() => setPhase("question")}
        />
      ) : null}

      {phase === "question" ? (
        <Question key={index} session={session} index={index} onLock={lock} />
      ) : null}

      {phase === "waiting" ? (
        <Waiting
          session={session}
          index={index}
          answer={answers[index]?.answer ?? null}
        />
      ) : null}

      {phase === "reveal" && round ? (
        <Reveal session={session} round={round} onNext={next} />
      ) : null}

      {phase === "results" && round ? (
        <Results standings={round.standings} />
      ) : null}
    </div>
  );
}

/* ---------- Lobby ---------- */

function Lobby({
  session,
  me,
  avatar,
  onAvatar,
  onStart,
}: {
  session: LiveSessionInfo;
  me: { name: string };
  avatar: AvatarId;
  onAvatar: (a: AvatarId) => void;
  onStart: () => void;
}) {
  // Demo: colegii intră în sesiune unul câte unul.
  const [joined, setJoined] = useState(2);
  const total = session.others.length;
  useEffect(() => {
    if (joined >= total) return;
    const t = setTimeout(() => setJoined((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [joined, total]);
  const others = session.others.slice(0, joined);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section
        aria-labelledby="alege-personaj"
        className="rounded-xl border bg-card p-5 shadow-xs lg:col-span-3"
      >
        <h2 id="alege-personaj" className="font-semibold">
          Alege-ți personajul
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Personajul apare lângă numele tău în clasament, doar în această
          sesiune.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-card text-2xl"
          >
            {AVATARS[avatar].emoji}
          </span>
          <div>
            <p className="font-medium">{me.name}</p>
            <p className="text-muted-foreground text-xs">
              Intri cu numele din contul tău · {AVATARS[avatar].label}
            </p>
          </div>
        </div>
        <fieldset className="mt-4">
          <legend className="sr-only">Personaj</legend>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
              <label
                key={id}
                className={cn(
                  "grid place-items-center gap-1 rounded-lg border p-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  avatar === id
                    ? "border-primary bg-primary-soft"
                    : "hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="live-avatar"
                  value={id}
                  checked={avatar === id}
                  onChange={() => onAvatar(id)}
                  className="sr-only"
                />
                <span className="text-3xl" aria-hidden="true">
                  {AVATARS[id].emoji}
                </span>
                <span className="text-muted-foreground text-xs">
                  {AVATARS[id].label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section
        aria-labelledby="participanti"
        className="flex flex-col rounded-xl border bg-card p-5 shadow-xs lg:col-span-2"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="participanti"
            className="flex items-center gap-2 font-semibold"
          >
            <Users
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Participanți
          </h2>
          <span
            className="text-muted-foreground text-sm tabular-nums"
            aria-live="polite"
          >
            {others.length + 1}
          </span>
        </div>
        <ul className="stagger mt-3 grid gap-1.5">
          <li className="flex items-center gap-2.5 rounded-lg bg-primary-soft px-2.5 py-1.5 text-sm">
            <span aria-hidden="true" className="text-lg">
              {AVATARS[avatar].emoji}
            </span>
            <span className="font-medium">{me.name}</span>
            <span className="ml-auto text-muted-foreground text-xs">Tu</span>
          </li>
          {others.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm"
            >
              <span aria-hidden="true" className="text-lg">
                {AVATARS[p.avatar].emoji}
              </span>
              {p.name}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5">
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Hourglass className="size-4" aria-hidden="true" />
            Așteptăm ca mentorul să pornească quiz-ul…
          </p>
          <Button className="mt-3 w-full" size="lg" onClick={onStart}>
            <Play /> Pornește demo
          </Button>
          <p className="mt-2 text-muted-foreground text-xs">
            În sesiunea reală, mentorul pornește quiz-ul și trece la fiecare
            întrebare. {session.questionCount} întrebări, câte 20 de secunde.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---------- Întrebarea ---------- */

function Question({
  session,
  index,
  onLock,
}: {
  session: LiveSessionInfo;
  index: number;
  onLock: (answer: number | null, msLeft: number) => void;
}) {
  const q = session.questions[index];
  const endsAt = useRef(0);
  const [msLeft, setMsLeft] = useState(QUESTION_MS);
  const locked = useRef(false);
  const onLockRef = useRef(onLock);
  useEffect(() => {
    onLockRef.current = onLock;
  });

  useEffect(() => {
    endsAt.current = Date.now() + QUESTION_MS;
    const t = setInterval(() => {
      const left = Math.max(0, endsAt.current - Date.now());
      setMsLeft(left);
      if (left === 0 && !locked.current) {
        locked.current = true;
        clearInterval(t);
        onLockRef.current(null, 0);
      }
    }, 100);
    return () => clearInterval(t);
  }, []);

  function choose(i: number) {
    if (locked.current) return;
    locked.current = true;
    onLock(i, Math.max(0, endsAt.current - Date.now()));
  }

  const seconds = Math.ceil(msLeft / 1000);
  return (
    <section aria-labelledby="live-q" className="grid gap-5">
      <div className="rounded-xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="live-q" className="font-semibold text-lg sm:text-xl">
            {q.prompt}
          </h2>
          <span
            role="timer"
            aria-label={`${seconds} secunde rămase`}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 font-semibold tabular-nums",
              seconds <= 5 && "border-warning/50 bg-warning-soft text-warning",
            )}
          >
            <Clock className="size-4" aria-hidden="true" />
            {seconds}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(msLeft / QUESTION_MS) * 100}%` }}
          />
        </div>
        {q.code ? <QuestionCode code={q.code} className="mt-4" /> : null}
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Variante de răspuns</legend>
        {q.options.map((opt, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
            key={i}
            type="button"
            onClick={() => choose(i)}
            className={cn(
              "flex min-h-20 items-center gap-4 rounded-xl px-5 py-4 text-left font-semibold text-lg outline-none transition-[filter] hover:brightness-105 focus-visible:ring-4 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
              ANSWER_STYLES[i].className,
            )}
          >
            <AnswerShape index={i} />
            <span className="sr-only">{ANSWER_STYLES[i].shapeLabel}: </span>
            <span className="min-w-0 break-words font-mono">{opt}</span>
          </button>
        ))}
      </fieldset>
      <p className="text-center text-muted-foreground text-sm">
        Alege un singur răspuns. După ce l-ai ales, nu îl mai poți schimba.
      </p>
    </section>
  );
}

function Waiting({
  session,
  index,
  answer,
}: {
  session: LiveSessionInfo;
  index: number;
  answer: number | null;
}) {
  const q = session.questions[index];
  return (
    <section className="grid place-items-center rounded-xl border bg-card px-6 py-14 text-center shadow-xs">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Hourglass className="size-5" aria-hidden="true" />
      </span>
      {answer === null ? (
        <>
          <h2 className="mt-4 font-semibold text-lg">Timpul a expirat</h2>
          <p className="mt-1 text-muted-foreground">
            Nu ai ales niciun răspuns la această întrebare.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-4 font-semibold text-lg">Răspuns înregistrat</h2>
          <p className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-lg",
                ANSWER_STYLES[answer].className,
              )}
            >
              <AnswerShape index={answer} className="size-4" />
            </span>
            <span className="font-mono">{q.options[answer]}</span>
          </p>
          <p className="mt-3 text-muted-foreground text-sm">
            Așteptăm ceilalți participanți…
          </p>
        </>
      )}
    </section>
  );
}

/* ---------- Răspunsul corect și clasamentul ---------- */

function Reveal({
  session,
  round,
  onNext,
}: {
  session: LiveSessionInfo;
  round: Round;
  onNext: () => void;
}) {
  const q = session.questions[round.questionIndex];
  const mine = round.standings.find((s) => s.isMe);
  const top = round.standings.slice(0, 5);
  const showMe = mine && !top.some((s) => s.isMe);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section
        aria-labelledby="live-reveal"
        className="rounded-xl border bg-card p-5 shadow-xs lg:col-span-3"
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-3",
            round.isCorrect ? "bg-success-soft" : "bg-muted",
          )}
        >
          {round.isCorrect ? (
            <CheckCircle2 className="size-6 text-success" aria-hidden="true" />
          ) : (
            <XCircle
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <div>
            <h2 id="live-reveal" className="font-semibold">
              {round.isCorrect
                ? "Corect"
                : round.yourAnswer === null
                  ? "Fără răspuns de data asta"
                  : "Nu de data asta"}
            </h2>
            <p className="text-sm">
              {round.points > 0
                ? `+${round.points} puncte (răspuns corect și rapid)`
                : "0 puncte la această întrebare. Urmează altele."}
            </p>
          </div>
        </div>

        <p className="mt-4 font-medium">{q.prompt}</p>
        <ul className="mt-3 grid gap-2">
          {q.options.map((opt, i) => {
            const isCorrect = i === round.correct;
            const isYours = i === round.yourAnswer;
            return (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
                key={i}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5",
                  isCorrect
                    ? "border-success/50 bg-success-soft"
                    : "opacity-70",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    ANSWER_STYLES[i].className,
                  )}
                >
                  <AnswerShape index={i} className="size-4" />
                </span>
                <span className="min-w-0 flex-1 font-mono text-sm">{opt}</span>
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1 font-medium text-success text-xs">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Răspuns corect
                  </span>
                ) : null}
                {isYours ? (
                  <span className="font-medium text-muted-foreground text-xs">
                    Răspunsul tău
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        {round.explanation ? (
          <p className="mt-4 flex gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
            <Info
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {round.explanation}
          </p>
        ) : null}
      </section>

      <section
        aria-labelledby="live-board"
        className="flex flex-col rounded-xl border bg-card p-5 shadow-xs lg:col-span-2"
      >
        <h2 id="live-board" className="font-semibold">
          Clasamentul sesiunii
        </h2>
        <ol className="mt-3 grid gap-1.5">
          {top.map((s) => (
            <StandingRow key={s.id} s={s} />
          ))}
          {showMe && mine ? (
            <>
              <li aria-hidden="true" className="px-2 text-muted-foreground">
                …
              </li>
              <StandingRow s={mine} />
            </>
          ) : null}
        </ol>
        <div className="mt-auto pt-5">
          <Button className="w-full" size="lg" onClick={onNext}>
            {round.finished
              ? "Vezi rezultatele finale"
              : "Următoarea întrebare"}
            <ArrowRight />
          </Button>
          <p className="mt-2 text-muted-foreground text-xs">
            Demo: în sesiunea reală, mentorul trece la următoarea întrebare.
          </p>
        </div>
      </section>
    </div>
  );
}

function StandingRow({ s, showXp }: { s: LiveStanding; showXp?: boolean }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
        s.isMe && "bg-primary-soft",
      )}
    >
      <span
        className={cn(
          "w-6 text-center font-semibold tabular-nums",
          s.rank > 3 && "text-muted-foreground",
        )}
      >
        {s.rank}
      </span>
      <span aria-hidden="true" className="text-lg">
        {AVATARS[s.avatar].emoji}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {s.name}
        {s.isMe ? (
          <span className="ml-1.5 font-normal text-muted-foreground text-xs">
            (tu)
          </span>
        ) : null}
      </span>
      <span className="text-muted-foreground tabular-nums">{s.score} p</span>
      {showXp ? <XpBadge amount={s.xp} /> : null}
    </li>
  );
}

/* ---------- Rezultatele finale ---------- */

function Results({ standings }: { standings: LiveStanding[] }) {
  const mine = standings.find((s) => s.isMe);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section
        aria-labelledby="live-final"
        className="rounded-xl border bg-card p-6 shadow-xs lg:col-span-2"
      >
        <span className="grid size-11 place-items-center rounded-full bg-xp-soft text-xp-foreground">
          <Trophy className="size-5" aria-hidden="true" />
        </span>
        <h2
          id="live-final"
          ref={heading}
          tabIndex={-1}
          className="mt-4 font-semibold text-xl outline-none"
        >
          Sesiunea s-a încheiat
        </h2>
        {mine ? (
          <>
            <p className="mt-2 text-lg">
              Locul <strong className="tabular-nums">{mine.rank}</strong> din{" "}
              {standings.length}, cu {mine.score} puncte.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              Ai primit <XpBadge amount={mine.xp} /> în clasă.
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {mine.rank <= 3
                ? "Felicitări pentru rezultat. Mulțumim pentru participare."
                : "Mulțumim pentru participare. Fiecare sesiune te ajută să recapitulezi."}
            </p>
          </>
        ) : null}
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-muted-foreground text-xs">
          Punctajul sesiunii și XP-ul se păstrează separat: punctajul arată
          rezultatul de azi, iar XP-ul se adaugă la progresul tău din clasă.
          Demo: rezultatele se salvează după conectarea la baza de date.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/progres" className={buttonVariants()}>
            Progresul meu
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ieși
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="live-ranking"
        className="rounded-xl border bg-card p-5 shadow-xs lg:col-span-3"
      >
        <h2 id="live-ranking" className="font-semibold">
          Clasament final
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          XP după loc: +5, +4, +3, +2, apoi +1 pentru toți ceilalți
          participanți. La punctaj egal, locul și XP-ul se împart.
        </p>
        <ol className="stagger mt-4 grid gap-1.5">
          {standings.map((s) => (
            <StandingRow key={s.id} s={s} showXp />
          ))}
        </ol>
      </section>
    </div>
  );
}
