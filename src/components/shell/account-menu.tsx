"use client";

import {
  ChevronsUpDown,
  GraduationCap,
  LogOut,
  Presentation,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShellUser } from "./nav";

export function AccountMenu({
  user,
  settingsHref,
}: {
  user: ShellUser;
  settingsHref: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Contul meu"
        className="flex items-center gap-2.5 rounded-lg p-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 xl:pr-2.5"
      >
        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
        <span className="hidden min-w-0 xl:block">
          <span className="block max-w-36 truncate font-medium text-sm leading-tight">
            {user.name}
          </span>
          <span className="block text-muted-foreground text-xs">
            {user.roleLabel}
          </span>
        </span>
        <ChevronsUpDown className="hidden size-4 text-muted-foreground xl:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <span className="block font-medium text-foreground text-sm">
              {user.name}
            </span>
            <span className="block text-muted-foreground text-xs">
              {user.roleLabel}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={settingsHref} />}>
          <Settings /> Setări cont
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Vizualizare demo</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/" />}>
            <GraduationCap /> Ca elev
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/mentor" />}>
            <Presentation /> Ca mentor
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck /> Ca administrator
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/autentificare" />}>
          <LogOut /> Deconectare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
