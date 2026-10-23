// Date demo realiste pentru design și testare. Vor fi înlocuite cu tabelele din Supabase.
// „Azi” în demo: vezi clock.ts.

import type {
  Assignment,
  AttendanceMeeting,
  ClassRoom,
  LiveSession,
  Material,
  MentorApplication,
  Notification,
  Quiz,
  QuizAttempt,
  Submission,
  User,
  WorkedProblem,
  XpTransaction,
} from "./types";

export { DEMO_TODAY } from "./clock";

/* ---------- Utilizatori ---------- */

const student = (
  id: string,
  displayName: string,
  username: string,
  avatar: User["avatar"],
): User => ({
  id,
  displayName,
  username,
  email: `${username}@exemplu.ro`,
  role: "student",
  avatar,
  status: "active",
  createdAt: "2026-09-10T10:00:00+03:00",
});

export const users: User[] = [
  student("u-tudor", "Tudor Popescu", "tudor.p", "fox"),
  student("u-maria", "Maria Ionescu", "maria.i", "panda"),
  student("u-luca", "Luca Dima", "luca.d", "robot"),
  student("u-sofia", "Sofia Radu", "sofia.r", "owl"),
  student("u-david", "David Matei", "david.m", "octopus"),
  student("u-ioana", "Ioana Pop", "ioana.p", "cat"),
  student("u-matei", "Matei Stan", "matei.s", "penguin"),
  student("u-elena", "Elena Vasile", "elena.v", "rocket"),
  student("u-radu", "Radu Georgescu", "radu.g", "robot"),
  student("u-bianca", "Bianca Tudor", "bianca.t", "cat"),
  student("u-victor", "Victor Neagu", "victor.n", "fox"),
  student("u-cristina", "Cristina Lazăr", "cristina.l", "owl"),
  student("u-alex", "Alex Munteanu", "alex.m", "panda"),
  {
    id: "u-ana",
    displayName: "Ana Ionescu",
    email: "ana.ionescu@exemplu.ro",
    role: "mentor",
    avatar: "owl",
    status: "active",
    createdAt: "2026-08-20T10:00:00+03:00",
  },
  {
    id: "u-mihai",
    displayName: "Mihai Dumitrescu",
    email: "mihai.dumitrescu@exemplu.ro",
    role: "mentor",
    avatar: "robot",
    status: "active",
    createdAt: "2026-08-25T10:00:00+03:00",
  },
  {
    id: "u-admin",
    displayName: "Echipa EduQuest",
    email: "admin@eduquest.ro",
    role: "admin",
    avatar: "rocket",
    status: "active",
    createdAt: "2026-08-01T10:00:00+03:00",
  },
  {
    ...student("u-george", "George Iliescu", "george.i", "penguin"),
    status: "suspended",
  },
];

/** Utilizatorii „logați” în demo, câte unul pe rol. */
export const DEMO_VIEWERS = {
  student: "u-tudor",
  mentor: "u-ana",
  admin: "u-admin",
} as const;

/* ---------- Clase ---------- */

export const classes: ClassRoom[] = [
  {
    id: "python-incepatori",
    name: "Python pentru începători",
    description:
      "Primii pași în programare: variabile, condiții, bucle și funcții, cu exerciții practice la fiecare întâlnire.",
    mentorId: "u-ana",
    status: "active",
    schedule: "Sâmbătă, 10:00–11:30",
    inviteCode: "PY7K2Q",
    inviteCodeActive: true,
    studentIds: [
      "u-tudor",
      "u-maria",
      "u-luca",
      "u-sofia",
      "u-david",
      "u-ioana",
      "u-matei",
      "u-elena",
    ],
    createdAt: "2026-09-12T10:00:00+03:00",
  },
  {
    id: "web-html-css",
    name: "Dezvoltare web: HTML și CSS",
    description:
      "Construim pagini web de la zero: structura cu HTML, aspectul cu CSS și primele layout-uri responsive.",
    mentorId: "u-mihai",
    status: "active",
    schedule: "Miercuri, 17:00–18:30",
    inviteCode: "WEB4M8",
    inviteCodeActive: true,
    studentIds: [
      "u-tudor",
      "u-maria",
      "u-ioana",
      "u-radu",
      "u-bianca",
      "u-victor",
    ],
    createdAt: "2026-09-15T10:00:00+03:00",
  },
  {
    id: "poo-java",
    name: "Programare orientată pe obiecte",
    description:
      "Clase, obiecte, moștenire și interfețe, pe exemple din jocuri și aplicații simple.",
    mentorId: "u-ana",
    status: "active",
    schedule: "Duminică, 11:00–12:30",
    inviteCode: "OOP9X3",
    inviteCodeActive: true,
    studentIds: ["u-luca", "u-sofia", "u-radu", "u-cristina", "u-alex"],
    createdAt: "2026-09-14T10:00:00+03:00",
  },
  {
    id: "scratch-primii-pasi",
    name: "Scratch: primii pași",
    description:
      "Introducere în gândirea algoritmică prin blocuri vizuale și mici jocuri animate.",
    mentorId: "u-mihai",
    status: "archived",
    schedule: "Vineri, 16:00–17:00",
    inviteCode: "SCR2B5",
    inviteCodeActive: false,
    studentIds: ["u-tudor", "u-david", "u-matei", "u-elena"],
    createdAt: "2026-03-01T10:00:00+03:00",
  },
];

/** Coduri care au existat, dar nu mai sunt valabile (pentru mesajele de eroare). */
export const expiredInviteCodes = ["PY1OLD", "WEB0LD"];

/* ---------- Materiale ---------- */

