import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeEditor } from "@/components/app/code-editor";
import { LevelStars } from "@/components/app/level-stars";
import { demoExercises } from "@/lib/demo-data";

type Props = PageProps<"/exercitii/[id]">;

export function generateStaticParams() {
  return demoExercises.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const exercise = demoExercises.find((e) => e.id === id);
  return { title: exercise?.title ?? "Exercițiu" };
}

export default function ExercisePage({ params }: Props) {
  return (
    <div className="grid gap-6">
      <Link
        href="/exercitii"
        className="flex w-fit items-center gap-1 font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Toate exercițiile
      </Link>
      {/* params sunt date din URL: Suspense lasă navigarea să afișeze imediat scheletul. */}
      <Suspense fallback={<ExerciseSkeleton />}>
        <Exercise params={params} />
      </Suspense>
    </div>
  );
}

async function Exercise({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const exercise = demoExercises.find((e) => e.id === id);
  if (!exercise) notFound();

  return (
    <div className="groups grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="stagger-rise grid content-start gap-4">
        <section className="sticker p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="anim-pop grid size-16 shrink-0 -rotate-6 place-items-center rounded-3xl bg-primary text-4xl shadow-[0_5px_0_0_var(--primary-shadow)]"
            >
              {exercise.emoji}
            </span>
            <div>
              <h1 className="anim-fade font-bold text-3xl leading-tight">
                {exercise.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <LevelStars level={exercise.level} />
                <span className="anim-pop rounded-full bg-primary-soft px-2.5 py-0.5 font-bold text-secondary-foreground text-xs">
                  +{exercise.xp} XP
                </span>
                <span className="font-bold text-muted-foreground text-sm">
                  {exercise.topic}
                </span>
              </div>
            </div>
          </div>
          <h2 className="anim-fade mt-6 font-bold text-xl">
            🎯 Ce ai de făcut
          </h2>
          <p className="anim-fade mt-1 font-semibold text-lg">
            {exercise.statement}
          </p>

          <h2 className="anim-fade mt-5 font-bold text-xl">
            👀 Exemplu de rezultat
          </h2>
          <pre className="anim-fade mt-2 overflow-x-auto rounded-2xl bg-code px-4 py-3 font-mono text-code-foreground">
            {exercise.example}
          </pre>
        </section>

        <details className="sticker group p-5">
          <summary className="flex list-none items-center justify-between font-bold font-heading text-xl">
            💡 Ai nevoie de un indiciu?
            <span className="text-muted-foreground transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <p className="mt-3 animate-pop font-semibold text-lg">
            {exercise.hint}
          </p>
        </details>
      </div>

      <CodeEditor starter={exercise.starter} />
    </div>
  );
}

function ExerciseSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid animate-pulse gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <div className="sticker h-96" />
      <div className="h-96 rounded-3xl bg-code/80" />
    </div>
  );
}
