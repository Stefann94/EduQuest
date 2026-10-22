// Date demonstrative pentru design. Vor fi înlocuite cu date din Supabase.

export const demoStudent = {
  name: "Andrei Popescu",
  firstName: "Andrei",
  initials: "AP",
  group: "Python Începători",
  level: 7,
  xp: 1240,
  xpNextLevel: 1500,
  streakDays: 5,
  rank: 3,
};

export type HomeworkStatus = "de-facut" | "predata" | "corectata";

export const demoHomework: {
  id: string;
  title: string;
  topic: string;
  due: string;
  status: HomeworkStatus;
  grade?: number;
}[] = [
  {
    id: "t1",
    title: "Bucle for: desenează o piramidă",
    topic: "Python · Bucle",
    due: "Vineri, 24 oct",
    status: "de-facut",
  },
  {
    id: "t2",
    title: "Calculator de vârstă",
    topic: "Python · Variabile",
    due: "Marți, 21 oct",
    status: "predata",
  },
  {
    id: "t3",
    title: "Mini-joc: ghicește numărul",
    topic: "Python · Condiții",
    due: "Vineri, 17 oct",
    status: "corectata",
    grade: 9.5,
  },
];

export const demoGames = [
  {
    id: "output",
    title: "Ghicește output-ul",
    description: "Citește codul și spune ce afișează.",
    minutes: 3,
    color: "bg-quiz-blue",
  },
  {
    id: "bug",
    title: "Vânătoare de bug-uri",
    description: "Găsește greșeala din cod cât mai repede.",
    minutes: 5,
    color: "bg-quiz-red",
  },
  {
    id: "ordine",
    title: "Pune codul în ordine",
    description: "Aranjează liniile ca programul să meargă.",
    minutes: 4,
    color: "bg-quiz-green",
  },
  {
    id: "tastare",
    title: "Tastare rapidă",
    description: "Scrie cod corect, contra cronometru.",
    minutes: 2,
    color: "bg-quiz-yellow",
  },
];

export const demoBadges = [
  { id: "b1", title: "Prima buclă", earned: true },
  { id: "b2", title: "5 zile la rând", earned: true },
  { id: "b3", title: "Vânător de bug-uri", earned: true },
  { id: "b4", title: "Quiz perfect", earned: false },
  { id: "b5", title: "10 teme predate", earned: false },
];

export const demoLeaderboard = [
  { name: "Maria", initials: "MI", xp: 1580 },
  { name: "Luca", initials: "LD", xp: 1395 },
  { name: "Andrei", initials: "AP", xp: 1240, isMe: true },
  { name: "Sofia", initials: "SR", xp: 1105 },
  { name: "David", initials: "DM", xp: 990 },
];

export const demoMentor = {
  name: "Mentor Demo",
  initials: "MD",
};

export const demoGroups = [
  {
    id: "g1",
    name: "Python Începători",
    schedule: "Sâmbătă, 10:00",
    students: 8,
    progress: 62,
  },
  {
    id: "g2",
    name: "Scratch Junior",
    schedule: "Sâmbătă, 12:00",
    students: 6,
    progress: 45,
  },
  {
    id: "g3",
    name: "JavaScript Avansați",
    schedule: "Duminică, 11:00",
    students: 5,
    progress: 78,
  },
];

export const demoQuizzes = [
  { id: "q1", title: "Bucle și condiții", questions: 12, plays: 4 },
  { id: "q2", title: "Variabile și tipuri", questions: 10, plays: 7 },
  { id: "q3", title: "Funcții: primii pași", questions: 8, plays: 2 },
];

export const demoToGrade = [
  {
    id: "s1",
    student: "Maria Ionescu",
    initials: "MI",
    homework: "Calculator de vârstă",
    submitted: "acum 2 ore",
  },
  {
    id: "s2",
    student: "Luca Dima",
    initials: "LD",
    homework: "Calculator de vârstă",
    submitted: "acum 5 ore",
  },
  {
    id: "s3",
    student: "Sofia Radu",
    initials: "SR",
    homework: "Desenează cu turtle",
    submitted: "ieri",
  },
];

export const demoLobbyPlayers = [
  "Maria",
  "Luca",
  "Andrei",
  "Sofia",
  "David",
  "Ioana",
  "Matei",
];

export type LiveQuestion = {
  prompt: string;
  code?: string;
  answers: [string, string, string, string];
  correct: number;
  seconds: number;
};

export const demoLiveQuiz: LiveQuestion[] = [
  {
    prompt: "Ce afișează programul?",
    code: "print(2 + 3 * 2)",
    answers: ["10", "8", "12", "2 + 3 * 2"],
    correct: 1,
    seconds: 20,
  },
  {
    prompt: "Care dintre acestea pornește o buclă în Python?",
    answers: ["if", "def", "for", "import"],
    correct: 2,
    seconds: 15,
  },
  {
    prompt: "Ce valoare are x la final?",
    code: "x = 5\nx += 3",
    answers: ["5", "3", "53", "8"],
    correct: 3,
    seconds: 20,
  },
  {
    prompt: 'Ce tip de date are valoarea "42"?',
    answers: ["str (text)", "int (număr)", "float", "bool"],
    correct: 0,
    seconds: 15,
  },
];
