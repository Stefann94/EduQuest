import { ArrowLeft, Play, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ANSWER_STYLES } from "@/components/quiz/answer-shape";
import { buttonVariants } from "@/components/ui/button";
import { demoLobbyPlayers, demoQuizzes } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sesiune live" };

const DEMO_PIN = "482193";

export default function LiveSessionLobbyPage() {
  const quiz = demoQuizzes[0];

  return (
    <div className="grid gap-6">
      <Link
        href="/mentor"
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Înapoi la panou
      </Link>

      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 text-center sm:p-10">
        <div className="bg-dots absolute inset-0 -z-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
        <div className="relative">
          <p className="text-muted-foreground">
            Intră pe{" "}
            <span className="font-semibold text-foreground">
              eduquest.ro/intra
            </span>{" "}
            și scrie PIN-ul
          </p>
          <p className="mt-4 font-bold font-mono text-6xl text-primary tracking-[0.15em] sm:text-8xl">
            <span className="sr-only">PIN {DEMO_PIN.split("").join(" ")}</span>
            <span aria-hidden="true">
              {DEMO_PIN.slice(0, 3)} {DEMO_PIN.slice(3)}
            </span>
          </p>
          <p className="mt-6 font-medium">
            {quiz.title} · {quiz.questions} întrebări
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-semibold text-lg">
            <Users className="size-5 text-primary" />
            {demoLobbyPlayers.length} elevi au intrat
            <span className="relative ml-1 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>
          </h2>
          <Link
            href="/live"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 px-6 text-base",
            )}
          >
            <Play className="fill-current" /> Începe quiz-ul
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-3">
          {demoLobbyPlayers.map((name, i) => (
            <li
              key={name}
              className="flex animate-pop items-center gap-2 rounded-full border bg-background py-1.5 pr-4 pl-1.5 font-medium"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full font-semibold text-sm text-white",
                  ANSWER_STYLES[i % ANSWER_STYLES.length].bg,
                )}
              >
                {name[0]}
              </span>
              {name}
            </li>
          ))}
          <li className="flex items-center rounded-full border border-dashed px-4 py-1.5 text-muted-foreground">
            se așteaptă…
          </li>
        </ul>
      </section>
    </div>
  );
}