export const materials: Material[] = [
  {
    id: "variabile-tipuri",
    classId: "python-incepatori",
    title: "Variabile și tipuri de date",
    description:
      "Ce este o variabilă, cum îi dăm o valoare și ce tipuri de date folosim cel mai des.",
    topic: "Python · Bazele",
    kind: "article",
    tags: ["variabile", "tipuri", "începători"],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-09-19T12:00:00+03:00",
    blocks: [
      {
        type: "paragraph",
        text: "O variabilă este un nume pe care îl dăm unei valori, ca să o putem folosi mai târziu în program. În Python, creăm o variabilă scriind numele, semnul egal și valoarea.",
      },
      {
        type: "code",
        language: "python",
        code: 'nume = "Tudor"\nvarsta = 12\ninaltime = 1.52\nare_bicicleta = True\n\nprint(nume, "are", varsta, "ani")',
      },
      { type: "heading", text: "Tipurile cele mai folosite" },
      {
        type: "list",
        items: [
          "int: numere întregi, de exemplu 12 sau -3",
          "float: numere cu virgulă, de exemplu 1.52",
          "str: text, scris între ghilimele",
          "bool: adevărat sau fals (True / False)",
        ],
      },
      {
        type: "note",
        text: "Poți afla tipul unei valori cu funcția type(). Încearcă: print(type(varsta)).",
      },
    ],
  },
  {
    id: "conditii-if",
    classId: "python-incepatori",
    title: "Structuri decizionale: if, elif, else",
    description:
      "Cum ia programul decizii în funcție de valori și cum combinăm mai multe condiții.",
    topic: "Python · Condiții",
    kind: "article",
    tags: ["if", "condiții"],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-10-03T12:00:00+03:00",
    blocks: [
      {
        type: "paragraph",
        text: "Cu if, programul execută un bloc de cod doar dacă o condiție este adevărată. Cu elif și else tratăm celelalte cazuri.",
      },
      {
        type: "code",
        language: "python",
        code: 'nota = 8\n\nif nota >= 9:\n    print("Excelent!")\nelif nota >= 7:\n    print("Foarte bine")\nelse:\n    print("Mai exersăm")',
      },
      {
        type: "note",
        text: "Atenție la indentare: codul din interiorul lui if trebuie mutat cu 4 spații spre dreapta.",
      },
    ],
  },
  {
    id: "bucle-video",
    classId: "python-incepatori",
    title: "Bucle for și while, explicate pe scurt",
    description:
      "Un video de 12 minute despre repetarea instrucțiunilor, cu exemple pas cu pas.",
    topic: "Python · Bucle",
    kind: "video",
    tags: ["for", "while", "video"],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-10-10T12:00:00+03:00",
    url: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
  },
  {
    id: "fisa-bucle",
    classId: "python-incepatori",
    title: "Fișă de exerciții: bucle",
    description: "10 exerciții gradate despre for și while, pentru acasă.",
    topic: "Python · Bucle",
    kind: "pdf",
    tags: ["exerciții", "fișă"],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-10-17T12:00:00+03:00",
    file: { name: "fisa-bucle.pdf", sizeKb: 284 },
  },
  {
    id: "functii-draft",
    classId: "python-incepatori",
    title: "Funcții: cum ne organizăm codul",
    description: "Definirea funcțiilor, parametri și valori returnate.",
    topic: "Python · Funcții",
    kind: "article",
    tags: ["funcții"],
    status: "draft",
    authorId: "u-ana",
    publishedAt: "2026-10-22T12:00:00+03:00",
    blocks: [
      {
        type: "paragraph",
        text: "O funcție este un bloc de cod cu nume, pe care îl putem folosi de câte ori avem nevoie.",
      },
    ],
  },
  {
    id: "structura-html",
    classId: "web-html-css",
    title: "Structura unei pagini HTML",
    description:
      "Elementele de bază ale unei pagini: html, head, body, titluri și paragrafe.",
    topic: "Web · HTML",
    kind: "article",
    tags: ["html", "structură"],
    status: "published",
    authorId: "u-mihai",
    publishedAt: "2026-09-23T19:00:00+03:00",
    blocks: [
      {
        type: "paragraph",
        text: "Orice pagină HTML are aceeași structură de bază. Conținutul vizibil stă în body, iar informațiile despre pagină în head.",
      },
      {
        type: "code",
        language: "html",
        code: '<!DOCTYPE html>\n<html lang="ro">\n  <head>\n    <meta charset="utf-8">\n    <title>Pagina mea</title>\n  </head>\n  <body>\n    <h1>Salut!</h1>\n    <p>Aceasta este prima mea pagină.</p>\n  </body>\n</html>',
      },
    ],
  },
  {
    id: "ghid-flexbox",
    classId: "web-html-css",
    title: "Ghid complet CSS Flexbox",
    description:
      "Un ghid vizual excelent pentru aranjarea elementelor pe rând sau pe coloană.",
    topic: "Web · CSS",
    kind: "link",
    tags: ["css", "flexbox", "layout"],
    status: "published",
    authorId: "u-mihai",
    publishedAt: "2026-10-14T19:00:00+03:00",
    url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
  },
  {
    id: "mesaje-eroare",
    classId: null,
    title: "Cum citești un mesaj de eroare în Python",
    description:
      "Erorile nu sunt dușmani: te învățăm să găsești rapid linia și cauza problemei.",
    topic: "Python · Depanare",
    kind: "article",
    tags: ["erori", "depanare"],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-09-25T12:00:00+03:00",
    blocks: [
      {
        type: "paragraph",
        text: "Când programul se oprește cu o eroare, Python îți spune exact pe ce linie s-a întâmplat și ce tip de eroare este. Citește întâi ultima linie a mesajului.",
      },
      {
        type: "code",
        language: "text",
        code: "Traceback (most recent call last):\n  File \"main.py\", line 3, in <module>\n    print(varsta + 1)\nNameError: name 'varsta' is not defined",
      },
      {
        type: "list",
        items: [
          "NameError: ai folosit un nume care nu există (poate o greșeală de scriere)",
          "SyntaxError: lipsește ceva în scriere, de exemplu două puncte sau o paranteză",
          "IndentationError: spațiile de la începutul liniei nu sunt corecte",
        ],
      },
    ],
  },
  {
    id: "documentatie-python",
    classId: null,
    title: "Documentația oficială Python",
    description:
      "Referința completă a limbajului, cu tutorialul oficial pentru începători.",
    topic: "Python · Resurse",
    kind: "link",
    tags: ["documentație", "referință"],
    status: "published",
    authorId: "u-mihai",
    publishedAt: "2026-09-20T12:00:00+03:00",
    url: "https://docs.python.org/3/tutorial/",
  },
];

