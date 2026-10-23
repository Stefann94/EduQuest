"use client";

import { Archive, KeyRound, Lock, RefreshCw } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import {
  archiveClass,
  type ClassDetailsState,
  regenerateInviteCode,
  setInviteCodeActive,
  updateClassDetails,
} from "@/app/mentor/clase/[id]/setari/actions";
import { parseSchedule } from "@/app/mentor/clase/schedule";
import { Button } from "@/components/ui/button";
import { ClassDetailsFields } from "./class-details-fields";
import { ClassStatusBadge, InviteCodeStatusBadge } from "./class-status";
import { ConfirmDialog } from "./confirm-dialog";
import { CopyButton } from "./copy-button";

const INITIAL: ClassDetailsState = { status: "idle" };

function Card({
  title,
  description,
  children,
  actions,
  danger,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={
        danger
          ? "rounded-xl border border-destructive/25 bg-card shadow-xs"
          : "rounded-xl border bg-card shadow-xs"
      }
    >
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-base">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {children ? <div className="p-5">{children}</div> : null}
      {actions ? (
        <div className="flex flex-wrap justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-5 py-3">
          {actions}
        </div>
      ) : null}
    </section>
  );
}

export function ClassSettings({
  classId,
  name,
  description,
  schedule,
  inviteCode,
  inviteCodeActive,
  archived: initiallyArchived,
}: {
  classId: string;
  name: string;
  description: string;
  schedule: string;
  inviteCode: string;
  inviteCodeActive: boolean;
  archived: boolean;
}) {
  // Demo: starea se schimbă doar în pagină. Cu Supabase vine din baza de date.
  const [code, setCode] = useState(inviteCode);
  const [codeActive, setCodeActive] = useState(inviteCodeActive);
  const [archived, setArchived] = useState(initiallyArchived);
  const parsed = parseSchedule(schedule);
  const [saved, setSaved] = useState({
    name,
    description,
    day: parsed.day ?? "",
    start: parsed.start,
    end: parsed.end,
  });

  const [state, action, pending] = useActionState(
    async (prev: ClassDetailsState, formData: FormData) => {
      const res = await updateClassDetails(prev, formData);
      if (res.status === "success") {
        setSaved(res.values);
        toast.success("Detaliile clasei au fost salvate", {
          description:
            "Demo: modificarea se salvează după conectarea la baza de date.",
        });
      } else if (res.status === "error" && res.message) {
        toast.error(res.message);
      }
      return res;
    },
    INITIAL,
  );
  const values = state.status === "error" ? state.values : saved;

  return (
    <div className="grid max-w-3xl gap-6">
      <form action={action} noValidate>
        <input type="hidden" name="classId" value={classId} />
        <Card
          title="Detaliile clasei"
          description="Elevii văd numele, descrierea și programul în pagina clasei."
          actions={
            <Button type="submit" disabled={pending || archived}>
              {pending ? "Se salvează…" : "Salvează modificările"}
            </Button>
          }
        >
          <fieldset disabled={archived} className="contents">
            <ClassDetailsFields
              key={JSON.stringify(values)}
              idPrefix="class-settings"
              errors={state.status === "error" ? state.errors : {}}
              defaults={values}
            />
          </fieldset>
        </Card>
      </form>

      <Card
        title="Cod de invitație"
        description="Elevii se înscriu în clasă cu acest cod de 6 caractere."
      >
        <div className="flex flex-wrap items-center gap-4">
          <p className="rounded-lg border border-dashed bg-muted/40 px-5 py-3 font-mono font-semibold text-2xl tracking-[0.3em]">
            {code}
          </p>
          <div className="grid gap-2">
            <InviteCodeStatusBadge active={codeActive && !archived} />
            <CopyButton
              value={code}
              label="Copiază codul"
              successMessage={`Codul ${code} a fost copiat.`}
            />
          </div>
        </div>
        <p className="mt-4 text-muted-foreground text-sm">
          {archived
            ? "Clasa este arhivată, deci nu mai primește elevi noi."
            : codeActive
              ? "Dacă un cod a ajuns la persoane din afara clasei, generează unul nou sau dezactivează-l."
              : "Codul este dezactivat: elevii noi nu se pot înscrie. Elevii deja înscriși rămân în clasă."}
        </p>
        {!archived ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <ConfirmDialog
              trigger={
                <Button variant="outline">
                  <RefreshCw aria-hidden="true" /> Generează un cod nou
                </Button>
              }
              title="Generezi un cod nou?"
              description={
                <>
                  Codul actual,{" "}
                  <strong className="font-mono text-foreground">{code}</strong>,
                  nu va mai funcționa. Elevii deja înscriși rămân în clasă; cei
                  noi vor avea nevoie de codul nou.
                </>
              }
              confirmLabel="Generează codul nou"
              pendingLabel="Se generează…"
              onConfirm={async () => {
                const res = await regenerateInviteCode(classId);
                if (!res.ok || !res.code) {
                  toast.error(res.message);
                  return false;
                }
                setCode(res.code);
                setCodeActive(true);
                toast.success(res.message, { description: res.note });
                return true;
              }}
            />
            <ConfirmDialog
              trigger={
                <Button variant={codeActive ? "destructive" : "outline"}>
                  {codeActive ? (
                    <Lock aria-hidden="true" />
                  ) : (
                    <KeyRound aria-hidden="true" />
                  )}
                  {codeActive ? "Dezactivează codul" : "Activează codul"}
                </Button>
              }
              title={
                codeActive
                  ? "Dezactivezi codul de invitație?"
                  : "Activezi codul?"
              }
              description={
                codeActive
                  ? "Elevii noi nu se vor mai putea înscrie cu acest cod până îl activezi din nou. Elevii deja înscriși nu sunt afectați."
                  : `Elevii care au codul ${code} se vor putea înscrie din nou în clasă.`
              }
              confirmLabel={codeActive ? "Dezactivează" : "Activează"}
              destructive={codeActive}
              onConfirm={async () => {
                const res = await setInviteCodeActive(classId, !codeActive);
                if (!res.ok) {
                  toast.error(res.message);
                  return false;
                }
                setCodeActive(!codeActive);
                toast.success(res.message, { description: res.note });
                return true;
              }}
            />
          </div>
        ) : null}
      </Card>

      <Card
        title="Arhivarea clasei"
        description="Pentru clasele încheiate."
        danger={!archived}
      >
        {archived ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <ClassStatusBadge status="archived" />
            <span className="text-muted-foreground">
              Elevii păstrează accesul de citire la materiale și la istoricul
              lor. Clasa nu mai primește teme, quiz-uri sau elevi noi.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ul className="grid list-disc gap-1 pl-5 text-muted-foreground text-sm">
              <li>Elevii păstrează accesul de citire la materiale.</li>
              <li>Trimiterile, prezența și clasamentul rămân ca istoric.</li>
              <li>Codul de invitație se dezactivează.</li>
            </ul>
            <ConfirmDialog
              trigger={
                <Button variant="destructive">
                  <Archive aria-hidden="true" /> Arhivează clasa
                </Button>
              }
              title={`Arhivezi clasa „${saved.name}”?`}
              description="Clasa se mută la „Arhivate”. Elevii o vor vedea în continuare, dar doar pentru citire."
              confirmLabel="Arhivează clasa"
              pendingLabel="Se arhivează…"
              destructive
              onConfirm={async () => {
                const res = await archiveClass(classId);
                if (!res.ok) {
                  toast.error(res.message);
                  return false;
                }
                setArchived(true);
                setCodeActive(false);
                toast.success(res.message, { description: res.note });
                return true;
              }}
            >
              <ul className="grid list-disc gap-1 pl-5 text-muted-foreground text-sm">
                <li>
                  Elevii păstrează accesul de citire la materiale și la
                  problemele rezolvate.
                </li>
                <li>
                  Nu se mai pot trimite teme, porni quiz-uri sau înregistra
                  prezențe.
                </li>
                <li>Codul de invitație nu mai funcționează.</li>
              </ul>
            </ConfirmDialog>
          </div>
        )}
      </Card>
    </div>
  );
}
