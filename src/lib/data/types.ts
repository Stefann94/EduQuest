// Modelul de date al platformei (vezi docs/PROJECT.md).
// Tipurile urmăresc schema viitoare din Supabase; deocamdată sunt populate cu date demo.

import type { ContentBlock } from "../content/schema";

export type Role = "student" | "mentor" | "admin";

export type AccountStatus = "active" | "suspended" | "deactivated";

export type AvatarId =
  | "fox"
  | "panda"
  | "owl"
  | "cat"
  | "robot"
  | "rocket"
  | "octopus"
  | "penguin";

export type User = {
  id: string;
  displayName: string;
  /** Doar elevii au username; mentorii se autentifică cu emailul. */
  username?: string;
  email: string;
  role: Role;
  avatar: AvatarId;
  status: AccountStatus;
  createdAt: string;
};

export type ClassStatus = "active" | "archived";

export type ClassRoom = {
  id: string;
  name: string;
  description: string;
  mentorId: string;
  status: ClassStatus;
  /** Ziua și ora întâlnirilor, ca text pentru afișare. */
  schedule: string;
  inviteCode: string;
  inviteCodeActive: boolean;
  studentIds: string[];
  createdAt: string;
};

export type MaterialKind = "article" | "pdf" | "link" | "video";

export type PublicationStatus = "published" | "draft";

/** Conținut formatat, scris direct în platformă: paragrafe, titluri, cod. */
// Blocurile de conținut (titluri, cod, tabele, exerciții…) sunt definite cu validare în
// lib/content/schema.ts, ca autorul să nu poată salva un bloc greșit.
export type { ContentBlock } from "../content/schema";

export type Material = {
  id: string;
  /** null = resursă globală, disponibilă tuturor elevilor. */
  classId: string | null;
  title: string;
  description: string;
  topic: string;
  kind: MaterialKind;
  tags: string[];
  status: PublicationStatus;
  authorId: string;
  publishedAt: string;
  blocks?: ContentBlock[];
  url?: string;
  /** Pentru PDF: numele fișierului și mărimea, pentru afișare. */
  file?: { name: string; sizeKb: number };
};

export type Difficulty = 1 | 2 | 3;

export type WorkedProblem = {
  id: string;
  classId: string | null;
  title: string;
  topic: string;
  difficulty: Difficulty;
  statement: string;
  constraints: string[];
  examples: { input: string; output: string; note?: string }[];
  solution: { language: string; code: string };
  explanation: string[];
  status: PublicationStatus;
  authorId: string;
  publishedAt: string;
};

export type AssignmentType = "required" | "optional";

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  summary: string;
  instructions: string[];
  type: AssignmentType;
  /** ISO; lipsă = fără termen. */
  deadline?: string;
  maxBonusXp: number;
  attachments: { label: string; url: string }[];
  allowResubmit: boolean;
  status: PublicationStatus;
  publishedAt: string;
};

export type SubmissionStatus =
  | "not_started"
  | "submitted"
  | "reviewed"
  | "needs_changes";

export type SubmissionAttempt = {
  at: string;
  text?: string;
  files: { name: string; sizeKb: number }[];
  link?: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  status: Exclude<SubmissionStatus, "not_started">;
  attempts: SubmissionAttempt[];
  feedback?: { text: string; at: string };
  /** +2 pentru o trimitere validă, acordat o singură dată. */
  submissionXp: number;
  /** 0–maxBonusXp, acordat de mentor. */
  bonusXp?: number;
};

export type AttendanceMeeting = {
  id: string;
  classId: string;
  date: string;
  topic: string;
  /** studentId -> prezent */
  records: Record<string, boolean>;
};

export type XpSource =
  | "attendance"
  | "submission"
  | "quality_bonus"
  | "live_quiz"
  | "practice_quiz"
  | "class_quiz"
  | "adjustment";

export type XpTransaction = {
  id: string;
  studentId: string;
  classId: string | null;
  source: XpSource;
  amount: number;
  label: string;
  at: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  correct: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: Difficulty;
  /** null = quiz de exersare global. */
  classId: string | null;
  questions: QuizQuestion[];
  timeLimitSec?: number;
  /** Doar pentru quiz-urile date unei clase. */
  assignment?: {
    opensAt: string;
    deadline: string;
    maxAttempts: number;
    xp: number;
  };
  authorId: string;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  studentId: string;
  at: string;
  correct: number;
  total: number;
};

export type LiveSessionStatus = "scheduled" | "lobby" | "running" | "ended";

export type LiveSession = {
  id: string;
  quizId: string;
  classId: string;
  title: string;
  code: string;
  status: LiveSessionStatus;
  startsAt: string;
  /** Pentru sesiunile încheiate: clasamentul final. */
  results?: { studentId: string; score: number; rank: number; xp: number }[];
};

export type NotificationKind =
  | "assignment_new"
  | "deadline"
  | "feedback"
  | "needs_changes"
  | "material_new"
  | "live_quiz"
  | "submission_new"
  | "resubmission"
  | "application";

export type Notification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  at: string;
  read: boolean;
};

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_info";

export type MentorApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  background: string;
  intendedUse: string;
  evidence: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewNote?: string;
};
