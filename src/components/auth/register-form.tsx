"use client";

import { MailCheck, RotateCw, UserPlus } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type RegisterState,
  register,
  resendVerification,
} from "@/app/(auth)/inregistrare/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { DemoNote, linkClass, ResultPanel } from "./auth-card";
import { NewPasswordFields, TextField } from "./form-fields";

const INITIAL: RegisterState = { status: "idle" };

export function RegisterForm() {
  // Cheia golește formularul când elevul vrea să o ia de la capăt.
  const [round, setRound] = useState(0);
  return <Register key={round} onRestart={() => setRound((r) => r + 1)} />;
}

function Register({ onRestart }: { onRestart: () => void }) {
  const [state, action, pending] = useActionState(register, INITIAL);

  if (state.status === "success")
    return <VerifyEmail email={state.email} onRestart={onRestart} />;

  const failed = state.status === "error" ? state : null;
  const errors = failed?.errors ?? {};
  const values = failed?.values ?? {};

  return (
    <div className="grid gap-5">
      <form action={action} noValidate className="grid gap-4">
        <TextField
          id="displayName"
          name="displayName"
          label="Nume afișat"
          autoComplete="name"
          required
          maxLength={40}
          defaultValue={values.displayName}
          error={errors.displayName}
          hint="Așa te vor vedea mentorul și colegii din clasele tale."
        />
        <TextField
          id="username"
          name="username"
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={20}
          defaultValue={values.username}
          error={errors.username}
          hint="3–20 caractere: litere mici, cifre, punct sau underscore. Ex.: maria.pop"
        />
        <TextField
          id="email"
          name="email"
          type="email"
          label="Adresa de email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={values.email}
          error={errors.email}
          hint="O folosim doar pentru verificarea contului și recuperarea parolei. Nu este afișată altor utilizatori."
        />
        <NewPasswordFields errors={errors} />
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          <UserPlus aria-hidden="true" />
          {pending ? "Se creează contul…" : "Creează contul"}
        </Button>
      </form>
      <DemoNote>
        Demo: username-uri deja folosite, de exemplu{" "}
        <span className="font-mono text-foreground">tudor.p</span> sau{" "}
        <span className="font-mono text-foreground">maria.i</span>, și emailuri
        precum{" "}
        <span className="font-mono text-foreground">maria.i@exemplu.ro</span>.
      </DemoNote>
    </div>
  );
}

function VerifyEmail({
  email,
  onRestart,
}: {
  email: string;
  onRestart: () => void;
}) {
  const [sending, startSending] = useTransition();

  function resend() {
    startSending(async () => {
      const { ok } = await resendVerification(email);
      if (ok)
        toast.success("Am retrimis emailul de verificare", {
          description: `Verifică ${email}. Demo: emailul nu se trimite cu adevărat.`,
        });
      else toast.error("Nu am putut retrimite emailul. Încearcă din nou.");
    });
  }

  return (
    <div className="grid gap-6">
      <ResultPanel icon={MailCheck} title="Verifică-ți emailul">
        <p>
          Am trimis un link de confirmare la{" "}
          <strong className="break-all font-medium text-foreground">
            {email}
          </strong>
          .
        </p>
        <p>
          Deschide emailul și apasă pe link ca să-ți activezi contul. Linkul
          este valabil 24 de ore. Dacă nu îl găsești, verifică și dosarul Spam.
        </p>
      </ResultPanel>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={resend}
          disabled={sending}
          className="w-full"
        >
          <RotateCw aria-hidden="true" />
          {sending ? "Se trimite…" : "Retrimite emailul"}
        </Button>
        <Link
          href="/autentificare"
          className={buttonVariants({ className: "w-full" })}
        >
          Mergi la autentificare
        </Link>
      </div>
      <p className="text-center text-muted-foreground text-xs">
        Ai greșit adresa?{" "}
        <button type="button" onClick={onRestart} className={linkClass}>
          Completează din nou formularul
        </button>
      </p>
    </div>
  );
}
