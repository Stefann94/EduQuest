import type { Metadata } from "next";
import { ExerciseGrid } from "@/components/app/exercise-grid";
import { PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { demoExercises } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Exerciții" };

export default function ExercisesPage() {
  const done = demoExercises.filter((e) => e.done).length;
  const total = demoExercises.length;

  return (
    <div className="grid gap-8">
      <PageHeader
        emoji="💻"
        title="Exerciții"
        description="Scrie cod adevărat și câștigă XP pentru fiecare exercițiu."
        action={
          <div className="sticker w-full min-w-56 p-4 sm:w-auto">
            <p className="mb-2 flex justify-between font-bold text-sm">
              <span>Progresul tău</span>
              <span className="tabular-nums">
                {done} / {total}
              </span>
            </p>
            <Progress
              value={Math.round((done / total) * 100)}
              aria-label="Exerciții rezolvate"
            />
          </div>
        }
      />
      <ExerciseGrid exercises={demoExercises} />
    </div>
  );
}
