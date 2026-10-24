"use client";

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteHomework, setHomeworkArchived } from "@/app/mentor/teme/actions";
import { ConfirmDialog } from "@/components/mentor-content/confirm-dialog";
import { Button } from "@/components/ui/button";

/** Arhivarea (tema dispare din panou, elevii o păstrează în arhivă) și ștergerea. */
export function HomeworkActions({
  homeworkId,
  title,
  archived,
}: {
  homeworkId: string;
  title: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await setHomeworkArchived(homeworkId, !archived);
            if (r.ok) toast.success(r.message);
            else toast.error(r.message);
            router.refresh();
          })
        }
      >
        {archived ? <ArchiveRestore /> : <Archive />}
        {archived ? "Scoate din arhivă" : "Arhivează"}
      </Button>
      <ConfirmDialog
        title="Ștergi tema?"
        description={`„${title}” dispare definitiv, din toate clasele. Se poate doar dacă niciun elev n-a trimis încă nimic; altfel arhiveaz-o.`}
        confirmLabel="Șterge tema"
        onConfirm={async () => {
          const r = await deleteHomework(homeworkId);
          if (!r.ok) toast.error(r.message);
        }}
        trigger={
          <Button variant="ghost" className="text-destructive">
            <Trash2 /> Șterge
          </Button>
        }
      />
    </div>
  );
}
