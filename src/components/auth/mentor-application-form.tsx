"use client";

import { Lock, MailCheck, Send } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  applyAsMentor,
  type MentorApplicationState,
} from "@/app/(auth)/aplicare-mentor/actions";
import { ApplicationStatusBadge } from "@/components/common/status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DemoNote, ResultPanel } from "./auth-card";
import { FieldError, TextareaField, TextField } from "./form-fields";

const INITIAL: MentorApplicationState = { status: "idle" };

export function MentorApplicationForm() {
  const [state, action, pending] = useActionState(applyAsMentor, INITIAL);
  const [consent, setConsent] = useState(false);

  if (state.status === "success")
    return <Submitted fullName={state.fullName} email={state.email} />;

  const failed = state.status === "error" ? state : null;
  const errors = failed?.errors ?? {};
  const values = failed?.values ?? {};

  return (
    <form action={action} noValidate className="grid gap-8">
      <fieldset className="grid gap-4">
        <legend className="mb-1 grid gap-1">
          <span className="font-semibold">Date de contact</span>
          <span className="text-muted-foreground text-sm">
            Le folosim ca să-ți comunicăm rezultatul verificării. Dacă aplicația
            este aprobată, emailul devine datele tale de autentificare.
          </span>
        </legend>
        <TextField
          id="fullName"
          name="fullName"
          label="Nume complet"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={values.fullName}
          error={errors.fullName}
        />
        <div className="grid gap-4 sm:grid-cols-2">
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
          />
          <TextField
            id="phone"
            name="phone"
            type="tel"
            label="Telefon"
            autoComplete="tel"
            inputMode="tel"
            required
            defaultValue={values.phone}
            error={errors.phone}
            hint="Te sunăm doar dacă avem nevoie de o clarificare rapidă."
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-1 grid gap-1">
          <span className="font-semibold">Despre tine și clasa ta</span>
          <span className="text-muted-foreground text-sm">
            Ne ajută să verificăm că elevii vor lucra cu un mentor potrivit. Nu
            este nevoie de documente oficiale.
          </span>
        </legend>
        <TextareaField
          id="background"
          name="background"
          label="Experiența educațională sau profesională"
          required
          maxLength={2000}
          rows={4}
          defaultValue={values.background}
          error={errors.background}
          hint="De exemplu: studii, locul de muncă, experiență cu predarea sau cu activități pentru copii."
        />
        <TextareaField
          id="intendedUse"
          name="intendedUse"
          label="Cum vrei să folosești platforma"
          required
          maxLength={2000}
          rows={4}
          defaultValue={values.intendedUse}
          error={errors.intendedUse}
          hint="Ce ai vrea să predai, pentru ce vârstă și cât de des se întâlnește clasa."
        />
        <TextareaField
          id="evidence"
          name="evidence"
          label="Informații care îți susțin aplicația"
          required
          maxLength={2000}
          rows={3}
          defaultValue={values.evidence}
          error={errors.evidence}
          hint="O recomandare, organizația cu care colaborezi, un profil profesional sau proiecte relevante. Dacă e nevoie de mai multe detalii, îți scriem noi."
        />
      </fieldset>

      <div className="grid gap-4">
        <div className="flex gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
          <Lock
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="grid gap-1.5 text-muted-foreground">
            <p className="font-medium text-foreground">
              Cum folosim datele tale
            </p>
            <p>
              Aplicația este văzută doar de administratorii platformei și este
              folosită exclusiv pentru verificarea ta ca mentor. Telefonul și
              informațiile din aplicație nu apar niciodată elevilor sau altor
              mentori. Dacă aplicația este respinsă, datele se păstrează doar
              cât este necesar pentru evidența verificării.
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox din Base UI este controlul, inclus în etichetă */}
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              name="consent"
              checked={consent}
              onCheckedChange={setConsent}
              className="mt-0.5"
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              Sunt de acord ca datele din această aplicație să fie folosite
              pentru verificarea mea ca mentor, așa cum este descris mai sus.
            </span>
          </label>
          {errors.consent ? (
            <FieldError id="consent-error">{errors.consent}</FieldError>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/autentificare"
          className={buttonVariants({ variant: "ghost" })}
        >
          Înapoi la autentificare
        </Link>
        <Button type="submit" size="lg" disabled={pending}>
          <Send aria-hidden="true" />
          {pending ? "Se trimite…" : "Trimite aplicația"}
        </Button>
      </div>
    </form>
  );
}

function Submitted({ fullName, email }: { fullName: string; email: string }) {
  const firstName = fullName.split(" ")[0];
  return (
    <div className="grid gap-6">
      <ResultPanel icon={MailCheck} title={`Mulțumim, ${firstName}`}>
        <p>
          Am primit aplicația ta și am trimis o confirmare la{" "}
          <strong className="break-all font-medium text-foreground">
            {email}
          </strong>
          .
        </p>
      </ResultPanel>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
        <span className="font-medium text-sm">Starea aplicației</span>
        <ApplicationStatusBadge status="pending" />
      </div>

      <div className="grid gap-3">
        <h3 className="font-semibold text-sm">Ce urmează</h3>
        <ol className="stagger grid gap-3 text-muted-foreground text-sm">
          {[
            "Un administrator verifică aplicația, de obicei în câteva zile lucrătoare.",
            "Dacă avem nevoie de mai multe informații, îți scriem pe email ce anume lipsește.",
            "Primești un email de fiecare dată când se schimbă starea aplicației.",
            "Dacă aplicația este aprobată, primești un link securizat cu care îți setezi parola. Nu îți trimitem niciodată parola pe email.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary font-medium text-foreground text-xs"
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-muted-foreground text-sm">
        Până atunci nu ai un cont de mentor activ, deci nu te poți autentifica
        încă.
      </p>

      <DemoNote>
        Demo: aplicația nu se salvează. Verificarea poate fi văzută în zona de
        administrator.
      </DemoNote>

      <Link
        href="/autentificare"
        className={buttonVariants({ variant: "outline", className: "w-fit" })}
      >
        Înapoi la autentificare
      </Link>
    </div>
  );
}
