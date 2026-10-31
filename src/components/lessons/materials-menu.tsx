"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import {
  MATERIAL_KIND,
  type MaterialKind,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export type MenuItem = {
  id: string;
  kind: MaterialKind;
  title: string;
  href: string;
  /** Linkurile externe și PDF-urile se deschid într-o filă nouă. */
  external?: boolean;
  hidden?: boolean;
};

/** Meniul derulant cu materialele unei lecții (PDF, link, video, problemă…). */
export function MaterialsMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (items.length === 0)
    return (
      <p className="text-muted-foreground text-sm">Niciun material încă.</p>
    );

  return (
    <div className="grid gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 cut-xs items-center justify-between gap-3 bg-secondary px-3 font-bold font-heading text-sm uppercase tracking-wide outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
      >
        <span>{plural(items.length, "material", "materiale")}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <ul id={id} hidden={!open} className="grid gap-1">
        {items.map((m) => {
          const inner = (
            <>
              <MaterialKindIcon kind={m.kind} className="size-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{m.title}</span>
                <span className="block text-muted-foreground text-xs">
                  {MATERIAL_KIND[m.kind].label}
                  {m.hidden ? " · ascuns elevilor" : ""}
                </span>
              </span>
              {m.external ? (
                <ExternalLink
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
            </>
          );
          const cls =
            "flex items-center gap-3 px-2 py-2 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70";
          return (
            <li key={m.id}>
              {m.external ? (
                <a
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                >
                  {inner}
                  <span className="sr-only">
                    {" "}
                    (se deschide într-o filă nouă)
                  </span>
                </a>
              ) : (
                <Link href={m.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
