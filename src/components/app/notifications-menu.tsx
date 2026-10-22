"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import type { Notification } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { NavPopoverContent } from "./nav-popover";

export function NotificationsMenu({ initial }: { initial: Notification[] }) {
  // Demo: starea „citit” e locală. Cu Supabase vine din baza de date, în timp real.
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => n.unread).length;

  function markRead(id?: string) {
    setItems((list) =>
      list.map((n) =>
        id === undefined || n.id === id ? { ...n, unread: false } : n,
      ),
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          unread > 0 ? `Notificări, ${unread} necitite` : "Notificări"
        }
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-12",
          "relative",
        )}
      >
        <Bell className="text-primary" />
        {unread > 0 ? (
          <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border-2 border-card bg-destructive font-bold text-white text-xs">
            {unread}
          </span>
        ) : null}
      </PopoverTrigger>
      <NavPopoverContent className="w-96 gap-0 p-0">
        <div className="flex items-center justify-between gap-3 border-b-2 px-4 py-3">
          <p className="font-bold font-heading text-xl">🔔 Notificări</p>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => markRead()}
              className="rounded-lg px-2 py-1 font-bold text-primary text-sm hover:bg-secondary"
            >
              Marchează citite
            </button>
          ) : null}
        </div>
        <ul className="stagger-slide mr-1.5 mb-3 max-h-96 overflow-y-auto p-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl px-3 py-2.5 hover:bg-secondary",
                  n.unread && "bg-primary-soft",
                )}
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-xl"
                >
                  {n.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">
                    {n.title}
                  </span>
                  <span className="block font-semibold text-muted-foreground text-sm">
                    {n.text} · {n.time}
                  </span>
                </span>
                {n.unread ? (
                  <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary">
                    <span className="sr-only">necitită</span>
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </NavPopoverContent>
    </Popover>
  );
}
