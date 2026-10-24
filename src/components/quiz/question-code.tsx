import { cn } from "@/lib/utils";

/**
 * Codul unei întrebări, pentru componentele client (CodeBlock rulează doar pe server).
 * Fără evidențiere de sintaxă, dar cu aceleași culori ca blocurile de cod din platformă.
 */
export function QuestionCode({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-code bg-code px-4 py-3 font-mono text-sm text-code-foreground leading-6",
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  );
}
