"use client";

import { toast } from "sonner";
import { deleteQuiz } from "@/app/mentor/quiz/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";

export function QuizDeleteButton({
  quizId,
  title,
  icon,
}: {
  quizId: string;
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <ConfirmDialog
      title="Ștergi quiz-ul?"
      description={`„${title}” dispare din toate clasele, împreună cu rezultatele elevilor. XP-ul deja primit rămâne.`}
      confirmLabel="Șterge quiz-ul"
      onConfirm={async () => {
        const r = await deleteQuiz(quizId);
        if (!r.ok) toast.error(r.message);
      }}
      trigger={
        <Button variant="ghost" className="text-destructive">
          {icon} Șterge
        </Button>
      }
    />
  );
}
