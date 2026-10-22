"use client";

import Link from "next/link";
import { useState } from "react";
import type { Exercise } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { LevelStars } from "./level-stars";

const ALL = "Toate";

export function ExerciseGrid({ exercises }: { exercises: Exercise[] }) {
  const topics = [ALL, ...new Set(exercises.map((e) => e.topic))];
  const [topic, setTopic] = useState(ALL);
  const visible =
    topic === ALL ? exercises : exercises.filter((e) => e.topic === topic);

  return (
    <div className="grid gap-5">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrează după temă</legend>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            aria-pressed={t === topic}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 font-bold font-heading transition-transform hover:-translate-y-0.5",
              t === topic
                ? "border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_var(--primary-shadow)]"
                : "bg-card shadow-[0_3px_0_0_var(--border)]",
            )}
          >
            {t}
          </button>
        ))}
      </fieldset>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((e, i) => (
          <li
            key={e.id}
            className="animate-pop"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Link
              href={`/exercitii/${e.id}`}
              className={cn(
                "sticker group flex h-full flex-col gap-4 p-5 transition-transform hover:-translate-y-1",
                i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-14 place-items-center rounded-2xl bg-secondary text-3xl transition-transform group-hover:scale-110"
                >
                  {e.emoji}
                </span>
                {e.done ? (
                  <span className="rounded-full bg-success/15 px-3 py-1 font-bold text-sm text-success">
                    ✅ Rezolvat
                  </span>
                ) : (
                  <span className="rounded-full bg-primary-soft px-3 py-1 font-bold text-secondary-foreground text-sm">
                    +{e.xp} XP
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold font-heading text-xl">{e.title}</p>
                <p className="mt-1 font-semibold text-muted-foreground text-sm">
                  {e.statement}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground text-sm">
                  {e.topic}
                </span>
                <LevelStars level={e.level} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
