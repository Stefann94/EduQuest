import "server-only";
import type { NotificationKind } from "@/lib/data/types";
import { emailHtml, mailAllowed, mailConfigured, sendMail } from "@/lib/mail";
import { trustedOrigin } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Notifică elevii unor clase (temă nouă, lecție nouă, quiz live). Elevii nu pot scrie
 * notificări pentru alții, deci scrierea se face cu cheia de server.
 * Se apelează DOAR din acțiuni care au verificat deja că mentorul predă în acele clase.
 */
export async function notifyClassStudents(
  classIds: string[],
  note: { kind: NotificationKind; title: string; body?: string; href: string },
) {
  const admin = supabaseAdmin();
  if (!admin || classIds.length === 0) return;
  const { data: members } = await admin
    .from("class_members")
    .select("student_id, class_id")
    .in("class_id", classIds);
  const students = [...new Set((members ?? []).map((m) => m.student_id))];
  if (students.length === 0) return;
  await admin.from("notifications").insert(
    students.map((user_id) => ({
      user_id,
      kind: note.kind,
      title: note.title,
      body: note.body ?? "",
      href: note.href,
    })),
  );
}

/**
 * Emailul către mentorul clasei când un elev trimite (sau retrimite) o rezolvare la temă.
 * Respectă preferințele mentorului („Trimiteri noi” / „Retrimiteri” din Setări). Cel mult un
 * email la 10 minute pentru același elev și aceeași temă, ca o temă cu mai multe probleme
 * să nu aducă un email pentru fiecare. Fără server de email (SMTP) nu face nimic.
 */
export async function emailMentorAboutSubmission(input: {
  assignmentId: string;
  problemId: string;
  studentId: string;
  resubmission: boolean;
}) {
  const admin = supabaseAdmin();
  if (!admin || !mailConfigured()) return;
  if (!mailAllowed(`hw:${input.assignmentId}:${input.studentId}`, 10 * 60_000))
    return;
  const [{ data: a }, { data: student }, { data: problem }] = await Promise.all(
    [
      admin
        .from("homework_assignments")
        .select(
          "class_id, homework:homeworks!homework_assignments_homework_id_fkey(id, title), class:classes!homework_assignments_class_id_fkey(name, mentor_id)",
        )
        .eq("id", input.assignmentId)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("display_name")
        .eq("id", input.studentId)
        .maybeSingle(),
      admin
        .from("homework_problems")
        .select("title")
        .eq("id", input.problemId)
        .maybeSingle(),
    ],
  );
  if (!a?.class || !a.homework || !student) return;
  const [{ data: mentor }, { data: account }] = await Promise.all([
    admin
      .from("profiles")
      .select("display_name, notification_prefs")
      .eq("id", a.class.mentor_id)
      .maybeSingle(),
    admin.auth.admin.getUserById(a.class.mentor_id),
  ]);
  const email = account?.user?.email;
  if (!mentor || !email) return;
  const prefs = (mentor.notification_prefs ?? {}) as Record<string, unknown>;
  if (prefs[input.resubmission ? "resubmissions" : "submissions"] === false)
    return;

  const link = `${await trustedOrigin()}/mentor/teme/${a.homework.id}?clasa=${a.class_id}`;
  const what = input.resubmission ? "o rezolvare retrimisă" : "o temă nouă";
  const details: [string, string][] = [
    ["Elev", student.display_name],
    ["Clasă", a.class.name],
    ["Temă", a.homework.title],
    ...(problem ? ([["Problemă", problem.title]] as [string, string][]) : []),
  ];
  await sendMail(
    email,
    input.resubmission
      ? "EduQuest – Rezolvare retrimisă de verificat"
      : "EduQuest – Temă nouă de verificat",
    [
      `Bună, ${mentor.display_name}!`,
      "",
      `Ai ${what} de verificat!`,
      "",
      ...details.map(([k, v]) => `${k}: ${v}`),
      "",
      "Un elev a trimis o rezolvare care așteaptă evaluarea ta.",
      `Intră în EduQuest ca să o verifici: ${link}`,
      "",
      "Echipa EduQuest",
    ].join("\n"),
    emailHtml({
      title: `Ai ${what} de verificat`,
      paragraphs: [
        `Bună, ${mentor.display_name}!`,
        "Un elev a trimis o rezolvare care așteaptă evaluarea ta.",
      ],
      details,
      button: { label: "Verifică tema", href: link },
      note: "Poți opri aceste emailuri din Setări cont → Notificări („Trimiteri noi” și „Retrimiteri”).",
    }),
  );
}
