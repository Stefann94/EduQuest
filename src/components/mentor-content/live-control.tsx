"use client";

import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  Flag,
  MessageCircle,
  Play,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { finishLiveSession } from "@/app/mentor/live/actions";
import { Section } from "@/components/common/section";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AvatarId } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import { ConfirmDialog } from "./confirm-dialog";
import { formatSessionCode, rankLiveResults } from "./live-ranking";
import { formatPoints, type LiveResultRow, LiveResults } from "./live-results";
import { ANSWER_STYLES, AnswerShape } from "./quiz-shapes";

export type LiveStudent = { id: string; name: string; avatar: AvatarId };

export type LiveQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation?: string;
  /** Codul întrebării, deja evidențiat pe server (CodeBlock). */
  code?: React.ReactNode;
};

type Phase = "lobby" | "question" | "final";

/** Când răspunde fiecare participant (simulare pentru demo). */
type PlannedAnswer = { studentId: string; atMs: number; option: number };

type Score = { score: number; correct: number };

const JOIN_EVERY_MS = 900;

/**
 * Panoul de control al mentorului pentru o sesiune live: lobby, întrebări, rezultate.
 * În demo, intrarea elevilor și răspunsurile lor sunt simulate în browser.
 */
export function LiveControl({
  sessionId,
  code,
  quizTitle,
  questions,
  secondsPerQuestion,
  students,
}: {
  sessionId: string;
  code: string;
  quizTitle: string;
  questions: LiveQuestion[];
  secondsPerQuestion: number;
  students: LiveStudent[];
}) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [joined, setJoined] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [nowMs, setNowMs] = useState(0);
  const [revealedAt, setRevealedAt] = useState<number | null>(null);
  const [plan, setPlan] = useState<PlannedAnswer[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [played, setPlayed] = useState(0);
  const [results, setResults] = useState<LiveResultRow[] | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [saving, startSaving] = useTransition();

  const limitMs = secondsPerQuestion * 1000;
  const question = questions[qIndex];
  const revealed = revealedAt !== null;
  const elapsed = Math.max(0, (revealedAt ?? nowMs) - startedAt);
  const remaining = Math.max(0, Math.ceil((limitMs - elapsed) / 1000));
  const timeUp = elapsed >= limitMs;
  // Răspunsurile primite până acum; după termen nu se mai acceptă (nici schimbări).
  const received = plan.filter((p) => p.atMs <= Math.min(elapsed, limitMs));
  const allAnswered = joined.length > 0 && received.length === joined.length;
  const byId = new Map(students.map((s) => [s.id, s]));

  // Lobby: elevii intră pe rând (simulare). Unul dintre ei lipsește azi.
  useEffect(() => {
    if (phase !== "lobby") return;
    const expected = students
      .slice(0, Math.max(1, students.length - 1))
      .map((s) => s.id);
    const timer = setInterval(() => {
      setJoined((list) =>
        list.length >= expected.length
          ? list
          : [...list, expected[list.length]],
      );
    }, JOIN_EVERY_MS);
    return () => clearInterval(timer);
  }, [phase, students]);

  // Cronometrul întrebării curente.
  useEffect(() => {
    if (phase !== "question" || revealed || timeUp || allAnswered) return;
    const timer = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(timer);
  }, [phase, revealed, timeUp, allAnswered]);

  function startQuestion(index: number) {
    const q = questions[index];
    const t = Date.now();
    setQIndex(index);
    setStartedAt(t);
    setNowMs(t);
    setRevealedAt(null);
    setPlan(
      joined.map((studentId) => {
        // Aproximativ 1 din 10 elevi nu răspunde la timp.
        const answers = Math.random() > 0.1;
        const right = Math.random() < 0.65;
        const others = q.options
          .map((_, i) => i)
          .filter((i) => i !== q.correct);
        return {
          studentId,
          atMs: answers
            ? (0.12 + Math.random() * 0.8) * limitMs
            : Number.POSITIVE_INFINITY,
          option: right
            ? q.correct
            : others[Math.floor(Math.random() * others.length)],
        };
      }),
    );
    setPhase("question");
    setAnnouncement(
      `Întrebarea ${index + 1} din ${questions.length} a început.`,
    );
  }

  function reveal() {
    const at = Date.now();
    const cutoff = Math.min(at - startedAt, limitMs);
    const answered = plan.filter((p) => p.atMs <= cutoff);
    setRevealedAt(startedAt + cutoff);
    setScores((prev) => {
      const next = { ...prev };
      for (const p of answered) {
        if (p.option !== question.correct) continue;
        // Răspuns corect: 500 de puncte + până la 500 pentru viteză.
        const points = 500 + Math.round(500 * (1 - p.atMs / limitMs));
        const cur = next[p.studentId] ?? { score: 0, correct: 0 };
        next[p.studentId] = {
          score: cur.score + points,
          correct: cur.correct + 1,
        };
      }
      return next;
    });
    setPlayed((n) => n + 1);
    setAnnouncement(`Răspunsul corect: ${question.options[question.correct]}.`);
  }

  function finish() {
    const rows = joined.map((id) => ({
      studentId: id,
      score: scores[id]?.score ?? 0,
    }));
    startSaving(async () => {
      const res = await finishLiveSession(sessionId, rows);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setResults(
        res.results.map((r) => {
          const s = byId.get(r.studentId);
          return {
            ...r,
            name: s?.name ?? "Elev",
            avatar: s?.avatar ?? "owl",
            correct: scores[r.studentId]?.correct ?? 0,
          };
        }),
      );
      setPhase("final");
      setAnnouncement("Quiz-ul s-a încheiat. Clasamentul final este afișat.");
      toast.success(res.message, { description: res.detail });
    });
  }

  const live = (
    <output className="sr-only" aria-live="polite">
      {announcement}
    </output>
  );

  /* ---------- Lobby ---------- */
  if (phase === "lobby") {
    const waiting = students.length - joined.length;
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {live}
        <section className="grid gap-6 rounded-xl border bg-card p-6 text-center shadow-xs sm:p-10">
          <div className="grid gap-2">
            <p className="font-medium text-muted-foreground text-sm">
              Codul sesiunii
            </p>
            <p className="font-mono font-semibold text-5xl tabular-nums tracking-[0.12em] sm:text-7xl">
              <span aria-hidden="true">{formatSessionCode(code)}</span>
              <span className="sr-only">{code.split("").join(" ")}</span>
            </p>
          </div>
          <p className="mx-auto max-w-md text-lg">
            Elevii intră pe{" "}
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono font-semibold">
              /live
            </span>{" "}
            și scriu codul.
          </p>
          <p className="mx-auto max-w-md text-muted-foreground text-sm">
            Fiecare elev își alege un personaj, care rămâne legat de contul lui
            din platformă. Nu e nevoie de un cont separat.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              size="lg"
              onClick={() => startQuestion(0)}
              disabled={joined.length === 0}
            >
              <Play aria-hidden="true" /> Începe quiz-ul
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {quizTitle} · {questions.length} întrebări · {secondsPerQuestion}{" "}
            secunde pe întrebare
          </p>
        </section>

        <Section
          title="Participanți"
          description={`${joined.length} din ${students.length} elevi au intrat${waiting > 0 ? ` · se așteaptă ${waiting}` : ""}`}
        >
          {joined.length === 0 ? (
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="size-4" aria-hidden="true" />
              Se așteaptă elevii…
            </p>
          ) : (
            <ul className="stagger grid grid-cols-2 gap-2">
              {joined.map((id) => {
                const s = byId.get(id);
                if (!s) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-2"
                  >
                    <UserAvatar name={s.name} avatar={s.avatar} />
                    <span className="truncate font-medium text-sm">
                      {s.name.split(" ")[0]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    );
  }

  /* ---------- Rezultate ---------- */
  if (phase === "final" && results) {
    const absent = students.filter((s) => !joined.includes(s.id));
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {live}
        <Section
          title="Clasament final"
          description={`${results.length} participanți · ${played} din ${questions.length} întrebări jucate`}
        >
          <LiveResults rows={results} totalQuestions={played} />
        </Section>
        <div className="grid gap-4">
          <Callout icon={Check} tone="info">
            Elevii văd rezultatul și XP-ul primit pe ecranul lor și în istoricul
            de XP.
          </Callout>
          {absent.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              Nu au participat: {absent.map((s) => s.name).join(", ")}. Elevii
              care nu intră în sesiune nu primesc XP pentru ea.
            </p>
          ) : null}
          <Link
            href="/mentor/live"
            className={buttonVariants({ variant: "outline" })}
          >
            Înapoi la sesiuni
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Întrebare ---------- */
  const counts = question.options.map(
    (_, i) => received.filter((p) => p.option === i).length,
  );
  const isLast = qIndex === questions.length - 1;
  const standings = rankLiveResults(
    joined.map((id) => ({ studentId: id, score: scores[id]?.score ?? 0 })),
  ).slice(0, 5);
  const progress = ((qIndex + (revealed ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="grid gap-6">
      {live}
      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">
            Întrebarea {qIndex + 1} din {questions.length}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-muted-foreground text-sm">
              Cod:{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatSessionCode(code)}
              </span>
            </p>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" disabled={saving}>
                  <Flag aria-hidden="true" /> Încheie quiz-ul
                </Button>
              }
              title="Închei quiz-ul acum?"
              description={
                revealed
                  ? `Clasamentul se calculează din cele ${played} întrebări jucate, iar XP-ul se acordă după regulile sesiunii.`
                  : `Întrebarea curentă nu se mai punctează. Clasamentul se calculează din cele ${played} întrebări încheiate.`
              }
              confirmLabel="Încheie quiz-ul"
              pendingLabel="Se încheie…"
              destructive={false}
              onConfirm={finish}
            />
          </div>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progresul sesiunii"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={qIndex + (revealed ? 1 : 0)}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <section className="grid gap-5 rounded-xl border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-balance font-semibold text-xl sm:text-2xl">
            {question.prompt}
          </h2>
          {question.code ?? null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {question.options.map((o, i) => {
              const style = ANSWER_STYLES[i];
              const correct = i === question.correct;
              return (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: poziția variantei îi dă culoarea și forma
                  key={i}
                  className={cn(
                    "flex min-h-16 items-center gap-3 rounded-lg px-4 py-3 font-semibold",
                    style.bg,
                    style.text,
                    revealed && !correct && "opacity-40",
                    revealed && correct && "ring-4 ring-success ring-offset-2",
                  )}
                >
                  <AnswerShape index={i} className="size-6" />
                  <span className="sr-only">{style.label}: </span>
                  <span className="min-w-0 flex-1">{o}</span>
                  {revealed ? (
                    <span className="flex items-center gap-1.5 text-sm tabular-nums">
                      {correct ? (
                        <>
                          <Check className="size-5" aria-hidden="true" />
                          <span className="sr-only">Răspuns corect, </span>
                        </>
                      ) : null}
                      {counts[i]}
                      <span className="sr-only"> răspunsuri</span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {revealed && question.explanation ? (
            <Callout icon={MessageCircle} tone="info">
              {question.explanation}
            </Callout>
          ) : null}
        </section>

        <div className="grid gap-4">
          <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-xs">
            <div role="timer" aria-label="Timp rămas">
              <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Clock className="size-4" aria-hidden="true" />
                {revealed
                  ? "Răspunsurile s-au închis"
                  : allAnswered
                    ? "Toți elevii au răspuns"
                    : timeUp
                      ? "Timpul a expirat"
                      : "Timp rămas"}
              </p>
              <p className="mt-1 font-semibold text-4xl tabular-nums">
                {remaining}
                <span className="ml-1 font-normal text-base text-muted-foreground">
                  s
                </span>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Răspunsuri primite
              </p>
              <p className="mt-1 font-semibold text-2xl tabular-nums">
                {received.length}
                <span className="font-normal text-base text-muted-foreground">
                  {" "}
                  din {joined.length}
                </span>
              </p>
            </div>
            {timeUp && !revealed ? (
              <p className="text-muted-foreground text-xs">
                După termen, elevii nu mai pot trimite sau schimba răspunsul.
              </p>
            ) : null}
            {revealed ? (
              <Button
                size="lg"
                onClick={() => (isLast ? finish() : startQuestion(qIndex + 1))}
                disabled={saving}
              >
                {isLast ? (
                  saving ? (
                    "Se calculează…"
                  ) : (
                    <>
                      Vezi rezultatele <ArrowRight aria-hidden="true" />
                    </>
                  )
                ) : (
                  <>
                    Următoarea întrebare <ArrowRight aria-hidden="true" />
                  </>
                )}
              </Button>
            ) : (
              <Button size="lg" onClick={reveal}>
                <Eye aria-hidden="true" /> Arată răspunsul corect
              </Button>
            )}
          </div>

          {played > 0 ? (
            <Section title="Clasament provizoriu" bodyClassName="p-3">
              <ol className="grid gap-1">
                {standings.map((r) => {
                  const s = byId.get(r.studentId);
                  if (!s) return null;
                  return (
                    <li
                      key={r.studentId}
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm"
                    >
                      <span className="w-5 text-right font-semibold text-muted-foreground tabular-nums">
                        {r.rank}
                      </span>
                      <UserAvatar name={s.name} avatar={s.avatar} size="xs" />
                      <span className="min-w-0 flex-1 truncate">{s.name}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {formatPoints(r.score)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