/* ---------- Probleme rezolvate ---------- */

export const workedProblems: WorkedProblem[] = [
  {
    id: "suma-cifrelor",
    classId: "python-incepatori",
    title: "Suma cifrelor unui număr",
    topic: "Python · Bucle",
    difficulty: 1,
    statement: "Se citește un număr natural n. Afișează suma cifrelor lui n.",
    constraints: ["0 ≤ n ≤ 1 000 000 000"],
    examples: [
      { input: "1234", output: "10", note: "1 + 2 + 3 + 4 = 10" },
      { input: "7", output: "7" },
    ],
    solution: {
      language: "python",
      code: "n = int(input())\nsuma = 0\n\nwhile n > 0:\n    suma += n % 10\n    n //= 10\n\nprint(suma)",
    },
    explanation: [
      "n % 10 ne dă ultima cifră a numărului.",
      "n //= 10 taie ultima cifră, împărțind numărul la 10 fără rest.",
      "Repetăm până când numărul devine 0 și adunăm fiecare cifră la sumă.",
    ],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-10-10T12:00:00+03:00",
  },
  {
    id: "maximul-a-trei",
    classId: "python-incepatori",
    title: "Cel mai mare dintre trei numere",
    topic: "Python · Condiții",
    difficulty: 1,
    statement:
      "Se citesc trei numere întregi a, b și c. Afișează cel mai mare dintre ele, fără să folosești funcția max().",
    constraints: ["-1000 ≤ a, b, c ≤ 1000"],
    examples: [{ input: "4 9 2", output: "9" }],
    solution: {
      language: "python",
      code: "a, b, c = map(int, input().split())\n\nmaxim = a\nif b > maxim:\n    maxim = b\nif c > maxim:\n    maxim = c\n\nprint(maxim)",
    },
    explanation: [
      "Presupunem că primul număr este cel mai mare.",
      "Comparăm pe rând celelalte numere cu maximul de până acum și îl actualizăm dacă găsim unul mai mare.",
    ],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-10-03T12:00:00+03:00",
  },
  {
    id: "numere-prime",
    classId: null,
    title: "Numerele prime până la N",
    topic: "Python · Algoritmi",
    difficulty: 2,
    statement:
      "Se citește un număr natural N. Afișează toate numerele prime mai mici sau egale cu N, separate prin spațiu.",
    constraints: ["2 ≤ N ≤ 10 000"],
    examples: [{ input: "20", output: "2 3 5 7 11 13 17 19" }],
    solution: {
      language: "python",
      code: "n = int(input())\nprime = []\n\nfor x in range(2, n + 1):\n    este_prim = True\n    d = 2\n    while d * d <= x:\n        if x % d == 0:\n            este_prim = False\n            break\n        d += 1\n    if este_prim:\n        prime.append(x)\n\nprint(*prime)",
    },
    explanation: [
      "Un număr este prim dacă nu are divizori în afară de 1 și de el însuși.",
      "E suficient să căutăm divizori până la rădăcina pătrată a numărului (d * d <= x).",
      "Ne oprim imediat ce găsim un divizor, cu break, ca să nu facem verificări inutile.",
    ],
    status: "published",
    authorId: "u-ana",
    publishedAt: "2026-10-12T12:00:00+03:00",
  },
  {
    id: "invers-sir",
    classId: null,
    title: "Inversarea unui cuvânt",
    topic: "Python · Șiruri",
    difficulty: 1,
    statement:
      "Se citește un cuvânt. Afișează cuvântul scris de la coadă la cap și spune dacă este palindrom.",
    constraints: ["Cuvântul are cel mult 100 de litere mici."],
    examples: [
      { input: "cojoc", output: "cojoc\npalindrom" },
      { input: "python", output: "nohtyp\nnu este palindrom" },
    ],
    solution: {
      language: "python",
      code: 'cuvant = input()\ninvers = cuvant[::-1]\n\nprint(invers)\nif invers == cuvant:\n    print("palindrom")\nelse:\n    print("nu este palindrom")',
    },
    explanation: [
      "cuvant[::-1] parcurge șirul de la ultimul caracter la primul.",
      "Un palindrom se citește la fel în ambele sensuri, deci este egal cu inversul lui.",
    ],
    status: "published",
    authorId: "u-mihai",
    publishedAt: "2026-09-28T12:00:00+03:00",
  },
];

/* ---------- Teme ---------- */

