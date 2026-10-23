"use client";

import { MailCheck, Send } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import {
  type RecoveryState,
  requestPasswordReset,
} from "@/app/(auth)/recuperare-parola/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { DemoNote, ResultPanel } from "./auth-card";
import { TextField } from "./form-fields";

const INITIAL: RecoveryState = { status: "idle" };

export function RecoveryForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    INITIAL,
  );

  if (state.status === "success")
    return (
      <div className="grid gap-6">
        <ResultPanel icon={MailCheck} tone="info" title="Verifică-ți emailul">
          <p>
            Dacă există un cont asociat acestei adrese, vei primi în câteva
            minute un link de resetare valabil 60 de minute.
          </p>
          <p>
            Linkul poate fi folosit o singură dată. Dacă nu primești nimic,
            verifică dosarul Spam sau încearcă din nou cu adresa folosită la
            înregistrare.
          </p>
        </ResultPanel>
        <Link
          href="/autentificare"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Înapoi la autentificare
        </Link>
        <DemoNote>
          Demo: niciun email nu este trimis. Pagina de resetare este la{" "}
          <Link
            href="/resetare-parola"
            className="font-medium text-foreground underline underline-offset-2"
          >
            /resetare-parola
          </Link>
          .
        </DemoNote>
      </div>
    );

  const failed = state.status === "error" ? state : null;

  return (
    <form action={action} noValidate className="grid gap-4">
      <TextField
        id="email"
        name="email"
        type="email"
        label="Adresa de email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={failed?.values.email}
        error={failed?.errors.email}
        hint="Adresa folosită la crearea contului, de elev sau de mentor."
      />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <Send aria-hidden="true" />
        {pending ? "Se trimite…" : "Trimite linkul de resetare"}
      </Button>
    </form>
  );
}
