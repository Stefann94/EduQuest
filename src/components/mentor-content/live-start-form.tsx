"use client";

import { Play } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { startLiveSession } from "@/app/mentor/live/actions";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "./field";

/** „Pornește un quiz live”: clasa, quiz-ul și timpul pe întrebare; codul îl dă baza de date. */
export function LiveStartForm({
  classes,
  quizzes,
  defaultClassId,
}: {
  classes: { id: string; name: string }[];
  quizzes: {
    id: string;
    title: string;
    questions: number;
    classIds: string[];
  }[];
  defaultClassId?: string;
}) {
  const [classId, setClassId] = useState(
    defaultClassId ?? classes[0]?.id ?? "",
  );
  const [quizId, setQuizId] = useState("");
  const [seconds, setSeconds] = useState("20");
  const [pending, startTransition] = useTransition();

  // Întâi quiz-urile date clasei alese, apoi celelalte.
  const sorted = [...quizzes]
    .filter((q) => q.questions > 0)
    .sort(
      (a, b) =>
        Number(b.classIds.includes(classId)) -
        Number(a.classIds.includes(classId)),
    );

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          // La reușită, acțiunea deschide direct panoul de control.
          const r = await startLiveSession({
            quizId,
            classId,
            seconds: Number(seconds),
          });
          if (r && !r.ok) toast.error(r.message);
        });
      }}
    >
      <Field id="live-class" label="Clasa">
        <SelectField
          id="live-class"
          name="classId"
          value={classId}
          onValueChange={setClassId}
          items={classes.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Alege clasa"
        />
      </Field>
      <Field id="live-quiz" label="Quiz">
        <SelectField
          id="live-quiz"
          name="quizId"
          value={quizId}
          onValueChange={setQuizId}
          items={sorted.map((q) => ({
            value: q.id,
            label: `${q.title} (${q.questions} întrebări)`,
          }))}
          placeholder={
            sorted.length ? "Alege quiz-ul" : "Creează întâi un quiz"
          }
        />
      </Field>
      <Field id="live-seconds" label="Timp pe întrebare">
        <SelectField
          id="live-seconds"
          name="seconds"
          value={seconds}
          onValueChange={setSeconds}
          items={["10", "15", "20", "30", "45", "60"].map((s) => ({
            value: s,
            label: `${s} secunde`,
          }))}
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
