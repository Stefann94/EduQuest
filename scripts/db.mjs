// Rulează CLI-ul Supabase pe baza de date din .env.local (SUPABASE_DB_URL),
// fără ca parola să apară în comandă sau în istoric.
// Exemple: node scripts/db.mjs push   |   node scripts/db.mjs push --dry-run
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^SUPABASE_DB_URL=(.*)$/m)?.[1]?.trim();
if (!url || url.includes("[YOUR-PASSWORD]")) {
  console.error("Lipsește SUPABASE_DB_URL în .env.local.");
  process.exit(1);
}

const [command = "push", ...rest] = process.argv.slice(2);
const args = {
  push: ["db", "push", "--db-url", url, "--include-all", "--yes", ...rest],
  lint: ["db", "lint", "--db-url", url, ...rest],
  types: [
    "gen",
    "types",
    "typescript",
    "--db-url",
    url,
    "--schema",
    "public",
    ...rest,
  ],
}[command];
if (!args) {
  console.error(`Comandă necunoscută: ${command}`);
  process.exit(1);
}

const res = spawnSync("pnpm", ["exec", "supabase", ...args], {
  stdio: ["inherit", "pipe", "pipe"],
  shell: process.platform === "win32",
  encoding: "utf8",
});
// Nu afișăm niciodată adresa cu parola, nici dacă CLI-ul o repetă într-o eroare.
const hide = (s) =>
  s
    .replaceAll(url, "[SUPABASE_DB_URL]")
    .replace(/postgres(ql)?:\/\/[^\s"']+/g, "[url]");
// `types` scrie direct fișierul de tipuri folosit de aplicație.
if (command === "types" && res.status === 0) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(
    new URL("../src/lib/supabase/database.types.ts", import.meta.url),
    `// Generat cu „pnpm db:types” din baza de date. Nu edita manual.

${res.stdout}`,
  );
  console.log("Am scris src/lib/supabase/database.types.ts");
} else process.stdout.write(hide(res.stdout ?? ""));
process.stderr.write(hide(res.stderr ?? ""));
process.exit(res.status ?? 1);
