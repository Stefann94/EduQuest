"use client";

import { Bell, Circle, CircleDot, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createAssignment } from "@/app/mentor/teme/actions";
import { Section } from "@/components/common/section";
import { XpBadge } from "@/components/common/status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AssignmentType } from "@/lib/data/types";
import { now } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import { toLocalInput } from "./drafts";
import {
  describe,
  Field,
  FieldError,
  FieldSet,
  FormMessage,
  SelectField,
} from "./field";
import { AddButton, ItemControls, newKey } from "./list-controls";
import { useMentorForm } from "./use-mentor-form";

type LinkRow = { key: string; label: string; url: string };

const TYPES: {
  value: AssignmentType;
  label: string;
  description: string;
  icon: typeof Circle;
}[] = [
  {
    value: "required",
    label: "Obligatorie",
    description:
      "Apare evidențiată la elevi și intră în lista lor de teme de făcut.",
    icon: CircleDot,
  },
  {
    value: "optional",
    label: "Opțională",
    description: "Un exercițiu suplimentar, pentru cine vrea să exerseze.",
    icon: Circle,
  },
];

export function AssignmentForm({
  classes,
}: {
  classes: { id: string; name: string; students: number }[];
}) {
  const [classId, setClassId] = useState(
    classes.length === 1 ? classes[0].id : "",
  );
  const [type, setType] = useState<AssignmentType>("required");
  const [allowResubmit, setAllowResubmit] = useState(true);
  const [links, setLinks] = useState<LinkRow[]>([]);

  const { errors, pending, formRef, onSubmit, state } = useMentorForm(
    createAssignment,
    (fd) => {
      fd.set(
        "links",
        JSON.stringify(links.map(({ label, url }) => ({ label, url }))),
      );
    },
  );

  const updateLink = (i: number, patch: Partial<LinkRow>) =>
    setLinks((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const selected = classes.find((c) => c.id === classId);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="grid min-w-0 gap-6">
        <Section title="Tema">
          <div className="grid gap-5">
            <Field
              id="classId"
              label="Clasa"
              error={errors.classId}
              hint={
                selected
                  ? `${selected.students} elevi în clasă.`
                  : "Tema apare doar elevilor acestei clase."
              }
            >
              <SelectField
                id="classId"
                name="classId"
                value={classId}
                onValueChange={setClassId}
                items={classes.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Alege clasa"
                error={errors.classId}
                hint="hint"
              />
            </Field>
            <Field id="title" label="Titlu" error={errors.title}>
              <Input
                {...describe("title", errors.title)}
                name="title"
                placeholder="ex. Piramida de steluțe"
                maxLength={120}
              />
            </Field>
            <Field
              id="summary"
              label="Descriere scurtă"
              error={errors.summary}
              hint="O frază care spune ce au de făcut elevii."
            >
              <Textarea
                {...describe("summary", errors.summary, "hint")}
                name="summary"
                className="min-h-20"
                maxLength={300}
              />
            </Field>
            <Field
              id="instructions"
              label="Instrucțiuni"
              error={errors.instructions}
              hint="Câte un pas pe rând. Elevii le văd ca listă numerotată."
            >
              <Textarea
                {...describe("instructions", errors.instructions, "hint")}
                name="instructions"
                className="min-h-36"
                placeholder={
                  "Citește numărul de rânduri n.\nFolosește o buclă for…"
                }
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Linkuri de referință"
          description="Opțional: un material din platformă sau o pagină externă care îi ajută pe elevi."
        >
          <div className="grid gap-4">
            {links.length > 0 ? (
              <ul className="grid gap-3">
                {links.map((l, i) => {
                  const p = `links.${i}`;
                  return (
                    <li
                      key={l.key}
                      className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-start"
                    >
                      <Field
                        id={`${p}.label`}
                        label="Nume"
                        error={errors[`${p}.label`]}
                      >
                        <Input
                          {...describe(`${p}.label`, errors[`${p}.label`])}
                          value={l.label}
                          onChange={(e) =>
                            updateLink(i, { label: e.target.value })
                          }
                          placeholder="ex. Fișă de exerciții"
                        />
                      </Field>
                      <Field
                        id={`${p}.url`}
                        label="Adresă"
                        error={errors[`${p}.url`]}
                      >
                        <Input
                          {...describe(`${p}.url`, errors[`${p}.url`])}
                          value={l.url}
                          onChange={(e) =>
                            updateLink(i, { url: e.target.value })
                          }
                          inputMode="url"
                          placeholder="https:// sau /invatare/materiale/…"
                        />
                      </Field>
                      <div className="sm:pt-6">
                        <ItemControls
                          label={`linkul ${i + 1}`}
                          index={i}
                          count={links.length}
                          onRemove={(j) =>
                            setLinks((x) => x.filter((_, k) => k !== j))
                          }
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {errors.links ? <FieldError>{errors.links}</FieldError> : null}
            <AddButton
              disabled={links.length >= 5}
              onClick={() =>
                setLinks((l) => [
                  ...l,
                  { key: newKey("link"), label: "", url: "" },
                ])
              }
            >
              Adaugă un link
            </AddButton>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:sticky lg:top-20">
        <Section title="Setări">
          <div className="grid gap-5">
            <FieldSet legend="Tip" error={errors.type}>
              <div className="grid gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  const isRequired = t.value === "required";
                  return (
                    <label
                      key={t.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                        isRequired
                          ? "has-checked:border-primary has-checked:border-l-4 has-checked:bg-primary-soft"
                          : "has-checked:border-foreground/30 has-checked:bg-secondary",
                      )}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={type === t.value}
                        onChange={() => setType(t.value)}
                        className="mt-0.5 size-4 shrink-0 accent-primary"
                      />
                      <span className="grid gap-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 font-medium",
                            isRequired && "text-accent-foreground",
                          )}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          {t.label}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </FieldSet>

            <Field
              id="deadline"
              label="Termen"
              optional
              error={errors.deadline}
              hint="Lasă gol pentru o temă fără termen. Ora României."
            >
              <Input
                {...describe("deadline", errors.deadline, "hint")}
                type="datetime-local"
                name="deadline"
                min={toLocalInput(now().toISOString())}
              />
            </Field>

            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <Label htmlFor="allowResubmit">Permite retrimiterea</Label>
                <p
                  id="allowResubmit-hint"
                  className="text-muted-foreground text-xs"
                >
                  Elevii pot trimite din nou după ce le ceri corecturi.
                </p>
              </div>
              <Switch
                id="allowResubmit"
                checked={allowResubmit}
                onCheckedChange={setAllowResubmit}
                aria-describedby="allowResubmit-hint"
              />
              <input
                type="hidden"
                name="allowResubmit"
                value={allowResubmit ? "1" : "0"}
              />
            </div>
          </div>
        </Section>

        <Section title="Recompensă">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Trimitere validă</span>
              <XpBadge amount={2} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Bonus de calitate, acordat de tine</span>
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-xp-soft px-2.5 font-semibold text-xp-foreground text-xs tabular-nums">
                <Star className="size-3.5 fill-xp text-xp" aria-hidden="true" />
                0–5 XP
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Bonusul maxim este fix, 5 XP, conform regulilor platformei. XP-ul
              pentru trimitere se acordă o singură dată, chiar dacă elevul
              retrimite. Temele nu primesc note.
            </p>
          </div>
        </Section>

        <div className="grid gap-3">
          <Callout icon={Bell} tone="info">
            Când publici tema, elevii clasei primesc o notificare în aplicație.
            O ciornă rămâne vizibilă doar pentru tine.
          </Callout>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Button
              type="submit"
              name="intent"
              value="publish"
              size="lg"
              disabled={pending}
            >
              {pending ? "Se salvează…" : "Publică tema"}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="draft"
              size="lg"
              variant="outline"
              disabled={pending}
            >
              Salvează ca ciornă
            </Button>
          </div>
          <Link
            href="/mentor/teme"
            className={buttonVariants({ variant: "ghost" })}
          >
            Anulează
          </Link>
          {state.status === "error" ? (
            <FormMessage message={state.message} />
          ) : null}
        </div>
      </div>
    </form>
  );
}
