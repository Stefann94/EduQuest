import { Fragment } from "react";

/* ---------- Text cu marcaje: `cod`, **important** și *termen* ---------- */

/** Paragraf cu `cod` (mono, cyan), **text îngroșat** și *cursiv* (termeni, ex. în engleză). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        // Bucățile vin dintr-un text fix, în ordine fixă.
        const key = `${i}-${part.length}`;
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
          return (
            <code
              key={key}
              className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.88em] text-cyan"
            >
              {part.slice(1, -1)}
            </code>
          );
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
          return (
            <strong key={key} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
          return (
            <em
              key={key}
              className="font-semibold text-secondary-foreground not-italic"
            >
              {part.slice(1, -1)}
            </em>
          );
        return <Fragment key={key}>{part}</Fragment>;
      })}
    </>
  );
}
