"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { type CreateClassState, createClass } from "@/app/mentor/clase/actions";
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
import { ClassDetailsFields } from "./class-details-fields";
import { CopyButton } from "./copy-button";

const INITIAL: CreateClassState = { status: "idle" };

export function CreateClassDialog({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
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
      <DialogTrigger render={<Button variant={variant} />}>
        <Plus aria-hidden="true" /> Creează clasă
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <CreateClassForm key={round} />
      </DialogContent>
    </Dialog>
  );
}

function CreateClassForm() {
  const [state, action, pending] = useActionState(createClass, INITIAL);

  if (state.status === "success") {
    return (
      <>
        <DialogHeader>
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>Clasa a fost creată</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{state.name}</strong> ·{" "}
            {state.schedule}. Trimite-le elevilor codul de mai jos, ca să se
            poată înscrie.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 rounded-lg border border-dashed bg-muted/40 p-4 text-center">
          <p className="text-muted-foreground text-xs">Cod de invitație</p>
          <p className="font-mono font-semibold text-3xl tracking-[0.3em]">
            {state.code}
          </p>
          <div className="flex justify-center">
            <CopyButton
              value={state.code}
              label="Copiază codul"
              successMessage={`Codul ${state.code} a fost copiat.`}
            />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Poți genera oricând un cod nou sau îl poți dezactiva din setările
          clasei.
        </p>
        <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground text-xs">
          Demo: clasa se salvează după conectarea la baza de date.
        </p>
        <DialogFooter>
          <DialogClose render={<Button />}>Gata</DialogClose>
        </DialogFooter>
      </>
    );
  }

  const errors = state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Creează o clasă</DialogTitle>
        <DialogDescription>
          După creare primești un cod de invitație de 6 caractere pe care îl
          trimiți elevilor.
        </DialogDescription>
      </DialogHeader>
      <ClassDetailsFields
        // Remontăm câmpurile după fiecare trimitere, ca să păstreze valorile introduse.
        key={values ? JSON.stringify(values) : "new"}
        idPrefix="new-class"
        errors={errors}
        defaults={values}
      />
      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" />}>
          Anulează
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Se creează…" : "Creează clasa"}
        </Button>
      </DialogFooter>
    </form>
  );
}