export const assignments: Assignment[] = [
  {
    id: "calculator-varsta",
    classId: "python-incepatori",
    title: "Calculator de vârstă",
    summary: "Cere anul nașterii și afișează vârsta în 2026.",
    instructions: [
      "Citește de la tastatură anul nașterii.",
      "Calculează vârsta pe care o ai în 2026.",
      'Afișează un mesaj de forma: "Ai 12 ani".',
      "Bonus: dacă anul introdus este mai mare decât 2026, afișează un mesaj de eroare.",
    ],
    type: "required",
    deadline: "2026-10-16T22:00:00+03:00",
    maxBonusXp: 5,
    attachments: [],
    allowResubmit: true,
    status: "published",
    publishedAt: "2026-10-10T12:00:00+03:00",
  },
  {
    id: "piramida-stelute",
    classId: "python-incepatori",
    title: "Piramida de steluțe",
    summary: "Desenează o piramidă din steluțe cu o buclă for.",
    instructions: [
      "Citește numărul de rânduri n.",
      "Folosește o buclă for ca să desenezi o piramidă din steluțe.",
      "Pe rândul i ai (n - i) spații și (2 * i - 1) steluțe.",
      "Trimite fișierul .py sau lipește codul în caseta de text.",
    ],
    type: "required",
    deadline: "2026-10-28T22:00:00+03:00",
    maxBonusXp: 5,
    attachments: [
      {
        label: "Fișă de exerciții: bucle",
        url: "/invatare/materiale/fisa-bucle",
      },
    ],
    allowResubmit: true,
    status: "published",
    publishedAt: "2026-10-17T12:00:00+03:00",
  },
  {
    id: "ghiceste-numarul",
    classId: "python-incepatori",
    title: "Joc: ghicește numărul",
    summary: "Calculatorul alege un număr, iar jucătorul îl ghicește.",
    instructions: [
      "Folosește random.randint(1, 50) ca să alegi un număr secret.",
      "Cere jucătorului să ghicească până găsește numărul.",
      'După fiecare încercare, spune "mai mare" sau "mai mic".',
      "La final, afișează numărul de încercări.",
    ],
    type: "optional",
    maxBonusXp: 5,
    attachments: [],
    allowResubmit: true,
    status: "published",
    publishedAt: "2026-10-03T12:00:00+03:00",
  },
  {
    id: "functii-draft",
    classId: "python-incepatori",
    title: "Funcții: aria și perimetrul",
    summary: "Scrie două funcții pentru un dreptunghi.",
    instructions: ["Definește funcțiile aria(l, L) și perimetru(l, L)."],
    type: "required",
    deadline: "2026-11-04T22:00:00+03:00",
    maxBonusXp: 5,
    attachments: [],
    allowResubmit: true,
    status: "draft",
    publishedAt: "2026-10-22T12:00:00+03:00",
  },
  {
    id: "pagina-prezentare",
    classId: "web-html-css",
    title: "Pagina mea de prezentare",
    summary: "O pagină HTML despre tine, cu titlu, imagine și o listă.",
    instructions: [
      "Creează un fișier index.html cu structura de bază.",
      "Adaugă un titlu cu numele tău și un paragraf despre ce îți place.",
      "Pune o listă cu 3 lucruri pe care vrei să le înveți.",
      "Opțional: adaugă o imagine și un link către site-ul tău preferat.",
    ],
    type: "required",
    deadline: "2026-10-30T22:00:00+03:00",
    maxBonusXp: 5,
    attachments: [],
    allowResubmit: true,
    status: "published",
    publishedAt: "2026-10-14T19:00:00+03:00",
  },
  {
    id: "pagina-css",
    classId: "web-html-css",
    title: "Stilizează pagina cu CSS",
    summary: "Culori, fonturi și un layout simplu cu Flexbox.",
    instructions: [
      "Adaugă un fișier style.css la pagina de prezentare.",
      "Schimbă fontul și culorile pentru titlu și paragrafe.",
      "Aranjează lista pe orizontală cu display: flex.",
    ],
    type: "optional",
    deadline: "2026-11-06T22:00:00+03:00",
    maxBonusXp: 5,
    attachments: [
      {
        label: "Ghid complet CSS Flexbox",
        url: "/invatare/materiale/ghid-flexbox",
      },
    ],
    allowResubmit: true,
    status: "published",
    publishedAt: "2026-10-21T19:00:00+03:00",
  },
];

const code = {
  varsta:
    'an = int(input("În ce an te-ai născut? "))\nif an > 2026:\n    print("Anul nu poate fi în viitor!")\nelse:\n    print("Ai", 2026 - an, "ani")',
  piramida:
    'n = int(input("Câte rânduri? "))\nfor i in range(1, n + 1):\n    print(" " * (n - i) + "*" * (2 * i - 1))',
  ghiceste:
    'import random\n\nsecret = random.randint(1, 50)\nincercare = int(input("Ghicește: "))\nif incercare == secret:\n    print("Bravo!")',
};

