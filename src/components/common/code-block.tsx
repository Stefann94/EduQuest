import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";

const LANGS: Record<string, string> = {
  python: "Python",
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  java: "Java",
  text: "Text",
};

/**
 * Cod cu evidențierea sintaxei. Rulează doar pe server (la generarea paginii),
 * deci nu trimite niciun JavaScript în browser. Opțional: o etichetă deasupra
 * (ex. numele fișierului) și ce afișează programul, ca un terminal dedesubt.
 */
export async function CodeBlock({
  code,
  language,
  title,
  output,
  className,
}: {
  code: string;
  language: string;
  title?: string;
  output?: string;
  className?: string;
}) {
  // Shiki citește intern ora curentă; cu cacheComponents asta ar bloca pre-generarea.
  // Rezultatul depinde doar de cod și limbaj, deci se poate păstra în cache.
  "use cache";
  const html = await codeToHtml(code, {
    lang: language in LANGS ? language : "text",
    theme: "github-dark-default",
  });
  return (
    <figure
      className={cn(
        "cut-sm overflow-hidden border-cyan/70 border-l-4 bg-code text-code-foreground",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-3 border-white/10 border-b px-4 py-2 font-mono text-white/55 text-xs">
        <span className="truncate">{title ?? LANGS[language] ?? language}</span>
        {title ? <span>{LANGS[language] ?? language}</span> : null}
      </figcaption>
      <div
        className="overflow-x-auto px-4 py-3.5 font-mono text-[14px] leading-6 [&_pre]:bg-transparent!"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generat de Shiki din codul nostru, cu caracterele escapate
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {output !== undefined ? (
        <div className="border-white/10 border-t bg-black/30 px-4 py-3">
          <p className="mb-1 font-bold font-heading text-[11px] text-success uppercase tracking-widest">
            Rezultat
          </p>
          <pre className="overflow-x-auto whitespace-pre font-mono text-[14px] text-success/90 leading-6">
            {output}
          </pre>
        </div>
      ) : null}
    </figure>
  );
}
