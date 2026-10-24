import {
  BookmarkCheck,
  Check,
  Dumbbell,
  Info,
  Lightbulb,
  type LucideIcon,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Fragment } from "react";
import { CodeBlock } from "@/components/common/code-block";
import { SolutionToggle } from "@/components/student-learning/solution-toggle";
import type { Accent, CalloutTone, ContentBlock } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { ACCENT, ACCENT_ORDER } from "./accent";

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
              className="rounded-sm bg-background/70 px-1.5 py-0.5 font-mono text-[0.88em] text-cyan"
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
            <em key={key} className="text-foreground italic">
              {part.slice(1, -1)}
            </em>
          );
        return <Fragment key={key}>{part}</Fragment>;
      })}
    </>
  );
}

/** Id-ul unui titlu, pentru cuprins și linkuri directe. */
export function headingId(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Cuprinsul unei lecții: titlurile, în ordine. */
export function tableOfContents(blocks: ContentBlock[]) {
  return blocks
    .filter((b) => b.type === "heading")
    .map((b) => ({ id: headingId(b.text), text: b.text }));
}

/* ---------- Culori ---------- */

const TONE: Record<
  CalloutTone,
  { icon: LucideIcon; label: string; accent: Accent }
> = {
  tip: { icon: Lightbulb, label: "Sfat", accent: "green" },
  info: { icon: Info, label: "Bine de știut", accent: "cyan" },
  warning: { icon: TriangleAlert, label: "Atenție", accent: "orange" },
  analogy: { icon: Sparkles, label: "Gândește-te așa", accent: "yellow" },
  remember: { icon: BookmarkCheck, label: "De reținut", accent: "pink" },
};

/* ---------- Blocurile ---------- */

function Heading({ text }: { text: string }) {
  return (
    <h2
      id={headingId(text)}
      className="mt-6 flex scroll-mt-28 items-center gap-3 font-extrabold text-[28px] leading-none first:mt-0"
    >
      <span
        aria-hidden="true"
        className="size-3 shrink-0 rotate-45 bg-primary"
      />
      {text}
    </h2>
  );
}

function Callout({
  tone,
  title,
  text,
}: {
  tone: CalloutTone;
  title?: string;
  text: string;
}) {
  const t = TONE[tone];
  const a = ACCENT[t.accent];
  const Icon = t.icon;
  return (
    <aside
      className={cn("cut-sm flex gap-3.5 border-l-4 p-4", a.soft, a.border)}
    >
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", a.text)}
        aria-hidden="true"
      />
      <div>
        <p
          className={cn(
            "font-bold font-heading text-sm uppercase tracking-widest",
            a.text,
          )}
        >
          {title ?? t.label}
        </p>
        <p className="mt-1 leading-relaxed">
          <RichText text={text} />
        </p>
      </div>
    </aside>
  );
}

function Table({
  columns,
  rows,
  caption,
  mono,
  title,
}: {
  columns: string[];
  rows: string[][];
  caption?: string;
  mono?: boolean;
  title?: string;
}) {
  return (
    <figure className="cut-sm overflow-hidden bg-card">
      {title ? (
        <figcaption className="border-b px-4 py-2.5 font-bold font-heading text-cyan text-sm uppercase tracking-widest">
          {title}
        </figcaption>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="bg-muted">
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2.5 font-bold font-heading text-sm uppercase tracking-wide"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              // Rândurile sunt fixe și în ordine fixă.
              <tr key={`${i}-${r.join("|")}`} className="border-t">
                {r.map((cell, j) => (
                  <td
                    key={`${j}-${cell}`}
                    className={cn(
                      "px-4 py-2.5 align-top",
                      mono && "font-mono text-[14px]",
                      j === 0 && "font-semibold",
                    )}
                  >
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <p className="border-t px-4 py-2.5 text-muted-foreground text-sm">
          <RichText text={caption} />
        </p>
      ) : null}
    </figure>
  );
}

function Boxes({
  items,
  caption,
}: {
  items: { name: string; value: string; kind?: string }[];
  caption?: string;
}) {
  return (
    <figure className="grid gap-3">
      <div className="flex flex-wrap gap-4">
        {items.map((b, i) => {
          const a = ACCENT[ACCENT_ORDER[i % ACCENT_ORDER.length]];
          return (
            <div key={b.name} className="min-w-36">
              <span
                className={cn(
                  "slant inline-block px-3 py-0.5 font-bold font-mono text-[13px] text-background",
                  a.bar,
                )}
              >
                {b.name}
              </span>
              <div
                className={cn(
                  "cut-sm mt-1 border-2 border-dashed bg-card px-4 py-3",
                  a.border,
                )}
              >
                <p className="font-mono text-xl">{b.value}</p>
                {b.kind ? (
                  <p className="mt-1 text-muted-foreground text-xs">
                    tip: <span className="font-mono">{b.kind}</span>
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-sm">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function Machine({
  input,
  name,
  output,
  caption,
}: {
  input: string;
  name: string;
  output: string;
  caption?: string;
}) {
  return (
    <figure className="grid gap-3">
      <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1.2fr_auto_1fr]">
        <div className="cut-sm bg-card px-4 py-3">
          <p className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-widest">
            Intrare
          </p>
          <p className="mt-1 font-mono">{input}</p>
        </div>
        <span
          aria-hidden="true"
          className="justify-self-center font-extrabold text-2xl text-muted-foreground max-sm:rotate-90"
        >
          →
        </span>
        <div className="cut bg-[linear-gradient(140deg,var(--primary),#c42a8f_70%)] px-4 py-4 text-center text-primary-foreground">
          <p className="font-bold font-heading text-xs uppercase tracking-widest opacity-85">
            Funcția
          </p>
          <p className="mt-1 font-bold font-mono text-lg">{name}</p>
        </div>
        <span
          aria-hidden="true"
          className="justify-self-center font-extrabold text-2xl text-muted-foreground max-sm:rotate-90"
        >
          →
        </span>
        <div className="cut-sm bg-card px-4 py-3">
          <p className="font-bold font-heading text-success text-xs uppercase tracking-widest">
            Ieșire
          </p>
          <p className="mt-1 font-mono">{output}</p>
        </div>
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-sm">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function Chars({
  text,
  highlight,
  caption,
}: {
  text: string;
  highlight?: number[];
  caption?: string;
}) {
  // Fiecare poziție e identitatea celulei ei (literele se pot repeta).
  const cells = [...text].map((char, index) => ({ char, index }));
  const total = cells.length;
  const marked = new Set(highlight ?? []);
  return (
    <figure className="grid gap-3">
      <div className="overflow-x-auto pb-1">
        <table className="border-separate border-spacing-1 font-mono">
          <caption className="sr-only">
            Literele șirului „{text}” și indicii lor
          </caption>
          <tbody>
            <tr>
              <th
                scope="row"
                className="pr-2 text-left font-heading text-muted-foreground text-xs uppercase"
              >
                Literă
              </th>
              {cells.map(({ char: c, index: i }) => (
                <td
                  key={i}
                  className={cn(
                    "h-11 min-w-10 text-center text-lg",
                    marked.has(i)
                      ? "bg-cyan font-bold text-cyan-foreground"
                      : "bg-card",
                  )}
                >
                  {c === " " ? "␣" : c}
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="pr-2 text-left font-heading text-muted-foreground text-xs uppercase"
              >
                Index
              </th>
              {cells.map(({ index: i }) => (
                <td key={i} className="text-center text-sm text-xp">
                  {i}
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="pr-2 text-left font-heading text-muted-foreground text-xs uppercase"
              >
                Negativ
              </th>
              {cells.map(({ index: i }) => (
                <td
                  key={i}
                  className="text-center text-muted-foreground text-xs"
                >
                  {i - total}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-sm">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function Cards({
  items,
}: {
  items: { title: string; text: string; code?: string; accent?: Accent }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => {
        const a = ACCENT[c.accent ?? ACCENT_ORDER[i % ACCENT_ORDER.length]];
        return (
          <div key={c.title} className="cut-sm relative bg-card p-4 pt-5">
            <span
              aria-hidden="true"
              className={cn("absolute inset-x-0 top-0 h-1", a.bar)}
            />
            <p
              className={cn(
                "font-extrabold font-heading text-xl uppercase leading-tight",
                a.text,
              )}
            >
              {c.title}
            </p>
            {c.code ? (
              <p className="mt-2 inline-block bg-background px-2 py-1 font-mono text-sm">
                {c.code}
              </p>
            ) : null}
            <p className="mt-2 text-[15px] leading-relaxed">
              <RichText text={c.text} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol
      className="grid gap-4 md:gap-3"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(10rem, 1fr))` }}
    >
      {items.map((s, i) => {
        const a = ACCENT[ACCENT_ORDER[i % ACCENT_ORDER.length]];
        return (
          <li key={s.title} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-5 right-0 left-12 hidden h-0.5 bg-border md:block"
            />
            <span
              className={cn(
                "hex relative grid size-10 place-items-center font-extrabold font-heading text-background text-lg",
                a.bar,
              )}
            >
              {i + 1}
            </span>
            <p
              className={cn(
                "mt-3 font-extrabold font-heading text-lg uppercase",
                a.text,
              )}
            >
              {s.title}
            </p>
            <p className="mt-0.5 text-[15px] text-muted-foreground leading-relaxed">
              <RichText text={s.text} />
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function Exercise(b: Extract<ContentBlock, { type: "exercise" }>) {
  return (
    <section className="cut relative grid gap-4 bg-card p-5 sm:p-6">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5 bg-xp"
      />
      <div className="flex flex-wrap items-center gap-3">
        <span className="slant inline-flex items-center gap-1.5 bg-xp px-3 py-0.5 font-bold font-heading text-[13px] text-cta-foreground uppercase tracking-widest">
          <Dumbbell className="size-3.5" aria-hidden="true" />
          Exercițiu
        </span>
        <h3 className="font-extrabold text-xl leading-tight">{b.title}</h3>
      </div>
      <p className="leading-relaxed">
        <RichText text={b.text} />
      </p>
      {b.starter ? (
        <CodeBlock
          code={b.starter}
          language={b.solution.language}
          title="Pornești de aici"
        />
      ) : null}
      {b.hint ? (
        <details className="group cut-sm bg-background/60 px-4 py-3">
          <summary className="font-bold font-heading text-cyan text-sm uppercase tracking-widest marker:text-cyan">
            Indiciu
          </summary>
          <p className="mt-2 leading-relaxed">
            <RichText text={b.hint} />
          </p>
        </details>
      ) : null}
      <SolutionToggle>
        <div className="grid gap-3">
          <CodeBlock
            code={b.solution.code}
            language={b.solution.language}
            title="O soluție posibilă"
            output={b.output}
          />
          {b.explanation ? (
            <p className="leading-relaxed text-muted-foreground">
              <RichText text={b.explanation} />
            </p>
          ) : null}
        </div>
      </SolutionToggle>
    </section>
  );
}

/** Conținutul unei lecții sau al unui material, bloc cu bloc. */
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="grid gap-6 text-[16.5px] text-foreground/90 leading-relaxed">
      {blocks.map((b, i) => {
        // Blocurile nu au id propriu; ordinea lor e fixă, deci indexul e o cheie stabilă.
        const key = `${b.type}-${i}`;
        switch (b.type) {
          case "heading":
            return <Heading key={key} text={b.text} />;
          case "paragraph":
            return (
              <p key={key}>
                <RichText text={b.text} />
              </p>
            );
          case "code":
            return (
              <CodeBlock
                key={key}
                code={b.code}
                language={b.language}
                title={b.title}
                output={b.output}
              />
            );
          case "list": {
            const List = b.ordered ? "ol" : "ul";
            return (
              <List key={key} className="grid gap-2">
                {b.items.map((item, n) => (
                  <li key={item} className="flex gap-3">
                    {b.ordered ? (
                      <span className="mt-0.5 font-extrabold font-heading text-primary">
                        {n + 1}.
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-2 w-3 shrink-0 -skew-x-12 bg-primary"
                      />
                    )}
                    <span>
                      <RichText text={item} />
                    </span>
                  </li>
                ))}
              </List>
            );
          }
          case "note":
            return <Callout key={key} tone="remember" text={b.text} />;
          case "callout":
            return (
              <Callout key={key} tone={b.tone} title={b.title} text={b.text} />
            );
          case "table":
            return (
              <Table
                key={key}
                columns={b.columns}
                rows={b.rows}
                caption={b.caption}
              />
            );
          case "trace":
            return (
              <Table
                key={key}
                title={b.title ?? "Pas cu pas"}
                columns={b.columns}
                rows={b.rows}
                caption={b.note}
                mono
              />
            );
          case "compare":
            return (
              <figure key={key} className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { side: b.wrong, ok: false },
                    { side: b.right, ok: true },
                  ].map(({ side, ok }) => (
                    <div key={String(ok)} className="grid content-start gap-2">
                      <p
                        className={cn(
                          "flex items-center gap-1.5 font-bold font-heading text-sm uppercase tracking-widest",
                          ok ? "text-success" : "text-destructive",
                        )}
                      >
                        {ok ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <X className="size-4" aria-hidden="true" />
                        )}
                        {side.label}
                      </p>
                      <CodeBlock code={side.code} language={side.language} />
                    </div>
                  ))}
                </div>
                {b.note ? (
                  <figcaption className="text-muted-foreground">
                    <RichText text={b.note} />
                  </figcaption>
                ) : null}
              </figure>
            );
          case "boxes":
            return <Boxes key={key} items={b.items} caption={b.caption} />;
          case "machine":
            return <Machine key={key} {...b} />;
          case "chars":
            return (
              <Chars
                key={key}
                text={b.text}
                highlight={b.highlight}
                caption={b.caption}
              />
            );
          case "cards":
            return <Cards key={key} items={b.items} />;
          case "steps":
            return <Steps key={key} items={b.items} />;
          case "exercise":
            return <Exercise key={key} {...b} />;
          case "keypoints":
            return (
              <section
                key={key}
                className="cut bg-primary-soft p-5 sm:p-6"
                aria-label={b.title ?? "Ce ai învățat"}
              >
                <p className="font-extrabold font-heading text-2xl text-primary uppercase">
                  {b.title ?? "Ce ai învățat"}
                </p>
                <ul className="mt-3 grid gap-2">
                  {b.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check
                        className="mt-1 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>
                        <RichText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
