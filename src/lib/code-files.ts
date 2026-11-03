// Rezolvarea unei probleme poate avea mai multe fișiere de cod (main.py, utils.py…).
// Se păstrează în același câmp text ca până acum: un singur fișier = codul simplu (exact
// ca înainte); mai multe = fiecare precedat de un rând-marcaj. Fișier fără acces la date,
// folosit și în browser.

export type CodeFile = { name: string; code: string };

const MARK = /^#~~ eduquest-file: (.+?) ~~#$/;
const mark = (name: string) => `#~~ eduquest-file: ${name} ~~#`;

/** Numele implicit al primului fișier, după limbaj. */
export function defaultFileName(language: string) {
  const ext: Record<string, string> = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    html: "html",
    css: "css",
    sql: "sql",
  };
  return `main.${ext[language] ?? "txt"}`;
}

/** Textul salvat → fișierele lui (textul vechi, fără marcaje, e un singur fișier). */
export function unpackFiles(text: string, language: string): CodeFile[] {
  const lines = text.split("\n");
  if (!MARK.test(lines[0] ?? ""))
    return [{ name: defaultFileName(language), code: text }];
  const files: { name: string; lines: string[] }[] = [];
  for (const line of lines) {
    const m = line.match(MARK);
    if (m) files.push({ name: m[1], lines: [] });
    else files[files.length - 1].lines.push(line);
  }
  return files.map((f) => ({ name: f.name, code: f.lines.join("\n") }));
}

/** Fișierele → textul salvat. Un singur fișier rămâne cod simplu, ca înainte. */
export function packFiles(files: CodeFile[]) {
  if (files.length === 1) return files[0].code;
  return files.map((f) => `${mark(f.name)}\n${f.code}`).join("\n");
}

/** Un nume de fișier valid: fără spații la capete, fără „/”, unic în listă. */
export function cleanFileName(name: string) {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .slice(0, 40);
}
