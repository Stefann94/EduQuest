"use client";

import {
  Ban,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type AccountAction,
  type AccountState,
  changeAccountStatus,
} from "@/app/admin/utilizatori/actions";
import { FieldError } from "@/components/auth/form-fields";
import { EmptyState } from "@/components/common/empty-state";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUser } from "@/lib/data/admin-queries";
import type { AccountStatus, Role } from "@/lib/data/types";
import { formatDate, plural } from "@/lib/format";
import { AccountStatusBadge, RoleBadge } from "./account-badges";

type RoleFilter = Role | "all";
type StatusFilter = AccountStatus | "all";

const ROLE_ITEMS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Toate rolurile" },
  { value: "student", label: "Elevi" },
  { value: "mentor", label: "Mentori" },
  { value: "admin", label: "Administratori" },
];

const STATUS_ITEMS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Toate stările" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspendate" },
  { value: "deactivated", label: "Dezactivate" },
];

const ACTIONS: Record<
  AccountAction,
  {
    label: string;
    icon: typeof Ban;
    from: AccountStatus[];
    title: string;
    text: string;
    submit: string;
    toast: string;
    placeholder: string;
  }
> = {
  suspend: {
    label: "Suspendă",
    icon: PauseCircle,
    from: ["active"],
    title: "Suspenzi contul?",
    text: "Utilizatorul nu se mai poate autentifica până la reactivare, iar sesiunile deschise se închid. Datele lui (clase, teme, XP) rămân neschimbate.",
    submit: "Suspendă contul",
    toast: "Contul a fost suspendat",
    placeholder:
      "Ex.: Mesaje nepotrivite trimise altor elevi, în curs de verificare.",
  },
  reactivate: {
    label: "Reactivează",
    icon: PlayCircle,
    from: ["suspended", "deactivated"],
    title: "Reactivezi contul?",
    text: "Utilizatorul se poate autentifica din nou și își regăsește clasele și progresul.",
    submit: "Reactivează contul",
    toast: "Contul a fost reactivat",
    placeholder:
      "Ex.: Situația a fost lămurită cu părinții și mentorul clasei.",
  },
  deactivate: {
    label: "Dezactivează",
    icon: Ban,
    from: ["active", "suspended"],
    title: "Dezactivezi contul?",
    text: "Contul se închide și nu mai apare în clase. Datele se păstrează conform politicii de retenție și contul poate fi reactivat ulterior de un administrator.",
    submit: "Dezactivează contul",
    toast: "Contul a fost dezactivat",
    placeholder: "Ex.: Utilizatorul a cerut închiderea contului.",
  },
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function UsersTable({
  users,
  viewerId,
}: {
  users: AdminUser[];
  viewerId: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  // Demo: schimbările de stare rămân doar în pagină.
  const [overrides, setOverrides] = useState<Record<string, AccountStatus>>({});
  const [pending, setPending] = useState<{
    user: AdminUser;
    action: AccountAction;
  } | null>(null);
  const [round, setRound] = useState(0);

  const rows = useMemo(
    () => users.map((u) => ({ ...u, status: overrides[u.id] ?? u.status })),
    [users, overrides],
  );

  const q = normalize(query.trim());
  const visible = rows.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (status === "all" || u.status === status) &&
      (!q ||
        normalize(u.displayName).includes(q) ||
        normalize(u.email).includes(q) ||
        (u.username ? normalize(u.username).includes(q) : false)),
  );
  const filtered = q !== "" || role !== "all" || status !== "all";

  function openAction(user: AdminUser, action: AccountAction) {
    setRound((r) => r + 1);
    setPending({ user, action });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="user-search">Caută</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="user-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nume, username sau email"
              autoComplete="off"
              spellCheck={false}
              className="pl-9"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role-filter">Rol</Label>
          <Select
            items={ROLE_ITEMS}
            value={role}
            onValueChange={(v) => v && setRole(v as RoleFilter)}
          >
            <SelectTrigger id="role-filter" className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_ITEMS.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status-filter">Stare</Label>
          <Select
            items={STATUS_ITEMS}
            value={status}
            onValueChange={(v) => v && setStatus(v as StatusFilter)}
          >
            <SelectTrigger id="status-filter" className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ITEMS.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {visible.length === rows.length
            ? plural(rows.length, "cont", "conturi")
            : `${visible.length} din ${plural(rows.length, "cont", "conturi")}`}
        </p>
        {filtered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setRole("all");
              setStatus("all");
            }}
          >
            <X aria-hidden="true" /> Șterge filtrele
          </Button>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Utilizator</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stare</TableHead>
                <TableHead className="text-right">Clase</TableHead>
                <TableHead>Creat pe</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Acțiuni</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="stagger">
              {visible.map((u) => {
                const self = u.id === viewerId;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.displayName} avatar={u.avatar} />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {u.displayName}
                            {self ? (
                              <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                                (tu)
                              </span>
                            ) : null}
                          </p>
                          {u.username ? (
                            <p className="text-muted-foreground text-xs">
                              @{u.username}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <AccountStatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.role === "admin" ? "–" : u.classCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {self ? (
                        <span className="text-muted-foreground text-xs">
                          Contul tău
                        </span>
                      ) : (
                        <RowActions user={u} onSelect={openAction} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Niciun cont nu se potrivește"
          description="Încearcă alt nume sau altă adresă, ori schimbă filtrele de rol și stare."
        />
      )}

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {pending ? (
            <AccountActionForm
              key={round}
              user={pending.user}
              action={pending.action}
              onDone={(newStatus) => {
                setOverrides((o) => ({ ...o, [pending.user.id]: newStatus }));
                setPending(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowActions({
  user,
  onSelect,
}: {
  user: AdminUser;
  onSelect: (user: AdminUser, action: AccountAction) => void;
}) {
  const available = (Object.keys(ACTIONS) as AccountAction[]).filter((a) =>
    ACTIONS[a].from.includes(user.status),
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Acțiuni pentru ${user.displayName}`}
          />
        }
      >
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Starea contului</DropdownMenuLabel>
          {available.map((a) => {
            const Icon = ACTIONS[a].icon;
            return (
              <DropdownMenuItem
                key={a}
                variant={a === "reactivate" ? "default" : "destructive"}
                onClick={() => onSelect(user, a)}
              >
                <Icon aria-hidden="true" /> {ACTIONS[a].label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <p className="px-1.5 py-1 text-muted-foreground text-xs">
          Rolul nu se poate schimba de aici.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const INITIAL: AccountState = { status: "idle" };

function AccountActionForm({
  user,
  action,
  onDone,
}: {
  user: AdminUser;
  action: AccountAction;
  onDone: (status: AccountStatus) => void;
}) {
  const c = ACTIONS[action];
  const [state, formAction, busy] = useActionState(
    async (prev: AccountState, formData: FormData) => {
      const result = await changeAccountStatus(prev, formData);
      if (result.status === "success") {
        toast.success(c.toast, {
          description: `${user.displayName}. Demo: modificarea nu se salvează.`,
        });
        onDone(result.newStatus);
      } else if (result.status === "error" && result.message)
        toast.error(result.message);
      return result;
    },
    INITIAL,
  );
  const failed = state.status === "error" ? state : null;

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="currentStatus" value={user.status} />
      <DialogHeader>
        <DialogTitle>{c.title}</DialogTitle>
        <DialogDescription>{c.text}</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <UserAvatar name={user.displayName} avatar={user.avatar} />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.displayName}</p>
          <p className="truncate text-muted-foreground text-xs">{user.email}</p>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="account-reason">Motiv</Label>
        <Textarea
          id="account-reason"
          name="reason"
          rows={3}
          maxLength={500}
          required
          defaultValue={failed?.reason}
          placeholder={c.placeholder}
          aria-invalid={failed?.reasonError ? true : undefined}
          aria-describedby={
            failed?.reasonError ? "account-reason-error" : "account-reason-hint"
          }
        />
        {failed?.reasonError ? (
          <FieldError id="account-reason-error">
            {failed.reasonError}
          </FieldError>
        ) : (
          <p id="account-reason-hint" className="text-muted-foreground text-xs">
            Obligatoriu. Motivul rămâne în istoricul contului și este văzut doar
            de administratori.
          </p>
        )}
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" />}>
          Anulează
        </DialogClose>
        <Button
          type="submit"
          variant={action === "reactivate" ? "default" : "destructive"}
          disabled={busy}
        >
          {busy ? "Se salvează…" : c.submit}
        </Button>
      </DialogFooter>
    </form>
  );
}
