"use client";

import { KeyRound, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import {
  type ResetState,
  resetPassword,
} from "@/app/(auth)/resetare-parola/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { ResultPanel } from "./auth-card";
import { FormAlert, NewPasswordFields } from "./form-fields";

const INITIAL: ResetState = { status: "idle" };

export function ResetForm() {
  const [state, action, pending] = useActionState(resetPassword, INITIAL);

  if (state.status === "success")
    return (
      <div className="grid gap-6">
        <ResultPanel icon={ShieldCheck} title="Parola a fost schimbată">
          <p>
            Te poți autentifica acum cu parola nouă. Din motive de siguranță, am
            închis sesiunile deschise pe alte dispozitive.
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
        {pending ? "Se salvează…" : "Salvează parola nouă"}
      </Button>
    </form>
  );
}
