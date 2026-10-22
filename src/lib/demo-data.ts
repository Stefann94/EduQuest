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
    emoji: "🔮",
    tile: "bg-fun-blue/15",
  },
  {
    id: "bug",
    title: "Vânătoare de bug-uri",
    description: "Găsește greșeala din cod cât mai repede.",
    minutes: 5,
    emoji: "🐛",
    tile: "bg-fun-pink/15",
  },
  {
    id: "ordine",
    title: "Pune codul în ordine",
    description: "Aranjează liniile ca programul să meargă.",
    minutes: 4,
    emoji: "🧩",
    tile: "bg-fun-green/15",
  },
  {
    id: "tastare",
    title: "Tastare rapidă",
    description: "Scrie cod corect, contra cronometru.",
    minutes: 2,
    emoji: "⌨️",
    tile: "bg-fun-yellow/25",
  },
];

export const demoBadges = [
  { id: "b1", title: "Prima buclă", emoji: "🔁", earned: true },
  { id: "b2", title: "5 zile la rând", emoji: "🔥", earned: true },
  { id: "b3", title: "Vânător de bug-uri", emoji: "🐞", earned: true },
  { id: "b4", title: "Quiz perfect", emoji: "💯", earned: false },
  { id: "b5", title: "10 teme predate", emoji: "📦", earned: false },
];

export const demoLeaderboard = [
  { name: "Maria", avatar: "🐼", xp: 1580 },
  { name: "Luca", avatar: "🦖", xp: 1395 },
  { name: "Andrei", avatar: "🦊", xp: 1240, isMe: true },
  { name: "Sofia", avatar: "🦄", xp: 1105 },
  { name: "David", avatar: "🐙", xp: 990 },
];

export const demoMentor = {
  name: "Mentor Demo",
  initials: "MD",
};

export const demoGroups = [
  {
    id: "g1",
    name: "Python Începători",
    emoji: "🐍",
    schedule: "Sâmbătă, 10:00",
    students: 8,
    progress: 62,
  },
  {
    id: "g2",
    name: "Scratch Junior",
    emoji: "🐱",
    schedule: "Sâmbătă, 12:00",
    students: 6,
    progress: 45,
  },
  {
    id: "g3",
    name: "JavaScript Avansați",
    emoji: "⚡",
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
    avatar: "🐼",
    homework: "Calculator de vârstă",
    submitted: "acum 2 ore",
  },
  {
    id: "s2",
    student: "Luca Dima",
    avatar: "🦖",
    homework: "Calculator de vârstă",
    submitted: "acum 5 ore",
  },
  {
    id: "s3",
    student: "Sofia Radu",
    avatar: "🦄",
    homework: "Desenează cu turtle",
    submitted: "ieri",
  },
];

export const demoLobbyPlayers = [
  { name: "Maria", avatar: "🐼" },
  { name: "Luca", avatar: "🦖" },
  { name: "Andrei", avatar: "🦊" },
  { name: "Sofia", avatar: "🦄" },
  { name: "David", avatar: "🐙" },
  { name: "Ioana", avatar: "🐱" },
  { name: "Matei", avatar: "🐸" },
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
