"use client";

import { ChevronRight, Clock, ListChecks, SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { DifficultyBadge } from "@/components/common/status";
import { cn } from "@/lib/utils";

export type PracticeQuizItem = {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  questionCount: number;
  timeLimitLabel?: string;
  lastResult?: string;
};

/** Quiz-urile de exersare, cu filtru pe subiect (starea rămâne în browser). */
export function PracticeQuizList({ items }: { items: PracticeQuizItem[] }) {
  const topics = [...new Set(items.map((q) => q.topic))].sort();
  const [topic, setTopic] = useState<string>("all");
  const visible =
    topic === "all" ? items : items.filter((q) => q.topic === topic);

  return (
    <div className="grid gap-4">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Filtrează după subiect</legend>
        {[
          { id: "all", label: "Toate subiectele" },
          ...topics.map((t) => ({ id: t, label: t })),
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={topic === f.id}
            onClick={() => setTopic(f.id)}
            className={cn(
              "h-8 rounded-full border px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              topic === f.id
                ? "border-primary bg-primary-soft text-accent-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </fieldset>

      {visible.length > 0 ? (
        <ul className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((q) => (
            <li key={q.id}>
              <Link
                href={`/quiz/${q.id}`}
                className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-xs outline-none transition-colors hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    {q.topic}
                  </span>
                  <DifficultyBadge level={q.difficulty} />
                </div>
                <h3 className="mt-2 font-semibold group-hover:text-primary">
                  {q.title}
                </h3>
                <p className="mt-1 flex-1 text-muted-foreground text-sm">
                  {q.description}
                </p>
                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="size-3.5" aria-hidden="true" />
                    {q.questionCount} întrebări
                  </span>
                  {q.timeLimitLabel ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {q.timeLimitLabel}
                    </span>
                  ) : null}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-sm">
                  <span
                    className={cn(!q.lastResult && "text-muted-foreground")}
                  >
                    {q.lastResult ?? "Neîncercat încă"}
                  </span>
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Niciun quiz pentru acest subiect"
          description="Alege alt subiect sau revino mai târziu."
        />
      )}
    </div>
  );
}
