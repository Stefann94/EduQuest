"use client";

import { Star, UserMinus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { removeMember } from "@/app/mentor/clase/[id]/membri/actions";
import { EmptyState } from "@/components/common/empty-state";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AvatarId } from "@/lib/data/types";
import { ConfirmDialog } from "./confirm-dialog";

/** Doar ce are nevoie mentorul să vadă despre un elev (fără email). */
export type MemberRow = {
  id: string;
  displayName: string;
  username?: string;
  avatar: AvatarId;
  xp: number;
  attended: number;
  meetings: number;
  attendanceRate: number | null;
  submitted: number;
  assignments: number;
};

export function MembersTable({
  classId,
  className,
  rows,
  canRemove,
}: {
  classId: string;
  className: string;
  rows: MemberRow[];
  canRemove: boolean;
}) {
  // Demo: eliminarea e locală. Cu Supabase, lista vine din baza de date.
  const [removed, setRemoved] = useState<string[]>([]);
  const visible = rows.filter((r) => !removed.includes(r.id));

  if (visible.length === 0)
    return (
      <EmptyState
        icon={Users}
        title="Niciun elev în clasă"
        description="Trimite-le elevilor codul de invitație din setările clasei, ca să se poată înscrie."
      />
    );

  return (
    <div className="rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Elev</TableHead>
            <TableHead className="text-right">XP în clasă</TableHead>
            <TableHead className="text-right">Prezență</TableHead>
            <TableHead className="text-right">Teme trimise</TableHead>
            {canRemove ? (
              <TableHead className="pr-5 text-right">
                <span className="sr-only">Acțiuni</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody className="stagger">
          {visible.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="py-3 pl-5">
                <div className="flex items-center gap-3">
                  <UserAvatar name={r.displayName} avatar={r.avatar} />
                  <div className="min-w-0">
                    <p className="font-medium">{r.displayName}</p>
                    {r.username ? (
                      <p className="text-muted-foreground text-xs">
                        @{r.username}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Star
                    className="size-3.5 fill-xp text-xp"
                    aria-hidden="true"
                  />
                  {r.xp} XP
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.attendanceRate === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <>
                    <span className="font-medium">{r.attendanceRate}%</span>
                    <span className="block text-muted-foreground text-xs">
                      {r.attended} din {r.meetings} întâlniri
                    </span>
                  </>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.assignments === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <>
                    <span className="font-medium">
                      {r.submitted} din {r.assignments}
                    </span>
                    <span className="block text-muted-foreground text-xs">
                      teme publicate
                    </span>
                  </>
                )}
              </TableCell>
              {canRemove ? (
                <TableCell className="pr-5 text-right">
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Elimină pe ${r.displayName} din clasă`}
                      >
                        <UserMinus aria-hidden="true" />
                        <span className="hidden sm:inline">Elimină</span>
                      </Button>
                    }
                    title={`Elimini pe ${r.displayName} din clasă?`}
                    description={
                      <>
                        {r.displayName} nu va mai avea acces la materialele,
                        temele și clasamentul clasei{" "}
                        <strong className="text-foreground">{className}</strong>
                        .
                      </>
                    }
                    confirmLabel="Elimină din clasă"
                    pendingLabel="Se elimină…"
                    destructive
                    onConfirm={async () => {
                      const res = await removeMember(classId, r.id);
                      if (!res.ok) {
                        toast.error(res.message);
                        return false;
                      }
                      toast.success(res.message, { description: res.note });
                      setRemoved((list) => [...list, r.id]);
                      return true;
                    }}
                  >
                    <ul className="grid list-disc gap-1 pl-5 text-muted-foreground text-sm">
                      <li>
                        Istoricul de XP și trimiterile rămân păstrate, dar nu
                        mai apar în clasament.
                      </li>
                      <li>
                        Elevul se poate înscrie din nou doar cu un cod de
                        invitație activ.
                      </li>
                    </ul>
                  </ConfirmDialog>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
