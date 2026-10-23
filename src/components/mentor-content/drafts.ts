// Valorile inițiale ale formularelor de editare, calculate din datele salvate.
// Modul fără "use client": îl folosesc și paginile (pe server), și formularele.

import type {
  Material,
  MaterialKind,
  PublicationStatus,
  Quiz,
  WorkedProblem,
} from "@/lib/data/types";
import { GLOBAL } from "./form-state";

export type MaterialDraft = {
  id?: string;
  title: string;
  description: string;
  topic: string;
  classId: string;
  kind: MaterialKind;
  content: string;
  code: string;
  codeLanguage: string;
  url: string;
  file?: { name: string; sizeKb: number };
  tags: string;
  status: PublicationStatus;
};

export function materialDraft(m?: Material): MaterialDraft {
  if (!m)
    return {
      title: "",
      description: "",
      topic: "",
      classId: "",
      kind: "article",
      content: "",
      code: "",
      codeLanguage: "python",
      url: "",
      tags: "",
      status: "draft",
    };
  const blocks = m.blocks ?? [];
  const firstCode = blocks.find((b) => b.type === "code");
  const content = blocks
    .map((b) => {
      if (b.type === "paragraph" || b.type === "heading" || b.type === "note")
        return b.text;
      if (b.type === "list") return b.items.map((i) => `- ${i}`).join("\n");
      return null;
    })
    .filter((x): x is string => x !== null)
    .join("\n\n");
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    topic: m.topic,
    classId: m.classId ?? GLOBAL,
    kind: m.kind,
    content,
    code: firstCode?.type === "code" ? firstCode.code : "",
    codeLanguage: firstCode?.type === "code" ? firstCode.language : "python",
    url: m.url ?? "",
    file: m.file,
    tags: m.tags.join(", "),
    status: m.status,
  };
}

export type ProblemDraft = {
  id?: string;
  title: string;
  topic: string;
  difficulty: "1" | "2" | "3";
  classId: string;
  statement: string;
  constraints: string;
  examples: { input: string; output: string; note: string }[];
  solutionCode: string;
  solutionLanguage: string;
  explanation: string[];
  status: PublicationStatus;
};

export function problemDraft(p?: WorkedProblem): ProblemDraft {
  if (!p)
    return {
      title: "",
      topic: "",
      difficulty: "1",
      classId: "",
      statement: "",
      constraints: "",
      examples: [{ input: "", output: "", note: "" }],
      solutionCode: "",
      solutionLanguage: "python",
      explanation: [""],
      status: "draft",
    };
  return {
    id: p.id,
    title: p.title,
    topic: p.topic,
    difficulty: String(p.difficulty) as ProblemDraft["difficulty"],
    classId: p.classId ?? GLOBAL,
    statement: p.statement,
    constraints: p.constraints.join("\n"),
    examples: p.examples.map((e) => ({
      input: e.input,
      output: e.output,
      note: e.note ?? "",
    })),
    solutionCode: p.solution.code,
    solutionLanguage: p.solution.language,
    explanation: p.explanation,
    status: p.status,
  };
}

export type QuestionDraft = {
  key: string;
  prompt: string;
  code: string;
  options: string[];
  correct: number | null;
  explanation: string;
};

export type QuizDraft = {
  id?: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "1" | "2" | "3";
  scope: "global" | "class";
  classId: string;
  opensAt: string;
  deadline: string;
  maxAttempts: string;
  xp: string;
  timeLimit: string;
  timeUnit: "sec" | "min";
  questions: QuestionDraft[];
};

/** ISO → valoare pentru <input type="datetime-local">, pe ora României. */
export function toLocalInput(iso?: string) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
  return parts.replace(" ", "T");
}

export function quizDraft(q?: Quiz): QuizDraft {
  if (!q)
    return {
      title: "",
      description: "",
      topic: "",
      difficulty: "1",
      scope: "global",
      classId: "",
      opensAt: "",
      deadline: "",
      maxAttempts: "2",
      xp: "3",
      timeLimit: "",
      timeUnit: "min",
      questions: [
        {
          key: "q-new-1",
          prompt: "",
          code: "",
          options: ["", ""],
          correct: null,
          explanation: "",
        },
      ],
    };
  const sec = q.timeLimitSec;
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    topic: q.topic,
    difficulty: String(q.difficulty) as QuizDraft["difficulty"],
    scope: q.classId ? "class" : "global",
    classId: q.classId ?? "",
    opensAt: toLocalInput(q.assignment?.opensAt),
    deadline: toLocalInput(q.assignment?.deadline),
    maxAttempts: String(q.assignment?.maxAttempts ?? 2),
    xp: String(q.assignment?.xp ?? 3),
    timeLimit: sec ? String(sec % 60 === 0 ? sec / 60 : sec) : "",
    timeUnit: sec && sec % 60 !== 0 ? "sec" : "min",
    questions: q.questions.map((x) => ({
      key: x.id,
      prompt: x.prompt,
      code: x.code ?? "",
      options: [...x.options],
      correct: x.correct,
      explanation: x.explanation ?? "",
    })),
  };
}

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function localToUtcGuess(value: string) {
  const m = LOCAL_RE.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  return Date.UTC(y, mo - 1, d, h, mi);
}

/**
 * Valoare din <input type="datetime-local"> (ora României) → ISO.
 * `null` dacă valoarea nu e o dată validă.
 */
export function fromLocalInput(value: string): string | null {
  const guess = localToUtcGuess(value);
  if (guess === null || Number.isNaN(guess)) return null;
  // Diferența dintre ora României și UTC în acel moment (ține cont de ora de vară).
  const offset = (t: number) =>
    (localToUtcGuess(toLocalInput(new Date(t).toISOString())) ?? t) - t;
  let t = guess - offset(guess);
  t = guess - offset(t);
  return new Date(t).toISOString();
}
