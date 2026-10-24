// Quiz-urile de recapitulare ale cursului „Introducere în Python”: câte 10 întrebări pe
// lecție, fiecare cu 4 variante și o explicație. La întrebările cu `check: true`, varianta
// corectă este exact ce afișează codul; pnpm content:check rulează codul și verifică.

export type QuizQuestionSource = {
  prompt: string;
  code?: string;
  options: string[];
  correct: number;
  explanation: string;
  /** Varianta corectă = ce afișează `code` (verificat cu Python). */
  check?: boolean;
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

export const quizzes: Record<string, QuizQuestionSource[]> = {
  /* ------------------------------------------------------------------ 1 */
  variabile: [
    out(
      `x = 5
x = x + 2
print(x)`,
      ["5", "x + 2", "7", "52"],
      2,
      "Întâi se calculează `x + 2` (adică 7), apoi rezultatul se pune înapoi în `x`.",
    ),
    {
      prompt: "Ce tip are valoarea `3.14`?",
      options: ["int", "float", "str", "bool"],
      correct: 1,
      explanation:
        "Numerele cu zecimale sunt `float`. În cod, zecimalele se scriu cu punct.",
    },
    {
      prompt: 'Ce tip are valoarea `"7"`?',
      options: ["str", "int", "float", "bool"],
      correct: 0,
      explanation: "Ghilimelele fac din 7 un text, deci tipul e `str`.",
    },
    out(
      "print(type(True))",
      ["True", "<class 'str'>", "<class 'int'>", "<class 'bool'>"],
      3,
      "`True` și `False` sunt valori de tip `bool`.",
    ),
    {
      prompt: "Care nume de variabilă este valid în Python?",
      options: ["1scor", "scor total", "scor_1", "scor-1"],
      correct: 2,
      explanation:
        "Un nume nu poate începe cu o cifră și nu poate conține spații sau cratimă; `_` e permis.",
    },
    out(
      `a = "7"
b = "1"
print(a + b)`,
      ["8", "71", "7 1", "eroare"],
      1,
      '`a` și `b` sunt texte, iar `+` lipește textele: `"7" + "1"` dă `"71"`.',
    ),
    {
      prompt: "Ce face semnul `=` în `scor = 10`?",
      options: [
        "Pune valoarea 10 în variabila `scor`",
        "Verifică dacă `scor` e egal cu 10",
        "Afișează 10 pe ecran",
        "Compară două numere",
      ],
      correct: 0,
      explanation:
        "`=` înseamnă atribuire: valoarea din dreapta intră în cutia din stânga. Comparația se scrie `==`.",
    },
    out(
      `Scor = 3
scor = 5
print(Scor)`,
      ["5", "8", "eroare", "3"],
      3,
      "Python face diferența între litere mari și mici: `Scor` și `scor` sunt două variabile diferite.",
    ),
    out(
      `print("Am", 15, "ani")`,
      ["Am15ani", "Am 15 ani", "Am, 15, ani", '"Am" 15 "ani"'],
      1,
      "`print()` pune singur câte un spațiu între valorile separate prin virgulă.",
    ),
    out(
      `a = 3
b = 8
a, b = b, a
print(a, b)`,
      ["3 8", "8 8", "8 3", "3 3"],
      2,
      "`a, b = b, a` schimbă valorile între ele într-un singur rând.",
    ),
  ],

  /* ------------------------------------------------------------------ 2 */
  operatori: [
    out(
      "print(7 // 2)",
      ["3.5", "3", "1", "4"],
      1,
      "`//` dă câtul: de câte ori încape 2 în 7, adică de 3 ori.",
    ),
    out(
      "print(17 % 5)",
      ["3", "12", "2", "3.4"],
      2,
      "`%` dă restul: 17 = 5 · 3 + 2, deci restul e 2.",
    ),
    out(
      "print(2 ** 4)",
      ["16", "8", "6", "24"],
      0,
      "`**` ridică la putere: 2 · 2 · 2 · 2 = 16.",
    ),
    out(
      "print(2 + 3 * 4)",
      ["20", "24", "9", "14"],
      3,
      "Înmulțirea se face înaintea adunării: 3 · 4 = 12, plus 2 = 14.",
    ),
    out(
      "print(7 / 2)",
      ["3", "4", "3.5", "1"],
      2,
      "Împărțirea cu `/` dă mereu un număr cu zecimale.",
    ),
    out(
      "print(5 != 3)",
      ["False", "True", "2", "eroare"],
      1,
      "`!=` întreabă „sunt diferite?”. 5 și 3 sunt diferite, deci `True`.",
    ),
    out(
      "print(True and False)",
      ["False", "True", "None", "eroare"],
      0,
      "`and` cere ca ambele condiții să fie adevărate.",
    ),
    out(
      "print(not (3 > 5))",
      ["False", "3", "True", "5"],
      2,
      "`3 > 5` e `False`, iar `not` îl întoarce pe dos: `True`.",
    ),
    {
      prompt: "Cum verifici că un număr `n` este par?",
      options: ["n / 2 == 0", "n // 2 == 1", "n = 2", "n % 2 == 0"],
      correct: 3,
      explanation: "Un număr e par când restul împărțirii la 2 este 0.",
    },
    out(
      `varsta = 14
print(varsta > 12 or varsta < 5)`,
      ["True", "False", "14", "eroare"],
      0,
      "`or` cere măcar o condiție adevărată; `varsta > 12` este adevărată.",
    ),
  ],

  /* ------------------------------------------------------------------ 3 */
  "decizii-if": [
    out(
      `nota = 6
if nota >= 9:
    print("Excelent")
elif nota >= 5:
    print("Ai trecut")
else:
    print("Mai încearcă")`,
      ["Excelent", "Ai trecut", "Mai încearcă", "nimic"],
      1,
      "Prima condiție e falsă (6 < 9), a doua e adevărată, deci se execută ramura ei.",
    ),
    {
      prompt: "Câte mesaje afișează programul?",
      code: `x = 10
if x > 5:
    print("mare")
if x > 8:
    print("foarte mare")`,
      options: ["0", "1", "2", "eroare"],
      correct: 2,
      explanation:
        "Sunt două `if`-uri separate (nu `elif`), deci amândouă se verifică, iar ambele condiții sunt adevărate.",
    },
    {
      prompt: "Ce se întâmplă dacă uiți cele două puncte de după `if a > b`?",
      options: [
        "Programul afișează un avertisment, dar merge",
        "Condiția devine mereu adevărată",
        "Se execută ramura `else`",
        "Apare o eroare de sintaxă și programul nu pornește",
      ],
      correct: 3,
      explanation:
        "`:` de la finalul rândului cu `if` e obligatoriu; fără el, Python nu poate rula programul.",
    },
    {
      prompt: "Câte spații se folosesc de obicei pentru indentare în Python?",
      options: ["4", "2", "8", "Nu contează, nici nu e nevoie de ele"],
      correct: 0,
      explanation:
        "Convenția e de 4 spații. Indentarea arată ce instrucțiuni țin de `if`.",
    },
    out(
      `a = 15
if a % 2 == 0:
    print("par")
else:
    print("impar")`,
      ["par", "impar", "15", "nimic"],
      1,
      "15 % 2 este 1, nu 0, deci condiția e falsă și se execută `else`.",
    ),
    {
      prompt: "Într-un lanț `if` / `elif` / `else`, câte ramuri se execută?",
      options: [
        "Toate cele adevărate",
        "Mereu ultima",
        "Doar prima ramură adevărată (sau `else`, dacă niciuna nu e)",
        "Toate, în ordine",
      ],
      correct: 2,
      explanation:
        "Python verifică de sus în jos și se oprește la prima condiție adevărată.",
    },
    out(
      `soare = False
if soare:
    print("plajă")
else:
    print("film")`,
      ["film", "plajă", "False", "eroare"],
      0,
      "`soare` e `False`, deci se execută ramura `else`.",
    ),
    out(
      `ora = 20
if ora >= 6 and ora <= 11:
    print(1)
elif ora >= 12 and ora <= 18:
    print(2)
else:
    print(3)`,
      ["1", "2", "20", "3"],
      3,
      "20 nu e în niciunul dintre primele două intervale, deci se ajunge la `else`.",
    ),
    {
      prompt: "Cum scrii mai scurt `if gata == True:`?",
      options: ["if gata = True:", "if gata:", "if True:", "if gata == :"],
      correct: 1,
      explanation:
        "`gata` e deja `True` sau `False`, deci poate sta direct după `if`.",
    },
    out(
      `nota = 10
if nota >= 5:
    print("Ai trecut")
elif nota >= 9:
    print("Excelent")`,
      ["Excelent", "Ai trecut", "nimic", "eroare"],
      1,
      "Ordinea contează: prima condiție (`nota >= 5`) e deja adevărată, așa că a doua nu mai e verificată.",
    ),
  ],

  /* ------------------------------------------------------------------ 4 */
  "input-si-while": [
    {
      prompt: "Ce tip de valoare întoarce `input()`?",
      options: ["int", "Depinde ce scrie utilizatorul", "float", "str"],
      correct: 3,
      explanation: "`input()` întoarce mereu text, chiar dacă scrii cifre.",
    },
    {
      prompt: "Utilizatorul scrie `5`. Ce afișează programul?",
      code: `x = input()
print(x + x)`,
      options: ["10", "55", "x + x", "eroare"],
      correct: 1,
      explanation:
        '`x` e textul `"5"`, iar `+` lipește textele: `"5" + "5"` dă `"55"`.',
    },
    out(
      `i = 0
while i < 3:
    i = i + 1
print(i)`,
      ["2", "3", "4", "0"],
      1,
      "Bucla se oprește când `i` ajunge 3, pentru că `3 < 3` e fals.",
    ),
    out(
      `n = 5
suma = 0
while n > 0:
    suma = suma + n
    n = n - 2
print(suma)`,
      ["9", "15", "8", "5"],
      0,
      "Se adună 5, 3 și 1: suma e 9. Apoi `n` devine -1 și bucla se oprește.",
    ),
    {
      prompt:
        "Ce se întâmplă dacă într-un `while` nu schimbi niciodată variabila din condiție, iar condiția e adevărată?",
      options: [
        "Bucla rulează o singură dată",
        "Python o oprește singur după 10 pași",
        "Bucla nu se mai oprește (buclă infinită)",
        "Apare o eroare de sintaxă",
      ],
      correct: 2,
      explanation:
        "Condiția rămâne mereu adevărată, deci bucla se repetă la nesfârșit.",
    },
    {
      prompt: "Cum transformi răspunsul de la `input()` într-un număr întreg?",
      options: [
        "int(input())",
        "str(input())",
        "input(int)",
        "number(input())",
      ],
      correct: 0,
      explanation:
        "`int()` transformă textul în număr întreg; pentru zecimale folosești `float()`.",
    },
    out(
      `x = 1
while x < 20:
    x = x * 3
print(x)`,
      ["9", "20", "3", "27"],
      3,
      "x ia valorile 1, 3, 9, 27. Când e 27, condiția `27 < 20` e falsă.",
    ),
    out(
      `mere = 3
while mere > 0:
    mere = mere - 1
print("Gata", mere)`,
      ["Gata 3", "Gata 0", "Gata 1", "Gata -1"],
      1,
      "Bucla scade câte un măr până rămân 0, apoi afișează mesajul.",
    ),
    {
      prompt: "Cu ce oprești un program blocat într-o buclă infinită?",
      options: ["Ctrl+Z", "Enter", "Ctrl+C", "Ctrl+S"],
      correct: 2,
      explanation: "Ctrl+C întrerupe programul care rulează în terminal.",
    },
    out(
      `i = 10
while i < 5:
    print(i)
print("final")`,
      ["10", "final", "nimic", "eroare"],
      1,
      "Condiția `10 < 5` e falsă de la început, deci bucla nu rulează deloc.",
    ),
  ],

  /* ------------------------------------------------------------------ 5 */
  liste: [
    out(
      `fructe = ["măr", "banană", "kiwi"]
print(fructe[1])`,
      ["măr", "banană", "kiwi", "eroare"],
      1,
      "Indexul începe de la 0, deci `[1]` e al doilea element.",
    ),
    out(
      `fructe = ["măr", "banană", "kiwi"]
print(fructe[-1])`,
      ["kiwi", "măr", "banană", "eroare"],
      0,
      "Indicii negativi numără de la final: `[-1]` e ultimul element.",
    ),
    out(
      `numere = [4, 8, 15]
print(len(numere))`,
      ["2", "15", "27", "3"],
      3,
      "`len()` numără elementele: sunt trei.",
    ),
    out(
      `lista = [1, 2]
lista.append(5)
print(lista)`,
      ["[5, 1, 2]", "[1, 2, 5]", "[1, 5, 2]", "[1, 2]"],
      1,
      "`append()` adaugă la sfârșitul listei.",
    ),
    out(
      `lista = [3, 6, 9]
x = lista.pop()
print(x, lista)`,
      ["3 [6, 9]", "9 [3, 6, 9]", "9 [3, 6]", "6 [3, 9]"],
      2,
      "`pop()` scoate ultimul element și ți-l dă înapoi.",
    ),
    {
      prompt: "Lista are 3 elemente. Ce eroare primești la `lista[3]`?",
      options: ["KeyError", "TypeError", "Niciuna, dă `None`", "IndexError"],
      correct: 3,
      explanation:
        "Indicii valizi sunt 0, 1 și 2; `[3]` iese din listă: `IndexError: list index out of range`.",
    },
    out(
      `lista = ["a", "b", "c"]
lista.pop(0)
print(lista)`,
      ["['b', 'c']", "['a', 'b']", "['a', 'c']", "['a', 'b', 'c']"],
      0,
      "`pop(0)` scoate elementul de la indexul 0, adică primul.",
    ),
    {
      prompt: "Care este indexul primului element dintr-o listă?",
      options: ["1", "-1", "0", "Depinde de listă"],
      correct: 2,
      explanation: "În Python, numărătoarea indicilor începe mereu de la 0.",
    },
    out(
      `note = [9, 7, 10]
suma = 0
i = 0
while i < len(note):
    suma = suma + note[i]
    i = i + 1
print(suma)`,
      ["26", "3", "10", "9"],
      0,
      "Bucla trece prin toate cele trei note și le adună: 9 + 7 + 10 = 26.",
    ),
    out(
      "print(type([1, 2]))",
      ["<class 'int'>", "<class 'list'>", "[1, 2]", "<class 'str'>"],
      1,
      "Valorile între paranteze drepte sunt liste: tipul `list`.",
    ),
  ],

  /* ------------------------------------------------------------------ 6 */
  siruri: [
    out(
      `text = "Python"
print(text[0])`,
      ["y", "P", "Python", "n"],
      1,
      "Prima literă are indexul 0.",
    ),
    out(
      `text = "Python"
print(text[-1])`,
      ["n", "P", "o", "eroare"],
      0,
      "`[-1]` e ultima literă.",
    ),
    out(
      `text = "Hello there"
print(text[0:4])`,
      ["Hello", "ello", "Hell", "Hel"],
      2,
      "Felia ia indicii 0, 1, 2 și 3; indexul 4 nu intră.",
    ),
    out(
      `print("ha" * 3)`,
      ["ha3", "ha ha ha", "eroare", "hahaha"],
      3,
      "Un șir înmulțit cu un număr se repetă, lipit.",
    ),
    out(
      `print(len("salut"))`,
      ["4", "5", "6", "salut"],
      1,
      "„salut” are 5 litere.",
    ),
    out(
      `print("banana".find("na"))`,
      ["2", "4", "1", "-1"],
      0,
      "„na” apare prima dată de la indexul 2: b(0) a(1) n(2).",
    ),
    out(
      `print("test".find("x"))`,
      ["0", "None", "-1", "eroare"],
      2,
      "Când nu găsește nimic, `find()` întoarce -1.",
    ),
    {
      prompt: 'Ce se întâmplă la `"Am " + 15`?',
      options: [
        "Se afișează Am 15",
        "Se obține „Am15”",
        "Apare o eroare: nu poți lipi text cu un număr",
        "Se obține 15",
      ],
      correct: 2,
      explanation: 'Textul se lipește doar cu text. Corect: `"Am " + str(15)`.',
    },
    out(
      `print("es" in "test")`,
      ["True", "False", "1", "es"],
      0,
      "`in` verifică dacă un șir apare în altul.",
    ),
    out(
      `text = "programare"
print(text[3:6])`,
      ["ogr", "gra", "gram", "ram"],
      1,
      "Indicii 3, 4 și 5 sunt literele g, r, a.",
    ),
  ],

  /* ------------------------------------------------------------------ 7 */
  functii: [
    {
      prompt: "De câte ori apare „Salut!” pe ecran?",
      code: `def salut():
    print("Salut!")

salut()
salut()`,
      options: ["0", "1", "3", "2"],
      correct: 3,
      explanation:
        "`def` doar definește funcția; ea rulează la fiecare apel, iar aici sunt două apeluri.",
    },
    {
      prompt: "Ce face cuvântul `def`?",
      options: [
        "Rulează imediat codul funcției",
        "Definește o funcție, care rulează abia când o apelezi",
        "Șterge o funcție",
        "Importă o funcție din alt fișier",
      ],
      correct: 1,
      explanation:
        "Cu `def` îi înveți programului rețeta; o folosești când o apelezi pe nume.",
    },
    out(
      `def dublu(x):
    return x * 2

print(dublu(4) + 1)`,
      ["8", "9", "41", "eroare"],
      1,
      "`dublu(4)` întoarce 8, iar 8 + 1 = 9.",
    ),
    {
      prompt: "Ce afișează a doua linie a programului?",
      code: `def dublu(x):
    print(x * 2)

r = dublu(3)
print(r)`,
      options: ["6", "3", "None", "eroare"],
      correct: 2,
      explanation:
        "Funcția doar afișează 6, fără `return`, deci întoarce `None`.",
    },
    {
      prompt:
        "Cum se numește variabila din parantezele unei funcții, care primește valoarea la apel?",
      options: ["Parametru", "Modul", "Return", "Bucla"],
      correct: 0,
      explanation: "În `def salut(nume):`, `nume` este un parametru.",
    },
    out(
      `def maxim(a, b):
    if a > b:
        return a
    return b

print(maxim(3, 11))`,
      ["3", "11", "a", "14"],
      1,
      "3 nu e mai mare decât 11, deci se ajunge la `return b`.",
    ),
    out(
      `def f(n):
    return n + 1

print(f(f(2)))`,
      ["3", "2", "5", "4"],
      3,
      "`f(2)` dă 3, iar `f(3)` dă 4.",
    ),
    {
      prompt: "Ce se întâmplă când o funcție ajunge la `return`?",
      options: [
        "Continuă cu rândurile următoare din funcție",
        "Se reia de la început",
        "Se oprește și trimite valoarea înapoi",
        "Afișează valoarea pe ecran",
      ],
      correct: 2,
      explanation:
        "`return` încheie funcția și dă rezultatul înapoi programului.",
    },
    out(
      `def salut(nume):
    return "Salut, " + nume + "!"

print(salut("Ioana"))`,
      ["Salut, Ioana!", "Salut, nume!", "Ioana", "Salut,Ioana!"],
      0,
      "Parametrul `nume` primește textul „Ioana”, care e lipit în mesaj.",
    ),
    {
      prompt: "De ce folosim funcții?",
      options: [
        "Ca programul să ruleze mai repede",
        "Ca să nu repetăm același cod și să-l reparăm într-un singur loc",
        "Pentru că Python nu merge fără funcții",
        "Ca să ascundem codul de alți programatori",
      ],
      correct: 1,
      explanation:
        "Funcțiile organizează codul: îl scrii o dată și îl folosești de câte ori ai nevoie.",
    },
  ],

  /* ------------------------------------------------------------------ 8 */
  "for-si-range": [
    {
      prompt: "Ce numere generează `range(3)`?",
      options: ["1, 2, 3", "0, 1, 2, 3", "0, 1, 2", "3"],
      correct: 2,
      explanation: "`range(n)` pornește de la 0 și se oprește înainte de n.",
    },
    {
      prompt: "Ce numere dă `range(2, 6)`?",
      options: ["2, 3, 4, 5", "2, 3, 4, 5, 6", "3, 4, 5", "2, 6"],
      correct: 0,
      explanation: "De la 2 inclusiv până la 6, fără 6.",
    },
    out(
      "print(list(range(1, 9, 3)))",
      ["[1, 4, 7]", "[1, 3, 9]", "[3, 6, 9]", "[1, 4, 7, 10]"],
      0,
      "Pornește de la 1, din 3 în 3, și se oprește înainte de 9.",
    ),
    out(
      `suma = 0
for i in range(1, 5):
    suma = suma + i
print(suma)`,
      ["15", "4", "10", "5"],
      2,
      "Se adună 1, 2, 3 și 4 (fără 5): suma e 10.",
    ),
    out(
      `nr = 0
for litera in "banana":
    if litera == "a":
        nr = nr + 1
print(nr)`,
      ["2", "3", "6", "1"],
      1,
      "`for` trece pe rând prin fiecare literă; „a” apare de 3 ori.",
    ),
    out(
      `numere = [5, 2, 9]
print(numere[::-1])`,
      ["[5, 2, 9]", "[2, 5, 9]", "[9, 5, 2]", "[9, 2, 5]"],
      3,
      "`[::-1]` parcurge lista de la coadă la cap.",
    ),
    out(
      `lista = ["a", "c"]
lista.insert(1, "b")
print(lista)`,
      ["['a', 'c', 'b']", "['a', 'b', 'c']", "['b', 'a', 'c']", "['a', 'b']"],
      1,
      "`insert(1, x)` pune `x` la poziția 1 și împinge restul la dreapta.",
    ),
    out(
      `print("exemplu"[0:7:2])`,
      ["eepu", "xml", "exem", "eemu"],
      0,
      "Pasul 2 ia indicii 0, 2, 4 și 6: e, e, p, u.",
    ),
    out(
      "print(min([4, 1, 7]), max([4, 1, 7]))",
      ["4 7", "1 4", "7 1", "1 7"],
      3,
      "`min()` dă cel mai mic element, `max()` pe cel mai mare.",
    ),
    {
      prompt: "Când e mai potrivit `for` decât `while`?",
      options: [
        "Când nu știi de câte ori se repetă",
        "Niciodată, sunt identice",
        "Când parcurgi elementele unei liste sau un șir cunoscut de numere",
        "Doar pentru șiruri de caractere",
      ],
      correct: 2,
      explanation:
        "`for` e ideal când știi ce parcurgi; `while` repetă cât timp o condiție e adevărată.",
    },
  ],

  /* ------------------------------------------------------------------ 9 */
  dictionare: [
    out(
      `d = {"Ana": 15, "Mihai": 16}
print(d["Mihai"])`,
      ["15", "Mihai", "16", "eroare"],
      2,
      "Valoarea se citește după cheie, nu după poziție.",
    ),
    out(
      `d = {"a": 1}
d["b"] = 2
print(d)`,
      ["{'a': 1}", "{'a': 1, 'b': 2}", "{'b': 2}", "eroare"],
      1,
      "O cheie nouă adaugă o pereche nouă în dicționar.",
    ),
    out(
      `d = {"a": 1}
d["a"] = 5
print(d)`,
      ["{'a': 5}", "{'a': 1, 'a': 5}", "{'a': 6}", "{'a': 1}"],
      0,
      "Cheia există deja, deci i se schimbă valoarea.",
    ),
    {
      prompt: "Pot exista două chei identice într-un dicționar?",
      options: [
        "Da, oricâte",
        "Da, dacă au valori diferite",
        "Doar dacă sunt numere",
        "Nu, fiecare cheie e unică",
      ],
      correct: 3,
      explanation:
        "Ca într-un dicționar adevărat, fiecare cuvânt (cheie) apare o singură dată.",
    },
    out(
      `print(dict(zip(["x", "y"], [1, 2])))`,
      [
        "{'x': 'y', 1: 2}",
        "{'x': 1, 'y': 2}",
        "[('x', 1), ('y', 2)]",
        "{1: 'x', 2: 'y'}",
      ],
      1,
      "`zip()` prinde în perechi elementele de pe aceeași poziție, iar `dict()` face din ele un dicționar.",
    ),
    out(
      `d = {"a": 1, "b": 2}
del d["a"]
print(d)`,
      ["{'a': 1}", "{}", "{'b': 2}", "eroare"],
      2,
      '`del` șterge perechea cu cheia `"a"`.',
    ),
    out(
      `d = {"a": 1, "b": 2}
v = d.pop("b")
print(v, d)`,
      ["2 {'a': 1}", "b {'a': 1}", "2 {'a': 1, 'b': 2}", "1 {'b': 2}"],
      0,
      "`pop()` scoate perechea și îți dă valoarea ei.",
    ),
    out(
      `print("ana are mere".split())`,
      [
        "ana are mere",
        "['ana are mere']",
        "['a', 'n', 'a']",
        "['ana', 'are', 'mere']",
      ],
      3,
      "`split()` împarte textul în cuvinte, la spații.",
    ),
    out(
      "print(sorted([3, 1, 2]))",
      ["[3, 2, 1]", "[1, 2, 3]", "[3, 1, 2]", "6"],
      1,
      "`sorted()` întoarce o listă nouă, în ordine crescătoare.",
    ),
    out(
      `varste = {"Ana": 15, "Ion": 17}
total = 0
for nume, v in varste.items():
    total = total + v
print(total)`,
      ["2", "15", "32", "AnaIon"],
      2,
      "`items()` dă perechile; se adună valorile: 15 + 17 = 32.",
    ),
  ],

  /* ----------------------------------------------------------------- 10 */
  "module-si-fisiere": [
    {
      prompt: "Ce face `import random`?",
      options: [
        "Generează un număr la întâmplare",
        "Deschide modulul `random`, ca să-i poți folosi funcțiile",
        "Instalează Python",
        "Creează un fișier `random.txt`",
      ],
      correct: 1,
      explanation:
        "`import` deschide „cutia” cu unelte; funcțiile ei se apelează apoi cu `random.`.",
    },
    {
      prompt: "Ce valori poate da `random.randint(1, 6)`?",
      options: ["0–5", "1–5", "Orice număr", "1–6, inclusiv 1 și 6"],
      correct: 3,
      explanation: "`randint(a, b)` include ambele capete.",
    },
    {
      prompt: 'Ce face modul `"w"` din `open("note.txt", "w")`?',
      options: [
        "Citește fișierul",
        "Creează sau golește fișierul și scrie de la zero",
        "Adaugă la final",
        "Șterge fișierul",
      ],
      correct: 1,
      explanation:
        "`w` (write) pornește de la un fișier gol. Atenție: tot ce era înainte se pierde.",
    },
    {
      prompt:
        "Ce mod folosești ca să adaugi rânduri fără să ștergi ce era deja în fișier?",
      options: ['"r"', '"w"', '"a"', '"x"'],
      correct: 2,
      explanation: "`a` (append) scrie la finalul fișierului.",
    },
    {
      prompt: "Ce întoarce `f.readlines()`?",
      options: [
        "O listă cu toate rândurile",
        "Primul rând",
        "Numărul de rânduri",
        "Tot textul, ca un singur șir",
      ],
      correct: 0,
      explanation: "Fiecare rând devine un element al listei.",
    },
    {
      prompt: "De ce e mai bine să scrii `with open(...) as f:`?",
      options: [
        "E mai rapid",
        "Poți scrie fără `write()`",
        "Fișierul se închide singur, chiar dacă apare o eroare",
        "Nu mai trebuie numele fișierului",
      ],
      correct: 2,
      explanation:
        "Cu `with`, nu uiți `close()`, iar datele ajung sigur în fișier.",
    },
    {
      prompt: "Ce înseamnă `\\n` într-un text?",
      options: ["Un spațiu", "Rând nou", "Sfârșitul fișierului", "Litera n"],
      correct: 1,
      explanation: "`\\n` e caracterul de rând nou.",
    },
    out(
      `with open("test.txt", "w") as f:
    f.write("unu\\n")
with open("test.txt", "a") as f:
    f.write("doi\\n")
with open("test.txt", "r") as f:
    print(len(f.readlines()))`,
      ["1", "2", "0", "eroare"],
      1,
      "Primul `open` scrie un rând, al doilea (cu `a`) mai adaugă unul.",
    ),
    {
      prompt: 'Ce face `os.remove("nou.txt")`?',
      options: [
        "Mută fișierul în Coșul de gunoi",
        "Golește conținutul fișierului",
        "Îl redenumește",
        "Șterge fișierul definitiv",
      ],
      correct: 3,
      explanation: "Fișierul nu trece prin Coșul de gunoi: dispare de tot.",
    },
    out(
      `print(", ".join(["mama", "tata"]))`,
      ["mama, tata", "mamatata", "['mama', 'tata']", "mama tata"],
      0,
      "`join()` lipește elementele listei, cu `, ` între ele.",
    ),
  ],

  /* ----------------------------------------------------------------- 11 */
  hackathon: [
    {
      prompt: "Ce înseamnă „hackathon”?",
      options: [
        "Un concurs de spart parole",
        "Un curs de securitate",
        "Programare creativă într-un timp scurt, de la idee la demo",
        "Un tip de buclă",
      ],
      correct: 2,
      explanation: "*Hack* (programare creativă) + *maraton* (în timp scurt).",
    },
    {
      prompt: "Care e ordinea pașilor din planul proiectului?",
      options: [
        "Codifică, prezintă, planifică, testează",
        "Planifică, codifică, testează, prezintă",
        "Testează, planifică, codifică, prezintă",
        "Prezintă, codifică, testează, planifică",
      ],
      correct: 1,
      explanation:
        "Întâi plănuiești pașii, apoi scrii codul, îl testezi și la final îl prezinți.",
    },
    out(
      `alfabet = "abcdefghijklmnopqrstuvwxyz"
poz = alfabet.find("a")
print(alfabet[(poz + 3) % 26])`,
      ["c", "d", "a", "e"],
      1,
      "„a” e pe poziția 0; mutată cu 3, ajunge pe poziția 3, adică „d”.",
    ),
    out(
      `alfabet = "abcdefghijklmnopqrstuvwxyz"
poz = alfabet.find("y")
print(alfabet[(poz + 3) % 26])`,
      ["b", "z", "a", "eroare"],
      0,
      "„y” e pe poziția 24; 24 + 3 = 27, iar 27 % 26 = 1, adică „b”.",
    ),
    {
      prompt: "De ce folosim `% 26` în cifrul lui Cezar?",
      options: [
        "Ca să obținem litere mari",
        "Ca să eliminăm spațiile",
        "Ca să numărăm literele",
        "Ca după „z” să revenim la începutul alfabetului",
      ],
      correct: 3,
      explanation: "Restul împărțirii la 26 ține poziția mereu între 0 și 25.",
    },
    {
      prompt: "Cum decodifici un mesaj criptat cu cheia 3?",
      options: [
        "Scazi 3 din poziția fiecărei litere",
        "Aduni din nou 3",
        "Inversezi mesajul",
        "Înmulțești poziția cu 3",
      ],
      correct: 0,
      explanation:
        "Decodificarea face drumul invers: muți fiecare literă cu 3 poziții înapoi.",
    },
    {
      prompt:
        "Ce structură se potrivește cel mai bine pentru „Biblioteca digitală” (titlu → autor)?",
      options: [
        "O listă de numere",
        "Un singur șir",
        "Un dicționar",
        "O variabilă `bool`",
      ],
      correct: 2,
      explanation: "Titlul e cheia, iar autorul e valoarea.",
    },
    {
      prompt: "Apare un bug în timpul demo-ului. Ce e cel mai bine să faci?",
      options: [
        "Să ascunzi ecranul",
        "Să ștergi tot codul",
        "Să spui că e vina lui Python",
        "Să-l explici: face parte din meseria de programator",
      ],
      correct: 3,
      explanation: "Să explici ce s-a întâmplat arată că îți înțelegi codul.",
    },
    {
      prompt: "Ce valorează mai mult la final de hackathon?",
      options: [
        "Un proiect mic, terminat și prezentat",
        "Un proiect mare, neterminat",
        "Un proiect copiat",
        "Un proiect pe care nu l-ai testat",
      ],
      correct: 0,
      explanation:
        "Un program mic care merge și pe care îl poți prezenta e cel mai bun rezultat.",
    },
    out(
      `sold = 100
sold = sold + 50
sold = sold - 30
print(sold)`,
      ["150", "70", "120", "100"],
      2,
      "100 + 50 = 150, apoi 150 - 30 = 120.",
    ),
  ],
};
