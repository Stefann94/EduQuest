"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Butoanele pentru listele dinamice (exemple, pași, linkuri, întrebări).

export function ItemControls({
  label,
  index,
  count,
  onMove,
  onRemove,
  minCount = 0,
}: {
  /** Numele elementului pentru cititoarele de ecran, de exemplu „exemplul 2”. */
  label: string;
  index: number;
  count: number;
  onMove?: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  minCount?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {onMove ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            aria-label={`Mută mai sus ${label}`}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === count - 1}
            onClick={() => onMove(index, index + 1)}
            aria-label={`Mută mai jos ${label}`}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
        </>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={count <= minCount}
        onClick={() => onRemove(index)}
        aria-label={`Șterge ${label}`}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AddButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="w-fit"
    >
      <Plus aria-hidden="true" /> {children}
    </Button>
  );
}

/** Mută un element dintr-o listă (fără să modifice lista inițială). */
export function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Chei stabile pentru elementele noi din listele dinamice. */
let seq = 0;
export const newKey = (prefix: string) => `${prefix}-${Date.now()}-${++seq}`;
