"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type NavItem, type ShellUser, SidebarContent } from "./sidebar";

export function MobileNav({ nav, user }: { nav: NavItem[]; user: ShellUser }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Deschide meniul" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-80 max-w-[85vw] rounded-r-[2rem] border-0 bg-primary p-0 text-primary-foreground shadow-[6px_0_0_0_var(--primary-shadow)]"
      >
        <SheetTitle className="sr-only">Meniu</SheetTitle>
        <SidebarContent
          nav={nav}
          user={user}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
