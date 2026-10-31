// Încarcă datele demo (src/lib/data/demo.ts) în Supabase, pentru teste.
// Rulare: pnpm db:seed   (se poate rula de mai multe ori; actualizează ce există)
//
// Conturile demo primesc o parolă aleatorie, salvată doar în .env.local (DEMO_PASSWORD),
// ca nimeni să nu poată intra pe baza reală cu o parolă cunoscută.

import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { type ItemKind, itemContentSchema } from "../src/lib/content/items";
import * as demo from "../src/lib/data/demo";

const ENV_PATH = new URL("../.env.local", import.meta.url);
const env = readFileSync(ENV_PATH, "utf8");
const read = (name: string) =>
  env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";

const url = read("NEXT_PUBLIC_SUPABASE_URL");
const secret = read("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !secret) throw new Error("Lipsesc cheile Supabase din .env.local.");

let password = read("DEMO_PASSWORD");
if (!password) {
  password = randomBytes(12).toString("base64url");
  appendFileSync(
    ENV_PATH,
    `\n# Parola conturilor demo (generată de pnpm db:seed).\nDEMO_PASSWORD=${password}\n`,
  );
}

const db = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Id-urile demo (ex. „python-incepatori”) devin uuid-uri stabile, aceleași la fiecare rulare.
const uuid = (kind: string, id: string) => {
  const h = createHash("md5").update(`eduquest:${kind}:${id}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

async function must<T>(
  label: string,
  p: PromiseLike<{ data: T; error: { message: string } | null }>,
) {
  const { data, error } = await p;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

/* ---------- Conturi ---------- */

const userIds = new Map<string, string>();
const existing = new Map<string, string>();
for (let page = 1; ; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  for (const u of data.users) if (u.email) existing.set(u.email, u.id);
  if (data.users.length < 200) break;
}

for (const u of demo.users) {
  let id = existing.get(u.email);
  if (!id) {
    const { data, error } = await db.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: u.displayName, username: u.username },
    });
    if (error) throw new Error(`Cont ${u.email}: ${error.message}`);
    id = data.user.id;
  } else {
    await db.auth.admin.updateUserById(id, { password });
  }
  userIds.set(u.id, id);
}
const user = (demoId: string) => {
  const id = userIds.get(demoId);
  if (!id) throw new Error(`Utilizator demo necunoscut: ${demoId}`);
  return id;
};

// Rolul, avatarul și starea se setează doar de pe server (cheia secretă).
for (const u of demo.users) {
  await must(
    `Profil ${u.email}`,
    db
      .from("profiles")
      .update({
        role: u.role,
        avatar: u.avatar,
        status: u.status,
        username: u.username ?? null,
        created_at: u.createdAt,
      })
      .eq("id", user(u.id)),
  );
}

/* ---------- Clase ---------- */

const classId = (id: string) => uuid("class", id);
await must(
  "Clase",
  db.from("classes").upsert(
    demo.classes.map((c) => ({
      id: classId(c.id),
      name: c.name,
      description: c.description,
      mentor_id: user(c.mentorId),
      status: c.status,
      schedule: c.schedule,
      invite_code: c.inviteCode,
      invite_code_active: c.inviteCodeActive,
      created_at: c.createdAt,
    })),
  ),
);
await must(
  "Membri",
  db.from("class_members").upsert(
    demo.classes.flatMap((c) =>
      c.studentIds.map((s) => ({
        class_id: classId(c.id),
        student_id: user(s),
        joined_at: c.createdAt,
      })),
    ),
  ),
);
/* ---------- Lecții și materiale (v2) ---------- */

// Ce au creat conturile demo se șterge și se reface la fiecare rulare; ștergerea
// merge în cascadă (trimiteri, încercări, sesiuni live etc.). Cursurile nu se ating.
const demoAccounts = [...userIds.values()];
await must(
  "Curățare XP",
  db.from("xp_transactions").delete().in("student_id", demoAccounts),
);
await must(
  "Curățare quiz-uri",
  db
    .from("quizzes")
    .delete()
    .is("course_id", null)
    .in("author_id", demoAccounts),
);
await must(
  "Curățare teme",
  db.from("homeworks").delete().in("author_id", demoAccounts),
);
await must(
  "Curățare lecții",
  db
    .from("lessons")
    .delete()
    .is("course_id", null)
    .in("author_id", demoAccounts),
);

const mentorOfClass = (cid: string) =>
  user(demo.classes.find((c) => c.id === cid)?.mentorId ?? "");

// Lecțiile fiecărei clase urmează întâlnirile, în ordine; plus câteva planificate.
const PLANNED: Record<string, string[]> = {
  "python-incepatori": ["Funcții"],
  "poo-java": [],
  "web-html-css": [],
};
type DemoLesson = {
  key: string;
  classId: string;
  title: string;
  number: number;
};
const demoLessons: DemoLesson[] = [];
for (const c of demo.classes.filter((x) => x.status === "active")) {
  const topics = demo.attendance
    .filter((m) => m.classId === c.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => m.topic);
  for (const [i, title] of [...topics, ...(PLANNED[c.id] ?? [])].entries())
    demoLessons.push({
      key: `${c.id}:${title}`,
      classId: c.id,
      title,
      number: i + 1,
    });
}
const lessonId = (key: string) => uuid("lesson-v2", key);

await must(
  "Lecții",
  db.from("lessons").upsert(
    demoLessons.map((l) => ({
      id: lessonId(l.key),
      author_id: mentorOfClass(l.classId),
      title: l.title,
      summary: "",
    })),
  ),
);
await must(
  "Lecții în clase",
  db.from("lesson_classes").upsert(
    demoLessons.map((l) => ({
      lesson_id: lessonId(l.key),
      class_id: classId(l.classId),
      number: l.number,
      display: "both",
      published: true,
    })),
  ),
);

// O lecție folosită în două clase (Python și Java), cu numere diferite.
const sharedKey = "shared:erori";
await must(
  "Lecție comună",
  db.from("lessons").upsert({
    id: lessonId(sharedKey),
    author_id: user("u-ana"),
    title: "Cum citești un mesaj de eroare",
    summary: "Unde te uiți întâi când programul se oprește cu o eroare.",
  }),
);
await must(
  "Lecție comună în clase",
  db.from("lesson_classes").upsert([
    {
      lesson_id: lessonId(sharedKey),
      class_id: classId("python-incepatori"),
      number: 7,
      display: "both",
    },
    {
      lesson_id: lessonId(sharedKey),
      class_id: classId("poo-java"),
      number: 3,
      display: "both",
    },
  ]),
);

// Materialele demo, puse în lecția potrivită.
const MATERIAL_LESSON: Record<string, string> = {
  "documentatie-python": "python-incepatori:Primul program",
  "variabile-tipuri": "python-incepatori:Variabile și tipuri",
  "conditii-if": "python-incepatori:Condiții",
  "bucle-video": "python-incepatori:Bucla while",
  "fisa-bucle": "python-incepatori:Bucla for",
  "functii-draft": "python-incepatori:Funcții",
  "structura-html": "web-html-css:Ce este HTML",
  "ghid-flexbox": "web-html-css:Primii pași în CSS",
  "mesaje-eroare": sharedKey,
};
const PROBLEM_LESSON: Record<string, string> = {
  "suma-cifrelor": "python-incepatori:Bucla while",
  "maximul-a-trei": "python-incepatori:Condiții",
};

// Un PDF mic, real, pentru fișa de exerciții (Supabase Storage, bucket privat „materials”).
function tinyPdf(lines: string[]) {
  const text = lines
    .map(
      (l, i) =>
        `BT /F1 14 Tf 72 ${760 - i * 24} Td (${l.replace(/[()\\]/g, "")}) Tj ET`,
    )
    .join("\n");
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

const items: Record<string, unknown>[] = [];
for (const m of demo.materials) {
  const key = MATERIAL_LESSON[m.id];
  if (!key) continue;
  const lid = lessonId(key);
  let content: Record<string, unknown> = {};
  if (m.kind === "article") content = { blocks: m.blocks ?? [] };
  else if (m.kind === "link" || m.kind === "video")
    content = { url: m.url ?? "https://www.python.org", note: m.description };
  else if (m.kind === "pdf") {
    const path = `${lid}/fisa-bucle.pdf`;
    const pdf = tinyPdf([
      "Fisa de exercitii: bucle",
      "",
      "1. Afiseaza numerele de la 1 la 10 cu un while.",
      "2. Afiseaza numerele pare pana la 20 cu range().",
      "3. Calculeaza suma numerelor de la 1 la 100.",
      "4. Afiseaza tabla inmultirii cu 7.",
      "5. Numara de cate ori apare litera a intr-un cuvant.",
    ]);
    const { error } = await db.storage
      .from("materials")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (error) throw new Error(`PDF: ${error.message}`);
    content = {
      path,
      name: m.file?.name ?? "fisa-bucle.pdf",
      sizeKb: Math.max(1, Math.round(pdf.length / 1024)),
    };
  }
  items.push({
    id: uuid("item", m.id),
    lesson_id: lid,
    kind: m.kind,
    title: m.title,
    position: items.filter((i) => i.lesson_id === lid).length,
    published: m.status === "published",
    content,
  });
}
for (const p of demo.workedProblems) {
  const key = PROBLEM_LESSON[p.id];
  if (!key) continue;
  const lid = lessonId(key);
  items.push({
    id: uuid("item", p.id),
    lesson_id: lid,
    kind: "problem",
    title: p.title,
    position: items.filter((i) => i.lesson_id === lid).length,
    published: p.status === "published",
    content: {
      statement: p.statement,
      examples: p.examples,
      constraints: p.constraints,
      language: p.solution.language,
      solution: p.solution.code,
      explanation: p.explanation.join("\n\n"),
    },
  });
}
// Un material ascuns (ciornă), ca să se vadă diferența la mentor.
items.push({
  id: uuid("item", "patratele-pana-la-n"),
  lesson_id: lessonId("python-incepatori:Funcții"),
  kind: "problem",
  title: "Pătratele numerelor până la N",
  position: 9,
  published: false,
  content: {
    statement:
      "Citește un număr `n` și afișează pătratele numerelor de la 1 la `n`, câte unul pe rând.",
    examples: [{ input: "3", output: "1\n4\n9" }],
    constraints: [],
    hint: "Un `for` cu `range(1, n + 1)`.",
    language: "python",
    solution: "n = int(input())\nfor i in range(1, n + 1):\n    print(i * i)",
  },
});
for (const i of items) {
  const ok = itemContentSchema[i.kind as ItemKind].safeParse(i.content);
  if (!ok.success)
    throw new Error(`Material „${i.title}”: ${ok.error.message}`);
}
await must("Materiale", db.from("lesson_items").upsert(items));

// Un subfolder în capitolul „Bucla for”, cu o problemă rezolvată în două fișiere
// (programul și datele lui), ca să se vadă folderele și soluția pe taburi.
const forFolder = lessonId("python-incepatori:Bucla for");
const solvedFolder = uuid(
  "lesson-v2",
  "python-incepatori:Bucla for/probleme-rezolvate",
);
await must(
  "Subfolder",
  db.from("lessons").upsert({
    id: solvedFolder,
    author_id: user("u-ana"),
    parent_id: forFolder,
    title: "Probleme rezolvate",
    summary: "Probleme cu bucla for, cu rezolvarea pas cu pas.",
    position: 0,
  }),
);
const multiFile = {
  id: uuid("item", "media-din-json"),
  lesson_id: solvedFolder,
  kind: "problem",
  title: "Media notelor dintr-un fișier JSON",
  position: 0,
  published: true,
  content: {
    statement:
      "Fișierul `note.json` conține notele unui elev, pe materii. Scrie un program care citește fișierul și afișează media tuturor notelor, cu două zecimale.\n\nFolosește modulul `json` și o buclă `for` care trece prin materii.",
    examples: [{ input: "(note.json de alături)", output: "Media: 8.83" }],
    constraints: [],
    hint: "`json.load(f)` îți dă un dicționar; `for materie, nota in note.items():` trece prin perechi.",
    language: "python",
    files: [
      {
        name: "main.py",
        language: "python",
        code: `import json

with open("note.json", "r") as f:
    note = json.load(f)

suma = 0
for materie, nota in note.items():
    suma = suma + nota
media = suma / len(note)
print(f"Media: {media:.2f}")`,
      },
      {
        name: "note.json",
        language: "json",
        code: `{
  "matematică": 9,
  "informatică": 10,
  "română": 7.5
}`,
      },
    ],
    output: "Media: 8.83",
    explanation:
      "`json.load` transformă textul din fișier într-un dicționar Python. Bucla adună notele, iar `len(note)` spune câte materii sunt. `:.2f` afișează media cu două zecimale.",
  },
};
{
  const ok = itemContentSchema.problem.safeParse(multiFile.content);
  if (!ok.success) throw new Error(`Problema demo: ${ok.error.message}`);
}
await must(
  "Problemă cu mai multe fișiere",
  db.from("lesson_items").upsert(multiFile),
);

/* ---------- Teme cu mai multe probleme (v2) ---------- */

type DemoHomework = {
  key: string;
  author: string;
  title: string;
  description: string;
  required: boolean;
  problems: { slug: string; required: boolean }[];
  classes: string[];
};
const extraProblems: Record<string, { title: string; statement: string }> = {
  "numaratoare-inversa": {
    title: "Numărătoare inversă",
    statement:
      "Citește un număr `n` și afișează numerele de la `n` până la 1, apoi `Start!`. Folosește o buclă `while`.",
  },
};
const HOMEWORKS: DemoHomework[] = [
  {
    key: "tema-1",
    author: "u-ana",
    title: "Tema 1: Primul program",
    description: "Prima temă: citești date și faci un calcul simplu.",
    required: true,
    problems: [{ slug: "calculator-varsta", required: true }],
    classes: ["python-incepatori"],
  },
  {
    key: "tema-2",
    author: "u-ana",
    title: "Tema 2: Bucle",
    description:
      "Exersăm buclele while și for. Problema cu jocul e opțională, pentru cine vrea mai mult.",
    required: true,
    problems: [
      { slug: "piramida-stelute", required: true },
      { slug: "numaratoare-inversa", required: true },
      { slug: "ghiceste-numarul", required: false },
    ],
    classes: ["python-incepatori"],
  },
  {
    key: "tema-functii",
    author: "u-ana",
    title: "Funcții: primele exerciții",
    description: "Pregătită pentru lecția despre funcții; încă neatribuită.",
    required: true,
    problems: [{ slug: "functii-draft", required: true }],
    classes: [],
  },
  {
    key: "tema-web-1",
    author: "u-mihai",
    title: "Pagina mea de prezentare",
    description: "Prima ta pagină web, cu titluri, paragrafe și o listă.",
    required: true,
    problems: [{ slug: "pagina-prezentare", required: true }],
    classes: ["web-html-css"],
  },
  {
    key: "tema-web-css",
    author: "u-mihai",
    title: "Stilizează pagina cu CSS",
    description: "Temă opțională: dă culoare paginii tale.",
    required: false,
    problems: [{ slug: "pagina-css", required: true }],
    classes: ["web-html-css"],
  },
];

const homeworkId = (key: string) => uuid("homework", key);
const problemId = (hw: string, slug: string) =>
  uuid("hw-problem", `${hw}:${slug}`);
const assignmentId = (hw: string, cls: string) =>
  uuid("hw-assignment", `${hw}:${cls}`);
const demoAssignment = (slug: string) =>
  demo.assignments.find((a) => a.id === slug);

await must(
  "Teme",
  db.from("homeworks").upsert(
    HOMEWORKS.map((h) => ({
      id: homeworkId(h.key),
      author_id: user(h.author),
      title: h.title,
      description: h.description,
      required: h.required,
    })),
  ),
);
await must(
  "Problemele temelor",
  db.from("homework_problems").upsert(
    HOMEWORKS.flatMap((h) =>
      h.problems.map((p, i) => {
        const a = demoAssignment(p.slug);
        const extra = extraProblems[p.slug];
        return {
          id: problemId(h.key, p.slug),
          homework_id: homeworkId(h.key),
          position: i,
          title: a?.title ?? extra?.title ?? p.slug,
          statement: a
            ? [
                a.summary,
                ...a.instructions.map((x, n) => `${n + 1}. ${x}`),
              ].join("\n\n")
            : (extra?.statement ?? ""),
          language: h.key.startsWith("tema-web") ? "html" : "python",
          required: p.required,
        };
      }),
    ),
  ),
);
const deadlineOf = (h: DemoHomework) =>
  h.problems
    .map((p) => demoAssignment(p.slug)?.deadline)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;
await must(
  "Teme atribuite",
  db.from("homework_assignments").upsert(
    HOMEWORKS.flatMap((h) =>
      h.classes.map((c) => ({
        id: assignmentId(h.key, c),
        homework_id: homeworkId(h.key),
        class_id: classId(c),
        deadline: deadlineOf(h),
        assigned_at:
          demoAssignment(h.problems[0].slug)?.publishedAt ??
          new Date().toISOString(),
      })),
    ),
  ),
);

// Trimiterile demo devin trimiteri pe probleme, cu toate încercările.
const STATUS = {
  submitted: "submitted",
  reviewed: "accepted",
  needs_changes: "needs_changes",
} as const;
const subRows: Record<string, unknown>[] = [];
const attemptRows: Record<string, unknown>[] = [];
const reviewRows = new Map<
  string,
  {
    assignment_id: string;
    student_id: string;
    bonus_xp: number;
    note: string | null;
    reviewed_at: string;
  }
>();
const xpRows: Record<string, unknown>[] = [];
for (const h of HOMEWORKS) {
  for (const c of h.classes) {
    const aid = assignmentId(h.key, c);
    const deadline = deadlineOf(h);
    const firstSubmit = new Map<string, Map<string, string>>(); // elev → problemă → prima trimitere
    for (const p of h.problems) {
      for (const s of demo.submissions.filter(
        (x) => x.assignmentId === p.slug,
      )) {
        const sid = uuid("problem-sub", `${aid}:${p.slug}:${s.studentId}`);
        subRows.push({
          id: sid,
          assignment_id: aid,
          problem_id: problemId(h.key, p.slug),
          student_id: user(s.studentId),
          status: STATUS[s.status],
          feedback: s.feedback?.text ?? null,
          feedback_at: s.feedback?.at ?? null,
          updated_at: s.attempts.at(-1)?.at,
        });
        for (const [i, at] of s.attempts.entries())
          attemptRows.push({
            id: uuid("problem-attempt", `${sid}:${i}`),
            submission_id: sid,
            at: at.at,
            code:
              at.text ??
              (at.link
                ? `# Link: ${at.link}`
                : `# Fișiere: ${at.files.map((f) => f.name).join(", ")}`),
            late: Boolean(deadline && at.at > deadline),
          });
        const byProblem = firstSubmit.get(s.studentId) ?? new Map();
        byProblem.set(p.slug, s.attempts[0].at);
        firstSubmit.set(s.studentId, byProblem);
        if (s.bonusXp && s.feedback) {
          const key = `${aid}:${s.studentId}`;
          const prev = reviewRows.get(key);
          reviewRows.set(key, {
            assignment_id: aid,
            student_id: user(s.studentId),
            bonus_xp: Math.min(5, (prev?.bonus_xp ?? 0) + s.bonusXp),
            note: s.feedback.text,
            reviewed_at: s.feedback.at,
          });
        }
      }
    }
    // +2 doar dacă toate problemele obligatorii au fost trimise înainte de termen.
    const required = h.problems.filter((p) => p.required).map((p) => p.slug);
    for (const [student, byProblem] of firstSubmit) {
      if (!required.every((r) => byProblem.has(r))) continue;
      const doneAt = required
        .map((r) => byProblem.get(r) as string)
        .sort()
        .at(-1) as string;
      if (deadline && doneAt > deadline) continue;
      xpRows.push({
        student_id: user(student),
        class_id: classId(c),
        source: "submission",
        amount: 2,
        label: `Temă trimisă la timp: ${h.title}`,
        at: doneAt,
        event_key: `homework:${aid}:${user(student)}`,
      });
    }
  }
}
await must("Trimiteri", db.from("problem_submissions").upsert(subRows));
await must("Încercări", db.from("problem_attempts").upsert(attemptRows));
await must(
  "Evaluări teme",
  db.from("homework_reviews").upsert([...reviewRows.values()]),
);
for (const r of reviewRows.values()) {
  const cls = HOMEWORKS.flatMap((h) =>
    h.classes.map((c) => ({ id: assignmentId(h.key, c), c, title: h.title })),
  ).find((x) => x.id === r.assignment_id);
  xpRows.push({
    student_id: r.student_id,
    class_id: classId(cls?.c ?? ""),
    source: "quality_bonus",
    amount: r.bonus_xp,
    label: `Bonus de calitate: ${cls?.title}`,
    at: r.reviewed_at,
    event_key: `hwbonus:${r.assignment_id}:${r.student_id}`,
  });
}

