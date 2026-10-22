"use client";

import { ArrowRight, Check, Crown, RotateCcw, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { demoLiveQuiz } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ANSWER_STYLES, AnswerShape } from "./answer-shape";

type Phase = "ready" | "question" | "reveal" | "final";

// Adversari simulați: punctele lor la fiecare întrebare.
const BOTS = [
  { name: "Maria", points: [910, 780, 0, 850] },
  { name: "Luca", points: [720, 0, 880, 640] },
  { name: "Sofia", points: [0, 900, 690, 710] },
  { name: "David", points: [650, 610, 0, 0] },
];

const MAX_POINTS = 1000;

/** Răspuns corect = 500–1000 puncte, în funcție de cât de repede răspunzi. */
function pointsFor(msLeft: number, totalMs: number) {
  return Math.round(MAX_POINTS / 2 + (MAX_POINTS / 2) * (msLeft / totalMs));
}

export function LiveQuizDemo() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [msLeft, setMsLeft] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState<number[]>([]);

  const question = demoLiveQuiz[index];
  const totalMs = question.seconds * 1000;
  const isLast = index === demoLiveQuiz.length - 1;

  function startQuestion(i: number) {
    setIndex(i);
    setSelected(null);
    setDeadline(Date.now() + demoLiveQuiz[i].seconds * 1000);
    setMsLeft(demoLiveQuiz[i].seconds * 1000);
    setPhase("question");
  }

  function answer(choice: number | null) {
    if (phase !== "question") return;
    const left = Math.max(0, deadline - Date.now());
    const correct = choice === question.correct;
    setMsLeft(left);
    setSelected(choice);
    setMyPoints((prev) => [...prev, correct ? pointsFor(left, totalMs) : 0]);
    setPhase("reveal");
  }

  function restart() {
    setMyPoints([]);
    startQuestion(0);
  }

  // Timer-ul: numără local, pornind de la termenul-limită (în versiunea live îl trimite serverul).
  useEffect(() => {
    if (phase !== "question") return;
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setMsLeft(left);
      if (left === 0) {
        clearInterval(id);
        setSelected(null);
        setMyPoints((prev) => [...prev, 0]);
        setPhase("reveal");
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, deadline]);

  // Tastele 1–4 aleg un răspuns.
  useEffect(() => {
    if (phase !== "question") return;
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) answer(n - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const answeredCount = myPoints.length;
  const leaderboard = [
    { name: "Tu", isMe: true, total: sum(myPoints) },
    ...BOTS.map((b) => ({
      name: b.name,
      isMe: false,
      total: sum(b.points.slice(0, answeredCount)),
    })),
  ].sort((a, b) => b.total - a.total);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark className="size-7" />
          <span className="hidden sm:inline">Quiz demo</span>
        </Link>
        {phase !== "ready" && phase !== "final" ? (
          <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground text-sm">
            Întrebarea {index + 1} din {demoLiveQuiz.length}
          </span>
        ) : null}
        <span className="flex items-center gap-1.5 font-semibold tabular-nums">
          <Star className="size-4 fill-xp text-xp" />
          {sum(myPoints)}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:py-10">
        {phase === "ready" && (
          <div className="m-auto max-w-md animate-pop text-center">
            <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
              Quiz demo: Python
            </h1>
            <p className="mt-3 text-muted-foreground">
              {demoLiveQuiz.length} întrebări. Răspunsurile corecte și rapide
              aduc mai multe puncte. Poți folosi și tastele 1–4.
            </p>
            <Button
              onClick={() => startQuestion(0)}
              className="mt-8 h-14 gap-2 px-10 text-lg"
            >
              Start <ArrowRight />
            </Button>
          </div>
        )}

        {(phase === "question" || phase === "reveal") && (
          <div key={index} className="flex flex-1 animate-pop flex-col">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-balance font-bold text-2xl tracking-tight sm:text-3xl">
                  {question.prompt}
                </h1>
                {question.code ? (
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-code px-5 py-4 font-mono text-code-foreground text-lg sm:text-xl">
                    {question.code}
                  </pre>
                ) : null}
              </div>
              <TimerRing
                fraction={msLeft / totalMs}
                seconds={Math.ceil(msLeft / 1000)}
              />
            </div>

            <div className="mt-8 grid flex-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {question.answers.map((text, i) => {
                const style = ANSWER_STYLES[i];
                const isCorrect = i === question.correct;
                const isPicked = i === selected;
                const revealed = phase === "reveal";
                return (
                  <button
                    key={style.shape}
                    type="button"
                    onClick={() => answer(i)}
                    disabled={revealed}
                    aria-label={`${style.label}: ${text}`}
                    className={cn(
                      "flex min-h-20 items-center gap-4 rounded-2xl px-5 py-4 text-left font-semibold text-lg text-white shadow-sm outline-none transition-all sm:min-h-28 sm:text-xl",
                      style.bg,
                      !revealed &&
                        "hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/60 active:translate-y-0",
                      revealed && !isCorrect && "opacity-35",
                      revealed && isPicked && "ring-4 ring-foreground/70",
                    )}
                  >
                    <AnswerShape shape={style.shape} className="size-7" />
                    <span className="flex-1 font-mono">{text}</span>
                    {revealed && isCorrect ? (
                      <Check className="size-7" strokeWidth={3} />
                    ) : null}
                    {revealed && isPicked && !isCorrect ? (
                      <X className="size-7" strokeWidth={3} />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {phase === "reveal" && (
              <RevealPanel
                points={myPoints[index] ?? 0}
                timedOut={selected === null}
                leaderboard={leaderboard}
                isLast={isLast}
                onNext={() =>
                  isLast ? setPhase("final") : startQuestion(index + 1)
                }
              />
            )}
          </div>
        )}

        {phase === "final" && (
          <FinalPodium leaderboard={leaderboard} onRestart={restart} />
        )}
      </main>
    </div>
  );
}

function TimerRing({
  fraction,
  seconds,
}: {
  fraction: number;
  seconds: number;
}) {
  const circumference = 2 * Math.PI * 15.5;
  const urgent = seconds <= 5;
  return (
    <div
      role="timer"
      aria-label={`${seconds} secunde rămase`}
      className="relative grid size-20 shrink-0 place-items-center"
    >
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx="18"
          cy="18"
          r="15.5"
          className="fill-none stroke-muted"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-100 ease-linear",
            urgent ? "stroke-quiz-red" : "stroke-primary",
          )}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <span
        className={cn(
          "font-bold text-2xl tabular-nums",
          urgent && "text-quiz-red",
        )}
      >
        {seconds}
      </span>
    </div>
  );
}

type Row = { name: string; isMe: boolean; total: number };

function RevealPanel({
  points,
  timedOut,
  leaderboard,
  isLast,
  onNext,
}: {
  points: number;
  timedOut: boolean;
  leaderboard: Row[];
  isLast: boolean;
  onNext: () => void;
}) {
  const correct = points > 0;
  return (
    <div className="mt-6 grid animate-pop gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-[1fr_1.3fr] sm:p-6">
      <div className="flex flex-col justify-center">
        <p
          className={cn(
            "font-bold text-2xl",
            correct ? "text-success" : "text-destructive",
          )}
        >
          {correct ? "Corect!" : timedOut ? "Timpul a expirat" : "Greșit"}
        </p>
        <p className="mt-1 text-muted-foreground">
          {correct ? `+${points} puncte` : "Nu-i nimic, data viitoare!"}
        </p>
        <Button
          onClick={onNext}
          className="mt-5 h-12 w-fit gap-2 px-6 text-base"
        >
          {isLast ? "Vezi rezultatele" : "Următoarea întrebare"} <ArrowRight />
        </Button>
      </div>
      <ol className="grid gap-1.5">
        {leaderboard.map((row, i) => (
          <li
            key={row.name}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2",
              row.isMe ? "bg-secondary font-semibold" : "bg-muted/50",
            )}
          >
            <span className="w-5 text-muted-foreground text-sm tabular-nums">
              {i + 1}
            </span>
            <span className="flex-1">{row.name}</span>
            <span className="tabular-nums">{row.total}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FinalPodium({
  leaderboard,
  onRestart,
}: {
  leaderboard: Row[];
  onRestart: () => void;
}) {
  const top = leaderboard.slice(0, 3);
  const myPlace = leaderboard.findIndex((r) => r.isMe) + 1;
  // Ordinea vizuală pe podium: locul 2, 1, 3.
  const podium = [top[1], top[0], top[2]].filter(Boolean);
  const heights = { 1: "h-40", 2: "h-28", 3: "h-20" } as const;

  return (
    <div className="m-auto w-full max-w-xl animate-pop text-center">
      <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
        {myPlace === 1 ? "Ai câștigat! 🏆" : `Ai terminat pe locul ${myPlace}!`}
      </h1>
      <p className="mt-2 text-muted-foreground">Iată podiumul grupei.</p>

      <div className="mt-10 flex items-end justify-center gap-3">
        {podium.map((row) => {
          const place = (leaderboard.indexOf(row) + 1) as 1 | 2 | 3;
          return (
            <div
              key={row.name}
              className="flex w-28 flex-col items-center gap-2"
            >
              {place === 1 ? <Crown className="size-7 text-xp" /> : null}
              <span className={cn("font-semibold", row.isMe && "text-primary")}>
                {row.name}
              </span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {row.total}
              </span>
              <div
                className={cn(
                  "grid w-full place-items-start justify-center rounded-t-2xl pt-3 font-bold text-3xl text-white",
                  heights[place],
                  place === 1
                    ? "bg-primary"
                    : place === 2
                      ? "bg-quiz-blue"
                      : "bg-quiz-green",
                )}
              >
                {place}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button
          onClick={onRestart}
          variant="outline"
          className="h-12 gap-2 px-6 text-base"
        >
          <RotateCcw /> Joacă din nou
        </Button>
        <Link
          href="/elev"
          className={cn(buttonVariants(), "h-12 gap-2 px-6 text-base")}
        >
          Înapoi acasă
        </Link>
      </div>
    </div>
  );
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}
