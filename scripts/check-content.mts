// Rulează fiecare exemplu Python dintr-un curs și compară ce afișează cu „output”-ul
// scris în lecție. Codul fără output e doar compilat (verificăm sintaxa).
// Rulare: pnpm content:check   (are nevoie de Python instalat: comanda „py” sau „python3”)

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { course } from "../content/python-modulul-1";
import { courseSchema } from "../src/lib/content/schema";

const parsed = courseSchema.parse(course);
const python = ["py", "python3", "python"].find(
  (cmd) => spawnSync(cmd, ["--version"]).status === 0,
);
if (!python) {
  console.error("Nu am găsit Python (py / python3).");
  process.exit(1);
}

// input() citește din stdin și afișează și valoarea, ca într-un terminal.
const PRELUDE = `import builtins, sys
_vals = sys.stdin.read().split("\\n")
_pos = [0]
def _input(prompt=""):
    value = _vals[_pos[0]]
    _pos[0] += 1
    print(prompt + value)
    return value
builtins.input = _input
`;

/** Valorile scrise de utilizator, deduse din liniile care încep cu un prompt din cod. */
function inputsFrom(code: string, output: string) {
  const prompts = [...code.matchAll(/input\("([^"]*)"\)/g)].map((m) => m[1]);
  if (prompts.length === 0) return "";
  return output
    .split("\n")
    .flatMap((line) => {
      const p = prompts.find((x) => x && line.startsWith(x));
      return p === undefined ? [] : [line.slice(p.length)];
    })
    .join("\n");
}

let failed = 0;
let checked = 0;
for (const lesson of parsed.lessons) {
  const dir = mkdtempSync(join(tmpdir(), "eduquest-py-"));
  const samples = lesson.blocks.flatMap((b) => {
    if (b.type === "code" && b.language === "python")
      return [{ label: b.title ?? "exemplu", code: b.code, output: b.output }];
    if (b.type === "exercise" && b.solution.language === "python")
      return [{ label: b.title, code: b.solution.code, output: b.output }];
    return [];
  });
  for (const s of samples) {
    checked++;
    if (s.output === undefined) {
      const res = spawnSync(
        python,
        [
          "-X",
          "utf8",
          "-c",
          "import sys; compile(sys.stdin.read(), 'lectie', 'exec')",
        ],
        { input: s.code, encoding: "utf8" },
      );
      if (res.status !== 0) {
        failed++;
        console.log(`✗ ${lesson.slug} · ${s.label}: sintaxă\n${res.stderr}`);
      }
      continue;
    }
    // Fișiere de care au nevoie exemplele (ex. prieteni.txt).
    const res = spawnSync(python, ["-X", "utf8", "-c", PRELUDE + s.code], {
      cwd: dir,
      input: inputsFrom(s.code, s.output),
      encoding: "utf8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    const got = (res.stdout ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
    if (res.status !== 0 || got !== s.output) {
      failed++;
      console.log(
        `✗ ${lesson.slug} · ${s.label}\n  așteptat: ${JSON.stringify(s.output)}\n  primit:   ${JSON.stringify(got)}${res.stderr ? `\n  eroare: ${res.stderr.trim().split("\n").at(-1)}` : ""}`,
      );
    }
  }
  rmSync(dir, { recursive: true, force: true });
}

console.log(
  failed === 0
    ? `Toate cele ${checked} exemple din „${parsed.title}” sunt corecte.`
    : `${failed} din ${checked} exemple nu se potrivesc.`,
);
process.exit(failed === 0 ? 0 : 1);
