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
 * deci nu trimite niciun JavaScript în browser.
 */
export async function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language: string;
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
        "overflow-hidden rounded-lg border border-code bg-code text-code-foreground",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between border-white/10 border-b px-4 py-2 font-mono text-white/55 text-xs">
        {LANGS[language] ?? language}
      </figcaption>
      <div
        className="overflow-x-auto px-4 py-3.5 font-mono text-[13.5px] leading-6 [&_pre]:bg-transparent!"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generat de Shiki din codul nostru, cu caracterele escapate
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
