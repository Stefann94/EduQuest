"use client";

import {
  BookOpen,
  ClipboardList,
  FileCode2,
  LayoutGrid,
  ListChecks,
  type LucideIcon,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HeaderPopoverContent } from "./header-popover";

export type SearchKind =
  | "page"
  | "class"
  | "material"
  | "problem"
  | "assignment"
  | "quiz";

/** Un rezultat de căutare. Conține doar conținut la care utilizatorul are deja acces. */
export type SearchItem = {
  label: string;
  hint: string;
  href: string;
  kind: SearchKind;
};

const KINDS: Record<SearchKind, { group: string; icon: LucideIcon }> = {
  page: { group: "Pagini", icon: LayoutGrid },
  class: { group: "Clase", icon: Users },
  assignment: { group: "Teme", icon: ClipboardList },
  material: { group: "Materiale", icon: BookOpen },
  problem: { group: "Probleme rezolvate", icon: FileCode2 },
  quiz: { group: "Quiz-uri", icon: ListChecks },
};

// „ș” se potrivește cu „s”, „ă” cu „a” etc.: nu toată lumea scrie cu diacritice.
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function SearchMenu({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const q = normalize(query.trim());
  const results = q
    ? items.filter((i) => normalize(`${i.label} ${i.hint}`).includes(q))
    : items.filter((i) => i.kind === "page" || i.kind === "class");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  };

  const go = (item: SearchItem) => {
    changeOpen(false);
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  let lastGroup = "";

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        aria-label="Caută"
        title="Caută (Ctrl+K)"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-9 px-0 text-muted-foreground md:w-64 md:justify-start md:px-3",
        )}
      >
        <Search />
        <span className="hidden flex-1 text-left font-normal md:inline">
          Caută…
        </span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[11px] md:inline">
          Ctrl K
        </kbd>
      </PopoverTrigger>
      <HeaderPopoverContent className="w-[26rem]">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            // biome-ignore lint/a11y/noAutofocus: căutarea tocmai a fost deschisă de utilizator
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Caută clase, teme, materiale…"
            aria-label="Caută"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="stagger mr-1 mb-1.5 max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-muted-foreground text-sm">
              Niciun rezultat pentru „{query}”.
            </li>
          ) : (
            results.map((item, i) => {
              const { group, icon: Icon } = KINDS[item.kind];
              const header = group !== lastGroup ? group : null;
              lastGroup = group;
              return (
                <li key={`${item.kind}-${item.href}`}>
                  {header ? (
                    <p className="px-2.5 pt-2.5 pb-1 font-medium text-muted-foreground text-xs">
                      {header}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => go(item)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left",
                      i === active && "bg-accent",
                    )}
                  >
                    <Icon
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {item.label}
                      </span>
                      <span className="block truncate text-muted-foreground text-xs">
                        {item.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </HeaderPopoverContent>
    </Popover>
  );
}
