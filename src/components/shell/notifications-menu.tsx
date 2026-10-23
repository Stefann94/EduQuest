"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import type { Notification } from "@/lib/data/types";
import { formatDay, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HeaderPopoverContent } from "./header-popover";
import { NotificationIcon } from "./notification-icon";

export function NotificationsMenu({
  initial,
  allHref,
}: {
  initial: Notification[];
  allHref: string;
}) {
  // Demo: starea „citită” e locală. Cu Supabase vine din baza de date.
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  const markRead = (id?: string) =>
    setItems((list) =>
      list.map((n) =>
        id === undefined || n.id === id ? { ...n, read: true } : n,
      ),
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          unread > 0 ? `Notificări, ${unread} necitite` : "Notificări"
        }
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative",
        )}
      >
        <Bell />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
        ) : null}
      </PopoverTrigger>
      <HeaderPopoverContent className="w-96">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="font-semibold">Notificări</p>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => markRead()}
              className="rounded-md px-1.5 py-0.5 font-medium text-primary text-sm hover:bg-accent"
            >
              Marchează toate ca citite
            </button>
          ) : null}
        </div>
        <ul className="stagger mr-1 max-h-96 overflow-y-auto p-1.5">
          {items.slice(0, 6).map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                }}
                className="flex gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted"
              >
                <NotificationIcon kind={n.kind} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm leading-snug",
                      !n.read && "font-medium",
                    )}
                  >
                    {n.title}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground text-xs">
                    {n.body} · {formatDay(n.at)}, {formatTime(n.at)}
                  </span>
                </span>
                {!n.read ? (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                    <span className="sr-only">Necitită</span>
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t p-1.5">
          <Link
            href={allHref}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-2.5 py-2 text-center font-medium text-primary text-sm hover:bg-accent"
          >
            Vezi toate notificările
          </Link>
        </div>
      </HeaderPopoverContent>
    </Popover>
  );
}
