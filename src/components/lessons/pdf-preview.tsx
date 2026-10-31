"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * PDF-ul se vede direct în pagină, doar pentru citire: fără bara vizualizatorului
 * (unde browserul pune descărcarea și printarea).
 */
export function PdfPreview({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <Button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        variant={open ? "outline" : "default"}
      >
        {open ? <EyeOff /> : <Eye />}
        {open ? "Ascunde PDF-ul" : "Vezi PDF-ul"}
      </Button>
      {open ? (
        <div id={id} className="basis-full">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&view=FitH`}
            title={title}
            className="h-[80vh] w-full border bg-muted"
          />
        </div>
      ) : null}
    </>
  );
}
