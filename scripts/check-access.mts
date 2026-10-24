// Verifică regulile de acces (RLS) cu conturile demo, prin cheia publică, ca un browser.
// Rulare: pnpm db:check   (după pnpm db:seed)

import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const read = (name: string) =>
  env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
const url = read("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const password = read("DEMO_PASSWORD");

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` (${detail})` : ""}`);
};

async function login(email: string) {
  const c = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login ${email}: ${error.message}`);
  return c;
}
const count = async (c: SupabaseClient, table: string) => {
  const { data, error } = await c.from(table).select("*");
  return error ? -1 : (data?.length ?? 0);
};

// Vizitator: nu vede nimic.
const guest = createClient(url, anonKey, { auth: { persistSession: false } });
for (const t of ["profiles", "classes", "assignments", "quiz_answer_keys"]) {
  const { data } = await guest.from(t).select("*");
  check(`vizitator nu vede ${t}`, (data?.length ?? 0) === 0);
}

// Elev
const tudor = await login("tudor.p@exemplu.ro");
const { data: tudorUser } = await tudor.auth.getUser();
const me = tudorUser.user?.id ?? "";
const classes = await tudor.from("classes").select("name");
check(
  "elevul vede doar clasele lui",
  (classes.data ?? []).every(
    (c) => c.name !== "Programare orientată pe obiecte",
  ),
  (classes.data ?? []).map((c) => c.name).join(", "),
);
check(
  "elevul nu vede răspunsurile corecte",
  (await count(tudor, "quiz_answer_keys")) === 0,
);
check(
  "elevul vede întrebările quiz-urilor",
  (await count(tudor, "quiz_questions")) > 0,
);
check(
  "elevul nu vede aplicațiile de mentor",
  (await count(tudor, "mentor_applications")) === 0,
);
const xp = await tudor.from("xp_transactions").select("student_id");
check(
  "elevul vede doar XP-ul lui",
  (xp.data ?? []).length > 0 &&
    (xp.data ?? []).every((r) => r.student_id === me),
);
const subs = await tudor.from("submissions").select("student_id");
check(
  "elevul vede doar trimiterile lui",
  (subs.data ?? []).every((r) => r.student_id === me),
);
const roleUpdate = await tudor
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", me);
check("elevul nu își poate schimba rolul", roleUpdate.error !== null);
const xpInsert = await tudor.from("xp_transactions").insert({
  student_id: me,
  source: "adjustment",
  amount: 100,
  label: "hack",
});
check("elevul nu își poate da XP", xpInsert.error !== null);
const ownName = await tudor
  .from("profiles")
  .update({ display_name: "Tudor Popescu" })
  .eq("id", me)
  .select();
check(
  "elevul își poate schimba numele afișat",
  !ownName.error && (ownName.data?.length ?? 0) === 1,
);
const python = (classes.data ?? []).length
  ? await tudor
      .from("classes")
      .select("id")
      .eq("name", "Python pentru începători")
      .single()
  : null;
const board = await tudor.rpc("class_leaderboard", {
  p_class: python?.data?.id,
});
check(
  "clasamentul clasei lui merge",
  !board.error && (board.data?.length ?? 0) > 0,
  board.data ? `${board.data.length} elevi` : board.error?.message,
);
const others = await tudor.from("profiles").select("id");
check(
  "elevul vede doar colegii, nu toți utilizatorii",
  (others.data?.length ?? 0) > 1 && (others.data?.length ?? 0) < 17,
  `${others.data?.length} profiluri`,
);
const badJoin = await tudor.rpc("join_class", { p_code: "XXXXXX" });
check("cod de clasă greșit e respins", badJoin.error !== null);

// Mentor
const ana = await login("ana.ionescu@exemplu.ro");
check(
  "mentorul vede răspunsurile quiz-urilor lui",
  (await count(ana, "quiz_answer_keys")) > 0,
);
check(
  "mentorul nu vede aplicațiile de mentor",
  (await count(ana, "mentor_applications")) === 0,
);
const anaSubs = await count(ana, "submissions");
check("mentorul vede trimiterile din clasele lui", anaSubs > 0, `${anaSubs}`);

// Administrator
const admin = await login("admin@eduquest.ro");
check(
  "adminul vede aplicațiile de mentor",
  (await count(admin, "mentor_applications")) > 0,
);
check(
  "adminul nu vede temele claselor",
  (await count(admin, "assignments")) === 0,
);

console.log(
  failed === 0
    ? "\nToate verificările au trecut."
    : `\n${failed} verificări au eșuat.`,
);
process.exit(failed === 0 ? 0 : 1);