export const submissions: Submission[] = [
  {
    id: "s-tudor-varsta",
    assignmentId: "calculator-varsta",
    studentId: "u-tudor",
    status: "reviewed",
    attempts: [
      { at: "2026-10-14T18:20:00+03:00", text: code.varsta, files: [] },
    ],
    feedback: {
      text: "Excelentă rezolvare! Codul este clar, iar verificarea pentru anii din viitor arată că te-ai gândit și la cazurile speciale.",
      at: "2026-10-17T11:00:00+03:00",
    },
    submissionXp: 2,
    bonusXp: 4,
  },
  {
    id: "s-tudor-ghiceste",
    assignmentId: "ghiceste-numarul",
    studentId: "u-tudor",
    status: "needs_changes",
    attempts: [
      {
        at: "2026-10-12T17:05:00+03:00",
        files: [{ name: "ghiceste.py", sizeKb: 1 }],
        text: code.ghiceste,
      },
    ],
    feedback: {
      text: "Început bun! Momentan jucătorul are o singură încercare. Pune citirea și verificarea într-o buclă while, ca jocul să continue până ghicește numărul.",
      at: "2026-10-13T10:30:00+03:00",
    },
    submissionXp: 2,
  },
  {
    id: "s-tudor-pagina",
    assignmentId: "pagina-prezentare",
    studentId: "u-tudor",
    status: "submitted",
    attempts: [
      {
        at: "2026-10-21T20:40:00+03:00",
        files: [{ name: "index.html", sizeKb: 2 }],
        link: "https://tudor-p.github.io/prezentare",
      },
    ],
    submissionXp: 2,
  },
  {
    id: "s-maria-varsta",
    assignmentId: "calculator-varsta",
    studentId: "u-maria",
    status: "reviewed",
    attempts: [
      { at: "2026-10-13T16:00:00+03:00", text: code.varsta, files: [] },
    ],
    feedback: {
      text: "Foarte bine! Rezolvare corectă și ușor de citit.",
      at: "2026-10-17T11:10:00+03:00",
    },
    submissionXp: 2,
    bonusXp: 5,
  },
  {
    id: "s-luca-varsta",
    assignmentId: "calculator-varsta",
    studentId: "u-luca",
    status: "reviewed",
    attempts: [
      { at: "2026-10-15T19:30:00+03:00", text: code.varsta, files: [] },
    ],
    feedback: {
      text: "Bună treabă! Încearcă data viitoare să pui mesaje mai clare pentru utilizator.",
      at: "2026-10-17T11:20:00+03:00",
    },
    submissionXp: 2,
    bonusXp: 3,
  },
  {
    id: "s-ioana-varsta",
    assignmentId: "calculator-varsta",
    studentId: "u-ioana",
    status: "submitted",
    attempts: [
      {
        at: "2026-10-16T21:50:00+03:00",
        files: [{ name: "varsta.py", sizeKb: 1 }],
        text: 'an = int(input())\nprint("Ai", 2026 - an, "ani")',
      },
    ],
    submissionXp: 2,
  },
  {
    id: "s-maria-piramida",
    assignmentId: "piramida-stelute",
    studentId: "u-maria",
    status: "submitted",
    attempts: [
      { at: "2026-10-21T18:10:00+03:00", text: code.piramida, files: [] },
    ],
    submissionXp: 2,
  },
  {
    id: "s-luca-piramida",
    assignmentId: "piramida-stelute",
    studentId: "u-luca",
    status: "submitted",
    attempts: [
      {
        at: "2026-10-22T19:45:00+03:00",
        files: [{ name: "piramida.py", sizeKb: 1 }],
        text: 'n = int(input())\nfor i in range(n):\n    print("*" * i)',
      },
    ],
    submissionXp: 2,
  },
  {
    id: "s-david-ghiceste",
    assignmentId: "ghiceste-numarul",
    studentId: "u-david",
    status: "submitted",
    attempts: [
      { at: "2026-10-11T15:00:00+03:00", text: code.ghiceste, files: [] },
      {
        at: "2026-10-20T17:30:00+03:00",
        files: [{ name: "ghiceste_v2.py", sizeKb: 1 }],
        text: 'import random\n\nsecret = random.randint(1, 50)\nincercari = 0\nwhile True:\n    x = int(input("Ghicește: "))\n    incercari += 1\n    if x < secret:\n        print("mai mare")\n    elif x > secret:\n        print("mai mic")\n    else:\n        print("Bravo! Ai ghicit în", incercari, "încercări")\n        break',
      },
    ],
    feedback: {
      text: "Adaugă o buclă, ca jucătorul să poată încerca de mai multe ori.",
      at: "2026-10-12T10:00:00+03:00",
    },
    submissionXp: 2,
  },
  {
    id: "s-sofia-ghiceste",
    assignmentId: "ghiceste-numarul",
    studentId: "u-sofia",
    status: "reviewed",
    attempts: [
      { at: "2026-10-09T18:00:00+03:00", text: code.ghiceste, files: [] },
    ],
    feedback: {
      text: "Excelent! Ai adăugat și un contor pentru încercări. Foarte frumos.",
      at: "2026-10-10T09:00:00+03:00",
    },
    submissionXp: 2,
    bonusXp: 5,
  },
];

/* ---------- Prezență ---------- */

const meeting = (
  id: string,
  classId: string,
  date: string,
  topic: string,
  absent: string[],
): AttendanceMeeting => {
  const cls = classes.find((c) => c.id === classId);
  const records: Record<string, boolean> = {};
  for (const s of cls?.studentIds ?? []) records[s] = !absent.includes(s);
  return { id, classId, date, topic, records };
};

export const attendance: AttendanceMeeting[] = [
  meeting(
    "py-1",
    "python-incepatori",
    "2026-09-19T10:00:00+03:00",
    "Primul program",
    ["u-elena"],
  ),
  meeting(
    "py-2",
    "python-incepatori",
    "2026-09-26T10:00:00+03:00",
    "Variabile și tipuri",
    ["u-matei"],
  ),
  meeting(
    "py-3",
    "python-incepatori",
    "2026-10-03T10:00:00+03:00",
    "Condiții",
    ["u-tudor", "u-elena"],
  ),
  meeting(
    "py-4",
    "python-incepatori",
    "2026-10-10T10:00:00+03:00",
    "Bucla while",
    ["u-ioana"],
  ),
  meeting(
    "py-5",
    "python-incepatori",
    "2026-10-17T10:00:00+03:00",
    "Bucla for",
    ["u-david", "u-matei"],
  ),
  meeting(
    "web-1",
    "web-html-css",
    "2026-09-23T17:00:00+03:00",
    "Ce este HTML",
    [],
  ),
  meeting(
    "web-2",
    "web-html-css",
    "2026-09-30T17:00:00+03:00",
    "Titluri, paragrafe, liste",
    ["u-victor"],
  ),
  meeting(
    "web-3",
    "web-html-css",
    "2026-10-07T17:00:00+03:00",
    "Imagini și link-uri",
    ["u-tudor"],
  ),
  meeting(
    "web-4",
    "web-html-css",
    "2026-10-14T17:00:00+03:00",
    "Primii pași în CSS",
    ["u-bianca"],
  ),
  meeting(
    "web-5",
    "web-html-css",
    "2026-10-21T17:00:00+03:00",
    "Culori și fonturi",
    [],
  ),
  meeting(
    "oop-1",
    "poo-java",
    "2026-10-11T11:00:00+03:00",
    "Clase și obiecte",
    ["u-alex"],
  ),
  meeting("oop-2", "poo-java", "2026-10-18T11:00:00+03:00", "Constructori", []),
];

