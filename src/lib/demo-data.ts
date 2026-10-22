// Date demonstrative pentru design. Vor fi înlocuite cu date din Supabase.

export const demoStudent = {
  name: "Tudor Popescu",
  firstName: "Tudor",
  initials: "TP",
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
  description: string;
  due: string;
  status: HomeworkStatus;
  /** Exercițiul din platformă în care se lucrează tema. */
  exerciseId: string;
  grade?: number;
  feedback?: string;
}[] = [
  {
    id: "t1",
    title: "Bucle for: desenează o piramidă",
    topic: "Python · Bucle",
    description:
      "Folosește o buclă for ca să desenezi o piramidă din steluțe, cu 5 rânduri.",
    due: "Vineri, 24 oct",
    status: "de-facut",
    exerciseId: "piramida",
  },
  {
    id: "t2",
    title: "Calculator de vârstă",
    topic: "Python · Variabile",
    description:
      "Cere anul nașterii și afișează câți ani are persoana în 2026.",
    due: "Marți, 21 oct",
    status: "predata",
    exerciseId: "varsta",
  },
  {
    id: "t3",
    title: "Mini-joc: ghicește numărul",
    topic: "Python · Condiții",
    description:
      "Calculatorul alege un număr, iar jucătorul încearcă să-l ghicească.",
    due: "Vineri, 17 oct",
    status: "corectata",
    exerciseId: "par-impar",
    grade: 9.5,
    feedback:
      "Super treabă! Mesajele sunt clare. Data viitoare încearcă să numeri și câte încercări a avut jucătorul. 🌟",
  },
];

export type Exercise = {
  id: string;
  title: string;
  topic: string;
  emoji: string;
  level: 1 | 2 | 3;
  xp: number;
  done: boolean;
  statement: string;
  example: string;
  hint: string;
  starter: string;
};

export const demoExercises: Exercise[] = [
  {
    id: "salut",
    title: "Salut, lume!",
    topic: "Primii pași",
    emoji: "👋",
    level: 1,
    xp: 20,
    done: true,
    statement: "Scrie un program care afișează mesajul Salut, lume!",
    example: "Salut, lume!",
    hint: "Folosește funcția print() și pune textul între ghilimele.",
    starter: "# Scrie codul tău aici\n",
  },
  {
    id: "varsta",
    title: "Câți ani ai?",
    topic: "Variabile",
    emoji: "🎂",
    level: 1,
    xp: 30,
    done: true,
    statement:
      "Salvează anul nașterii într-o variabilă și afișează câți ani ai în 2026.",
    example: "Ai 11 ani!",
    hint: "Scade anul nașterii din 2026 și pune rezultatul într-o variabilă.",
    starter: "an_nastere = 2015\n\n# Calculează vârsta aici\n",
  },
  {
    id: "numara",
    title: "Numără până la 10",
    topic: "Bucle",
    emoji: "🔢",
    level: 1,
    xp: 30,
    done: false,
    statement: "Afișează numerele de la 1 la 10, fiecare pe un rând.",
    example: "1\n2\n3\n...\n10",
    hint: "range(1, 11) îți dă numerele de la 1 la 10.",
    starter: "for i in range(1, 11):\n    # ce afișăm aici?\n    pass\n",
  },
  {
    id: "par-impar",
    title: "Par sau impar?",
    topic: "Condiții",
    emoji: "⚖️",
    level: 2,
    xp: 40,
    done: false,
    statement:
      "Pentru un număr dat, afișează „par” dacă se împarte exact la 2, altfel „impar”.",
    example: "7 este impar",
    hint: "Operatorul % îți dă restul împărțirii. Un număr par are restul 0.",
    starter: 'numar = 7\n\nif ...:\n    print(numar, "este par")\n',
  },
  {
    id: "tabla",
    title: "Tabla înmulțirii",
    topic: "Bucle",
    emoji: "✖️",
    level: 2,
    xp: 50,
    done: false,
    statement: "Afișează tabla înmulțirii cu 7, de la 7 × 1 până la 7 × 10.",
    example: "7 x 1 = 7\n7 x 2 = 14\n...",
    hint: 'Folosește o buclă for și o f-string: f"7 x {i} = {7 * i}".',
    starter: "for i in range(1, 11):\n    pass\n",
  },
  {
    id: "piramida",
    title: "Piramida de steluțe",
    topic: "Bucle",
    emoji: "🔺",
    level: 3,
    xp: 80,
    done: false,
    statement:
      "Desenează o piramidă din steluțe cu 5 rânduri. Fiecare rând are cu două steluțe mai mult.",
    example: "    *\n   ***\n  *****\n *******\n*********",
    hint: "Pe rândul i ai (5 - i) spații și (2 * i - 1) steluțe.",
    starter: "randuri = 5\n\nfor i in range(1, randuri + 1):\n    pass\n",
  },
];

export const demoQuizHistory = [
  {
    id: "h1",
    title: "Bucle și condiții",
    date: "Sâmbătă, 18 oct",
    place: 2,
    players: 8,
    points: 4210,
  },
  {
    id: "h2",
    title: "Variabile și tipuri",
    date: "Sâmbătă, 11 oct",
    place: 1,
    players: 7,
    points: 5120,
  },
  {
    id: "h3",
    title: "Primii pași în Python",
    date: "Sâmbătă, 4 oct",
    place: 4,
    players: 8,
    points: 2980,
  },
];

export const demoPracticeQuizzes = [
  { id: "p1", title: "Python: încălzire", emoji: "🐍", questions: 4 },
  { id: "p2", title: "Ce afișează codul?", emoji: "🔮", questions: 4 },
  { id: "p3", title: "Bucle pentru campioni", emoji: "🔁", questions: 4 },
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
  { name: "Tudor", avatar: "🦊" },
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

export type Notification = {
  id: string;
  emoji: string;
  title: string;
  text: string;
  href: string;
  time: string;
  unread: boolean;
};

export const demoStudentNotifications: Notification[] = [
  {
    id: "n1",
    emoji: "📚",
    title: "Temă nouă: Bucle for",
    text: "Termen: vineri, 24 oct",
    href: "/teme",
    time: "acum 1 oră",
    unread: true,
  },
  {
    id: "n2",
    emoji: "✅",
    title: "Tema ta a fost corectată: 9.5",
    text: "Mini-joc: ghicește numărul",
    href: "/teme",
    time: "ieri",
    unread: true,
  },
  {
    id: "n3",
    emoji: "⚡",
    title: "Quiz live sâmbătă la 10:00",
    text: "Python Începători",
    href: "/quiz",
    time: "acum 2 zile",
    unread: false,
  },
];

export const demoMentorNotifications: Notification[] = [
  {
    id: "m1",
    emoji: "📬",
    title: "Maria a trimis o temă",
    text: "Calculator de vârstă",
    href: "/mentor",
    time: "acum 2 ore",
    unread: true,
  },
  {
    id: "m2",
    emoji: "📬",
    title: "Luca a trimis o temă",
    text: "Calculator de vârstă",
    href: "/mentor",
    time: "acum 5 ore",
    unread: true,
  },
  {
    id: "m3",
    emoji: "🗓️",
    title: "Ora de sâmbătă, 10:00",
    text: "Python Începători · 8 elevi",
    href: "/mentor/sesiune",
    time: "acum 1 zi",
    unread: false,
  },
];
