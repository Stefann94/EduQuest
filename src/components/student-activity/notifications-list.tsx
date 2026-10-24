"use client";

import { BellOff, CheckCheck, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { NotificationIcon } from "@/components/shell/notification-icon";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/lib/actions/notifications";
import type { NotificationKind } from "@/lib/data/types";
import type { NotificationGroup } from "@/lib/notification-group";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  group: NotificationGroup;
  timeLabel: string;
};

const GROUPS: { id: NotificationGroup; label: string }[] = [
  { id: "today", label: "Azi" },
  { id: "yesterday", label: "Ieri" },
  { id: "earlier", label: "Mai devreme" },
];

/** Lista de notificări cu filtru și marcare ca citite (salvată în baza de date). */
export function NotificationsList({
  initial,
}: {
  initial: NotificationItem[];
}) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => !n.read).length;
  const visible = filter === "all" ? items : items.filter((n) => !n.read);

  const markRead = (id: string) => {
    setItems((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    void markNotificationsRead([id]);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="inline-flex rounded-lg bg-muted p-[3px]">
          <legend className="sr-only">Arată notificările</legend>
          {(
            [
              ["all", `Toate (${items.length})`],
              ["unread", `Necitite (${unread})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                "h-7 rounded-md px-3 font-medium text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                filter === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </fieldset>
        <Button
          variant="outline"
          size="sm"
          disabled={unread === 0}
          onClick={() => {
            setItems((list) => list.map((n) => ({ ...n, read: true })));
            void markNotificationsRead();
            toast.success("Toate notificările au fost marcate ca citite");
          }}
        >
          <CheckCheck /> Marchează toate ca citite
        </Button>
      </div>

      {visible.length === 0 ? (
        filter === "unread" ? (
          <EmptyState
            icon={Inbox}
            title="Nicio notificare necitită"
            description="Ești la zi. Notificările noi despre teme, feedback și quiz-uri apar aici."
          />
        ) : (
          <EmptyState
            icon={BellOff}
            title="Nicio notificare"
            description="Când apare ceva nou în clasele tale, te anunțăm aici."
          />
        )
      ) : (
        GROUPS.map((g) => {
          const list = visible.filter((n) => n.group === g.id);
          if (list.length === 0) return null;
          return (
            <section key={g.id} aria-labelledby={`grup-${g.id}`}>
              <h2
                id={`grup-${g.id}`}
                className="mb-2 font-medium text-muted-foreground text-sm"
              >
                {g.label}
              </h2>
              <ul className="stagger overflow-hidden rounded-xl border bg-card shadow-xs">
                {list.map((n) => (
                  <li key={n.id} className="border-b last:border-b-0">
                    <Link
                      href={n.href}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "flex gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset",
                        !n.read && "bg-primary-soft/40",
                      )}
                    >
                      <NotificationIcon kind={n.kind} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block leading-snug",
                            !n.read && "font-semibold",
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="mt-0.5 block text-muted-foreground text-sm">
                          {n.body}
                        </span>
                        <span className="mt-1 block text-muted-foreground text-xs">
                          {n.timeLabel}
                        </span>
                      </span>
                      {n.read ? (
                        <span className="sr-only">Citită</span>
                      ) : (
                        <span className="flex shrink-0 items-start gap-1.5 pt-1 font-medium text-primary text-xs">
                          <span
                            aria-hidden="true"
                            className="mt-1 size-2 rounded-full bg-primary"
                          />
                          Nouă
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