/* ---------- Quiz-uri ---------- */

export const quizzes: Quiz[] = [
  {
    id: "python-baza",
    title: "Python: noțiuni de bază",
    description:
      "Variabile, tipuri de date și afișare. Bun pentru recapitulare.",
    topic: "Python",
    difficulty: 1,
    classId: null,
    authorId: "u-ana",
    questions: [
      {
        id: "q1",
        prompt: "Ce tip de date are valoarea 3.14?",
        options: ["int", "float", "str", "bool"],
        correct: 1,
        explanation: "Numerele cu virgulă (punct zecimal) sunt de tip float.",
      },
      {
        id: "q2",
        prompt: "Care este rezultatul expresiei?",
        code: "print(7 // 2)",
        options: ["3.5", "3", "4", "1"],
        correct: 1,
        explanation:
          "Operatorul // face împărțirea întreagă: păstrează doar partea întreagă.",
      },
      {
        id: "q3",
        prompt: "Ce afișează programul?",
        code: 'nume = "Ana"\nprint("Salut, " + nume)',
        options: ["Salut, nume", "Salut, Ana", "Eroare", "Salut,Ana"],
        correct: 1,
      },
      {
        id: "q4",
        prompt: "Care dintre următoarele este un nume valid de variabilă?",
        options: ["2nume", "nume-elev", "nume_elev", "for"],
        correct: 2,
        explanation:
          "Numele nu pot începe cu cifră, nu pot conține „-” și nu pot fi cuvinte rezervate, ca for.",
      },
      {
        id: "q5",
        prompt: "Ce valoare are x la final?",
        code: "x = 5\nx = x * 2\nx += 1",
        options: ["10", "11", "6", "12"],
        correct: 1,
      },
      {
        id: "q6",
        prompt: "Cu ce funcție citim date de la tastatură?",
        options: ["print()", "read()", "input()", "scan()"],
        correct: 2,
      },
    ],
  },
  {
    id: "ce-afiseaza",
    title: "Ce afișează codul?",
    description: "Citește atent fiecare program și alege rezultatul corect.",
    topic: "Python",
    difficulty: 2,
    classId: null,
    authorId: "u-ana",
    timeLimitSec: 300,
    questions: [
      {
        id: "q1",
        prompt: "Ce afișează programul?",
        code: "for i in range(3):\n    print(i, end=' ')",
        options: ["1 2 3", "0 1 2", "0 1 2 3", "3"],
        correct: 1,
        explanation: "range(3) generează 0, 1 și 2 — se oprește înainte de 3.",
      },
      {
        id: "q2",
        prompt: "Ce afișează programul?",
        code: 'x = 10\nif x > 5:\n    print("mare")\nelse:\n    print("mic")',
        options: ["mare", "mic", "mare mic", "nimic"],
        correct: 0,
      },
      {
        id: "q3",
        prompt: "Ce afișează programul?",
        code: 'print("ab" * 3)',
        options: ["ab3", "ababab", "Eroare", "ab ab ab"],
        correct: 1,
        explanation: "Înmulțirea unui șir cu un număr îl repetă de atâtea ori.",
      },
      {
        id: "q4",
        prompt: "Ce afișează programul?",
        code: "s = 0\nfor i in range(1, 5):\n    s += i\nprint(s)",
        options: ["10", "15", "4", "6"],
        correct: 0,
        explanation: "1 + 2 + 3 + 4 = 10.",
      },
      {
        id: "q5",
        prompt: "Ce afișează programul?",
        code: "print(len('python'))",
        options: ["5", "6", "7", "python"],
        correct: 1,
      },
    ],
  },
  {
    id: "html-baza",
    title: "HTML: elemente de bază",
    description: "Titluri, paragrafe, liste și link-uri.",
    topic: "Web",
    difficulty: 1,
    classId: null,
    authorId: "u-mihai",
    questions: [
      {
        id: "q1",
        prompt: "Ce element folosim pentru cel mai important titlu?",
        options: ["<title>", "<h1>", "<head>", "<h6>"],
        correct: 1,
      },
      {
        id: "q2",
        prompt: "Ce element creează un link?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correct: 1,
        explanation: "Elementul <a> cu atributul href creează un link.",
      },
      {
        id: "q3",
        prompt: "Ce element creează o listă cu buline?",
        options: ["<ol>", "<ul>", "<li>", "<list>"],
        correct: 1,
      },
      {
        id: "q4",
        prompt: "Unde punem conținutul vizibil al paginii?",
        options: ["<head>", "<body>", "<meta>", "<html>"],
        correct: 1,
      },
      {
        id: "q5",
        prompt: "Ce atribut adaugă textul alternativ unei imagini?",
        options: ["title", "src", "alt", "href"],
        correct: 2,
      },
    ],
  },
  {
    id: "test-bucle",
    title: "Test: bucle",
    description: "Verifică ce ai învățat despre for și while.",
    topic: "Python",
    difficulty: 2,
    classId: "python-incepatori",
    authorId: "u-ana",
    timeLimitSec: 600,
    assignment: {
      opensAt: "2026-10-20T10:00:00+03:00",
      deadline: "2026-10-27T22:00:00+03:00",
      maxAttempts: 2,
      xp: 3,
    },
    questions: [
      {
        id: "q1",
        prompt: "De câte ori se execută corpul buclei?",
        code: "for i in range(2, 7):\n    print(i)",
        options: ["7", "5", "6", "4"],
        correct: 1,
      },
      {
        id: "q2",
        prompt: "Ce face instrucțiunea break?",
        options: [
          "Sare la următoarea repetare",
          "Oprește bucla imediat",
          "Repornește programul",
          "Nu face nimic",
        ],
        correct: 1,
      },
      {
        id: "q3",
        prompt: "Ce afișează programul?",
        code: "i = 3\nwhile i > 0:\n    print(i, end=' ')\n    i -= 1",
        options: ["3 2 1", "3 2 1 0", "1 2 3", "0 1 2"],
        correct: 0,
      },
      {
        id: "q4",
        prompt:
          "Care buclă e potrivită când nu știm dinainte de câte ori repetăm?",
        options: ["for", "while", "if", "def"],
        correct: 1,
      },
    ],
  },
  {
    id: "recapitulare-live",
    title: "Recapitulare: condiții și bucle",
    description: "Quiz pentru sesiunea live de la clasă.",
    topic: "Python",
    difficulty: 1,
    classId: "python-incepatori",
    authorId: "u-ana",
    timeLimitSec: 20,
    questions: [
      {
        id: "q1",
        prompt: "Ce afișează programul?",
        code: "print(2 + 3 * 2)",
        options: ["10", "8", "12", "2 + 3 * 2"],
        correct: 1,
        explanation:
          "Înmulțirea se face înaintea adunării: 3 * 2 = 6, apoi 2 + 6 = 8.",
      },
      {
        id: "q2",
        prompt: "Care dintre acestea pornește o buclă în Python?",
        options: ["if", "def", "for", "import"],
        correct: 2,
      },
      {
        id: "q3",
        prompt: "Ce valoare are x la final?",
        code: "x = 5\nx += 3",
        options: ["5", "3", "53", "8"],
        correct: 3,
      },
      {
        id: "q4",
        prompt: 'Ce tip de date are valoarea "42"?',
        options: ["str (text)", "int (număr)", "float", "bool"],
        correct: 0,
        explanation: "Orice valoare scrisă între ghilimele este text (str).",
      },
    ],
  },
];

