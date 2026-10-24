"use client";

import {
  CheckCircle2,
  ChevronDown,
  History,
  MessageSquareText,
  RotateCcw,
  Send,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitProblem } from "@/app/(student)/teme/[id]/actions";
import { CodeEditor } from "@/components/code/code-editor";
import { ProblemStatusBadge, StatusBadge } from "@/components/common/status";
import { Button } from "@/components/ui/button";
import type { ProblemAttempt, ProblemState } from "@/lib/db/homework";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type WorkspaceProblem = {
  id: string;
  title: string;
  required: boolean;
  language: string;
  starter: string | null;
  state: ProblemState;
  feedback?: { text: string; at: string };
  attempts: ProblemAttempt[];
  /** Enunțul, randat pe server (cu `cod` și **important**). */
  statement: React.ReactNode;
};

const draftKey = (a: string, p: string) => `eduquest:tema:${a}:${p}`;

/**
 * Lucrul la o temă: lista problemelor cu starea lor, enunțul, editorul de cod,
 * trimiterea (și retrimiterea) și trimiterile vechi cu feedbackul mentorului.
 */
export function HomeworkWorkspace({
  assignmentId,
  problems,
  canSubmit,
  deadlinePassed,
}: {
  assignmentId: string;
  problems: WorkspaceProblem[];
  canSubmit: boolean;
  deadlinePassed: boolean;
}) {
  const firstOpen = problems.findIndex(
    (p) => p.state === "not_started" || p.state === "needs_changes",
  );
  const [index, setIndex] = useState(firstOpen >= 0 ? firstOpen : 0);
  const p = problems[index];

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <nav
        aria-label="Problemele temei"
        className="lg:sticky lg:top-24 lg:self-start"
      >
        <ol className="grid gap-1.5">
          {problems.map((x, i) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "step" : undefined}
                className={cn(
                  "flex w-full cut-sm items-center gap-3 px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/70",
                  i === index
                    ? "bg-foreground text-background"
                    : "bg-card hover:bg-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-8 shrink-0 hex place-items-center font-extrabold font-heading tabular-nums",
                    i === index
                      ? "bg-background text-foreground"
                      : "bg-secondary",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{x.title}</span>
                  <span
                    className={cn(
                      "block text-xs",
                      i === index
                        ? "text-background/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {x.required ? "Obligatorie" : "Opțională"}
                  </span>
                </span>
                <StateDot state={x.state} />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <ProblemPanel
        key={p.id}
        assignmentId={assignmentId}
        problem={p}
        number={index + 1}
        canSubmit={canSubmit}
        deadlinePassed={deadlinePassed}
        onNext={
          index < problems.length - 1 ? () => setIndex(index + 1) : undefined
        }
      />
    </div>
  );
}

function StateDot({ state }: { state: ProblemState }) {
  const label = {
    not_started: "netrimisă",
    submitted: "trimisă",
    accepted: "acceptată",
    needs_changes: "de refăcut",
  }[state];
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rotate-45",
        state === "not_started" && "border-2 border-current opacity-50",
        state === "submitted" && "bg-info",
        state === "accepted" && "bg-success",
        state === "needs_changes" && "bg-warning",
      )}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}

function ProblemPanel({
  assignmentId,
  problem: p,
  number,
  canSubmit,
  deadlinePassed,
  onNext,
}: {
  assignmentId: string;
  problem: WorkspaceProblem;
  number: number;
  canSubmit: boolean;
  deadlinePassed: boolean;
  onNext?: () => void;
}) {
  const router = useRouter();
  const initial = p.attempts[0]?.code ?? p.starter ?? "";
  const [code, setCode] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  // Ciorna nesalvată rămâne în browser, ca să nu se piardă la reîncărcare.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey(assignmentId, p.id));
      if (saved !== null) setCode(saved);
    } catch {}
  }, [assignmentId, p.id]);

  function change(next: string) {
    setCode(next);
    setError(null);
    try {
      localStorage.setItem(draftKey(assignmentId, p.id), next);
    } catch {}
  }

  function submit() {
    startTransition(async () => {
      const r = await submitProblem(assignmentId, p.id, code);
      if (!r.ok) {
        setError(r.message);
        return;
      }
      try {
        localStorage.removeItem(draftKey(assignmentId, p.id));
      } catch {}
      toast.success(
        p.attempts.length > 0
          ? "Ai retrimis rezolvarea"
          : "Rezolvarea a fost trimisă",
        {
          description: r.xpAwarded
            ? "Ai trimis toate problemele obligatorii la timp: +2 XP."
            : r.late
              ? "Ai trimis după termen: mentorul o vede, dar nu primești XP pentru trimitere."
              : "Mentorul o va evalua și îți va lăsa feedback.",
        },
      );
      router.refresh();
    });
  }

  const unchanged = p.attempts.length > 0 && code === p.attempts[0].code;

  return (
    <section
      aria-labelledby={`p-${p.id}`}
      className="grid min-w-0 content-start gap-5"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id={`p-${p.id}`} className="text-2xl leading-tight">
          <span className="text-muted-foreground">Problema {number} · </span>
          {p.title}
        </h2>
        <ProblemStatusBadge status={p.state} />
        {!p.required ? (
          <StatusBadge tone="neutral">Opțională</StatusBadge>
        ) : null}
      </header>

      <div className="grid gap-3 leading-relaxed">{p.statement}</div>

      {p.feedback ? (
        <div
          className={cn(
            "flex cut-sm items-start gap-3 px-4 py-3 text-sm",
            p.state === "needs_changes" ? "bg-warning-soft" : "bg-success-soft",
          )}
        >
          {p.state === "needs_changes" ? (
            <RotateCcw
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden="true"
            />
          ) : (
            <MessageSquareText
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold">
              {p.state === "needs_changes"
                ? "De refăcut"
                : "Feedback de la mentor"}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {formatDateTime(p.feedback.at)}
              </span>
            </p>
            <p className="mt-1 whitespace-pre-line">{p.feedback.text}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        <CodeEditor
          value={code}
          onChange={canSubmit ? change : undefined}
          readOnly={!canSubmit}
          label={`Rezolvarea pentru problema ${number}`}
          language={p.language}
          rows={14}
          describedBy={error ? errorId : undefined}
        />
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="font-medium text-destructive text-sm"
          >
            {error}
          </p>
        ) : null}
        {canSubmit ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="cta"
              onClick={submit}
              disabled={pending || unchanged}
            >
              {p.attempts.length > 0 ? <Upload /> : <Send />}
              {pending
                ? "Se trimite…"
                : p.attempts.length > 0
                  ? "Retrimite"
                  : "Trimite"}
            </Button>
            {onNext && p.attempts.length > 0 ? (
              <Button type="button" variant="outline" onClick={onNext}>
                Problema următoare
              </Button>
            ) : null}
            <p className="text-muted-foreground text-sm">
              {unchanged
                ? "Modifică rezolvarea ca s-o poți retrimite."
                : deadlinePassed
                  ? "Termenul a trecut: poți trimite, dar nu mai primești +2 XP."
                  : "Poți retrimite oricând până la termen; mentorul vede fiecare variantă."}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Clasa e arhivată: tema nu mai poate fi trimisă.
          </p>
        )}
      </div>

      <AttemptsMenu
        attempts={p.attempts}
        onLoad={canSubmit ? change : undefined}
      />
    </section>
  );
}

