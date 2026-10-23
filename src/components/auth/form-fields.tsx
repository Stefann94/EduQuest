"use client";

import { Check, CircleAlert, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "./password-rules";

/** Eroarea unui câmp, anunțată de cititoarele de ecran. */
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-destructive text-sm"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Eticheta, câmpul, explicația și eroarea, legate între ele prin id-uri. */
function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  labelAside,
  children,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  labelAside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {optional ? (
            <span className="font-normal text-muted-foreground">
              (opțional)
            </span>
          ) : null}
        </Label>
        {labelAside}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return ids || undefined;
}

type FieldProps = {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  labelAside?: React.ReactNode;
};

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  labelAside,
  className,
  ...input
}: FieldProps & Omit<React.ComponentProps<"input">, "id">) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      labelAside={labelAside}
    >
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={className}
        {...input}
      />
    </FieldShell>
  );
}

export function TextareaField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...textarea
}: FieldProps & Omit<React.ComponentProps<"textarea">, "id">) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
    >
      <Textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={className}
        {...textarea}
      />
    </FieldShell>
  );
}

/** Câmp de parolă cu buton pentru afișarea parolei. */
export function PasswordField({
  id,
  label,
  hint,
  error,
  labelAside,
  autoComplete,
  ...input
}: FieldProps &
  Omit<React.ComponentProps<"input">, "id" | "type"> & {
    autoComplete: "current-password" | "new-password";
  }) {
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      labelAside={labelAside}
    >
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className="pr-11"
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ascunde parola" : "Arată parola"}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </FieldShell>
  );
}

/** Parola nouă și confirmarea ei, cu cerințele bifate pe măsură ce utilizatorul scrie. */
export function NewPasswordFields({
  errors,
  passwordLabel = "Parolă",
}: {
  errors: { password?: string; confirm?: string };
  passwordLabel?: string;
}) {
  const [password, setPassword] = useState("");
  return (
    <>
      <div className="grid gap-2">
        <PasswordField
          id="password"
          name="password"
          label={passwordLabel}
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Folosește o parolă pe care nu o mai ai pe alte site-uri."
        />
        <ul
          className="grid gap-1 text-xs sm:grid-cols-3"
          aria-label="Cerințe pentru parolă"
        >
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-1.5",
                  ok ? "text-success" : "text-muted-foreground",
                )}
              >
                {ok ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <X className="size-3.5" aria-hidden="true" />
                )}
                {rule.label}
                <span className="sr-only">
                  {ok ? " (îndeplinită)" : " (neîndeplinită)"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <PasswordField
        id="confirm"
        name="confirm"
        label="Confirmă parola"
        autoComplete="new-password"
        required
        error={errors.confirm}
      />
    </>
  );
}

/** Mesaj de eroare pentru tot formularul (nu pentru un singur câmp). */
export function FormAlert({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex gap-2.5 rounded-lg border border-destructive/25 bg-danger-soft px-3 py-2.5 text-sm"
    >
      <CircleAlert
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div className="grid gap-0.5">
        {title ? <p className="font-medium text-destructive">{title}</p> : null}
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  );
}
