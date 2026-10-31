"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createSubfolder,
  deleteItem,
  deleteSubfolder,
  moveEntry,
  setItemPublished,
  updateLessonDetails,
} from "@/app/mentor/materiale/actions";
import {
  MATERIAL_KIND,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import { ConfirmDialog } from "@/components/mentor-content/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { folderEntries } from "@/lib/content/folder-order";
import { ITEM_KINDS, type ItemKind } from "@/lib/content/items";
import type { FolderNode, LessonItemView } from "@/lib/db/lessons";
import { cn } from "@/lib/utils";
import { ItemEditor } from "./item-editor";

/** Cel mai adânc nivel la care se mai pot crea subfoldere (0 = folderul de pe primul nivel). */
const MAX_LEVEL = 2;

type Run = (task: () => Promise<{ ok: boolean; message: string }>) => void;

function useRun(): [Run, boolean] {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run: Run = (task) =>
    startTransition(async () => {
      const r = await task();
      if (!r.ok) toast.error(r.message);
      else if (r.message) toast.success(r.message);
      router.refresh();
    });
  return [run, pending];
}

/**
 * Tot conținutul unui folder, într-o singură listă și în ordinea pe care o văd elevii:
 * subfoldere (deschise pe loc, cu materialele lor), PDF-uri, probleme rezolvate, linkuri,
 * video și lecții scrise. Totul se adaugă, se mută și se modifică din aceeași pagină.
 */
export function FolderContentEditor({
  node,
  level,
}: {
  node: FolderNode;
  /** Nivelul folderului: 0 = primul nivel, 1 = subfolder, 2 = sub-subfolder. */
  level: number;
}) {
  const [run, pending] = useRun();
  const [editing, setEditing] = useState<{ id: string } | null>(null);
  const [adding, setAdding] = useState<ItemKind | "folder" | null>(null);
  const entries = folderEntries(node.children, node.items);

  return (
    <div className="grid gap-2">
      {entries.length === 0 && !adding ? (
        <p className="cut-sm border border-dashed px-4 py-5 text-center text-muted-foreground text-sm">
          Gol deocamdată. Adaugă mai jos un subfolder, un PDF, o problemă
          rezolvată, un link…
        </p>
      ) : null}

      <ol className="grid gap-2">
        {entries.map((e, i) => {
          const move = (by: -1 | 1) => run(() => moveEntry(node.id, e.id, by));
          const arrows = (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending || i === 0}
                onClick={() => move(-1)}
                aria-label={`Mută mai sus: ${e.type === "folder" ? e.folder.title : e.item.title}`}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending || i === entries.length - 1}
                onClick={() => move(1)}
                aria-label={`Mută mai jos: ${e.type === "folder" ? e.folder.title : e.item.title}`}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
            </>
          );
          return e.type === "folder" ? (
            <li key={e.id}>
              <SubfolderBlock
                folder={e.folder}
                level={level + 1}
                arrows={arrows}
              />
            </li>
          ) : editing?.id === e.id ? (
            <li key={e.id}>
              <ItemEditor
                lessonId={node.id}
                item={e.item}
                kind={e.item.kind}
                onDone={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={e.id}>
              <ItemRow
                folderId={node.id}
                item={e.item}
                arrows={arrows}
                run={run}
                pending={pending}
                onEdit={() => setEditing({ id: e.id })}
              />
            </li>
          );
        })}
      </ol>

      {adding === "folder" ? (
        <NewSubfolder parentId={node.id} onDone={() => setAdding(null)} />
      ) : adding ? (
        <ItemEditor
          lessonId={node.id}
          kind={adding}
          onDone={() => setAdding(null)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-wide">
            Adaugă{level > 0 ? ` în „${node.title}”` : ""}:
          </span>
          {level < MAX_LEVEL ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding("folder")}
            >
              <FolderPlus aria-hidden="true" /> Subfolder
            </Button>
          ) : null}
          {ITEM_KINDS.map((k) => {
            const Icon = MATERIAL_KIND[k].icon;
            return (
              <Button
                key={k}
                variant="outline"
                size="sm"
                onClick={() => setAdding(k)}
              >
                <Icon aria-hidden="true" /> {MATERIAL_KIND[k].label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  folderId,
  item,
  arrows,
  run,
  pending,
  onEdit,
}: {
  folderId: string;
  item: LessonItemView;
  arrows: React.ReactNode;
  run: Run;
  pending: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex cut-sm flex-wrap items-center gap-3 bg-card px-3 py-2.5">
      <MaterialKindIcon kind={item.kind} />
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-medium">{item.title}</p>
        <p className="text-muted-foreground text-xs">
          {MATERIAL_KIND[item.kind].label}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Switch
          checked={item.published}
          disabled={pending}
          onCheckedChange={(v) =>
            run(() => setItemPublished(folderId, item.id, v))
          }
          aria-label={`Vizibil elevilor: ${item.title}`}
        />
        <span
          className={cn(
            "hidden w-14 text-xs sm:inline",
            item.published ? "text-success" : "text-muted-foreground",
          )}
        >
          {item.published ? "Vizibil" : "Ascuns"}
        </span>
      </div>
      <div className="flex items-center">
        {arrows}
        {item.kind === "problem" ? (
          <Link
            href={`/mentor/materiale/${folderId}/probleme/${item.id}`}
            className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
            aria-label={`Previzualizează: ${item.title}`}
            title="Previzualizează ca elev"
          >
            <Eye className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
        {item.kind === "pdf" && item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
            aria-label={`Vezi PDF-ul: ${item.title}`}
          >
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`Editează: ${item.title}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <ConfirmDialog
          title="Ștergi materialul?"
          description={`„${item.title}” dispare din folder și din toate clasele. Acțiunea nu se poate anula.`}
          confirmLabel="Șterge"
          onConfirm={() => run(() => deleteItem(folderId, item.id))}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Șterge: ${item.title}`}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          }
        />
      </div>
    </div>
  );
}

/** Un subfolder deschis pe loc: antet (redenumire, ordine, ștergere) și conținutul lui. */
function SubfolderBlock({
  folder,
  level,
  arrows,
}: {
  folder: FolderNode;
  level: number;
  arrows: React.ReactNode;
}) {
  const [run, pending] = useRun();
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(folder.title);
  const count = folder.items.length + folder.children.length;

  return (
    <section
      aria-label={`Subfolder: ${folder.title}`}
      className="cut-sm border-xp/40 border-l-4 bg-xp-soft/40"
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 basis-48 items-center gap-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/70"
        >
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 cut-xs place-items-center bg-xp-soft text-xp-foreground"
          >
            <FolderOpen className="size-4" />
          </span>
          {renaming ? null : (
            <span className="min-w-0">
              <span className="block truncate font-semibold">
                {folder.title}
              </span>
              <span className="block text-muted-foreground text-xs">
                Subfolder · {count} {count === 1 ? "element" : "elemente"}
              </span>
            </span>
          )}
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        {renaming ? (
          <form
            className="flex flex-1 basis-64 items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const r = await updateLessonDetails(folder.id, {
                  title,
                  summary: folder.summary,
                });
                if (r.ok) setRenaming(false);
                return {
                  ...r,
                  message: r.ok ? "Subfolderul a fost redenumit." : r.message,
                };
              });
            }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              aria-label="Numele subfolderului"
              autoFocus
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              disabled={pending || title.trim().length < 2}
              aria-label="Salvează numele"
            >
              <Check aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setTitle(folder.title);
                setRenaming(false);
              }}
              aria-label="Renunță"
            >
              <X aria-hidden="true" />
            </Button>
          </form>
        ) : null}
        <div className="flex items-center">
          {arrows}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRenaming(true)}
            aria-label={`Redenumește: ${folder.title}`}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <ConfirmDialog
            title="Ștergi subfolderul?"
            description={`„${folder.title}”, cu tot ce are în el, dispare definitiv.`}
            confirmLabel="Șterge subfolderul"
            onConfirm={() => run(() => deleteSubfolder(folder.id))}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Șterge: ${folder.title}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            }
          />
        </div>
      </div>
      {open ? (
        <div className="border-xp/30 border-t px-3 py-3 sm:pl-6">
          <FolderContentEditor node={folder} level={level} />
        </div>
      ) : null}
    </section>
  );
}

function NewSubfolder({
  parentId,
  onDone,
}: {
  parentId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex cut-sm flex-wrap items-center gap-2 bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await createSubfolder(parentId, { title, summary: "" });
          if (!r.ok) {
            setError(r.errors?.title ?? r.message);
            return;
          }
          toast.success(r.message);
          onDone();
          router.refresh();
        });
      }}
    >
      <FolderPlus className="size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Numele subfolderului, ex. Probleme rezolvate"
        maxLength={120}
        aria-label="Numele subfolderului"
        aria-invalid={error ? true : undefined}
        className="min-w-56 flex-1"
        autoFocus
      />
      <Button type="submit" disabled={pending || title.trim().length < 2}>
        Creează
      </Button>
      <Button type="button" variant="ghost" onClick={onDone}>
        Renunță
      </Button>
      {error ? (
        <p className="basis-full text-destructive text-sm">{error}</p>
      ) : null}
    </form>
  );
}