/* ---------- Prezență (v2): prezent / absent / recuperat, pe lecție ---------- */

const meetingId = (id: string) => uuid("meeting", id);
await must(
  "Întâlniri",
  db.from("attendance_meetings").upsert(
    demo.attendance.map((m) => ({
      id: meetingId(m.id),
      class_id: classId(m.classId),
      date: m.date,
      topic: m.topic,
      lesson_id: lessonId(`${m.classId}:${m.topic}`),
    })),
  ),
);
const recordRows: { meeting_id: string; student_id: string; status: string }[] =
  [];
const firstAbsence = new Set<string>();
for (const m of [...demo.attendance].sort((a, b) =>
  a.date.localeCompare(b.date),
)) {
  for (const [s, present] of Object.entries(m.records)) {
    let status = present ? "present" : "absent";
    // Prima absență a fiecărui elev a fost recuperată la altă grupă.
    if (!present && !firstAbsence.has(`${m.classId}:${s}`)) {
      firstAbsence.add(`${m.classId}:${s}`);
      status = "recovered";
    }
    recordRows.push({
      meeting_id: meetingId(m.id),
      student_id: user(s),
      status,
    });
  }
}
// Un elev cu 3 absențe la Python, ca să se vadă regula „mai mult de 2 absențe”.
const pythonMeetings = demo.attendance
  .filter((m) => m.classId === "python-incepatori")
  .sort((a, b) => a.date.localeCompare(b.date));
