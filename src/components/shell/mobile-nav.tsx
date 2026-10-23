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
import type { NavGroup } from "./nav";
import { SidebarNav } from "./sidebar";

export function MobileNav({
  groups,
  home,
}: {
  groups: NavGroup[];
  home: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Deschide meniul" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className="w-72 p-0">
        <SheetTitle className="sr-only">Meniu</SheetTitle>
        <SidebarNav
          groups={groups}
          home={home}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
