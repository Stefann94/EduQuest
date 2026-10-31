"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { setQuizArchived } from "@/app/mentor/quiz/actions";
import { Button } from "@/components/ui/button";

/** „Arhivează” / „Scoate din arhivă” pentru un quiz al mentorului. */
export function QuizArchiveButton({
  quizId,
  title,
  archived,
  size = "default",
}: {
  quizId: string;
  title: string;
  archived: boolean;
  size?: "default" | "sm";
}) {
  const [pending, startTransition] = useTransition();
  const Icon = archived ? ArchiveRestore : Archive;
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={pending}
      aria-label={
        archived
          ? `Scoate din arhivă quiz-ul „${title}”`
          : `Arhivează quiz-ul „${title}”`
      }
      onClick={() =>
        startTransition(async () => {
          const r = await setQuizArchived(quizId, !archived);
          if (r.ok) toast.success(r.message);
          else toast.error(r.message);
        })
      }
    >
      <Icon aria-hidden="true" />
      {archived ? "Scoate din arhivă" : "Arhivează"}
    </Button>
  );
}
