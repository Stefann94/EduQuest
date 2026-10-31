// Conținutul unui folder într-o singură ordine, cea aleasă de mentor: subfolderele și
// materialele (PDF, problemă, link…) stau amestecate, după poziție. Fișier fără acces
// la date, folosit și în browser (editorul) și pe server (pagina elevului).

export type FolderEntry<F, I> =
  | { type: "folder"; id: string; position: number; folder: F }
  | { type: "item"; id: string; position: number; item: I };

export function folderEntries<
  F extends { id: string; position: number },
  I extends { id: string; position: number },
>(folders: F[], items: I[]): FolderEntry<F, I>[] {
  return [
    ...folders.map((f) => ({
      type: "folder" as const,
      id: f.id,
      position: f.position,
      folder: f,
    })),
    ...items.map((i) => ({
      type: "item" as const,
      id: i.id,
      position: i.position,
      item: i,
    })),
  ].sort(
    (a, b) =>
      a.position - b.position ||
      // La poziții egale (conținut vechi), folderele întâi.
      (a.type === b.type ? 0 : a.type === "folder" ? -1 : 1),
  );
}
