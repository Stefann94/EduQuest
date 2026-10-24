// Încarcă datele demo (src/lib/data/demo.ts) în Supabase, pentru teste.
// Rulare: pnpm db:seed   (se poate rula de mai multe ori; actualizează ce există)
//
// Conturile demo primesc o parolă aleatorie, salvată doar în .env.local (DEMO_PASSWORD),
// ca nimeni să nu poată intra pe baza reală cu o parolă cunoscută.

import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
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

/* ---------- Materiale și probleme ---------- */

const optClass = (id: string | null) => (id ? classId(id) : null);
await must(
  "Materiale",
  db.from("materials").upsert(
    demo.materials.map((m) => ({
      id: uuid("material", m.id),
      class_id: optClass(m.classId),
      title: m.title,
      description: m.description,
      topic: m.topic,
      kind: m.kind,
      tags: m.tags,
      status: m.status,
      author_id: user(m.authorId),
      published_at: m.publishedAt,
      blocks: m.blocks ?? null,
      url: m.url ?? null,
      file: m.file ?? null,
    })),
  ),
);
await must(
  "Probleme rezolvate",
  db.from("worked_problems").upsert(
    demo.workedProblems.map((p) => ({
      id: uuid("problem", p.id),
      class_id: optClass(p.classId),
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      statement: p.statement,
      constraints: p.constraints,
      examples: p.examples,
      solution: p.solution,
      explanation: p.explanation,
      status: p.status,
      author_id: user(p.authorId),
      published_at: p.publishedAt,
    })),
  ),
);

/* ---------- Teme și trimiteri ---------- */

const assignmentId = (id: string) => uuid("assignment", id);
await must(
  "Teme",
  db.from("assignments").upsert(
    demo.assignments.map((a) => ({
      id: assignmentId(a.id),
      class_id: classId(a.classId),
      title: a.title,
      summary: a.summary,
      instructions: a.instructions,
      type: a.type,
      deadline: a.deadline ?? null,
      max_bonus_xp: a.maxBonusXp,
      attachments: a.attachments,
      allow_resubmit: a.allowResubmit,
      status: a.status,
      published_at: a.publishedAt,
    })),
  ),
);

const submissionId = (id: string) => uuid("submission", id);
await must(
  "Trimiteri",
  db.from("submissions").upsert(
    demo.submissions.map((s) => ({
      id: submissionId(s.id),
      assignment_id: assignmentId(s.assignmentId),
      student_id: user(s.studentId),
      status: s.status,
      feedback_text: s.feedback?.text ?? null,
      feedback_at: s.feedback?.at ?? null,
      submission_xp: s.submissionXp,
      bonus_xp: s.bonusXp ?? null,
    })),
  ),
);
await must(
  "Încercări",
  db.from("submission_attempts").upsert(
    demo.submissions.flatMap((s) =>
      s.attempts.map((a, i) => ({
        id: uuid("attempt", `${s.id}:${i}`),
        submission_id: submissionId(s.id),
        at: a.at,
        text: a.text ?? null,
        files: a.files,
        link: a.link ?? null,
      })),
    ),
  ),
);

/* ---------- Prezență ---------- */

const meetingId = (id: string) => uuid("meeting", id);
await must(
  "Întâlniri",
  db.from("attendance_meetings").upsert(
    demo.attendance.map((m) => ({
      id: meetingId(m.id),
      class_id: classId(m.classId),
      date: m.date,
      topic: m.topic,
    })),
  ),
);
await must(
  "Prezențe",
  db.from("attendance_records").upsert(
    demo.attendance.flatMap((m) =>
      Object.entries(m.records).map(([s, present]) => ({
        meeting_id: meetingId(m.id),
        student_id: user(s),
        present,
      })),
    ),
  ),
);

/* ---------- Quiz-uri ---------- */

