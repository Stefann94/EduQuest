"use client";

import { CircleAlert } from "lucide-react";
import { type ClassFieldErrors, WEEKDAYS } from "@/app/mentor/clase/schedule";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DAY_ITEMS = WEEKDAYS.map((d) => ({ label: d, value: d }));

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-destructive text-sm"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/** Câmpurile unei clase: nume, descriere și program (zi, oră de început și de sfârșit). */
export function ClassDetailsFields({
  idPrefix,
  errors = {},
  defaults,
}: {
  idPrefix: string;
  errors?: ClassFieldErrors;
  defaults?: {
    name?: string;
    description?: string;
    day?: string;
    start?: string;
    end?: string;
  };
}) {
  const id = (f: string) => `${idPrefix}-${f}`;
  const err = (f: keyof ClassFieldErrors) =>
    errors[f]
      ? { "aria-invalid": true as const, "aria-describedby": id(`${f}-error`) }
      : {};

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={id("name")}>Numele clasei</Label>
        <Input
          id={id("name")}
          name="name"
          defaultValue={defaults?.name}
          placeholder="ex. Python pentru începători"
          maxLength={60}
          required
          {...err("name")}
        />
        <FieldError id={id("name-error")} message={errors.name} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={id("description")}>
          Descriere{" "}
          <span className="font-normal text-muted-foreground">(opțional)</span>
        </Label>
        <Textarea
          id={id("description")}
          name="description"
          defaultValue={defaults?.description}
          placeholder="Ce vor învăța elevii în această clasă"
          maxLength={300}
          className="min-h-20"
          {...err("description")}
        />
        <FieldError id={id("description-error")} message={errors.description} />
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-medium text-sm">
          Programul întâlnirilor
        </legend>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="grid gap-1.5">
            <Label
              htmlFor={id("day")}
              className="font-normal text-muted-foreground text-xs"
            >
              Ziua
            </Label>
            <Select
              name="day"
              items={DAY_ITEMS}
              defaultValue={defaults?.day ?? null}
            >
              <SelectTrigger id={id("day")} className="w-full" {...err("day")}>
                <SelectValue placeholder="Alege ziua" />
              </SelectTrigger>
              <SelectContent>
                {DAY_ITEMS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor={id("start")}
              className="font-normal text-muted-foreground text-xs"
            >
              De la
            </Label>
            <Input
              id={id("start")}
              name="start"
              type="time"
              defaultValue={defaults?.start}
              required
              className="sm:w-32"
              {...err("start")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor={id("end")}
              className="font-normal text-muted-foreground text-xs"
            >
              Până la
            </Label>
            <Input
              id={id("end")}
              name="end"
              type="time"
              defaultValue={defaults?.end}
              required
              className="sm:w-32"
              {...err("end")}
            />
          </div>
        </div>
        <FieldError id={id("day-error")} message={errors.day} />
        <FieldError id={id("start-error")} message={errors.start} />
        <FieldError id={id("end-error")} message={errors.end} />
      </fieldset>
    </div>
  );
}
