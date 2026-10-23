"use client";

import {
  BookOpen,
  Eye,
  EyeOff,
  Lightbulb,
  Pencil,
  SearchX,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type ContentKind,
  deleteContent,
  setContentStatus,
} from "@/app/mentor/materiale/actions";
import { EmptyState } from "@/components/common/empty-state";
import { DifficultyBadge, PublicationBadge } from "@/components/common/status";
import {
  MATERIAL_KIND,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Material,
  PublicationStatus,
  WorkedProblem,
} from "@/lib/data/types";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { FilterBar, FilterSelect } from "./filter-select";
import { GLOBAL } from "./form-state";

type MaterialItem = Material & { className?: string };
type ProblemItem = WorkedProblem & { className?: string };

type Row = {
  id: string;
  kind: ContentKind;
  title: string;
  classId: string | null;
  status: PublicationStatus;
  icon: React.ReactNode;
  meta: React.ReactNode;
  badge?: React.ReactNode;
  href: string;
};

/** Lista de materiale și probleme rezolvate, cu filtre și acțiuni pe rând. */
export function ContentManager({
  materials,
  problems,
  classes,
}: {
  materials: MaterialItem[];
  problems: ProblemItem[];
  classes: { id: string; name: string }[];
}) {
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // În demo, modificările rămân doar în pagină (datele nu se salvează).
  const [statusOverride, setStatusOverride] = useState<
    Record<string, PublicationStatus>
  >({});
  const [deleted, setDeleted] = useState<string[]>([]);

  const key = (kind: ContentKind, id: string) => `${kind}:${id}`;

  const toRows = (): { materials: Row[]; problems: Row[] } => ({
    materials: materials.map((m) => ({
      id: m.id,
      kind: "material",
      title: m.title,
      classId: m.classId,
      status: statusOverride[key("material", m.id)] ?? m.status,
      icon: <MaterialKindIcon kind={m.kind} />,
      meta: [
        MATERIAL_KIND[m.kind].label,
        m.className ?? "Resursă globală",
        m.topic,
        formatDay(m.publishedAt),
      ].join(" · "),
      href: `/mentor/materiale/${m.id}`,
    })),
    problems: problems.map((p) => ({
      id: p.id,
      kind: "problem",
      title: p.title,
      classId: p.classId,
      status: statusOverride[key("problem", p.id)] ?? p.status,
      icon: (
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-xp-soft text-xp-foreground"
        >
          <Lightbulb className="size-[18px]" />
        </span>
      ),
      meta: [
        p.topic,
        p.className ?? "Resursă globală",
        `${p.examples.length} ${p.examples.length === 1 ? "exemplu" : "exemple"}`,
      ].join(" · "),
      badge: <DifficultyBadge level={p.difficulty} />,
      href: `/mentor/materiale/probleme/${p.id}`,
    })),
  });

  const rows = toRows();
  const visible = (list: Row[]) =>
    list.filter(
      (r) =>
        !deleted.includes(key(r.kind, r.id)) &&
        (classFilter === "all" ||
          (classFilter === GLOBAL
            ? r.classId === null
            : r.classId === classFilter)) &&
        (statusFilter === "all" || r.status === statusFilter),
    );
  const shownMaterials = visible(rows.materials);
  const shownProblems = visible(rows.problems);

  const classItems = [
    { value: "all", label: "Toate clasele" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
    { value: GLOBAL, label: "Resurse globale" },
  ];
  const statusItems = [
    { value: "all", label: "Toate stările" },
    { value: "published", label: "Publicate" },
    { value: "draft", label: "Ciorne" },
  ];

  const actions = {
    onStatus: (r: Row, next: PublicationStatus) =>
      setStatusOverride((s) => ({ ...s, [key(r.kind, r.id)]: next })),
    onDelete: (r: Row) => setDeleted((d) => [...d, key(r.kind, r.id)]),
  };

  return (
    <Tabs defaultValue="materials">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="materials">
            Materiale ({shownMaterials.length})
          </TabsTrigger>
          <TabsTrigger value="problems">
            Probleme rezolvate ({shownProblems.length})
          </TabsTrigger>
        </TabsList>
        <FilterBar>
          <FilterSelect
            label="Filtrează după clasă"
            value={classFilter}
            onChange={setClassFilter}
            items={classItems}
          />
          <FilterSelect
            label="Filtrează după stare"
            value={statusFilter}
            onChange={setStatusFilter}
            items={statusItems}
          />
        </FilterBar>
      </div>

      <TabsContent value="materials" className="mt-4">
        <RowList
          rows={shownMaterials}
          empty={
            <EmptyState
              icon={materials.length ? SearchX : BookOpen}
              title={
                materials.length
                  ? "Niciun material pentru filtrele alese"
                  : "Nu ai publicat încă materiale"
              }
              description={
                materials.length
                  ? "Schimbă clasa sau starea ca să vezi și alte materiale."
                  : "Adaugă o lecție, o fișă PDF sau un link util pentru elevii tăi."
              }
              action={
                <Link
                  href="/mentor/materiale/nou"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Material nou
                </Link>
              }
            />
          }
          {...actions}
        />
      </TabsContent>
      <TabsContent value="problems" className="mt-4">
        <RowList
          rows={shownProblems}
          empty={
            <EmptyState
              icon={problems.length ? SearchX : Lightbulb}
              title={
                problems.length
                  ? "Nicio problemă pentru filtrele alese"
                  : "Nu ai publicat încă probleme rezolvate"
              }
              description={
                problems.length
                  ? "Schimbă clasa sau starea ca să vezi și alte probleme."
                  : "Scrie o problemă cu enunț, exemple și soluția explicată pas cu pas."
              }
              action={
                <Link
                  href="/mentor/materiale/probleme/nou"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Problemă rezolvată nouă
                </Link>
              }
            />
          }
          {...actions}
        />
      </TabsContent>
    </Tabs>
  );
}

function RowList({
  rows,
  empty,
  onStatus,
  onDelete,
}: {
  rows: Row[];
  empty: React.ReactNode;
  onStatus: (r: Row, next: PublicationStatus) => void;
  onDelete: (r: Row) => void;
}) {
  if (rows.length === 0) return empty;
  return (
    <ul className="stagger grid gap-2">
      {rows.map((r) => (
        <li key={r.id}>
          <ContentRow row={r} onStatus={onStatus} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}

function ContentRow({
  row: r,
  onStatus,
  onDelete,
}: {
  row: Row;
  onStatus: (r: Row, next: PublicationStatus) => void;
  onDelete: (r: Row) => void;
}) {
  const [pending, startTransition] = useTransition();
  const next: PublicationStatus =
    r.status === "published" ? "draft" : "published";
  const noun = r.kind === "material" ? "materialul" : "problema";

  function toggle() {
    startTransition(async () => {
      const res = await setContentStatus(r.kind, r.id, next);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      onStatus(r, next);
      toast.success(res.message, { description: res.detail });
    });
  }

  async function remove() {
    const res = await deleteContent(r.kind, r.id);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    onDelete(r);
    toast.success(res.message, { description: res.detail });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border bg-card px-4 py-3">
      {r.icon}
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={r.href}
            className="rounded-sm font-medium outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            {r.title}
          </Link>
          <PublicationBadge status={r.status} />
          {r.badge}
        </div>
        <p className="mt-0.5 text-muted-foreground text-sm">{r.meta}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={r.href}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Pencil aria-hidden="true" /> Editează
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          disabled={pending}
          aria-label={`${r.status === "published" ? "Retrage publicarea pentru" : "Publică"} ${r.title}`}
        >
          {r.status === "published" ? (
            <>
              <EyeOff aria-hidden="true" /> Retrage publicarea
            </>
          ) : (
            <>
              <Eye aria-hidden="true" /> Publică
            </>
          )}
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Șterge ${r.title}`}
              className={cn("text-muted-foreground hover:text-destructive")}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          }
          title={`Ștergi ${noun} „${r.title}”?`}
          description={`Elevii nu vor mai putea deschide ${noun}. Acțiunea nu poate fi anulată.`}
          confirmLabel="Șterge"
          pendingLabel="Se șterge…"
          onConfirm={remove}
        >
          <p className="rounded-lg bg-muted px-3 py-2.5 text-sm">
            Trimiterile elevilor și istoricul activității care depind de{" "}
            {r.kind === "material" ? "acest material" : "această problemă"} se
            păstrează: temele deja trimise, feedback-ul și XP-ul primit rămân
            neschimbate.
          </p>
        </ConfirmDialog>
      </div>
    </div>
  );
}
