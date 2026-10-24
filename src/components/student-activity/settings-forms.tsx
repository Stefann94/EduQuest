"use client";

import { MailCheck } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { toast } from "sonner";
import {
  changeEmail,
  changePassword,
  type FormState,
  type NotificationPrefs,
  saveNotificationPrefs,
  updateProfile,
} from "@/app/(student)/setari/actions";
import { AVATARS } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AvatarId } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { FieldError } from "./field-error";

/** Rulează o acțiune fără să golească formularul (păstrăm valorile la eroare). */
function useFormAction<F extends string>(
  action: (prev: FormState<F>, data: FormData) => Promise<FormState<F>>,
  onSuccess?: () => void,
) {
  const [state, run, pending] = useActionState(
    async (prev: FormState<F>, data: FormData) => {
      const result = await action(prev, data);
      if (result.status === "success") {
        toast.success(result.message);
        onSuccess?.();
      }
      return result;
    },
    { status: "idle" } as FormState<F>,
  );
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };
  const errors: Partial<Record<F | "form", string[]>> =
    state.status === "error" ? state.errors : {};
  return { state, submit, pending, errors };
}

function Card({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-6 rounded-xl border bg-card p-5 shadow-xs md:grid-cols-[minmax(0,14rem)_1fr]"
    >
      <div>
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/* ---------- Profil ---------- */

export function ProfileForm({
  displayName,
  username,
  avatar,
}: {
  displayName: string;
  username: string;
  avatar: AvatarId;
}) {
  const [name, setName] = useState(displayName);
  const [chosen, setChosen] = useState<AvatarId>(avatar);
  const { submit, pending, errors } = useFormAction(updateProfile);

  return (
    <Card
      id="profil"
      title="Profil"
      description="Așa te văd colegii și mentorii din clasele tale."
    >
      <form onSubmit={submit} noValidate className="grid max-w-xl gap-5">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Nume afișat</Label>
          <Input
            id="displayName"
            name="displayName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={40}
            aria-invalid={errors.displayName ? true : undefined}
            aria-describedby={
              errors.displayName ? "displayName-error" : undefined
            }
          />
          <FieldError id="displayName-error" messages={errors.displayName} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username">Nume de utilizator</Label>
          <Input
            id="username"
            value={username}
            readOnly
            className="bg-muted text-muted-foreground"
            aria-describedby="username-hint"
          />
          <p id="username-hint" className="text-muted-foreground text-xs">
            Numele de utilizator nu se poate schimba. Îl folosești la
            autentificare.
          </p>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 font-medium text-sm">Personaj</legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
              <label
                key={id}
                className={cn(
                  "grid place-items-center gap-1 rounded-lg border p-2 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  chosen === id
                    ? "border-primary bg-primary-soft"
                    : "hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="avatar"
                  value={id}
                  checked={chosen === id}
                  onChange={() => setChosen(id)}
                  className="sr-only"
                />
                <span className="text-2xl" aria-hidden="true">
                  {AVATARS[id].emoji}
                </span>
                <span className="text-xs text-muted-foreground">
                  {AVATARS[id].label}
                </span>
              </label>
            ))}
          </div>
          <FieldError id="avatar-error" messages={errors.avatar} />
        </fieldset>

        <FieldError id="profile-form-error" messages={errors.form} />
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Se salvează…" : "Salvează profilul"}
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Email ---------- */

export function EmailForm({ email }: { email: string }) {
  const [value, setValue] = useState("");
  const { state, submit, pending, errors } = useFormAction(changeEmail);

  return (
    <Card
      id="email"
      title="Email"
      description="Adresa nu este vizibilă altor elevi. O folosim doar pentru cont și recuperarea parolei."
    >
      <div className="grid max-w-xl gap-5">
        <p className="text-sm">
          Adresa actuală: <strong className="font-medium">{email}</strong>
        </p>
        {state.status === "success" ? (
          <output className="flex gap-3 rounded-lg border bg-success-soft p-3 text-sm">
            <MailCheck
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <span>{state.message}</span>
          </output>
        ) : null}
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newEmail">Adresă nouă</Label>
            <Input
              id="newEmail"
              name="email"
              type="email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="email"
              placeholder="nume@exemplu.ro"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : "email-hint"}
            />
            {errors.email ? (
              <FieldError id="email-error" messages={errors.email} />
            ) : (
              <p id="email-hint" className="text-muted-foreground text-xs">
                Îți trimitem un link de confirmare la adresa nouă. Până îl
                deschizi, contul folosește în continuare adresa actuală.
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={pending || value.trim() === ""}
            className="w-fit"
          >
            {pending ? "Se trimite…" : "Trimite linkul de confirmare"}
          </Button>
        </form>
      </div>
    </Card>
  );
}

/* ---------- Parolă ---------- */

export function PasswordForm() {
  const [round, setRound] = useState(0);
  return <PasswordFields key={round} onDone={() => setRound((r) => r + 1)} />;
}

function PasswordFields({ onDone }: { onDone: () => void }) {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const { submit, pending, errors } = useFormAction(changePassword, onDone);
  const mismatch = values.confirm.length > 0 && values.confirm !== values.next;

  const field = (
    key: keyof typeof values,
    label: string,
    autoComplete: string,
    hint?: string,
  ) => {
    const err =
      errors[key] ??
      (key === "confirm" && mismatch
        ? ["Parolele nu se potrivesc."]
        : undefined);
    return (
      <div className="grid gap-2">
        <Label htmlFor={`pw-${key}`}>{label}</Label>
        <Input
          id={`pw-${key}`}
          name={key}
          type="password"
          value={values[key]}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
          autoComplete={autoComplete}
          aria-invalid={err ? true : undefined}
          aria-describedby={
            err ? `pw-${key}-error` : hint ? `pw-${key}-hint` : undefined
          }
        />
        {err ? (
          <FieldError id={`pw-${key}-error`} messages={err} />
        ) : hint ? (
          <p id={`pw-${key}-hint`} className="text-muted-foreground text-xs">
            {hint}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <Card
      id="parola"
      title="Parolă"
      description="Alege o parolă pe care nu o folosești în altă parte."
    >
      <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
        {field("current", "Parola actuală", "current-password")}
        {field(
          "next",
          "Parola nouă",
          "new-password",
          "Cel puțin 8 caractere. O frază scurtă e ușor de ținut minte.",
        )}
        {field("confirm", "Confirmă parola nouă", "new-password")}
        <FieldError id="pw-form-error" messages={errors.form} />
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Se schimbă…" : "Schimbă parola"}
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Notificări ---------- */

const PREFS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  {
    key: "assignments",
    label: "Teme noi",
    hint: "Când mentorul dă clasei o temă nouă.",
  },
  {
    key: "deadlines",
    label: "Termene apropiate",
    hint: "Cu o zi sau două înainte de termenul unei teme.",
  },
  {
    key: "feedback",
    label: "Feedback de la mentor",
    hint: "Când o problemă e acceptată sau trebuie refăcută.",
  },
  {
    key: "materials",
    label: "Lecții și materiale noi",
    hint: "Când apar lecții sau materiale noi în clasele tale.",
  },
  {
    key: "liveQuiz",
    label: "Quiz-uri live",
    hint: "Când mentorul deschide o sesiune live.",
  },
];

export function NotificationPrefsForm({
  initial,
}: {
  initial: Partial<NotificationPrefs>;
}) {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    assignments: initial.assignments ?? true,
    deadlines: initial.deadlines ?? true,
    feedback: initial.feedback ?? true,
    materials: initial.materials ?? true,
    liveQuiz: initial.liveQuiz ?? true,
  });
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    const result = await saveNotificationPrefs(prefs);
    setPending(false);
    if (result.ok) toast.success("Preferințele au fost salvate");
    else toast.error("Preferințele nu au putut fi salvate. Încearcă din nou.");
  }

  return (
    <Card
      id="notificari"
      title="Notificări"
      description="Alege ce notificări vezi în platformă."
    >
      <div className="grid max-w-xl gap-4">
        <ul className="divide-y rounded-lg border">
          {PREFS.map((p) => (
            <li
              key={p.key}
              className="flex items-start justify-between gap-4 p-3.5"
            >
              <div className="min-w-0">
                <Label htmlFor={`pref-${p.key}`}>{p.label}</Label>
                <p
                  id={`pref-${p.key}-hint`}
                  className="mt-1 text-muted-foreground text-xs"
                >
                  {p.hint}
                </p>
              </div>
              <Switch
                id={`pref-${p.key}`}
                checked={prefs[p.key]}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, [p.key]: checked })
                }
                aria-describedby={`pref-${p.key}-hint`}
                className="mt-0.5"
              />
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs">
          Mesajele importante despre cont (confirmarea adresei, recuperarea
          parolei) vin mereu pe email.
        </p>
        <Button onClick={save} disabled={pending} className="w-fit">
          {pending ? "Se salvează…" : "Salvează preferințele"}
        </Button>
      </div>
    </Card>
  );
}
