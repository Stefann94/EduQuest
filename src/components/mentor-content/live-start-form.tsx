"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "./field";

/**
 * „Pornește o sesiune”: alegi clasa și quiz-ul, apoi deschizi panoul de control.
 * În demo, o combinație fără sesiune programată duce la sesiunea demo.
 */
export function LiveStartForm({
  classes,
  quizzes,
  scheduled,
  demoSessionId,
}: {
  classes: { id: string; name: string }[];
  quizzes: {
    id: string;
    title: string;
    classId: string | null;
    questions: number;
  }[];
  scheduled: { id: string; classId: string; quizId: string }[];
  demoSessionId?: string;
}) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [quizId, setQuizId] = useState("");
  const [errors, setErrors] = useState<{ classId?: string; quizId?: string }>(
    {},
  );

  // Pentru o clasă: quiz-urile ei și cele de exersare globală.
  const available = quizzes.filter(
    (q) => q.classId === null || q.classId === classId,
  );

  function start(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = {
      classId: classId ? undefined : "Alege clasa.",
      quizId: available.some((q) => q.id === quizId)
        ? undefined
        : "Alege quiz-ul pentru sesiune.",
    };
    setErrors(next);
    if (next.classId || next.quizId) return;

    const match = scheduled.find(
      (s) => s.classId === classId && s.quizId === quizId,
    );
    const target = match?.id ?? demoSessionId;
    if (!target) {
      toast.error("Nu am putut pregăti sesiunea.");
      return;
    }
    if (!match)
      toast.info("Sesiunea demo se deschide în locul uneia noi.", {
        description:
          "Crearea de sesiuni noi funcționează după conectarea la baza de date.",
      });
    router.push(`/mentor/live/${target}`);
  }

  return (
    <form onSubmit={start} noValidate className="grid gap-4">
      <Field id="live-class" label="Clasa" error={errors.classId}>
        <SelectField
          id="live-class"
          name="classId"
          value={classId}
          onValueChange={(v) => {
            setClassId(v);
            setQuizId("");
          }}
          items={classes.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Alege clasa"
          error={errors.classId}
        />
      </Field>
      <Field
        id="live-quiz"
        label="Quiz"
        error={errors.quizId}
        hint="Quiz-urile clasei și cele de exersare globală."
      >
        <SelectField
          id="live-quiz"
          name="quizId"
          value={quizId}
          onValueChange={setQuizId}
          items={available.map((q) => ({
            value: q.id,
            label: `${q.title} (${q.questions} întrebări)`,
          }))}
          placeholder="Alege quiz-ul"
          error={errors.quizId}
          hint="hint"
        />
      </Field>
      <Button type="submit" size="lg">
        <Play aria-hidden="true" /> Deschide lobby-ul
      </Button>
      <p className="text-muted-foreground text-xs">
        În lobby primești codul sesiunii. Quiz-ul începe doar când apeși tu
        „Începe quiz-ul”.
      </p>
    </form>
  );
}
