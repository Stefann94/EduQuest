"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Soluția unei probleme, ascunsă până când elevul o cere.
 * Conținutul (cod evidențiat pe server) vine ca `children`.
 */
export function SolutionToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="grid gap-5">
      <div>
        <Button
          variant={open ? "outline" : "default"}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <EyeOff /> : <Eye />}
          {open ? "Ascunde soluția" : "Arată soluția"}
        </Button>
      </div>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