for (const m of pythonMeetings.slice(1, 4)) {
  const r = recordRows.find(
    (x) => x.meeting_id === meetingId(m.id) && x.student_id === user("u-elena"),
  );
  if (r) r.status = "absent";
}
await must("Prezențe", db.from("attendance_records").upsert(recordRows));
for (const r of recordRows) {
  if (r.status === "absent") continue;
  const m = demo.attendance.find((x) => meetingId(x.id) === r.meeting_id);
  if (!m) continue;
  xpRows.push({
    student_id: r.student_id,
    class_id: classId(m.classId),
    source: "attendance",
    amount: 2,
    label: `${r.status === "recovered" ? "Prezență recuperată" : "Prezență"}: ${m.topic}`,
    at: m.date,
    event_key: `attendance:${r.meeting_id}:${r.student_id}`,
  });
}

/* ---------- Quiz-uri (v2): legate de lecții, date mai multor clase ---------- */

type DemoQuizSetup = {
  classes: string[];
  lessons: string[];
  kind: "lesson" | "recap";
};
const QUIZ_SETUP: Record<string, DemoQuizSetup> = {
  "test-bucle": {
    classes: ["python-incepatori"],
    lessons: ["python-incepatori:Bucla while", "python-incepatori:Bucla for"],
    kind: "recap",
  },
  "recapitulare-live": {
    classes: ["python-incepatori"],
    lessons: [
      "python-incepatori:Condiții",
      "python-incepatori:Bucla while",
      "python-incepatori:Bucla for",
    ],
    kind: "recap",
  },
  "python-baza": {
    classes: ["python-incepatori", "poo-java"],
    lessons: ["python-incepatori:Variabile și tipuri"],
    kind: "lesson",
  },
  "ce-afiseaza": {
    classes: ["python-incepatori"],
    lessons: [
      "python-incepatori:Variabile și tipuri",
      "python-incepatori:Condiții",
    ],
    kind: "recap",
  },
  "html-baza": {
    classes: ["web-html-css"],
    lessons: [
      "web-html-css:Ce este HTML",
      "web-html-css:Titluri, paragrafe, liste",
    ],
    kind: "lesson",
  },
};
const quizId = (id: string) => uuid("quiz-v2", id);
const quizzes = demo.quizzes.filter((q) => QUIZ_SETUP[q.id]);
// Autorul unui quiz e mentorul primei clase căreia îi e dat (poate edita și atribui).
const quizAuthor = (id: string) => mentorOfClass(QUIZ_SETUP[id].classes[0]);
await must(
  "Quiz-uri",
  db.from("quizzes").upsert(
    quizzes.map((q) => ({
      id: quizId(q.id),
      author_id: quizAuthor(q.id),
      title: q.title,
      description: q.description,
      kind: QUIZ_SETUP[q.id].kind,
      time_limit_sec: q.timeLimitSec ?? null,
      xp: Math.min(5, q.assignment?.xp ?? 3),
    })),
  ),
);
await must(
  "Quiz-uri pe lecții",
  db.from("quiz_lessons").upsert(
    quizzes.flatMap((q) =>
      QUIZ_SETUP[q.id].lessons.map((l) => ({
        quiz_id: quizId(q.id),
        lesson_id: lessonId(l),
      })),
    ),
  ),
);
await must(
  "Quiz-uri în clase",
  db.from("quiz_assignments").upsert(
    quizzes.flatMap((q) =>
      QUIZ_SETUP[q.id].classes.map((c) => ({
        quiz_id: quizId(q.id),
        class_id: classId(c),
        assigned_at: q.assignment?.opensAt ?? "2026-10-10T10:00:00+03:00",
      })),
    ),
  ),
);
const questions = quizzes.flatMap((q) =>
  q.questions.map((x, i) => ({
    quiz: q,
    question: x,
    position: i + 1,
    lesson: QUIZ_SETUP[q.id].lessons[i % QUIZ_SETUP[q.id].lessons.length],
  })),
);
await must(
  "Întrebări",
  db.from("quiz_questions").upsert(
    questions.map(({ quiz, question, position, lesson }) => ({
      id: uuid("question-v2", `${quiz.id}:${question.id}`),
      quiz_id: quizId(quiz.id),
      lesson_id: lessonId(lesson),
      position,
      prompt: question.prompt,
      code: question.code ?? null,
      options: question.options,
    })),
  ),
);
await must(
  "Răspunsuri corecte",
  db.from("quiz_answer_keys").upsert(
    questions.map(({ quiz, question }) => ({
      question_id: uuid("question-v2", `${quiz.id}:${question.id}`),
      correct: question.correct,
      explanation: question.explanation ?? null,
    })),
  ),
);
// Încercările demo: primele „correct” întrebări bune, restul greșite.
const attemptsByKey = new Map<string, number>();
const quizAttempts = [...demo.quizAttempts]
  .filter((a) => QUIZ_SETUP[a.quizId])
  .sort((a, b) => a.at.localeCompare(b.at));
