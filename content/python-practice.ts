// Quiz-urile de exersare „Noțiuni de bază de Python”: câte unul pe capitol, între 5 și 10
// întrebări, fiecare cu 4 variante și o explicație. La întrebările cu `check: true`,
// varianta corectă este exact ce afișează codul; pnpm content:check rulează codul și verifică.

import type { QuizQuestionSource } from "./python-quizzes";

export type PracticeQuizSource = {
  slug: string;
  title: string;
  description: string;
  questions: QuizQuestionSource[];
};

const out = (
  code: string,
  options: string[],
  correct: number,
  explanation: string,
): QuizQuestionSource => ({
  prompt: "Ce afișează programul?",
  code,
  options,
  correct,
  explanation,
  check: true,
});

export const practiceQuizzes: PracticeQuizSource[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    slug: "variabile",
    title: "Exersare: Variabile și atribuire",
    description:
      "Verifică dacă știi cum primesc și cum își schimbă valorile variabilele.",
    questions: [
      out(
        `a = 4
b = a
a = 9
print(b)`,
        ["9", "4", "a", "13"],
        1,
        "`b = a` copiază valoarea pe care o avea `a` atunci (4); schimbarea ulterioară a lui `a` nu îl afectează pe `b`.",
      ),
      {
        prompt:
          "Ce se întâmplă la `print(punctaj)` dacă variabila `punctaj` nu a primit încă nicio valoare?",
        options: [
          "Se afișează 0",
          "Se afișează un rând gol",
          "Apare o eroare NameError",
          "Se afișează cuvântul punctaj",
        ],
        correct: 2,
        explanation:
          "O variabilă există abia după prima atribuire. Folosită înainte, Python oprește programul cu NameError.",
      },
      out(
        `x = 3
y = x * 2
x = y + 1
print(x, y)`,
        ["7 6", "3 6", "6 7", "7 7"],
        0,
        "`y` devine 6, apoi `x` primește `6 + 1`, adică 7. `y` rămâne 6.",
      ),
      out(
        `nume = "Radu"
mesaj = "Salut, " + nume
print(mesaj)`,
        ["Salut, nume", "Salut,Radu", "Salut, + Radu", "Salut, Radu"],
        3,
        "`nume` fără ghilimele înseamnă valoarea variabilei, iar `+` lipește cele două texte (spațiul e deja în primul).",
      ),
      out(
        `a, b, c = 1, 2, 3
a = c
c = b
print(a, b, c)`,
        ["1 2 3", "3 2 3", "3 2 2", "2 2 3"],
        2,
        "`a` primește valoarea lui `c` (3), apoi `c` primește valoarea lui `b` (2). `b` nu se schimbă.",
      ),
    ],
  },
  /* ------------------------------------------------------------------ 2 */
  {
    slug: "tipuri-de-date",
    title: "Exersare: Tipuri de date și type()",
    description:
      "Exersează recunoașterea tipurilor int, float, str și bool și folosirea lui type().",
    questions: [
      out(
        "print(type(42))",
        ["<class 'str'>", "<class 'int'>", "<class 'float'>", "42"],
        1,
        "42 este un număr întreg, deci tipul lui este `int`.",
      ),
      out(
        `print(type("3.5"))`,
        ["<class 'float'>", "<class 'int'>", "<class 'str'>", "3.5"],
        2,
        "Ghilimelele transformă valoarea în text, chiar dacă arată ca un număr: tipul este `str`.",
      ),
      out(
        "print(type(10 / 5))",
        ["<class 'float'>", "<class 'int'>", "2.0", "<class 'bool'>"],
        0,
        "Împărțirea cu `/` dă mereu un `float`, chiar și când rezultatul e un număr întreg (2.0).",
      ),
      {
        prompt: "Care dintre valorile de mai jos este de tip `int`?",
        options: ['"12"', "12.0", "-12", "1.2"],
        correct: 2,
        explanation:
          '-12 e un număr întreg. `12.0` și `1.2` au zecimale (float), iar `"12"` e text.',
      },
      out(
        `a = 5
b = 2.0
print(a * b)`,
        ["10", "7.0", "52.0", "10.0"],
        3,
        "Când într-o operație apare un `float`, rezultatul este tot `float`: 10.0.",
      ),
      out(
        "print(type(3 > 1))",
        ["True", "<class 'int'>", "<class 'bool'>", "<class 'str'>"],
        2,
        "O comparație dă `True` sau `False`, adică o valoare de tip `bool`.",
      ),
      out(
        `print("5" * 2)`,
        ["10", "55", "5 5", "eroare"],
        1,
        'Un text înmulțit cu un număr întreg se repetă: `"5" * 2` dă `"55"`.',
      ),
    ],
  },
  /* ------------------------------------------------------------------ 3 */
  {
    slug: "operatori",
    title: "Exersare: Operatori aritmetici (// % **)",
    description:
      "Calcule cu cât, rest, putere și ordinea operațiilor, ca în programele reale.",
    questions: [
      out(
        "print(23 // 4)",
        ["5.75", "5", "3", "6"],
        1,
        "`//` dă câtul împărțirii: 4 încape de 5 ori în 23.",
      ),
      out(
        "print(23 % 4)",
        ["3", "5", "0", "1"],
        0,
        "`%` dă restul: 23 = 4 · 5 + 3, deci restul este 3.",
      ),
      out(
        "print(3 ** 3)",
        ["9", "6", "27", "33"],
        2,
        "`**` ridică la putere: 3 · 3 · 3 = 27.",
      ),
      out(
        "print(2 + 3 * 4)",
        ["20", "14", "24", "9"],
        1,
        "Înmulțirea se face înaintea adunării: 3 · 4 = 12, apoi 2 + 12 = 14.",
      ),
      out(
        "print((2 + 3) * 4)",
        ["14", "24", "9", "20"],
        3,
        "Parantezele se calculează primele: 5 · 4 = 20.",
      ),
      out(
        "print(10 % 2)",
        ["5", "0", "2", "1"],
        1,
        "10 se împarte exact la 2, deci restul este 0. Așa recunoști numerele pare.",
      ),
      out(
        "print(9 // 2 * 2)",
        ["8", "9", "1", "4.5"],
        0,
        "Operațiile se fac de la stânga la dreapta: `9 // 2` dă 4, apoi 4 · 2 = 8.",
      ),
      {
        prompt: "Cum verifici dacă un număr `n` se împarte exact la 3?",
        options: [
          "`n // 3 == 0`",
          "`n / 3 == 0`",
          "`n ** 3 == 0`",
          "`n % 3 == 0`",
        ],
        correct: 3,
        explanation:
          "Un număr se împarte exact la 3 când restul împărțirii la 3 este 0.",
      },
      out(
        "print(2 ** 10)",
        ["20", "100", "1024", "512"],
        2,
        "2 înmulțit cu el însuși de 10 ori dă 1024.",
      ),
      out(
        `n = 157
print(n // 10 % 10)`,
        ["5", "15", "7", "1"],
        0,
        "`157 // 10` taie ultima cifră și dă 15, iar `15 % 10` păstrează ultima cifră: 5, adică cifra zecilor.",
      ),
    ],
  },
  /* ------------------------------------------------------------------ 4 */
  {
    slug: "comparatii",
    title: "Exersare: Comparații și operatori logici",
    description:
      "Exersează comparațiile și combinarea condițiilor cu and, or și not.",
    questions: [
      out(
        "print(8 >= 8)",
        ["False", "True", "8", "eroare"],
        1,
        "`>=` înseamnă „mai mare sau egal”, iar 8 este egal cu 8.",
      ),
      out(
        `a = 4
b = 9
print(a > 3 and b < 5)`,
        ["True", "9", "False", "4"],
        2,
        "`a > 3` e adevărat, dar `b < 5` e fals. `and` cere ca ambele să fie adevărate.",
      ),
      out(
        "print(not (5 == 5))",
        ["False", "True", "5", "None"],
        0,
        "`5 == 5` e `True`, iar `not` îl întoarce în `False`.",
      ),
      {
        prompt: "Care este diferența dintre `=` și `==`?",
        options: [
          "Nu există nicio diferență",
          "`==` atribuie o valoare, `=` compară",
          "`==` se folosește doar la texte",
          "`=` atribuie o valoare, `==` compară două valori",
        ],
        correct: 3,
        explanation:
          "`x = 5` pune 5 în `x`, iar `x == 5` întreabă dacă `x` este egal cu 5 și dă `True` sau `False`.",
      },
      out(
        `x = 0
print(x == 0 or x > 10)`,
        ["False", "0", "True", "x"],
        2,
        "`or` cere măcar o condiție adevărată; `x == 0` este adevărată.",
      ),
      out(
        `print("abc" == "ABC")`,
        ["True", "False", "abc", "eroare"],
        1,
        "La texte, Python face diferența între literele mari și cele mici.",
      ),
    ],
  },
  /* ------------------------------------------------------------------ 5 */
  {
    slug: "decizii",
    title: "Exersare: Decizii cu if/elif/else",
    description:
      "Urmărește pe ce ramură intră programul în funcție de valorile variabilelor.",
    questions: [
      out(
        `t = 25
if t > 30:
    print("caniculă")
elif t > 20:
    print("cald")
else:
    print("răcoare")`,
        ["caniculă", "răcoare", "cald", "nimic"],
        2,
        "25 nu e mai mare decât 30, dar e mai mare decât 20, deci se execută ramura `elif`.",
      ),
      out(
        `x = 7
if x > 5:
    print("A")
elif x > 3:
    print("B")`,
        ["A", "B", "A B", "nimic"],
        0,
        "Ambele condiții sunt adevărate, dar într-un lanț `if` / `elif` se execută doar prima ramură adevărată.",
      ),
      {
        prompt:
          "Câte ramuri dintr-un lanț `if` / `elif` / `else` se execută la o rulare?",
        options: [
          "Toate ramurile cu condiția adevărată",
          "Doar ramura `else`",
          "Exact una",
          "Cel puțin două",
        ],
        correct: 2,
        explanation:
          "Python verifică condițiile în ordine și execută prima ramură adevărată; dacă niciuna nu e adevărată, execută `else`.",
      },
      out(
        `n = 0
if n:
    print("da")
else:
    print("nu")`,
        ["da", "nu", "0", "eroare"],
        1,
        "Folosit ca o condiție, numărul 0 contează ca fals, deci se execută `else`.",
      ),
      out(
        `puncte = 45
if puncte >= 50:
    print("promovat")
else:
    print("mai încearcă")`,
        ["promovat", "45", "nimic", "mai încearcă"],
        3,
        "45 nu este mai mare sau egal cu 50, deci condiția e falsă și se execută `else`.",
      ),
      {
        prompt:
          "Ce lipsește din rândul `if x > 3` ca programul să funcționeze?",
        options: [
          "Două puncte la final: `if x > 3:`",
          "Paranteze: `if (x > 3)`",
          "Cuvântul `then` la final",
          "Un punct și virgulă la final",
        ],
        correct: 0,
        explanation:
          "Rândul cu `if` se termină cu `:`, iar instrucțiunile din ramură se scriu dedesubt, indentate.",
      },
      out(
        `a = 12
if a % 2 == 0 and a % 3 == 0:
    print("divizibil cu 6")
else:
    print("nu")`,
        ["nu", "divizibil cu 6", "12", "eroare"],
        1,
        "12 se împarte exact și la 2, și la 3, deci ambele condiții sunt adevărate.",
      ),
      out(
        `x = 3
if x > 1:
    x = x * 10
elif x > 2:
    x = x + 100
print(x)`,
        ["103", "130", "30", "3"],
        2,
        "Se execută doar prima ramură adevărată (`x > 1`), deci `x` devine 30, iar `elif` e sărit.",
      ),
    ],
  },
  /* ------------------------------------------------------------------ 6 */
  {
    slug: "conversii",
    title: "Exersare: input() și conversii (int, float, str)",
    description:
      "Exersează transformarea textelor în numere și invers, ca la citirea datelor.",
    questions: [
      out(
        `print(int("12") + 3)`,
        ["123", "15", "12 3", "eroare"],
        1,
        '`int("12")` transformă textul în numărul 12, iar 12 + 3 = 15.',
      ),
      out(
        `print("12" + str(3))`,
        ["15", "12 3", "123", "eroare"],
        2,
        '`str(3)` dă textul `"3"`, iar `+` între două texte le lipește.',
      ),
      out(
        `print(float("2.5") * 2)`,
        ["5.0", "2.52.5", "5", "eroare"],
        0,
        '`float("2.5")` dă numărul 2.5, iar 2.5 · 2 = 5.0.',
      ),
      out(
        "print(int(7.9))",
        ["8", "7.9", "7", "eroare"],
        2,
        "`int()` taie partea zecimală, nu rotunjește.",
      ),
      {
        prompt: "Ce tip are valoarea întoarsă de `input()`?",
        options: ["`int`", "`str`", "`float`", "`bool`"],
        correct: 1,
        explanation:
          "`input()` întoarce mereu text, chiar dacă utilizatorul scrie cifre.",
      },
      {
        prompt:
          'Programul are `varsta = input("Vârsta: ")`, iar mai jos `varsta + 1`. Ce se întâmplă?',
        options: [
          "Se adună 1 la vârstă",
          "Apare o eroare, pentru că se adună un text cu un număr",
          "Se lipește cifra 1 la finalul textului",
          "Vârsta devine 0",
        ],
        correct: 1,
        explanation:
          "`varsta` este text, iar Python nu adună un `str` cu un `int`. Trebuie întâi `int(varsta)`.",
      },
      {
        prompt: "Cum citești corect un număr întreg de la tastatură?",
        options: [
          '`n = input(int("n = "))`',
          '`n = str(input("n = "))`',
          '`n = input("n = ") + 0`',
          '`n = int(input("n = "))`',
        ],
        correct: 3,
        explanation:
          "Întâi `input()` citește textul, apoi `int()` îl transformă în număr.",
      },
      out(
        `print(int("3") * int("4"))`,
        ["34", "7", "12", "3333"],
        2,
        "Ambele texte devin numere, deci se face o înmulțire obișnuită: 3 · 4 = 12.",
      ),
      {
        prompt: 'Ce se întâmplă la `int("2.5")`?',
        options: ["Dă 2", "Dă 3", "Dă 2.5", "Apare o eroare ValueError"],
        correct: 3,
        explanation:
          '`int()` acceptă doar texte care arată ca un număr întreg. Pentru `"2.5"` se folosește `float()`.',
      },
    ],
  },
  /* ------------------------------------------------------------------ 7 */
  {
    slug: "while",
    title: "Exersare: Bucla while",
    description:
      "Urmărește pas cu pas cum se schimbă variabilele într-o buclă while.",
    questions: [
      out(
        `i = 1
while i <= 4:
    i = i + 1
print(i)`,
        ["4", "5", "1", "6"],
        1,
        "Bucla se oprește abia când `i <= 4` devine fals, adică atunci când `i` ajunge la 5.",
      ),
      out(
        `s = 0
k = 1
while k < 6:
    s = s + k
    k = k + 2
print(s)`,
        ["15", "6", "9", "5"],
        2,
        "`k` ia valorile 1, 3 și 5, deci `s` = 1 + 3 + 5 = 9.",
      ),
      {
        prompt:
          "Ce se întâmplă dacă în corpul unei bucle `while` variabila din condiție nu se schimbă niciodată?",
        options: [
          "Bucla poate rula la nesfârșit",
          "Bucla rulează o singură dată",
          "Python o oprește singur după 100 de pași",
          "Apare o eroare de sintaxă",
        ],
        correct: 0,
        explanation:
          "Dacă condiția e adevărată la început și nimic nu o schimbă, rămâne adevărată mereu: o buclă infinită.",
      },
      out(
        `n = 1234
cifre = 0
while n > 0:
    n = n // 10
    cifre = cifre + 1
print(cifre)`,
        ["1234", "3", "10", "4"],
        3,
        "Fiecare `n // 10` taie o cifră, iar bucla se repetă până rămâne 0: de 4 ori.",
      ),
      out(
        `x = 100
pasi = 0
while x > 10:
    x = x // 2
    pasi = pasi + 1
print(pasi, x)`,
        ["3 12", "4 6", "5 3", "4 12"],
        1,
        "`x` trece prin 50, 25, 12 și 6. După 4 pași, 6 nu mai e mai mare decât 10.",
      ),
    ],
  },
  /* ------------------------------------------------------------------ 8 */
  {
    slug: "liste",
    title: "Exersare: Liste (index, len, append, pop)",
    description:
      "Exersează accesul la elemente, lungimea listei și adăugarea sau scoaterea de elemente.",
    questions: [
      out(
        `culori = ["roșu", "verde", "albastru", "galben"]
print(culori[2])`,
        ["verde", "albastru", "galben", "roșu"],
        1,
        "Numărarea începe de la 0: `roșu` e 0, `verde` e 1, `albastru` e 2.",
      ),
      out(
        `v = [10, 20, 30]
print(v[-2])`,
        ["20", "10", "30", "-20"],
        0,
        "`[-1]` e ultimul element, iar `[-2]` e penultimul: 20.",
      ),
      out(
        `v = []
v.append(3)
v.append(7)
print(len(v))`,
        ["0", "10", "2", "1"],
        2,
        "Lista pornește goală și primește două elemente, deci `len()` dă 2.",
      ),
      out(
        `v = [5, 1, 8]
v.append(v[0] + v[2])
print(v)`,
        ["[5, 1, 8, 6]", "[13, 5, 1, 8]", "[5, 1, 8]", "[5, 1, 8, 13]"],
        3,
        "`v[0] + v[2]` este 5 + 8 = 13, iar `append()` îl adaugă la finalul listei.",
      ),
      out(
        `v = [4, 7, 2, 9]
x = v.pop(1)
print(x + len(v))`,
        ["11", "10", "9", "7"],
        1,
        "`pop(1)` scoate și întoarce elementul de pe poziția 1 (7); rămân 3 elemente, deci 7 + 3 = 10.",
      ),
      {
        prompt: "Ce se întâmplă la `v[3]` dacă `v = [1, 2, 3]`?",
        options: ["Dă 3", "Dă 0", "Apare o eroare IndexError", "Dă None"],
        correct: 2,
        explanation:
          "Lista are indicii 0, 1 și 2. Indexul 3 nu există, așa că Python oprește programul cu IndexError.",
      },
      out(
        `v = [2, 4, 6]
v[1] = 5
print(v)`,
        ["[5, 4, 6]", "[2, 4, 6]", "[2, 4, 5]", "[2, 5, 6]"],
        3,
        "`v[1] = 5` înlocuiește al doilea element (4) cu 5.",
      ),
      out(
        `v = [1, 2, 3]
v.pop()
v.pop()
print(v)`,
        ["[1]", "[3]", "[]", "[1, 2]"],
        0,
        "Fără argument, `pop()` scoate ultimul element. După două apeluri rămâne doar 1.",
      ),
      out(
        `v = [3, 9, 4]
print(v[len(v) - 1])`,
        ["3", "9", "eroare", "4"],
        3,
        "`len(v) - 1` este 2, adică indexul ultimului element.",
      ),
      {
        prompt:
          "Care este indexul ultimului element într-o listă cu 8 elemente?",
        options: ["8", "7", "9", "0"],
        correct: 1,
        explanation:
          "Indicii merg de la 0 la 7, deci ultimul este 7 (sau -1, numărând de la final).",
      },
    ],
  },
  /* ------------------------------------------------------------------ 9 */
  {
    slug: "siruri",
    title: "Exersare: Șiruri de caractere (index, len, find, in)",
    description:
      "Exersează lucrul cu literele unui text: poziții, lungime și căutare.",
    questions: [
      out(
        `s = "Laptop"
print(s[2])`,
        ["a", "t", "L", "p"],
        3,
        "Literele se numără de la 0: `L` e 0, `a` e 1, `p` e 2.",
      ),
      out(
        `s = "informatica"
print(len(s))`,
        ["10", "12", "11", "9"],
        2,
        "`len()` numără toate literele cuvântului: sunt 11.",
      ),
      out(
        `print("cartofi".find("to"))`,
        ["3", "2", "4", "-1"],
        0,
        "`find()` dă poziția unde începe `to`: c-0, a-1, r-2, t-3.",
      ),
      out(
        `print("mar" in "Marea")`,
        ["True", "False", "0", "-1"],
        1,
        "`in` face diferența între litere mari și mici: în `Marea` apare `Mar`, nu `mar`.",
      ),
      out(
        `s = "abc"
print(s[-1] + s[0])`,
        ["ca", "ac", "cb", "ba"],
        0,
        "`s[-1]` e ultima literă (`c`), `s[0]` e prima (`a`); `+` le lipește.",
      ),
      {
        prompt:
          'Ce se întâmplă la `s[0] = "X"` dacă `s` este un șir de caractere?',
        options: [
          "Prima literă devine X",
          "Se adaugă X la început",
          "Apare o eroare: un șir nu poate fi modificat pe loc",
          "Se șterge prima literă",
        ],
        correct: 2,
        explanation:
          'Șirurile nu se pot modifica literă cu literă. Se construiește un șir nou, de exemplu `"X" + s[1:]`.',
      },
      out(
        `s = "elev"
print(s.find("e"), s.find("v"))`,
        ["2 3", "1 4", "0 3", "0 2"],
        2,
        "`find()` dă prima apariție: primul `e` e pe poziția 0, iar `v` pe poziția 3.",
      ),
    ],
  },
  /* ----------------------------------------------------------------- 10 */
  {
    slug: "feliere",
    title: "Exersare: Felierea [a:b:pas] pe liste și șiruri",
    description:
      "Exersează extragerea unor bucăți din liste și texte cu [a:b:pas].",
    questions: [
      out(
        `v = [10, 20, 30, 40, 50]
print(v[1:3])`,
        ["[20, 30]", "[20, 30, 40]", "[10, 20, 30]", "[30, 40]"],
        0,
        "Felia pornește de la indexul 1 și se oprește înainte de indexul 3.",
      ),
      out(
        `s = "calculator"
print(s[:4])`,
        ["calcu", "alcu", "calc", "ator"],
        2,
        "Fără început, felia pornește de la 0 și ia literele de pe pozițiile 0–3.",
      ),
      out(
        `s = "calculator"
print(s[-3:])`,
        ["ato", "tor", "or", "lator"],
        1,
        "`[-3:]` pornește de la a treia literă de la final și merge până la capăt.",
      ),
      out(
        `v = [1, 2, 3, 4, 5, 6, 7]
print(v[::3])`,
        ["[3, 6]", "[1, 3, 5, 7]", "[1, 4]", "[1, 4, 7]"],
        3,
        "Pasul 3 ia un element din trei, pornind de la primul: indicii 0, 3 și 6.",
      ),
      out(
        `print("radar"[::-1] == "radar")`,
        ["False", "radar", "True", "eroare"],
        2,
        "`[::-1]` întoarce textul, iar `radar` citit invers este tot `radar`.",
      ),
      {
        prompt: "Ce elemente ia felia `v[2:5]`?",
        options: [
          "Pe cele cu indicii 2, 3, 4 și 5",
          "Pe cele cu indicii 2, 3 și 4",
          "Pe cele cu indicii 3, 4 și 5",
          "Primele 5 elemente",
        ],
        correct: 1,
        explanation:
          "Felia include indexul de început, dar se oprește înainte de indexul de final.",
      },
    ],
  },
  /* ----------------------------------------------------------------- 11 */
  {
    slug: "for-range",
    title: "Exersare: Bucla for și range()",
    description:
      "Exersează parcurgerea listelor și a textelor cu for și numărarea cu range().",
    questions: [
      out(
        `s = ""
for i in range(4):
    s = s + str(i)
print(s)`,
        ["1234", "6", "0 1 2 3", "0123"],
        3,
        "`range(4)` dă 0, 1, 2 și 3, iar fiecare cifră e lipită, ca text, la finalul lui `s`.",
      ),
      {
        prompt: "Ce valori ia `i` în `for i in range(1, 10, 3)`?",
        options: ["1, 4, 7, 10", "1, 4, 7", "1, 3, 6, 9", "3, 6, 9"],
        correct: 1,
        explanation:
          "Pornește de la 1 și crește din 3 în 3, fără să ajungă la 10.",
      },
      out(
        `total = 0
for x in [4, 1, 6]:
    total = total + x
print(total)`,
        ["6", "3", "11", "4"],
        2,
        "`for` trece pe rând prin 4, 1 și 6 și le adună: 11.",
      ),
      out(
        `n = 0
for i in range(5, 0, -1):
    n = n + 1
print(n, i)`,
        ["5 1", "5 0", "4 1", "6 0"],
        0,
        "`range(5, 0, -1)` dă 5, 4, 3, 2, 1: cinci pași, iar ultima valoare a lui `i` este 1.",
      ),
      out(
        `p = 1
for i in range(1, 5):
    p = p * i
print(p)`,
        ["10", "24", "120", "0"],
        1,
        "`i` ia valorile 1, 2, 3 și 4, deci `p` = 1 · 2 · 3 · 4 = 24.",
      ),
      {
        prompt: "De câte ori se execută corpul buclei `for i in range(4, 9)`?",
        options: ["4", "9", "5", "6"],
        correct: 2,
        explanation: "`i` ia valorile 4, 5, 6, 7 și 8, adică 9 − 4 = 5 valori.",
      },
      out(
        `litere = ""
for c in "python":
    if c in "aeiouy":
        litere = litere + c
print(litere)`,
        ["o", "oy", "pythn", "yo"],
        3,
        "Bucla trece prin litere în ordine și le păstrează doar pe cele din `aeiouy`: întâi `y`, apoi `o`.",
      ),
      out(
        `v = [3, 8, 2, 7]
pare = 0
for x in v:
    if x % 2 == 0:
        pare = pare + 1
print(pare)`,
        ["2", "10", "4", "1"],
        0,
        "Doar 8 și 2 au restul 0 la împărțirea cu 2, deci se numără două numere pare.",
      ),
      out(
        `numere = []
for i in range(0, 10, 4):
    numere.append(i)
print(numere)`,
        ["[4, 8]", "[0, 4, 8, 12]", "[0, 4, 8]", "[0, 4]"],
        2,
        "`range(0, 10, 4)` dă 0, 4 și 8; 12 depășește limita 10.",
      ),
    ],
  },
  /* ----------------------------------------------------------------- 12 */
  {
    slug: "functii",
    title: "Exersare: Funcții (def, parametri, return)",
    description:
      "Exersează definirea și apelarea funcțiilor și folosirea valorii întoarse.",
    questions: [
      out(
        `def patrat(x):
    return x * x

print(patrat(3) + patrat(2))`,
        ["13", "25", "10", "36"],
        0,
        "`patrat(3)` întoarce 9, `patrat(2)` întoarce 4, iar 9 + 4 = 13.",
      ),
      out(
        `def f(a, b):
    return a - b

print(f(2, 9))`,
        ["7", "11", "-7", "eroare"],
        2,
        "Argumentele se potrivesc cu parametrii în ordine: `a` = 2, `b` = 9, iar 2 − 9 = −7.",
      ),
      {
        prompt:
          "Ce întoarce o funcție care nu are nicio instrucțiune `return`?",
        options: ["0", "`None`", "Un șir gol", "Ultima valoare calculată"],
        correct: 1,
        explanation:
          "Fără `return`, funcția întoarce automat valoarea specială `None`.",
      },
      out(
        `def f():
    return 5
    print("după")

print(f())`,
        ["după", "None", "5 după", "5"],
        3,
        '`return` încheie imediat funcția, așa că rândul cu `print("după")` nu se mai execută.',
      ),
      out(
        `def par(n):
    return n % 2 == 0

print(par(7), par(10))`,
        ["True False", "False True", "False False", "1 0"],
        1,
        "Funcția întoarce rezultatul comparației: 7 e impar (`False`), 10 e par (`True`).",
      ),
      {
        prompt: "Care este diferența dintre un parametru și un argument?",
        options: [
          "Argumentul e numele din `def`, parametrul e valoarea trimisă",
          "Parametrii există doar la funcțiile fără `return`",
          "Parametrul e numele din `def`, argumentul e valoarea trimisă la apel",
          "Nu există nicio diferență",
        ],
        correct: 2,
        explanation:
          "În `def dublu(x)`, `x` e parametru; în `dublu(4)`, 4 este argumentul care ajunge în `x`.",
      },
      out(
        `def semn(n):
    if n < 0:
        return "negativ"
    return "pozitiv"

print(semn(-3), semn(0))`,
        ["negativ pozitiv", "negativ negativ", "pozitiv pozitiv", "eroare"],
        0,
        "Pentru −3 condiția e adevărată; pentru 0 nu este, așa că se ajunge la al doilea `return`.",
      ),
      out(
        `x = 1

def schimba():
    x = 50
    return x

print(schimba(), x)`,
        ["50 50", "50 1", "1 1", "1 50"],
        1,
        "`x` din funcție este o variabilă locală, separată de `x`-ul din afară, care rămâne 1.",
      ),
    ],
  },
  /* ----------------------------------------------------------------- 13 */
  {
    slug: "dictionare",
    title: "Exersare: Dicționare (chei, items, del, pop)",
    description:
      "Exersează lucrul cu perechi cheie–valoare: citire, modificare, ștergere și parcurgere.",
    questions: [
      out(
        `elev = {"nume": "Dan", "clasa": 9}
print(elev["clasa"])`,
        ["nume", "9", "Dan", "clasa"],
        1,
        "Între paranteze drepte se pune cheia, iar rezultatul este valoarea ei: 9.",
      ),
      out(
        `d = {"x": 1, "y": 2, "z": 3}
print(len(d))`,
        ["6", "2", "1", "3"],
        3,
        "La un dicționar, `len()` numără perechile cheie–valoare: sunt 3.",
      ),
      out(
        `d = {"x": 1}
d["y"] = 4
d["x"] = d["x"] + 10
print(d)`,
        [
          "{'x': 11, 'y': 4}",
          "{'x': 1, 'y': 4}",
          "{'x': 11}",
          "{'y': 4, 'x': 11}",
        ],
        0,
        "Se adaugă cheia `y`, apoi valoarea lui `x` crește la 11. Cheile își păstrează ordinea în care au fost adăugate.",
      ),
      out(
        `stoc = {"mere": 5, "pere": 0}
print("pere" in stoc, "kiwi" in stoc)`,
        ["False False", "True True", "True False", "False True"],
        2,
        "`in` verifică dacă cheia există, indiferent de valoare. `pere` există (chiar cu valoarea 0), `kiwi` nu.",
      ),
      out(
        `d = {"a": 3, "b": 7}
print(list(d.keys()))`,
        ["[3, 7]", "['a', 'b']", "a b", "['a', 3, 'b', 7]"],
        1,
        "`keys()` dă cheile dicționarului, iar `list()` le pune într-o listă.",
      ),
      out(
        `d = {"a": 2, "b": 5}
cel_mare = ""
for k, v in d.items():
    if v > 3:
        cel_mare = k
print(cel_mare)`,
        ["a", "5", "b", "2"],
        2,
        "`items()` dă perechi (cheie, valoare). Doar `b` are valoarea mai mare decât 3, iar în variabilă se păstrează cheia.",
      ),
      out(
        `d = {"Ana": 9, "Ion": 7}
nota = d.pop("Ana")
print(nota, len(d))`,
        ["Ana 1", "9 2", "7 1", "9 1"],
        3,
        '`pop("Ana")` scoate perechea și întoarce valoarea 9; în dicționar mai rămâne o pereche.',
      ),
      {
        prompt:
          'Ce se întâmplă la `d["w"]` dacă cheia `"w"` nu există în dicționar?',
        options: [
          "Se întoarce None",
          "Apare o eroare KeyError",
          "Se creează cheia cu valoarea 0",
          "Se întoarce un șir gol",
        ],
        correct: 1,
        explanation:
          "Citirea unei chei care nu există oprește programul cu KeyError. Verifică întâi cu `in`.",
      },
      out(
        `d = {"a": 1, "b": 2, "c": 3}
del d["b"]
print(list(d.values()))`,
        ["[1, 3]", "[1, 2, 3]", "['a', 'c']", "[2]"],
        0,
        "`del` șterge perechea `b: 2`, iar `values()` dă valorile rămase: 1 și 3.",
      ),
      {
        prompt: "Pot exista două chei identice în același dicționar?",
        options: [
          "Da, se păstrează amândouă",
          "Da, dar doar dacă valorile sunt numere",
          "Nu, iar programul se oprește cu eroare",
          "Nu: cheile sunt unice, iar o atribuire nouă înlocuiește valoarea veche",
        ],
        correct: 3,
        explanation:
          'Fiecare cheie apare o singură dată. `d["a"] = 5` pe o cheie existentă doar îi schimbă valoarea.',
      },
    ],
  },
  /* ----------------------------------------------------------------- 14 */
  {
    slug: "random",
    title: "Exersare: Module: random și import",
    description:
      "Verifică dacă știi să imporți un modul și ce valori pot da funcțiile din random.",
    questions: [
      {
        prompt: "Ce valori poate întoarce `random.randint(1, 6)`?",
        options: [
          "Orice număr întreg de la 1 la 5",
          "Doar 1 sau 6",
          "Orice număr întreg de la 1 la 6, inclusiv 6",
          "Un număr cu zecimale între 1 și 6",
        ],
        correct: 2,
        explanation:
          "Spre deosebire de `range()`, `randint(a, b)` include și capătul `b`.",
      },
      {
        prompt:
          "Ce rând trebuie să apară în program înainte de a folosi `random.choice(...)`?",
        options: [
          "`import random`",
          "`include random`",
          "`using random`",
          "Niciunul, `random` e mereu disponibil",
        ],
        correct: 0,
        explanation:
          "Modulele se încarcă cu `import`. Abia după aceea poți scrie `random.` în fața funcțiilor din modul.",
      },
      {
        prompt: "Ce poate afișa programul?",
        code: `import random
culori = ["roșu", "verde", "albastru"]
print(random.choice(culori))`,
        options: [
          "Toată lista",
          "Mereu „roșu”, primul element",
          "Un număr între 0 și 2",
          "Una dintre cele trei culori, aleasă la întâmplare",
        ],
        correct: 3,
        explanation:
          "`choice()` alege la întâmplare un element din listă, deci la fiecare rulare poate apărea altă culoare.",
      },
      {
        prompt: "Ce afișează programul, indiferent de numărul ales?",
        code: `from random import randint
x = randint(10, 20)
print(x >= 10 and x <= 20)`,
        options: [
          "Uneori True, alteori False",
          "Mereu False",
          "Mereu True",
          "Un număr între 10 și 20",
        ],
        correct: 2,
        explanation:
          "`randint(10, 20)` dă mereu un număr între 10 și 20 inclusiv, deci condiția e mereu adevărată. Cu `from ... import` funcția se scrie fără `random.`.",
      },
      {
        prompt: "Ce face `random.shuffle(lista)`?",
        options: [
          "Întoarce un element ales la întâmplare",
          "Amestecă elementele listei, chiar în lista dată",
          "Sortează lista crescător",
          "Șterge un element la întâmplare",
        ],
        correct: 1,
        explanation:
          "`shuffle()` schimbă ordinea elementelor direct în listă și nu întoarce o listă nouă.",
      },
    ],
  },
  /* ----------------------------------------------------------------- 15 */
  {
    slug: "fisiere",
    title: "Exersare: Fișiere (open cu w/a/r, with, readlines)",
    description:
      "Exersează scrierea, adăugarea și citirea datelor din fișiere text.",
    questions: [
      out(
        `with open("salut.txt", "w") as f:
    f.write("Bună ziua")
with open("salut.txt", "r") as f:
    print(f.read())`,
        ["salut.txt", "f", "Bună ziua", "nimic"],
        2,
        "Primul bloc scrie textul în fișier, iar al doilea îl citește întreg cu `read()` și îl afișează.",
      ),
      out(
        `with open("a.txt", "w") as f:
    f.write("unu")
with open("a.txt", "w") as f:
    f.write("doi")
with open("a.txt") as f:
    print(f.read())`,
        ["unudoi", "unu", "doi", "unu doi"],
        2,
        "Modul `w` golește fișierul la deschidere, așa că a doua scriere îl înlocuiește pe `unu`.",
      ),
      out(
        `with open("numere.txt", "w") as f:
    f.write("3\\n5\\n8\\n")
total = 0
with open("numere.txt") as f:
    for rand in f.readlines():
        total = total + int(rand)
print(total)`,
        ["16", "358", "3", "eroare"],
        0,
        "`readlines()` dă rândurile ca texte, iar `int()` le transformă în numere: 3 + 5 + 8 = 16.",
      ),
      {
        prompt:
          'Ce se întâmplă dacă deschizi cu modul `"r"` un fișier care nu există?',
        options: [
          "Se creează un fișier gol",
          "Apare o eroare FileNotFoundError",
          "Se citește un șir gol",
          "Python așteaptă să apară fișierul",
        ],
        correct: 1,
        explanation:
          "Modul `r` doar citește. Fișierul trebuie să existe, altfel apare FileNotFoundError; `w` și `a` îl creează.",
      },
      out(
        `with open("c.txt", "w") as f:
    f.write("ab\\n")
with open("c.txt", "a") as f:
    f.write("cd\\n")
with open("c.txt") as f:
    print(f.readlines())`,
        ["['ab', 'cd']", "['cd\\n']", "['abcd']", "['ab\\n', 'cd\\n']"],
        3,
        "Modul `a` adaugă la final, iar `readlines()` păstrează caracterul `\\n` de la capătul fiecărui rând.",
      ),
      {
        prompt: "Ce fel de valoare primește `f.write()`?",
        options: [
          "Un șir de caractere; numerele se transformă întâi cu `str()`",
          "Orice valoare, inclusiv numere",
          "Doar o listă de rânduri",
          "Numele fișierului",
        ],
        correct: 0,
        explanation:
          "`write()` scrie doar text. `f.write(5)` dă eroare, dar `f.write(str(5))` funcționează.",
      },
      out(
        `with open("n.txt", "w") as f:
    for i in range(3):
        f.write(str(i))
with open("n.txt") as f:
    print(f.read())`,
        ["0 1 2", "3", "123", "012"],
        3,
        "`write()` nu adaugă spații sau rânduri noi, deci cifrele 0, 1 și 2 ajung lipite.",
      ),
    ],
  },
];
