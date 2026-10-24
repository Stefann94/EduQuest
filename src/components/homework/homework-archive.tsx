"use client";

import { Archive, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterSelect } from "@/components/mentor-content/filter-select";
import { Input } from "@/components/ui/input";
import type { StudentHomework } from "@/lib/db/homework";
import { HomeworkRow } from "./homework-row";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Temele cu termenul trecut, cu căutare și filtre (clasă, tip, stare). */
export function HomeworkArchive({ items }: { items: StudentHomework[] }) {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("all");
  const [type, setType] = useState("all");
  const [state, setState] = useState("all");

  const classes = [...new Map(items.map((h) => [h.classId, h.className]))].map(
    ([value, label]) => ({
      value,
      label,
    }),
  );
  const q = normalize(query.trim());
  const shown = items.filter(
    (h) =>
      (!q || normalize(`${h.title} ${h.className}`).includes(q)) &&
      (cls === "all" || h.classId === cls) &&
      (type === "all" || (type === "required") === h.required) &&
      (state === "all" || (state === "complete") === h.complete),
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută după titlu sau clasă"
            aria-label="Caută în arhivă"
            className="pl-9"
          />
        </div>
        {classes.length > 1 ? (
          <FilterSelect
            label="Clasa"
            value={cls}
            onChange={setCls}
            items={[{ value: "all", label: "Toate clasele" }, ...classes]}
          />
        ) : null}
        <FilterSelect
          label="Tipul"
          value={type}
          onChange={setType}
          items={[
            { value: "all", label: "Toate tipurile" },
            { value: "required", label: "Obligatorii" },
            { value: "optional", label: "Opționale" },
          ]}
        />
        <FilterSelect
          label="Starea"
          value={state}
          onChange={setState}
          items={[
            { value: "all", label: "Orice stare" },
            { value: "complete", label: "Trimise" },
            { value: "missing", label: "Netrimise" },
          ]}
        />
      </div>
      {shown.length > 0 ? (
        <ul className="grid gap-2">
          {shown.map((h) => (
            <li key={h.id}>
              <HomeworkRow homework={h} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Archive}
          title={items.length === 0 ? "Arhiva e goală" : "Nicio temă găsită"}
          description={
            items.length === 0
              ? "Temele ajung aici după ce le trece termenul."
              : "Încearcă alt cuvânt sau alte filtre."
          }
        />
      )}
    </div>
  );
}