await must(
  "Încercări quiz",
  db.from("quiz_attempts").upsert(
    quizAttempts.map((a) => {
      const q = quizzes.find((x) => x.id === a.quizId);
      const qs = questions.filter((x) => x.quiz.id === a.quizId);
      const answers = qs.map((x, i) =>
        i < a.correct
          ? x.question.correct
          : (x.question.correct + 1) % x.question.options.length,
      );
      const key = `${a.quizId}:${a.studentId}`;
      const n = attemptsByKey.get(key) ?? 0;
      attemptsByKey.set(key, n + 1);
      const cls = QUIZ_SETUP[a.quizId].classes.find((c) =>
        demo.classes.find((x) => x.id === c)?.studentIds.includes(a.studentId),
      );
      if (n === 0 && q) {
        const amount = Math.round(
          Math.min(5, q.assignment?.xp ?? 3) * (a.correct / a.total),
        );
        if (amount > 0)
          xpRows.push({
            student_id: user(a.studentId),
            class_id: cls ? classId(cls) : null,
            source: cls ? "class_quiz" : "practice_quiz",
            amount,
            label: `Quiz: ${q.title}`,
            at: a.at,
            event_key: `quiz:${quizId(a.quizId)}:${user(a.studentId)}`,
          });
      } else if (n === 1 && q)
        xpRows.push({
          student_id: user(a.studentId),
          class_id: cls ? classId(cls) : null,
          source: cls ? "class_quiz" : "practice_quiz",
          amount: 1,
          label: `Quiz refăcut: ${q.title}`,
          at: a.at,
          event_key: `quiz-retake:${quizId(a.quizId)}:${user(a.studentId)}`,
        });
      return {
        id: uuid("quiz-attempt-v2", a.id),
        quiz_id: quizId(a.quizId),
        student_id: user(a.studentId),
        at: a.at,
        answers,
        results: qs.map((x, i) => ({
          question_id: uuid("question-v2", `${x.quiz.id}:${x.question.id}`),
          lesson_id: lessonId(x.lesson),
          correct: answers[i] === x.question.correct,
        })),
        correct: a.correct,
        total: a.total,
      };
    }),
  ),
);