export const quizAttempts: QuizAttempt[] = [
  {
    id: "a1",
    quizId: "python-baza",
    studentId: "u-tudor",
    at: "2026-10-12T19:00:00+03:00",
    correct: 5,
    total: 6,
  },
  {
    id: "a2",
    quizId: "ce-afiseaza",
    studentId: "u-tudor",
    at: "2026-10-19T18:30:00+03:00",
    correct: 3,
    total: 5,
  },
];

export const liveSessions: LiveSession[] = [
  {
    id: "live-variabile",
    quizId: "python-baza",
    classId: "python-incepatori",
    title: "Variabile și tipuri",
    code: "482193",
    status: "ended",
    startsAt: "2026-10-10T10:15:00+03:00",
    results: [
      { studentId: "u-maria", score: 5420, rank: 1, xp: 5 },
      { studentId: "u-tudor", score: 5110, rank: 2, xp: 4 },
      { studentId: "u-luca", score: 4890, rank: 3, xp: 3 },
      { studentId: "u-sofia", score: 4320, rank: 4, xp: 2 },
      { studentId: "u-david", score: 3900, rank: 5, xp: 1 },
      { studentId: "u-matei", score: 3100, rank: 6, xp: 1 },
      { studentId: "u-elena", score: 2650, rank: 7, xp: 1 },
    ],
  },
  {
    id: "live-html",
    quizId: "html-baza",
    classId: "web-html-css",
    title: "Recapitulare HTML",
    code: "735019",
    status: "ended",
    startsAt: "2026-10-14T17:45:00+03:00",
    results: [
      { studentId: "u-ioana", score: 4980, rank: 1, xp: 5 },
      { studentId: "u-maria", score: 4710, rank: 2, xp: 4 },
      { studentId: "u-radu", score: 4300, rank: 3, xp: 3 },
      { studentId: "u-bianca", score: 3920, rank: 4, xp: 2 },
      { studentId: "u-tudor", score: 3610, rank: 5, xp: 1 },
      { studentId: "u-victor", score: 2200, rank: 6, xp: 1 },
    ],
  },
  {
    id: "live-recapitulare",
    quizId: "recapitulare-live",
    classId: "python-incepatori",
    title: "Recapitulare: condiții și bucle",
    code: "264817",
    status: "scheduled",
    startsAt: "2026-10-24T10:15:00+03:00",
  },
];

/* ---------- XP ---------- */

let xpSeq = 0;
const xp = (
  studentId: string,
  classId: string | null,
  source: XpTransaction["source"],
  amount: number,
  label: string,
  at: string,
): XpTransaction => ({
  id: `xp-${++xpSeq}`,
  studentId,
  classId,
  source,
  amount,
  label,
  at,
});

/** Tranzacțiile de XP se generează din activitate, ca în baza de date reală. */
function buildXp(): XpTransaction[] {
  const list: XpTransaction[] = [];
  for (const m of attendance) {
    for (const [studentId, present] of Object.entries(m.records)) {
      if (present)
        list.push(
          xp(
            studentId,
            m.classId,
            "attendance",
            2,
            `Prezență: ${m.topic}`,
            m.date,
          ),
        );
    }
  }
  for (const s of submissions) {
    const a = assignments.find((x) => x.id === s.assignmentId);
    if (!a) continue;
    list.push(
      xp(
        s.studentId,
        a.classId,
        "submission",
        s.submissionXp,
        `Temă trimisă: ${a.title}`,
        s.attempts[0].at,
      ),
    );
    if (s.bonusXp && s.feedback)
      list.push(
        xp(
          s.studentId,
          a.classId,
          "quality_bonus",
          s.bonusXp,
          `Bonus de calitate: ${a.title}`,
          s.feedback.at,
        ),
      );
  }
  for (const session of liveSessions) {
    for (const r of session.results ?? []) {
      list.push(
        xp(
          r.studentId,
          session.classId,
          "live_quiz",
          r.xp,
          `Quiz live: ${session.title} (locul ${r.rank})`,
          session.startsAt,
        ),
      );
    }
  }
  return list.sort((a, b) => b.at.localeCompare(a.at));
}

