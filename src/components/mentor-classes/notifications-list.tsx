"use client";

import { BellOff, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NotificationIcon } from "@/components/shell/notification-icon";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/data/types";
import { formatDay, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { daysBefore } from "./dates";

const GROUPS = ["Azi", "Ieri", "Mai devreme"] as const;

/** Lista de notificări: grupate pe zile, cu filtru „Necitite” și marcare ca citite. */
export function NotificationsList({
  initial,
  nowIso,
}: {
  initial: Notification[];
  nowIso: string;
}) {
  // Demo: starea „citită” e locală. Cu Supabase vine din baza de date.
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => !n.read).length;
  const visible = filter === "unread" ? items.filter((n) => !n.read) : items;

  const markRead = (id?: string) =>
    setItems((list) =>
      list.map((n) =>
        id === undefined || n.id === id ? { ...n, read: true } : n,
      ),
    );

  const groups = GROUPS.map((label, i) => ({
    label,
    items: visible.filter((n) => {
      const d = daysBefore(n.at, nowIso);
      return i === 2 ? d >= 2 : d === i;
    }),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="inline-flex rounded-lg bg-muted p-[3px]">
          <legend className="sr-only">Filtrează notificările</legend>
          {(
            [
              ["all", `Toate (${items.length})`],
              ["unread", `Necitite (${unread})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "h-7 rounded-md px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                filter === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </fieldset>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markRead()}
          disabled={unread === 0}
        >
          <CheckCheck aria-hidden="true" /> Marchează toate ca citite
        </Button>
      </div>

      {groups.length > 0 ? (
        groups.map((g) => (
          <section key={g.label} aria-labelledby={`group-${g.label}`}>
            <h2
              id={`group-${g.label}`}
              className="mb-2 font-medium text-muted-foreground text-sm"
            >
              {g.label}
            </h2>
            <ul className="stagger grid gap-2">
              {g.items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs",
                    !n.read && "border-primary/25",
                  )}
                >
                  <NotificationIcon kind={n.kind} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={n.href}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "rounded-sm text-sm leading-snug outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40",
                        !n.read && "font-semibold",
                      )}
                    >
                      {n.title}
                    </Link>
                    <p className="text-muted-foreground text-sm">{n.body}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {g.label === "Mai devreme"
                        ? `${formatDay(n.at)}, ${formatTime(n.at)}`
                        : formatTime(n.at)}
                    </p>
                  </div>
                  {!n.read ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="flex items-center gap-1.5 text-primary text-xs">
                        <span
                          className="size-2 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        Necitită
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => markRead(n.id)}
                        aria-label={`Marchează ca citită: ${n.title}`}
                      >
                        Marchează citită
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
            <BellOff className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 font-medium">
            {filter === "unread"
              ? "Nicio notificare necitită"
              : "Nicio notificare"}
          </p>
          <p className="mt-1 max-w-sm text-muted-foreground text-sm">
            Aici apar trimiterile noi, retrimiterile și activitatea din clasele
            tale.
          </p>
        </div>
      )}
    </div>
  );
}