// Sesiunile live: cele încheiate, cu rezultate; cea de recapitulare e deschisă (lobby).
const liveSessions = demo.liveSessions.filter((s) => QUIZ_SETUP[s.quizId]);
await must(
  "Sesiuni live",
  db.from("live_sessions").upsert(
    liveSessions.map((s) => ({
      id: uuid("live-v2", s.id),
      quiz_id: quizId(s.quizId),
      class_id: classId(s.classId),
      title: s.title,
      code: s.code,
      // Fără programare: o sesiune neîncepută stă deschisă, în așteptarea elevilor.
      status: s.status === "ended" ? "ended" : "lobby",
      created_by: mentorOfClass(s.classId),
      created_at: s.startsAt,
      ended_at: s.status === "ended" ? s.startsAt : null,
    })),
  ),
);
await must(
  "Rezultate live",
  db.from("live_results").upsert(
    liveSessions.flatMap((s) =>
      (s.results ?? []).map((r) => ({
        session_id: uuid("live-v2", s.id),
        student_id: user(r.studentId),
        score: r.score,
        rank: r.rank,
        xp: r.xp,
      })),
    ),
  ),
);
for (const s of liveSessions)
  for (const r of s.results ?? [])
    xpRows.push({
      student_id: user(r.studentId),
      class_id: classId(s.classId),
      source: "live_quiz",
      amount: r.xp,
      label: `Quiz live: ${s.title} (locul ${r.rank})`,
      at: s.startsAt,
      event_key: `live:${uuid("live-v2", s.id)}:${user(r.studentId)}`,
    });

