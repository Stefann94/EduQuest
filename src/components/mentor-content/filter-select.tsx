"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Un filtru de listă (starea rămâne în browser, fără searchParams). */
export function FilterSelect({
  label,
  value,
  onChange,
  items,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(v) => onChange(typeof v === "string" ? v : "all")}
    >
      <SelectTrigger
        aria-label={label}
        className={cn("w-full sm:w-auto sm:min-w-44", className)}
      >
        <SelectValue />
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

/** Rândul cu filtre de deasupra unei liste. */
export function FilterBar({
  children,
  summary,
}: {
  children: React.ReactNode;
  summary?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {summary ? (
        <p
          className="text-muted-foreground text-sm sm:ml-auto"
          aria-live="polite"
        >
          {summary}
        </p>
      ) : null}
    </div>
  );
}