const quizId = (id: string) => uuid("quiz", id);
await must(
  "Quiz-uri",
  db.from("quizzes").upsert(
    demo.quizzes.map((q) => ({
      id: quizId(q.id),
      title: q.title,
      description: q.description,
      topic: q.topic,
      difficulty: q.difficulty,
      class_id: optClass(q.classId),
      time_limit_sec: q.timeLimitSec ?? null,
      opens_at: q.assignment?.opensAt ?? null,
      deadline: q.assignment?.deadline ?? null,
      max_attempts: q.assignment?.maxAttempts ?? null,
      xp: q.assignment?.xp ?? null,
      author_id: user(q.authorId),
    })),
  ),
);
const questions = demo.quizzes.flatMap((q) =>
  q.questions.map((x, i) => ({ quiz: q, question: x, position: i + 1 })),
);
await must(
  "Întrebări",
  db.from("quiz_questions").upsert(
    questions.map(({ quiz, question, position }) => ({
      id: uuid("question", `${quiz.id}:${question.id}`),
      quiz_id: quizId(quiz.id),
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
      question_id: uuid("question", `${quiz.id}:${question.id}`),
      correct: question.correct,
      explanation: question.explanation ?? null,
    })),
  ),
);
await must(
  "Încercări quiz",
  db.from("quiz_attempts").upsert(
    demo.quizAttempts.map((a) => ({
      id: uuid("quiz-attempt", a.id),
      quiz_id: quizId(a.quizId),
      student_id: user(a.studentId),
      at: a.at,
      correct: a.correct,
      total: a.total,
    })),
  ),
);

const mentorOf = (cid: string) =>
  user(demo.classes.find((c) => c.id === cid)?.mentorId ?? "");
await must(
  "Sesiuni live",
  db.from("live_sessions").upsert(
    demo.liveSessions.map((s) => ({
      id: uuid("live", s.id),
      quiz_id: quizId(s.quizId),
      class_id: classId(s.classId),
      title: s.title,
      code: s.code,
      status: s.status,
      starts_at: s.startsAt,
      created_by: mentorOf(s.classId),
    })),
  ),
);
await must(
  "Rezultate live",
  db.from("live_results").upsert(
    demo.liveSessions.flatMap((s) =>
      (s.results ?? []).map((r) => ({
        session_id: uuid("live", s.id),
        student_id: user(r.studentId),
        score: r.score,
        rank: r.rank,
        xp: r.xp,
      })),
    ),
  ),
);

/* ---------- XP, cu aceleași chei de eveniment ca funcțiile din baza de date ---------- */

const xpRows = [
  ...demo.attendance.flatMap((m) =>
    Object.entries(m.records)
      .filter(([, present]) => present)
      .map(([s]) => ({
        student_id: user(s),
        class_id: classId(m.classId),
        source: "attendance",
        amount: 2,
        label: `Prezență: ${m.topic}`,
        at: m.date,
        event_key: `attendance:${meetingId(m.id)}:${user(s)}`,
      })),
  ),
  ...demo.submissions.flatMap((s) => {
    const a = demo.assignments.find((x) => x.id === s.assignmentId);
    if (!a) return [];
    const rows = [
      {
        student_id: user(s.studentId),
        class_id: classId(a.classId),
        source: "submission",
        amount: s.submissionXp,
        label: `Temă trimisă: ${a.title}`,
        at: s.attempts[0].at,
        event_key: `submission:${submissionId(s.id)}`,
      },
    ];
    if (s.bonusXp && s.feedback)
      rows.push({
        student_id: user(s.studentId),
        class_id: classId(a.classId),
        source: "quality_bonus",
        amount: s.bonusXp,
        label: `Bonus de calitate: ${a.title}`,
        at: s.feedback.at,
        event_key: `bonus:${submissionId(s.id)}`,
      });
    return rows;
  }),
  ...demo.liveSessions.flatMap((s) =>
    (s.results ?? []).map((r) => ({
      student_id: user(r.studentId),
      class_id: classId(s.classId),
      source: "live_quiz",
      amount: r.xp,
      label: `Quiz live: ${s.title} (locul ${r.rank})`,
      at: s.startsAt,
      event_key: `live:${uuid("live", s.id)}:${user(r.studentId)}`,
    })),
  ),
];
await must(
  "XP",
  db.from("xp_transactions").upsert(xpRows, { onConflict: "event_key" }),
);

/* ---------- Notificări și aplicații ---------- */

// Linkurile din notificări folosesc id-urile demo; le traducem în uuid-uri.
const slugs = new Map<string, string>([
  ...demo.assignments.map((a) => [a.id, assignmentId(a.id)] as const),
  ...demo.materials.map((m) => [m.id, uuid("material", m.id)] as const),
  ...demo.classes.map((c) => [c.id, classId(c.id)] as const),
  ...demo.quizzes.map((q) => [q.id, quizId(q.id)] as const),
]);
const href = (h: string) =>
  h
    .split("/")
    .map((part) => slugs.get(part) ?? part)
    .join("/");

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
  `Gata: ${demo.users.length} conturi, ${demo.classes.length} clase, ${demo.assignments.length} teme, ` +
    `${demo.quizzes.length} quiz-uri, ${xpRows.length} tranzacții XP.`,
);
console.log("Parola conturilor demo e în .env.local (DEMO_PASSWORD).");
