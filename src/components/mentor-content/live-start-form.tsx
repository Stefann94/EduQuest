"use client";

import { Play, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { startLiveSession } from "@/app/mentor/live/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, SelectField } from "./field";

/**
 * „Deschide o sesiune”: clasa și quiz-ul live (timpul e pus pe fiecare întrebare);
 * codul de 6 cifre îl dă baza de date.
 */
export function LiveStartForm({
  classes,
  quizzes,
  defaultClassId,
}: {
  classes: { id: string; name: string }[];
  /** Doar quiz-urile live ale mentorului. */
  quizzes: { id: string; title: string; questions: number }[];
  defaultClassId?: string;
}) {
  const playable = quizzes.filter((q) => q.questions > 0);
  const [classId, setClassId] = useState(
    classes.find((c) => c.id === defaultClassId)?.id ?? classes[0]?.id ?? "",
  );
  const [quizId, setQuizId] = useState(() => playable[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  if (playable.length === 0)
    return (
      <div className="grid gap-3">
        <p className="text-muted-foreground text-sm">
          Nu ai încă un quiz live cu întrebări. Creează unul, apoi îl poți juca
          cu orice clasă.
        </p>
        <Link
          href="/mentor/quiz/nou?mod=live"
          className={buttonVariants({ variant: "cta" })}
        >
          <Plus aria-hidden="true" /> Quiz live nou
        </Link>
      </div>
    );

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          // La reușită, acțiunea deschide direct panoul de control.
          const r = await startLiveSession({ quizId, classId });
          if (r && !r.ok) toast.error(r.message);
        });
      }}
    >
      <Field id="live-quiz" label="Quiz live">
        <SelectField
          id="live-quiz"
          name="quizId"
          value={quizId}
          onValueChange={setQuizId}
          items={playable.map((q) => ({
            value: q.id,
            label: `${q.title} (${q.questions} întrebări)`,
          }))}
          placeholder="Alege quiz-ul"
        />
      </Field>
      <Field id="live-class" label="Clasa">
        <SelectField
          id="live-class"
          name="classId"
          value={classId}
          onValueChange={setClassId}
          items={classes.map((c) => ({ value: c.id, label: c.name }))}
          placeholder={classes.length ? "Alege clasa" : "Nu ai clase active"}
        />
      </Field>
      <Button
        type="submit"
        variant="cta"
        size="lg"
        disabled={pending || !classId || !quizId}
      >
        <Play aria-hidden="true" />{" "}
        {pending ? "Se deschide…" : "Deschide sala de așteptare"}
      </Button>
      <p className="text-muted-foreground text-xs">
        Primești un cod unic de 6 cifre. Jocul începe doar când apeși „Începe”.
      </p>
    </form>
  );
}
