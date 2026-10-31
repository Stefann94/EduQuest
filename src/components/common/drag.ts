// Drag and drop nativ (HTML5) pentru listele din Materiale. Ce se trage e ținut și aici,
// pentru că în timpul tragerii (dragover) browserul nu lasă citirea datelor.

export type DragPayload = {
  kind: "item" | "folder" | "lesson";
  id: string;
  /** Folderul (sau lista) din care pleacă elementul. */
  from: string;
};

let current: DragPayload | null = null;

export function startDrag(e: React.DragEvent, payload: DragPayload) {
  e.stopPropagation();
  current = payload;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", payload.id);
}

export const dragged = () => current;

export function endDrag() {
  current = null;
}

/** Noua ordine după ce `id` a fost lăsat pe `targetId` (în jos: după țintă; în sus: înainte). */
export function reorder(ids: string[], id: string, targetId: string) {
  const from = ids.indexOf(id);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return null;
  const next = ids.filter((x) => x !== id);
  next.splice(next.indexOf(targetId) + (from < to ? 1 : 0), 0, id);
  return next;
}
