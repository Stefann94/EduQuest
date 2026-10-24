"use client";

import { GraduationCap, LogIn, Presentation } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { type LoginState, login } from "@/app/(auth)/autentificare/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoNote, linkClass } from "./auth-card";
import { FormAlert, PasswordField, TextField } from "./form-fields";

type LoginRole = "student" | "mentor";

const INITIAL: LoginState = { status: "idle" };

/** Autentificarea, cu alegerea rolului: Elev (implicit) sau Mentor. */
export function LoginForm() {
  return (
    <Tabs defaultValue="student" className="gap-5">
      <div className="grid gap-2">
        <p id="role-label" className="font-medium text-sm">
          Intru în cont ca
        </p>
        <TabsList aria-labelledby="role-label" className="h-10! w-full">
          <TabsTrigger value="student">
            <GraduationCap aria-hidden="true" /> Elev
          </TabsTrigger>
          <TabsTrigger value="mentor">
            <Presentation aria-hidden="true" /> Mentor
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="student">
        <RoleForm kind="student" />
      </TabsContent>
      <TabsContent value="mentor">
        <RoleForm kind="mentor" />
      </TabsContent>
    </Tabs>
  );
}

function RoleForm({ kind: role }: { kind: LoginRole }) {
  const [state, action, pending] = useActionState(login, INITIAL);
  const failed = state.status === "error" ? state : null;
  const student = role === "student";

  return (
    <div className="grid gap-5">
      <form action={action} noValidate className="grid gap-4">
        <input type="hidden" name="role" value={role} />
        {failed?.message ? (
          <FormAlert title={failed.title ?? "Nu te-am putut autentifica"}>
            {failed.message}
          </FormAlert>
        ) : null}
        <TextField
          id={`${role}-identifier`}
          name="identifier"
          label={student ? "Username sau email" : "Adresa de email"}
          type={student ? "text" : "email"}
          autoComplete={student ? "username" : "email"}
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={failed?.values.identifier}
          error={failed?.errors.identifier}
          hint={
            student
              ? undefined
              : "Mentorii nu au username: te autentifici cu emailul verificat."
          }
        />
        <PasswordField
          id={`${role}-password`}
          name="password"
          label="Parolă"
          autoComplete="current-password"
          required
          error={failed?.errors.password}
          labelAside={
            <Link href="/recuperare-parola" className={`${linkClass} text-sm`}>
              Ai uitat parola?
            </Link>
          }
        />
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          <LogIn aria-hidden="true" />
          {pending ? "Se verifică…" : "Intră în cont"}
        </Button>
      </form>

      {student ? (
        <p className="text-center text-muted-foreground text-sm">
          Nu ai cont?{" "}
          <Link href="/inregistrare" className={linkClass}>
            Creează un cont de elev
          </Link>
        </p>
      ) : (
        <p className="text-center text-muted-foreground text-sm">
          Nu ai cont de mentor?{" "}
          <Link href="/aplicare-mentor" className={linkClass}>
            Aplică
          </Link>
          <span className="mt-1 block text-xs">
            Conturile de mentor se creează doar după verificarea aplicației.
          </span>
        </p>
      )}

      {/* Doar local: conturile demo din pnpm db:seed (parola e în .env.local). */}
      {process.env.NODE_ENV === "development" ? (
        <DemoNote>
          Conturi demo:{" "}
          <span className="font-mono text-foreground">
            {student ? "tudor.p" : "ana.ionescu@exemplu.ro"}
          </span>
          {student ? null : (
            <>
              {" "}
              sau{" "}
              <span className="font-mono text-foreground">
                admin@eduquest.ro
              </span>
            </>
          )}
          . Parola e în <span className="font-mono">.env.local</span>, la{" "}
          <span className="font-mono">DEMO_PASSWORD</span>.
        </DemoNote>
      ) : null}
    </div>
  );
}