/** Meniul derulant cu trimiterile vechi ale problemei, cele mai noi primele. */
function AttemptsMenu({
  attempts,
  onLoad,
}: {
  attempts: ProblemAttempt[];
  onLoad?: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (attempts.length === 0) return null;
  return (
    <div className="grid gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 cut-xs items-center justify-between gap-3 bg-secondary px-3 font-bold font-heading text-sm uppercase tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
      >
        <span className="inline-flex items-center gap-2">
          <History className="size-4" aria-hidden="true" />
          Trimiterile tale ({attempts.length})
        </span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <ol id={id} hidden={!open} className="grid gap-3">
        {attempts.map((a, i) => (
          <li key={a.id} className="grid cut-sm gap-2 bg-card p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">
                {i === 0
                  ? "Ultima trimitere"
                  : `Trimiterea ${attempts.length - i}`}
              </span>
              <span className="text-muted-foreground">
                {formatDateTime(a.at)}
              </span>
              {a.late ? (
                <StatusBadge tone="danger">După termen</StatusBadge>
              ) : (
                <StatusBadge icon={CheckCircle2} tone="success">
                  La timp
                </StatusBadge>
              )}
              {onLoad ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => onLoad(a.code)}
                >
                  Încarcă în editor
                </Button>
              ) : null}
            </div>
            <pre className="max-h-64 overflow-auto bg-[#0d1117] p-3 font-mono text-[#e6edf3] text-sm leading-6">
              {a.code}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  );
}