/* ---------- XP ---------- */

await must(
  "XP",
  db.from("xp_transactions").upsert(xpRows, { onConflict: "event_key" }),
);

/* ---------- Notificări și aplicații ---------- */

// Linkurile din notificări folosesc id-urile demo ale problemelor; le traducem în tema
// atribuită clasei (elev) sau în tema propriu-zisă (mentor).
const homeworkOfProblem = (slug: string) =>
  HOMEWORKS.find((h) => h.problems.some((p) => p.slug === slug));
const href = (h: string) => {
  const [, first, second, third] = h.split("/");
  if (first === "teme" && second) {
    const hw = homeworkOfProblem(second);
    return hw?.classes[0]
      ? `/teme/${assignmentId(hw.key, hw.classes[0])}`
      : "/teme";
  }
  if (first === "mentor" && second === "teme" && third) {
    const hw = homeworkOfProblem(third);
    return hw ? `/mentor/teme/${homeworkId(hw.key)}` : "/mentor/teme";
  }
  if (first === "invatare" && second === "materiale" && third) {
    const key = MATERIAL_LESSON[third];
    return key ? `/clase/${classId(key.split(":")[0])}/lectii` : "/invatare";
  }
  return h;
};

await must(
  "Notificări",
  db.from("notifications").upsert(
    demo.notifications.map((n) => ({
      id: uuid("notification", n.id),
      user_id: user(n.userId),
      kind: n.kind,
      title: n.title,
      body: n.body,
      href: href(n.href),
      at: n.at,
      read: n.read,
    })),
  ),
);
await must(
  "Aplicații mentori",
  db.from("mentor_applications").upsert(
    demo.mentorApplications.map((a) => ({
      id: uuid("application", a.id),
      full_name: a.fullName,
      email: a.email,
      phone: a.phone,
      background: a.background,
      intended_use: a.intendedUse,
      evidence: a.evidence,
      status: a.status,
      submitted_at: a.submittedAt,
      review_note: a.reviewNote ?? null,
    })),
  ),
);

console.log(
  `Gata: ${demo.users.length} conturi, ${demo.classes.length} clase, ${demoLessons.length + 1} lecții, ` +
    `${items.length} materiale, ${HOMEWORKS.length} teme, ${quizzes.length} quiz-uri, ${xpRows.length} tranzacții XP.`,
);
console.log("Parola conturilor demo e în .env.local (DEMO_PASSWORD).");
