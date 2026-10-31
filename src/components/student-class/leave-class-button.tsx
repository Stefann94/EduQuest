"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { leaveClass } from "@/app/(student)/clase/actions";
import { ConfirmDialog } from "@/components/mentor-content/confirm-dialog";
import { Button } from "@/components/ui/button";

/** Ieșirea din clasă, cu confirmare. XP-ul rămâne; elevul poate reveni cu codul. */
export function LeaveClassButton({
  classId,
  className,
}: {
  classId: string;
  className: string;
}) {
  return (
    <ConfirmDialog
      title={`Ieși din ${className}?`}
      description="Nu vei mai vedea materialele, temele și quiz-urile clasei. XP-ul strâns rămâne al tău, iar dacă te răzgândești, revii cu codul de invitație de la mentor."
      confirmLabel="Ieși din clasă"
      onConfirm={async () => {
        // La reușită, acțiunea duce la lista claselor.
        const r = await leaveClass(classId);
        if (r && !r.ok) toast.error(r.message);
      }}
      trigger={
        <Button variant="outline" className="w-fit text-destructive">
          <LogOut /> Ieși din clasă
        </Button>
      }
    />
  );
}
