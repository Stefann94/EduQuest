"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NavPopoverContent } from "./nav-popover";

export type SearchItem = {
  label: string;
  hint: string;
  emoji: string;
  href: string;
  group: string;
};

// „ș” și „s” se potrivesc, la fel „ă” și „a” etc.: copiii nu scriu mereu cu diacritice.
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function SearchMenu({
  items,
  placeholder,
}: {
  items: SearchItem[];
  placeholder: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const q = normalize(query.trim());
  const results = q
    ? items.filter((i) => normalize(`${i.label} ${i.hint}`).includes(q))
    : items;

  // Ctrl+K / ⌘K deschide căutarea de oriunde.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  }

  function go(item: SearchItem) {
    changeOpen(false);
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
  }

  let lastGroup = "";

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        aria-label="Caută"
        title="Caută (Ctrl+K)"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-12 w-12 px-0 xl:w-32 xl:justify-start xl:px-4 2xl:w-48",
        )}
      >
        <Search className="text-primary" />
        <span className="hidden min-w-0 flex-1 truncate text-left font-sans font-semibold text-muted-foreground xl:inline">
          Caută
        </span>
        <kbd className="hidden shrink-0 rounded-lg bg-secondary px-1.5 py-0.5 font-mono text-secondary-foreground text-xs 2xl:inline">
          Ctrl K
        </kbd>
      </PopoverTrigger>
      <NavPopoverContent className="w-[26rem] gap-0 p-0">
        <div className="flex items-center gap-2 border-b-2 px-4">
          <Search className="size-5 text-primary" />
          <input
            // biome-ignore lint/a11y/noAutofocus: căutarea tocmai a fost deschisă de utilizator
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Caută"
            className="h-14 flex-1 bg-transparent font-bold text-lg outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="stagger-slide max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="p-6 text-center font-bold text-muted-foreground">
              Nu am găsit nimic. 🔍
            </li>
          ) : (
            results.map((item, i) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              return (
                <li key={`${item.group}-${item.href}-${item.label}`}>
                  {header ? (
                    <p className="px-3 pt-2 pb-1 font-bold text-muted-foreground text-xs uppercase tracking-wide">
                      {header}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => go(item)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left",
                      i === active && "bg-secondary",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-xl"
                    >
                      {item.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">
                        {item.label}
                      </span>
                      <span className="block truncate font-semibold text-muted-foreground text-sm">
                        {item.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </NavPopoverContent>
    </Popover>
  );
}