export const xpTransactions: XpTransaction[] = buildXp();

/* ---------- Notificări ---------- */

export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "u-tudor",
    kind: "assignment_new",
    title: "Temă nouă: Stilizează pagina cu CSS",
    body: "Dezvoltare web · opțională · termen 6 noiembrie",
    href: "/teme/pagina-css",
    at: "2026-10-21T19:05:00+03:00",
    read: false,
  },
  {
    id: "n2",
    userId: "u-tudor",
    kind: "live_quiz",
    title: "Quiz live sâmbătă, la 10:15",
    body: "Python pentru începători · Recapitulare: condiții și bucle",
    href: "/quiz",
    at: "2026-10-20T12:00:00+03:00",
    read: false,
  },
  {
    id: "n3",
    userId: "u-tudor",
    kind: "deadline",
    title: "Termen apropiat: Piramida de steluțe",
    body: "Python pentru începători · până marți, 28 octombrie",
    href: "/teme/piramida-stelute",
    at: "2026-10-23T09:00:00+03:00",
    read: false,
  },
  {
    id: "n4",
    userId: "u-tudor",
    kind: "material_new",
    title: "Material nou: Fișă de exerciții: bucle",
    body: "Python pentru începători",
    href: "/invatare/materiale/fisa-bucle",
    at: "2026-10-17T12:05:00+03:00",
    read: true,
  },
  {
    id: "n5",
    userId: "u-tudor",
    kind: "feedback",
    title: "Ai primit feedback: Calculator de vârstă",
    body: "Ana Ionescu a revizuit tema ta · +4 XP bonus",
    href: "/teme/calculator-varsta",
    at: "2026-10-17T11:00:00+03:00",
    read: true,
  },
  {
    id: "n6",
    userId: "u-tudor",
    kind: "needs_changes",
    title: "Corecturi cerute: Joc: ghicește numărul",
    body: "Citește feedback-ul și trimite din nou",
    href: "/teme/ghiceste-numarul",
    at: "2026-10-13T10:30:00+03:00",
    read: true,
  },
  {
    id: "m1",
    userId: "u-ana",
    kind: "submission_new",
    title: "Luca Dima a trimis: Piramida de steluțe",
    body: "Python pentru începători",
    href: "/mentor/teme/piramida-stelute",
    at: "2026-10-22T19:45:00+03:00",
    read: false,
  },
  {
    id: "m2",
    userId: "u-ana",
    kind: "submission_new",
    title: "Maria Ionescu a trimis: Piramida de steluțe",
    body: "Python pentru începători",
    href: "/mentor/teme/piramida-stelute",
    at: "2026-10-21T18:10:00+03:00",
    read: false,
  },
  {
    id: "m3",
    userId: "u-ana",
    kind: "resubmission",
    title: "David Matei a retrimis: Joc: ghicește numărul",
    body: "A doua variantă, după corecturi",
    href: "/mentor/teme/ghiceste-numarul",
    at: "2026-10-20T17:30:00+03:00",
    read: false,
  },
  {
    id: "m4",
    userId: "u-ana",
    kind: "submission_new",
    title: "Ioana Pop a trimis: Calculator de vârstă",
    body: "Python pentru începători",
    href: "/mentor/teme/calculator-varsta",
    at: "2026-10-16T21:50:00+03:00",
    read: true,
  },
];

/* ---------- Aplicații de mentor ---------- */

export const mentorApplications: MentorApplication[] = [
  {
    id: "app-1",
    fullName: "Andreea Stoica",
    email: "andreea.stoica@exemplu.ro",
    phone: "0722 123 456",
    background:
      "Studentă în anul III la Informatică (Universitatea din București). Am fost asistentă la un club de robotică pentru gimnaziu timp de un an.",
    intendedUse:
      "Vreau să țin o clasă de JavaScript pentru elevii de clasa a VII-a, cu teme săptămânale și quiz-uri la final de capitol.",
    evidence:
      "Recomandare de la coordonatorul clubului de robotică; profil GitHub cu proiectele mele.",
    status: "pending",
    submittedAt: "2026-10-21T14:20:00+03:00",
  },
  {
    id: "app-2",
    fullName: "Cosmin Radulescu",
    email: "cosmin.r@exemplu.ro",
    phone: "0745 987 654",
    background:
      "Programator backend de 6 ani, voluntar la workshop-uri de programare în weekend.",
    intendedUse:
      "Un curs de Python pentru liceeni, cu accent pe proiecte mici și lucrul cu fișiere.",
    evidence: "Certificat de voluntariat de la asociația CodeKids.",
    status: "pending",
    submittedAt: "2026-10-19T09:05:00+03:00",
  },
  {
    id: "app-3",
    fullName: "Irina Pavel",
    email: "irina.pavel@exemplu.ro",
    phone: "0733 456 789",
    background: "Profesoară de matematică, interesată de predarea programării.",
    intendedUse: "Clasă de Scratch pentru clasele a V-a și a VI-a.",
    evidence: "",
    status: "needs_info",
    submittedAt: "2026-10-15T16:40:00+03:00",
    reviewNote:
      "Vă rugăm să ne spuneți la ce școală predați și dacă aveți experiență anterioară cu Scratch.",
  },
  {
    id: "app-4",
    fullName: "Mihai Dumitrescu",
    email: "mihai.dumitrescu@exemplu.ro",
    phone: "0756 111 222",
    background: "Inginer software, mentor voluntar din 2024.",
    intendedUse: "Clase de dezvoltare web pentru începători.",
    evidence: "Recomandare de la Ana Ionescu.",
    status: "approved",
    submittedAt: "2026-08-22T11:00:00+03:00",
    reviewNote: "Aprobat. Cont activat pe 25 august.",
  },
];
