"use client";

import { Info } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import {
  changePassword,
  type FormState,
  requestEmailChange,
  updateNotificationPreferences,
  updateProfile,
} from "@/app/mentor/setari/actions";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AvatarId } from "@/lib/data/types";
import { FieldError } from "./class-details-fields";

function Card({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card shadow-xs">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-base">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 p-5">{children}</div>
      <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-5 py-3">
        {footer}
      </div>
    </section>
  );
}

/** Rulează acțiunea și confirmă rezultatul cu un mesaj. */
function useToastAction<F extends string>(
  fn: (prev: FormState<F>, fd: FormData) => Promise<FormState<F>>,
  onSuccess?: () => void,
) {
  return useActionState(
    async (prev: FormState<F>, fd: FormData) => {
      const res = await fn(prev, fd);
      if (res.status === "success") {
        toast.success(res.message, { description: res.note });
        onSuccess?.();
      }
      return res;
    },
    { status: "idle" } as FormState<F>,
  );
}

function Field({
  id,
  label,
  error,
  hint,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & React.ComponentProps<"input">) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AccountSettings({
  displayName,
  email,
  avatar,
}: {
  displayName: string;
  email: string;
  avatar: AvatarId;
}) {
  return (
    <div className="grid max-w-3xl gap-6">
      <ProfileForm displayName={displayName} avatar={avatar} />
      <EmailForm email={email} />
      <PasswordForm />
      <NotificationPreferences />
    </div>
  );
}

function ProfileForm({
  displayName,
  avatar,
}: {
  displayName: string;
  avatar: AvatarId;
}) {
  const [name, setName] = useState(displayName);
  const [state, action, pending] = useToastAction(updateProfile);
  const errors = state.status === "error" ? state.errors : {};

  return (
    <form action={action} noValidate>
      <Card
        title="Profil"
        description="Numele afișat apare elevilor în clase, la materiale și în feedback."
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? "Se salvează…" : "Salvează"}
          </Button>
        }
      >
        <div className="flex items-center gap-4">
          <UserAvatar name={name || displayName} avatar={avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <Field
              id="display-name"
              name="displayName"
              label="Nume afișat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoComplete="name"
              error={errors.displayName}
            />
          </div>
        </div>
      </Card>
    </form>
  );
}

function EmailForm({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Trimiterea pleacă doar din dialogul de confirmare (și la Enter într-un câmp).
  const confirmed = useRef(false);
  const [state, action, pending] = useToastAction(requestEmailChange, () => {
    setNewEmail("");
    setPassword("");
  });
  const errors = state.status === "error" ? state.errors : {};

  return (
    <form
      action={action}
      noValidate
      id="email-form"
      onSubmit={(e) => {
        // Cerem o confirmare explicită înainte de a trimite cererea.
        if (!confirmed.current) {
          e.preventDefault();
          if (newEmail.trim() !== "") setConfirmOpen(true);
          return;
        }
        confirmed.current = false;
        setConfirmOpen(false);
      }}
    >
      <Card
        title="Email de autentificare"
        description="Mentorii se autentifică cu adresa de email. Tot aici primești linkurile de resetare a parolei."
        footer={
          <Button type="submit" disabled={pending || newEmail.trim() === ""}>
            {pending ? "Se trimite…" : "Schimbă emailul"}
          </Button>
        }
      >
        <p className="text-sm">
          Adresa actuală: <strong className="font-medium">{email}</strong>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="new-email"
            name="email"
            type="email"
            label="Adresa nouă"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            placeholder="nume@exemplu.ro"
            error={errors.email}
          />
          <Field
            id="email-password"
            name="currentPassword"
            type="password"
            label="Parola actuală"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={errors.currentPassword}
          />
        </div>
        <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-muted-foreground text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Schimbarea are efect doar după ce deschizi linkul de confirmare trimis
          la adresa nouă. Până atunci te autentifici cu adresa actuală.
        </p>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schimbi adresa de autentificare?</DialogTitle>
            <DialogDescription>
              Îți vom trimite un link de confirmare la{" "}
              <strong className="text-foreground">{newEmail.trim()}</strong>.
              După confirmare, te vei autentifica doar cu adresa nouă.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Anulează
            </DialogClose>
            <Button
              type="submit"
              form="email-form"
              onClick={() => {
                confirmed.current = true;
              }}
            >
              Trimite linkul de confirmare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function PasswordForm() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [state, action, pending] = useToastAction(changePassword, () =>
    setValues({ currentPassword: "", newPassword: "", confirmPassword: "" }),
  );
  const errors = state.status === "error" ? state.errors : {};
  const set =
    (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form action={action} noValidate>
      <Card
        title="Parolă"
        description="Folosește o parolă pe care nu o mai ai la alte conturi."
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? "Se salvează…" : "Schimbă parola"}
          </Button>
        }
      >
        <Field
          id="current-password"
          name="currentPassword"
          type="password"
          label="Parola actuală"
          value={values.currentPassword}
          onChange={set("currentPassword")}
          autoComplete="current-password"
          error={errors.currentPassword}
          className="sm:max-w-sm"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="new-password"
            name="newPassword"
            type="password"
            label="Parola nouă"
            value={values.newPassword}
            onChange={set("newPassword")}
            autoComplete="new-password"
            hint="Cel puțin 8 caractere."
            error={errors.newPassword}
          />
          <Field
            id="confirm-password"
            name="confirmPassword"
            type="password"
            label="Confirmă parola nouă"
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </div>
      </Card>
    </form>
  );
}

const PREFERENCES = [
  {
    name: "submissions",
    label: "Trimiteri noi",
    description: "Când un elev trimite o temă pentru prima dată.",
  },
  {
    name: "resubmissions",
    label: "Retrimiteri",
    description: "Când un elev trimite din nou o temă după corecturi.",
  },
  {
    name: "classActivity",
    label: "Activitate în clase",
    description:
      "Elevi noi înscriși, quiz-uri live încheiate și termene apropiate.",
  },
] as const;

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    submissions: true,
    resubmissions: true,
    classActivity: true,
  });
  const [, action, pending] = useToastAction(updateNotificationPreferences);

  return (
    <form action={action}>
      {Object.entries(prefs).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value="on" /> : null,
      )}
      <Card
        title="Notificări"
        description="Alege ce notificări primești în aplicație."
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? "Se salvează…" : "Salvează preferințele"}
          </Button>
        }
      >
        <ul className="grid gap-1">
          {PREFERENCES.map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between gap-4 rounded-lg py-2"
            >
              <div className="min-w-0">
                <Label htmlFor={`pref-${p.name}`}>{p.label}</Label>
                <p
                  id={`pref-${p.name}-desc`}
                  className="mt-1 text-muted-foreground text-sm"
                >
                  {p.description}
                </p>
              </div>
              <Switch
                id={`pref-${p.name}`}
                checked={prefs[p.name]}
                onCheckedChange={(checked) =>
                  setPrefs((s) => ({ ...s, [p.name]: checked }))
                }
                aria-describedby={`pref-${p.name}-desc`}
              />
            </li>
          ))}
        </ul>
      </Card>
    </form>
  );
}
