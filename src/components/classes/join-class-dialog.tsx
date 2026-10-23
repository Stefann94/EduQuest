"use client";

import { CheckCircle2, CircleAlert, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { type JoinClassState, joinClass } from "@/app/(student)/clase/actions";
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

const INITIAL: JoinClassState = { status: "idle" };

export function JoinClassDialog() {
  const [open, setOpen] = useState(false);
  // Cheia resetează formularul la fiecare deschidere.
  const [round, setRound] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRound((r) => r + 1);
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus /> Alătură-te unei clase
      </DialogTrigger>
      <DialogContent>
        <JoinForm key={round} />
      </DialogContent>
    </Dialog>
  );
}

function JoinForm() {
  const [state, action, pending] = useActionState(joinClass, INITIAL);
  const [code, setCode] = useState("");

  if (state.status === "success") {
    return (
      <>
        <DialogHeader>
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>Te-ai alăturat clasei</DialogTitle>
          <DialogDescription>
            Acum faci parte din{" "}
            <strong className="text-foreground">{state.className}</strong>, cu
            mentorul {state.mentorName}. Vei primi notificări pentru temele și
            materialele noi.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground text-xs">
          Demo: înscrierea se salvează după conectarea la baza de date.
        </p>
        <DialogFooter>
          <DialogClose render={<Button />}>Gata</DialogClose>
        </DialogFooter>
      </>
    );
  }

  const error = state.status === "error" ? state.message : null;

  return (
    <form action={action} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Alătură-te unei clase</DialogTitle>
        <DialogDescription>
          Introdu codul de invitație primit de la mentor. Are 6 caractere,
          litere și cifre.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="invite-code">Cod de invitație</Label>
        <Input
          id="invite-code"
          name="code"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .replace(/[^a-z0-9]/gi, "")
                .toUpperCase()
                .slice(0, 6),
            )
          }
          placeholder="ex. PY7K2Q"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "invite-error" : "invite-hint"}
          className="h-12 text-center font-mono text-lg uppercase tracking-[0.3em]"
        />
        {error ? (
          <p
            id="invite-error"
            role="alert"
            className="flex items-start gap-1.5 text-destructive text-sm"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {error}
          </p>
        ) : (
          <p id="invite-hint" className="text-muted-foreground text-xs">
            Demo: încearcă OOP9X3 (valid), PY7K2Q (ești deja înscris) sau PY1OLD
            (expirat).
          </p>
        )}
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" />}>
          Anulează
        </DialogClose>
        <Button type="submit" disabled={code.length !== 6 || pending}>
          {pending ? "Se verifică…" : "Alătură-te"}
        </Button>
      </DialogFooter>
    </form>
  );
}
