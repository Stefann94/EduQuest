"use client";

import { KeyRound, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import {
  type ActivationState,
  activateMentor,
} from "@/app/(auth)/activare/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultPanel } from "./auth-card";
import { FormAlert, NewPasswordFields } from "./form-fields";

const INITIAL: ActivationState = { status: "idle" };

export function ActivationForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(activateMentor, INITIAL);

  if (state.status === "success")
    return (
      <div className="grid gap-6">
        <ResultPanel icon={ShieldCheck} title="Contul tău de mentor este activ">
          <p>
            Parola a fost setată, iar linkul de activare nu mai poate fi folosit
            din nou. Te poți autentifica acum cu adresa{" "}
            <strong className="break-all font-medium text-foreground">
              {email}
            </strong>
            , din fila Mentor.
          </p>
        </ResultPanel>
        <Link
          href="/autentificare"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          <LogIn aria-hidden="true" /> Mergi la autentificare
        </Link>
      </div>
    );

  const failed = state.status === "error" ? state : null;

  return (
    <form action={action} noValidate className="grid gap-4">
      {failed?.message ? (
        <FormAlert title={failed.title}>{failed.message}</FormAlert>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="activation-email">Adresa de email</Label>
        <Input
          id="activation-email"
          type="email"
          name="username"
          autoComplete="username"
          value={email}
          readOnly
          aria-describedby="activation-email-hint"
          className="bg-muted text-muted-foreground"
        />
        <p id="activation-email-hint" className="text-muted-foreground text-xs">
          Cu această adresă te vei autentifica. Mentorii nu au username.
        </p>
      </div>
      <NewPasswordFields
        errors={failed?.errors ?? {}}
        passwordLabel="Parolă nouă"
      />
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="mt-1 w-full"
      >
        <KeyRound aria-hidden="true" />
        {pending ? "Se activează…" : "Setează parola și activează contul"}
      </Button>
    </form>
  );
}
