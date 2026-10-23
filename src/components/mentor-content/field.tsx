"use client";

import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Piese comune pentru formularele mentorului: câmp cu etichetă, grupuri de opțiuni, erori.

/** Atributele de accesibilitate pentru un câmp: id, aria-invalid, aria-describedby. */
export function describe(id: string, error?: string, hint?: React.ReactNode) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function FieldError({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "flex items-start gap-1.5 text-destructive text-sm",
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function FieldHint({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="text-muted-foreground text-xs">
      {children}
    </p>
  );
}

/** Un câmp: etichetă, controlul, apoi eroarea (dacă există) sau indicația. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground">(opțional)</span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <FieldError id={`${id}-error`}>{error}</FieldError>
      ) : hint ? (
        <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      ) : null}
    </div>
  );
}

/** Un grup de opțiuni cu titlu (fieldset + legend), pentru radio-uri și liste. */
export function FieldSet({
  legend,
  hint,
  error,
  errorId,
  className,
  children,
}: {
  legend: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  errorId?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("grid min-w-0 gap-2", className)}>
      <legend className="mb-2 font-medium text-sm leading-none">
        {legend}
      </legend>
      {children}
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : hint ? (
        <FieldHint>{hint}</FieldHint>
      ) : null}
    </fieldset>
  );
}

export type Choice<T extends string> = {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
};

/**
 * Opțiuni ca niște carduri mici, cu radio-uri native (accesibile din tastatură).
 * `name` le trimite în formular.
 */
export function ChoiceGroup<T extends string>({
  name,
  value,
  onChange,
  choices,
  className,
  itemClassName,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  choices: Choice<T>[];
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div
      className={cn("grid gap-2 sm:grid-flow-col sm:auto-cols-fr", className)}
    >
      {choices.map((c) => (
        <label
          key={c.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary-soft has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
            itemClassName,
          )}
        >
          <input
            type="radio"
            name={name}
            value={c.value}
            checked={value === c.value}
            onChange={() => onChange(c.value)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          {c.icon ? (
            <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">
              {c.icon}
            </span>
          ) : null}
          <span className="grid gap-0.5">
            <span className="font-medium">{c.label}</span>
            {c.description ? (
              <span className="text-muted-foreground text-xs">
                {c.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}

/** Select cu etichete (Base UI), trimis în formular prin `name`. */
export function SelectField({
  id,
  name,
  value,
  onValueChange,
  items,
  placeholder = "Alege",
  error,
  hint,
  ariaLabel,
  className,
}: {
  id: string;
  ariaLabel?: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <Select
      name={name}
      items={items}
      value={value || null}
      onValueChange={(v) => onValueChange(typeof v === "string" ? v : "")}
    >
      <SelectTrigger
        {...describe(id, error, hint)}
        aria-label={ariaLabel}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Mesajul de sub formular, după o încercare de salvare. */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <FieldError className="justify-end">{message}</FieldError>;
}
