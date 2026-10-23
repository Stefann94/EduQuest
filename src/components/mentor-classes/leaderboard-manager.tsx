"use client";

import { Medal, SlidersHorizontal, Star, Trophy } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import {
  type AdjustXpState,
  adjustXp,
} from "@/app/mentor/clase/[id]/clasament/actions";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AvatarId } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { FieldError } from "./class-details-fields";

export type LeaderboardEntry = {
  id: string;
  displayName: string;
  username?: string;
  avatar: AvatarId;
  xp: number;
};

/** Locurile se împart la XP egal (1, 2, 2, 4), ca în clasamentul elevilor. */
function ranked(rows: LeaderboardEntry[]) {
  const sorted = [...rows].sort(
    (a, b) => b.xp - a.xp || a.displayName.localeCompare(b.displayName),
  );
  let rank = 0;
  return sorted.map((r, i) => {
    if (i === 0 || r.xp !== sorted[i - 1].xp) rank = i + 1;
    return { ...r, rank };
  });
}

const PODIUM: Record<number, { label: string; className: string }> = {
  1: { label: "Locul 1", className: "bg-xp-soft text-xp-foreground" },
  2: { label: "Locul 2", className: "bg-secondary text-secondary-foreground" },
  3: { label: "Locul 3", className: "bg-secondary text-secondary-foreground" },
};

export function LeaderboardManager({
  classId,
  initialRows,
  canAdjust,
}: {
  classId: string;
  initialRows: LeaderboardEntry[];
  canAdjust: boolean;
}) {
  // Demo: ajustările se văd doar în pagină. Cu Supabase, totalul se recalculează din istoric.
  const [rows, setRows] = useState(initialRows);
  const list = ranked(rows);

  return (
    <ol className="stagger grid gap-2">
      {list.map((r) => {
        const podium = PODIUM[r.rank];
        return (
          <li
            key={r.id}
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-4 py-3 shadow-xs",
              r.rank === 1 && "border-xp/40",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full font-semibold text-sm tabular-nums",
                podium ? podium.className : "text-muted-foreground",
              )}
            >
              <span className="sr-only">Locul </span>
              {r.rank}
            </span>
            <UserAvatar name={r.displayName} avatar={r.avatar} />
            <div className="min-w-0 flex-1 basis-40">
              <p className="flex items-center gap-1.5 truncate font-medium">
                {r.displayName}
                {r.rank === 1 ? (
                  <Trophy className="size-4 text-xp" aria-hidden="true" />
                ) : r.rank <= 3 ? (
                  <Medal
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : null}
              </p>
              {r.username ? (
                <p className="truncate text-muted-foreground text-xs">
                  @{r.username}
                </p>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
              <Star className="size-4 fill-xp text-xp" aria-hidden="true" />
              {r.xp} XP
            </span>
            {canAdjust ? (
              <AdjustXpDialog
                classId={classId}
                student={r}
                onAdjusted={(amount) =>
                  setRows((all) =>
                    all.map((x) =>
                      x.id === r.id ? { ...x, xp: x.xp + amount } : x,
                    ),
                  )
                }
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function AdjustXpDialog({
  classId,
  student,
  onAdjusted,
}: {
  classId: string;
  student: LeaderboardEntry;
  onAdjusted: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRound((r) => r + 1);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Ajustează XP pentru ${student.displayName}`}
          />
        }
      >
        <SlidersHorizontal aria-hidden="true" />
        <span className="hidden sm:inline">Ajustează XP</span>
      </DialogTrigger>
      <DialogContent>
        <AdjustForm
          key={round}
          classId={classId}
          student={student}
          onDone={(amount) => {
            onAdjusted(amount);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

const INITIAL: AdjustXpState = { status: "idle" };

function AdjustForm({
  classId,
  student,
  onDone,
}: {
  classId: string;
  student: LeaderboardEntry;
  onDone: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [state, action, pending] = useActionState(
    async (prev: AdjustXpState, formData: FormData) => {
      const res = await adjustXp(prev, formData);
      if (res.status === "success") {
        toast.success(`Ajustare înregistrată: ${res.message}`, {
          description: res.note,
        });
        onDone(Number(formData.get("amount")));
      } else if (res.status === "error" && res.message) {
        toast.error(res.message);
      }
      return res;
    },
    INITIAL,
  );
  const errors = state.status === "error" ? state.errors : {};
  const n = Number(amount);
  const preview =
    amount !== "" && Number.isInteger(n) && n !== 0 && Math.abs(n) <= 10
      ? student.xp + n
      : null;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="studentId" value={student.id} />
      <DialogHeader>
        <DialogTitle>Ajustează XP pentru {student.displayName}</DialogTitle>
        <DialogDescription>
          Folosește ajustarea pentru corecturi sau recompense speciale. Are acum{" "}
          <strong className="text-foreground">{student.xp} XP</strong> în
          această clasă.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="xp-amount">XP de adăugat sau de scăzut</Label>
        <Input
          id="xp-amount"
          name="amount"
          type="number"
          inputMode="numeric"
          min={-10}
          max={10}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ex. 3 sau -2"
          className="w-40 tabular-nums"
          aria-invalid={errors.amount ? true : undefined}
          aria-describedby={
            errors.amount ? "xp-amount-error" : "xp-amount-hint"
          }
        />
        {errors.amount ? (
          <FieldError id="xp-amount-error" message={errors.amount} />
        ) : (
          <p id="xp-amount-hint" className="text-muted-foreground text-xs">
            Un număr întreg între -10 și +10, diferit de 0.
            {preview !== null ? ` Noul total: ${preview} XP.` : null}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="xp-reason">Motivul</Label>
        <Textarea
          id="xp-reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ex. Prezență corectată: a fost la întâlnirea din 17 octombrie."
          maxLength={200}
          className="min-h-20"
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={
            errors.reason ? "xp-reason-error" : "xp-reason-hint"
          }
        />
        {errors.reason ? (
          <FieldError id="xp-reason-error" message={errors.reason} />
        ) : (
          <p id="xp-reason-hint" className="text-muted-foreground text-xs">
            Obligatoriu. Elevul vede motivul în istoricul lui de XP.
          </p>
        )}
      </div>

      <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground text-xs">
        Fiecare ajustare se înregistrează în istoricul de XP, cu sursa
        „Ajustare”, motivul și data. Totalul din clasament se recalculează din
        acest istoric.
      </p>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" />}>
          Anulează
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Se salvează…" : "Salvează ajustarea"}
        </Button>
      </DialogFooter>
    </form>
  );
}
