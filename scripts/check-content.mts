// Rulează fiecare exemplu Python dintr-un curs și compară ce afișează cu „output”-ul
// scris în lecție. Codul fără output e doar compilat (verificăm sintaxa).
// Verifică și quiz-urile: cel puțin 9 întrebări și 2 exerciții pe lecție, variante
// diferite între ele, iar la întrebările „ce afișează” varianta corectă e exact ieșirea.
// La fel pentru quiz-urile de exersare (content/python-practice.ts): 15 quiz-uri, 5–10 întrebări.
// Rulare: pnpm content:check   (are nevoie de Python instalat: comanda „py” sau „python3”)

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { course } from "../content/python-modulul-1";
import { practiceQuizzes } from "../content/python-practice";
import { type QuizQuestionSource, quizzes } from "../content/python-quizzes";
import { courseSchema } from "../src/lib/content/schema";

const parsed = courseSchema.parse(course);
const found = ["py", "python3", "python"].find(
  (cmd) => spawnSync(cmd, ["--version"]).status === 0,
);
if (!found) {
  console.error("Nu am găsit Python (py / python3).");
  process.exit(1);
}
const python: string = found;

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
const fail = (msg: string) => {
  failed++;
  console.log(`✗ ${msg}`);
};
type Sample = { label: string; code: string; output: string | undefined };

/** Fără output: doar compilează codul. Cu output: îl rulează în `dir` și compară ce afișează. */
function runSample(where: string, s: Sample, dir: string) {
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
      console.log(`✗ ${where} · ${s.label}: sintaxă\n${res.stderr}`);
    }
    return;
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
      `✗ ${where} · ${s.label}\n  așteptat: ${JSON.stringify(s.output)}\n  primit:   ${JSON.stringify(got)}${res.stderr ? `\n  eroare: ${res.stderr.trim().split("\n").at(-1)}` : ""}`,
    );
  }
}

/** Exemplele din codul întrebărilor: cu `check`, varianta corectă e ieșirea așteptată. */
const quizSamples = (questions: QuizQuestionSource[], label: string) =>
  questions.flatMap((q, i): Sample[] =>
    q.code
      ? [
          {
            label: `${label}, întrebarea ${i + 1}`,
            code: q.code,
            output: q.check ? q.options[q.correct] : undefined,
          },
        ]
      : [],
  );

/** Variantele unei întrebări: 2–4, diferite între ele, iar răspunsul corect există. */
function checkQuestions(where: string, questions: QuizQuestionSource[]) {
  for (const [i, q] of questions.entries()) {
    checked++;
    if (q.options.length < 2 || q.options.length > 4)
      fail(`${where} · întrebarea ${i + 1}: 2–4 variante`);
    if (new Set(q.options).size !== q.options.length)
      fail(`${where} · întrebarea ${i + 1}: variante repetate`);
    if (q.correct < 0 || q.correct >= q.options.length)
      fail(`${where} · întrebarea ${i + 1}: răspuns corect inexistent`);
  }
}

for (const lesson of parsed.lessons) {
  const dir = mkdtempSync(join(tmpdir(), "eduquest-py-"));
  const quiz = quizzes[lesson.slug] ?? [];
  if (quiz.length < 9)
    fail(`${lesson.slug}: quiz-ul are ${quiz.length} întrebări (minim 9)`);
  const exercises = lesson.blocks.filter((b) => b.type === "exercise").length;
  if (exercises < 2)
    fail(
      `${lesson.slug}: are ${exercises} exerciții (minim 2, devin problemele lecției)`,
    );
  checkQuestions(lesson.slug, quiz);
  const samples: Sample[] = [
    ...lesson.blocks.flatMap((b): Sample[] => {
      if (b.type === "code" && b.language === "python")
        return [
          { label: b.title ?? "exemplu", code: b.code, output: b.output },
        ];
      if (b.type === "exercise" && b.solution.language === "python")
        return [{ label: b.title, code: b.solution.code, output: b.output }];
      return [];
    }),
    ...quizSamples(quiz, "quiz"),
  ];
  for (const s of samples) runSample(lesson.slug, s, dir);
  rmSync(dir, { recursive: true, force: true });
}

// Quiz-urile de exersare: 15 quiz-uri, 5–10 întrebări fiecare, slug-uri unice.
const PRACTICE_COUNT = 15;
if (practiceQuizzes.length !== PRACTICE_COUNT)
  fail(
    `exersare: sunt ${practiceQuizzes.length} quiz-uri (trebuie ${PRACTICE_COUNT})`,
  );
const practiceSlugs = practiceQuizzes.map((p) => p.slug);
for (const slug of new Set(practiceSlugs))
  if (practiceSlugs.filter((x) => x === slug).length > 1)
    fail(`exersare: slug-ul „${slug}” apare de mai multe ori`);
for (const p of practiceQuizzes) {
  const where = `exersare/${p.slug}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug))
    fail(`${where}: slug-ul trebuie scris cu litere mici și cratime`);
  if (p.questions.length < 5 || p.questions.length > 10)
    fail(`${where}: are ${p.questions.length} întrebări (între 5 și 10)`);
  checkQuestions(where, p.questions);
  const dir = mkdtempSync(join(tmpdir(), "eduquest-py-"));
  for (const s of quizSamples(p.questions, "exersare"))
    runSample(where, s, dir);
  rmSync(dir, { recursive: true, force: true });
}

console.log(
  failed === 0
    ? `Toate cele ${checked} exemple și întrebări din „${parsed.title}” și din cele ${practiceQuizzes.length} quiz-uri de exersare sunt corecte.`
    : `${failed} din ${checked} exemple nu se potrivesc.`,
);
process.exit(failed === 0 ? 0 : 1);
