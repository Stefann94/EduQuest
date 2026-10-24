// Cursul „Introducere în Python”, rescris din prezentarea lecțiilor (Modulul 1).
// Se încarcă în baza de date cu: pnpm db:content. Fiecare lecție devine o lecție scrisă,
// primele două exerciții devin problemele lecției, iar quiz-ul vine din python-quizzes.ts.
// Tipurile de blocuri și ce face fiecare: src/lib/content/schema.ts.

import type { CourseSource } from "../src/lib/content/schema";

export const course: CourseSource = {
  slug: "introducere-in-python",
  title: "Introducere în Python",
  subtitle: "De la prima variabilă la primul tău proiect",
  description:
    "Unsprezece lecții care te duc de la zero la un program al tău: variabile, decizii, bucle, liste, șiruri, funcții, dicționare și fișiere. La final, un hackathon.",
  topic: "Python",
  level: "Începător",
  accent: "cyan",
  lessons: [
    /* ------------------------------------------------------------------ 1 */
    {
      slug: "variabile",
      title: "Variabile și tipuri de date",
      summary:
        "Cum păstrează un program informații: variabile, atribuire și cele patru tipuri de bază.",
      durationMin: 25,
      blocks: [
        {
          type: "paragraph",
          text: "Orice program lucrează cu date: numele unui jucător, un scor, dacă un nivel e terminat. Ca să le poată folosi mai târziu, programul le păstrează în **variabile**.",
        },
        {
          type: "callout",
          tone: "analogy",
          text: "O variabilă e o cutie cu etichetă. Eticheta e numele (`scor`), iar în cutie stă valoarea (`10`). Când ai nevoie de valoare, o ceri după etichetă.",
        },
        {
          type: "code",
          code: `nume = "Pufi"
varsta = 7
print(nume)
print(varsta)`,
          output: "Pufi\n7",
        },
        {
          type: "boxes",
          items: [
            { name: "nume", value: '"Pufi"', kind: "str" },
            { name: "varsta", value: "7", kind: "int" },
          ],
          caption: "După primele două rânduri, în memorie există două cutii.",
        },
        { type: "heading", text: "Atribuirea: semnul =" },
        {
          type: "paragraph",
          text: "Semnul `=` nu înseamnă „egal” ca la matematică. Înseamnă „pune valoarea din dreapta în cutia din stânga”. Conținutul cutiei se poate schimba oricând:",
        },
        {
          type: "code",
          code: `scor = 10
scor = scor + 5
print(scor)`,
          output: "15",
        },
        {
          type: "trace",
          columns: ["Rândul", "Ce se întâmplă", "scor"],
          rows: [
            ["1", "se creează cutia `scor`", "10"],
            [
              "2",
              "se calculează `scor + 5`, apoi rezultatul se pune înapoi",
              "15",
            ],
            ["3", "se afișează valoarea", "15"],
          ],
        },
        { type: "heading", text: "Tipuri de date" },
        {
          type: "table",
          columns: ["Tip", "Ce reține", "Exemple"],
          rows: [
            ["`int`", "numere întregi", "`7`, `-3`, `2026`"],
            [
              "`float`",
              "numere cu zecimale (în cod se scrie cu punct)",
              "`3.14`, `0.5`",
            ],
            ["`str`", "text, între ghilimele", "`\"Pufi\"`, `'salut'`"],
            ["`bool`", "adevărat sau fals", "`True`, `False`"],
          ],
        },
        {
          type: "paragraph",
          text: "Funcția `type()` îți spune ce tip are o valoare:",
        },
        {
          type: "code",
          code: `print(type(7))
print(type(3.14))
print(type("Pufi"))
print(type(True))`,
          output:
            "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>",
        },
        {
          type: "callout",
          tone: "warning",
          text: '`"7"` și `7` nu sunt același lucru: primul e text, al doilea e număr. `"7" + "1"` dă `"71"`, iar `7 + 1` dă `8`.',
        },
        { type: "heading", text: "Cum alegi un nume bun" },
        {
          type: "list",
          items: [
            "Poate conține litere, cifre și `_`, dar nu poate începe cu o cifră: `scor_1` e bun, `1scor` nu.",
            "Fără spații și fără diacritice: `varsta_mea`, nu `vârsta mea`.",
            "Python face diferența între litere mari și mici: `Scor` și `scor` sunt cutii diferite.",
            "Alege nume care spun ce e în cutie: `pret_total` e mai clar decât `x`.",
          ],
        },
        { type: "heading", text: "Prima funcție: print()" },
        {
          type: "paragraph",
          text: "Ai folosit deja `print()`. O funcție e ca o rețetă: îi dai ingrediente (**intrarea**), ea face ceva cu ele și îți dă un rezultat. Despre funcții vorbim pe larg în lecția 7; deocamdată ajunge să știi că `print()` afișează pe ecran ce primește între paranteze.",
        },
        {
          type: "machine",
          input: '"Am", 15, "ani"',
          name: "print()",
          output: "Am 15 ani",
          caption:
            "`print()` poate primi mai multe valori, separate prin virgulă, și pune singur câte un spațiu între ele.",
        },
        {
          type: "exercise",
          title: "Cartea de vizită",
          text: "Creează trei variabile: `nume`, `varsta` și `oras`. Afișează-le pe un singur rând, de forma `Ana are 15 ani și locuiește în Iași.`",
          hint: "`print()` primește mai multe valori separate prin virgulă. Ca punctul de la final să stea lipit de oraș, lipește-le cu `+`.",
          solution: {
            language: "python",
            code: `nume = "Ana"
varsta = 15
oras = "Iași"
print(nume, "are", varsta, "ani și locuiește în", oras + ".")`,
          },
          output: "Ana are 15 ani și locuiește în Iași.",
        },
        {
          type: "exercise",
          title: "Schimbă valorile",
          text: "Ai `a = 3` și `b = 8`. Schimbă valorile între ele, astfel încât la final `a` să fie 8 și `b` să fie 3.",
          hint: "Ai nevoie de o a treia cutie, ca să nu pierzi una dintre valori.",
          solution: {
            language: "python",
            code: `a = 3
b = 8
aux = a
a = b
b = aux
print(a, b)`,
          },
          output: "8 3",
          explanation:
            "Python are și o scurtătură: `a, b = b, a` face același lucru într-un singur rând.",
        },
        {
          type: "keypoints",
          items: [
            "O variabilă are un nume și o valoare; `=` pune valoarea în variabilă.",
            "Tipurile de bază: `int`, `float`, `str` și `bool`. Le afli cu `type()`.",
            'Textul stă între ghilimele: `"7"` e text, `7` e număr.',
            "`print()` afișează valori pe ecran.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 2 */
    {
      slug: "operatori",
      title: "Operatori: calcule și logică",
      summary:
        "Operațiile matematice (inclusiv câtul și restul), comparațiile și operatorii and, or, not.",
      durationMin: 30,
      blocks: [
        {
          type: "paragraph",
          text: "Calculatorul e, înainte de toate, un calculator. Operatorii sunt semnele cu care îi spui ce să calculeze sau ce să compare.",
        },
        { type: "heading", text: "Operatorii matematici" },
        {
          type: "cards",
          items: [
            {
              title: "Calcule de bază",
              code: "+   -   *   /",
              text: "Adunare, scădere, înmulțire, împărțire. Împărțirea cu `/` dă mereu un număr cu zecimale: `7 / 2` este `3.5`.",
              accent: "cyan",
            },
            {
              title: "Câtul: //",
              code: "7 // 3  →  2",
              text: "De câte ori încape întreg. Ce e după virgulă se aruncă.",
              accent: "pink",
            },
            {
              title: "Restul: %",
              code: "7 % 3  →  1",
              text: "Ce rămâne după împărțire. Foarte util: un număr e par dacă `n % 2 == 0`.",
              accent: "yellow",
            },
            {
              title: "Puterea: **",
              code: "2 ** 3  →  8",
              text: "Ridicarea la putere: 2 · 2 · 2.",
              accent: "green",
            },
          ],
        },
        {
          type: "code",
          code: `print(7 + 3)
print(7 - 3)
print(7 * 3)
print(7 / 2)
print(7 // 3)
print(7 % 3)
print(2 ** 3)`,
          output: "10\n4\n21\n3.5\n2\n1\n8",
        },
        {
          type: "callout",
          tone: "analogy",
          text: "Ai 7 bomboane și 3 prieteni. Fiecare primește `7 // 3 = 2` bomboane, iar ție îți rămân `7 % 3 = 1`.",
        },
        {
          type: "paragraph",
          text: "Ordinea operațiilor e ca la matematică: întâi `**`, apoi `*`, `/`, `//` și `%`, la final `+` și `-`. Parantezele schimbă ordinea.",
        },
        {
          type: "code",
          code: `print(2 + 3 * 4)
print((2 + 3) * 4)`,
          output: "14\n20",
        },
        { type: "heading", text: "Comparații" },
        {
          type: "table",
          columns: ["Operator", "Întreabă", "Exemplu", "Rezultat"],
          rows: [
            ["`==`", "sunt egale?", "`5 == 5`", "`True`"],
            ["`!=`", "sunt diferite?", "`5 != 3`", "`True`"],
            ["`<`", "e mai mic?", "`2 < 1`", "`False`"],
            ["`>`", "e mai mare?", "`9 > 4`", "`True`"],
            ["`<=`", "e mai mic sau egal?", "`3 <= 3`", "`True`"],
            ["`>=`", "e mai mare sau egal?", "`2 >= 7`", "`False`"],
          ],
          caption: "O comparație dă mereu un `bool`: `True` sau `False`.",
        },
        {
          type: "callout",
          tone: "warning",
          title: "= sau ==?",
          text: "`=` pune o valoare într-o variabilă. `==` întreabă dacă două valori sunt egale. Confuzia dintre ele e una dintre cele mai dese greșeli la început.",
        },
        { type: "heading", text: "Operatori logici: and, or, not" },
        {
          type: "paragraph",
          text: "Uneori o singură comparație nu ajunge: „Intri dacă ai bilet **și** ai peste 12 ani.” Pentru asta avem `and`, `or` și `not`.",
        },
        {
          type: "table",
          columns: ["A", "B", "A and B", "A or B"],
          rows: [
            ["`True`", "`True`", "`True`", "`True`"],
            ["`True`", "`False`", "`False`", "`True`"],
            ["`False`", "`True`", "`False`", "`True`"],
            ["`False`", "`False`", "`False`", "`False`"],
          ],
          caption:
            "**and**: ambele trebuie să fie adevărate. **or**: ajunge una.",
        },
        {
          type: "code",
          code: `varsta = 14
are_bilet = True
print(varsta >= 12 and are_bilet)
print(varsta < 10 or are_bilet)
print(not are_bilet)`,
          output: "True\nTrue\nFalse",
        },
        {
          type: "callout",
          tone: "info",
          title: "not, oglinda",
          text: "`not` întoarce valoarea pe dos: `not True` e `False`, iar `not False` e `True`.",
        },
        {
          type: "exercise",
          title: "Cât durează filmul",
          text: "Un film are 135 de minute. Afișează cât durează în ore și minute: `2 ore și 15 minute`.",
          hint: "Câte ore întregi încap în 135 de minute? `//`. Câte minute rămân? `%`.",
          solution: {
            language: "python",
            code: `minute = 135
ore = minute // 60
rest = minute % 60
print(ore, "ore și", rest, "minute")`,
          },
          output: "2 ore și 15 minute",
        },
        {
          type: "exercise",
          title: "Par și mai mare decât 10",
          text: "Pentru `n = 14`, afișează `True` dacă numărul e par **și** mai mare decât 10, altfel `False`. Folosește un singur `print`.",
          solution: {
            language: "python",
            code: `n = 14
print(n % 2 == 0 and n > 10)`,
          },
          output: "True",
        },
        {
          type: "keypoints",
          items: [
            "`//` dă câtul, `%` dă restul, `**` ridică la putere.",
            "Comparațiile (`==`, `!=`, `<`, `>`, `<=`, `>=`) dau `True` sau `False`.",
            "`and` cere ca ambele condiții să fie adevărate, `or` cere măcar una, `not` inversează.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 3 */
    {
      slug: "decizii-if",
      title: "Decizii cu if, elif și else",
      summary:
        "Cum alege programul ce să facă, de ce contează spațiile și cum verifici mai multe variante.",
      durationMin: 35,
      blocks: [
        {
          type: "paragraph",
          text: "Programele iau decizii tot timpul: dacă parola e corectă, intri; altfel, primești un mesaj de eroare. În Python, deciziile se scriu cu `if`.",
        },
        {
          type: "callout",
          tone: "analogy",
          text: "„**Dacă** e soare, merg la mare. **Altfel**, stau acasă.” Calculatorul verifică o condiție, ca un detectiv: dacă e `True`, face un lucru; dacă e `False`, face altul.",
        },
        {
          type: "code",
          code: `soare = True
if soare == True:
    print("Merg la mare!")
else:
    print("Rămân acasă.")`,
          output: "Merg la mare!",
        },
        {
          type: "callout",
          tone: "tip",
          text: "`if soare == True:` se poate scrie mai scurt: `if soare:`. Variabila e deja `True` sau `False`.",
        },
        { type: "heading", text: "Indentarea: spațiile contează" },
        {
          type: "paragraph",
          text: "În Python, spațiile de la începutul rândului (de obicei 4) arată ce instrucțiuni fac parte din `if`. Fără ele, programul nici nu pornește.",
        },
        {
          type: "compare",
          wrong: {
            language: "python",
            label: "Greșit",
            code: `if a > b:
print("a e mai mare")`,
          },
          right: {
            language: "python",
            label: "Corect",
            code: `if a > b:
    print("a e mai mare")`,
          },
          note: "Și cele două puncte `:` de la finalul rândului cu `if` sunt obligatorii. Uitarea lor e a doua cea mai des întâlnită greșeală.",
        },
        { type: "heading", text: "Mai multe variante: elif" },
        {
          type: "code",
          code: `nota = 8
if nota >= 9:
    print("Excelent")
elif nota >= 7:
    print("Bine")
elif nota >= 5:
    print("Ai trecut")
else:
    print("Mai încearcă")`,
          output: "Bine",
        },
        {
          type: "paragraph",
          text: "Python verifică condițiile de sus în jos și o execută doar pe **prima** adevărată. De aceea ordinea contează: dacă am fi pus `nota >= 5` primul, orice notă de trecere ar fi afișat „Ai trecut”.",
        },
        {
          type: "exercise",
          title: "Par sau impar",
          text: "Pentru `a = 13`, afișează dacă numărul este par sau impar.",
          hint: "Un număr e par dacă restul împărțirii la 2 este 0. Ce operator dă restul? Și ce semn folosești ca să verifici egalitatea?",
          solution: {
            language: "python",
            code: `a = 13
if a % 2 == 0:
    print("a este par")
else:
    print("a este impar")`,
          },
          output: "a este impar",
        },
        {
          type: "exercise",
          title: "Divizibil cu 5",
          text: "Afișează `True` dacă `a = 10` se împarte exact la 5, altfel `False`.",
          solution: {
            language: "python",
            code: `a = 10
if a % 5 == 0:
    print(True)
else:
    print(False)`,
          },
          output: "True",
          explanation:
            "Pentru că `a % 5 == 0` este deja `True` sau `False`, merge și direct: `print(a % 5 == 0)`.",
        },
        {
          type: "exercise",
          title: "Fructele din magazin",
          text: "Trei variabile spun dacă un fruct e în magazin: `mere = True`, `banane = False`, `ananas = True`. Numără câte fructe sunt disponibile și afișează numărul.",
          hint: "Pornește de la `nr = 0` și adună 1 pentru fiecare fruct disponibil. Folosește trei `if`-uri separate, nu `elif`: vrei să le verifici pe toate.",
          solution: {
            language: "python",
            code: `mere = True
banane = False
ananas = True
nr = 0
if mere:
    nr = nr + 1
if banane:
    nr = nr + 1
if ananas:
    nr = nr + 1
print(nr)`,
          },
          output: "2",
        },
        {
          type: "exercise",
          title: "Piatră, foarfecă, hârtie",
          text: "Codificăm alegerile: 1 = piatră, 2 = foarfecă, 3 = hârtie. Știi dinainte ce alege adversarul. Scrie un program care alege mereu varianta câștigătoare.",
          hint: "Hârtia învinge piatra, piatra învinge foarfeca, foarfeca învinge hârtia.",
          solution: {
            language: "python",
            code: `# 1 = piatră, 2 = foarfecă, 3 = hârtie
adversar = 3
if adversar == 1:
    print(3)  # hârtie
elif adversar == 2:
    print(1)  # piatră
elif adversar == 3:
    print(2)  # foarfecă`,
          },
          output: "2",
          explanation:
            "Variabila se numește `adversar`, nu `input`: `input` e deja numele unei funcții din Python (o vei folosi în lecția 4) și nu e bine să-l acoperi.",
        },
        {
          type: "exercise",
          title: "Momentul zilei",
          text: "Pentru o oră între 1 și 24, afișează `1` dacă e dimineață (6–11), `2` dacă e după-amiază (12–18) și `3` dacă e seară sau noapte (19–24 ori 1–5).",
          hint: "Un interval se scrie cu `and`: `ora >= 6 and ora <= 11`. Două intervale se leagă cu `or`.",
          solution: {
            language: "python",
            code: `ora = 13
if ora >= 6 and ora <= 11:
    print(1)
elif ora >= 12 and ora <= 18:
    print(2)
elif (ora >= 19 and ora <= 24) or (ora >= 1 and ora <= 5):
    print(3)`,
          },
          output: "2",
          explanation:
            "Python acceptă și forma scurtă `6 <= ora <= 11`. Parantezele din ultima condiție nu sunt obligatorii (`and` se calculează înaintea lui `or`), dar fac codul mai ușor de citit. Intervalele nu se suprapun, deci fiecare oră primește un singur răspuns.",
        },
        {
          type: "keypoints",
          items: [
            "`if` execută un bloc doar dacă o condiție e adevărată; `else` acoperă restul.",
            "`elif` verifică mai multe variante, de sus în jos; se execută doar prima adevărată.",
            "Blocul din `if` se indentează cu 4 spații, iar rândul cu `if` se termină cu `:`.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 4 */
    {
      slug: "input-si-while",
      title: "input() și bucla while",
      summary:
        "Programul te întreabă ceva, apoi repetă pași cât timp e nevoie. Și cum urmărești o buclă pas cu pas.",
      durationMin: 40,
      blocks: [
        {
          type: "paragraph",
          text: "Până acum calculatorul doar ți-a vorbit, prin `print()`. Cu `input()`, e rândul tău să-i spui ceva.",
        },
        {
          type: "code",
          code: `nume = input("Cum te cheamă? ")
print("Salut, " + nume + "!")`,
          output: "Cum te cheamă? Ana\nSalut, Ana!",
        },
        {
          type: "callout",
          tone: "info",
          text: "Programul se oprește la `input()` și așteaptă până scrii ceva și apeși Enter. Ce ai scris ajunge în variabilă.",
        },
        { type: "heading", text: "input() dă mereu text" },
        {
          type: "compare",
          wrong: {
            language: "python",
            label: "Dă eroare",
            code: `varsta = input("Câți ani ai? ")
print(varsta + 1)`,
          },
          right: {
            language: "python",
            label: "Corect",
            code: `varsta = int(input("Câți ani ai? "))
print(varsta + 1)`,
          },
          note: "`input()` întoarce un `str`, chiar dacă scrii cifre. Ca să calculezi cu el, îl transformi în număr cu `int()` (sau `float()`, pentru zecimale). Varianta din stânga se oprește cu eroarea `TypeError`.",
        },
        { type: "heading", text: "Bucla while: repetă cât timp" },
        {
          type: "paragraph",
          text: "O buclă `while` repetă un bloc de cod **cât timp** condiția e adevărată. Repetiția e mama învățăturii, și a programării.",
        },
        {
          type: "code",
          code: `mere = 3
while mere > 0:
    print("Mănânc un măr. Mai sunt", mere - 1)
    mere = mere - 1
print("Gata merele!")`,
          output:
            "Mănânc un măr. Mai sunt 2\nMănânc un măr. Mai sunt 1\nMănânc un măr. Mai sunt 0\nGata merele!",
        },
        {
          type: "callout",
          tone: "warning",
          title: "Bucla infinită",
          text: "Dacă uiți să schimbi variabila din condiție (aici, `mere = mere - 1`), condiția rămâne mereu adevărată și programul nu se mai oprește. Îl oprești cu Ctrl+C.",
        },
        { type: "heading", text: "Urmărim o buclă pas cu pas" },
        {
          type: "paragraph",
          text: "Cel mai bun mod de a înțelege o buclă e să notezi valorile la fiecare pas, ca pe tablă. Programul de mai jos citește două numere și îl înmulțește pe al doilea cu 3 cât timp e mai mic decât primul.",
        },
        {
          type: "code",
          code: `nr1 = int(input("Primul număr: "))
nr2 = int(input("Al doilea număr: "))
while nr1 > nr2:
    print(nr2 * 3)
    nr2 = nr2 * 3`,
        },
        {
          type: "trace",
          title: "Pentru nr1 = 20 și nr2 = 1",
          columns: ["Pas", "nr2", "nr1 > nr2?", "Afișează", "nr2 devine"],
          rows: [
            ["1", "1", "20 > 1 → True", "3", "3"],
            ["2", "3", "20 > 3 → True", "9", "9"],
            ["3", "9", "20 > 9 → True", "27", "27"],
            ["4", "27", "20 > 27 → False", "—", "bucla se oprește"],
          ],
        },
        { type: "heading", text: "Media numerelor, până la 6" },
        {
          type: "paragraph",
          text: "Citim numere până când utilizatorul scrie 6 și calculăm media lor. Un detaliu schimbă rezultatul: locul în care citești numărul.",
        },
        {
          type: "code",
          title: "Varianta 1",
          code: `a = 0
suma = 0
nr = 0
while a != 6:
    a = int(input("Un număr: "))
    suma = suma + a
    nr = nr + 1
print(suma / nr)`,
        },
        {
          type: "trace",
          title: "Pentru numerele 7, 3, 4, 2, 6",
          columns: ["a", "suma", "nr"],
          rows: [
            ["0", "0", "0"],
            ["7", "7", "1"],
            ["3", "10", "2"],
            ["4", "14", "3"],
            ["2", "16", "4"],
            ["6", "22", "5"],
          ],
          note: "Se afișează `22 / 5 = 4.4`: și 6 a intrat în medie, pentru că e adunat înainte ca bucla să verifice din nou condiția.",
        },
        {
          type: "paragraph",
          text: "Dacă vrei ca 6 să fie doar semnalul de oprire, citește primul număr înainte de buclă, iar pe următorul la finalul ei. Pentru aceleași numere, rezultatul devine `16 / 4 = 4.0`.",
        },
        {
          type: "code",
          title: "Varianta 2: 6 doar oprește bucla",
          code: `suma = 0
nr = 0
a = int(input("Un număr: "))
while a != 6:
    suma = suma + a
    nr = nr + 1
    a = int(input("Un număr: "))
print(suma / nr)`,
        },
        {
          type: "exercise",
          title: "Numărătoare inversă",
          text: "Citește un număr `n` și afișează numerele de la `n` până la 1, apoi `Start!`.",
          solution: {
            language: "python",
            code: `n = int(input("De la cât numărăm? "))
while n >= 1:
    print(n)
    n = n - 1
print("Start!")`,
          },
          output: "De la cât numărăm? 3\n3\n2\n1\nStart!",
        },
        {
          type: "exercise",
          title: "Parola",
          text: "Cere parola până când utilizatorul scrie `python`. Apoi afișează `Acces permis`.",
          hint: "Citește parola o dată înainte de buclă și din nou în interiorul ei, la fel ca în varianta 2 de mai sus.",
          solution: {
            language: "python",
            code: `parola = input("Parola: ")
while parola != "python":
    print("Greșit, mai încearcă.")
    parola = input("Parola: ")
print("Acces permis")`,
          },
          output:
            "Parola: java\nGreșit, mai încearcă.\nParola: python\nAcces permis",
        },
        {
          type: "keypoints",
          items: [
            "`input()` așteaptă un text de la utilizator; pentru numere îl transformi cu `int()`.",
            "`while` repetă cât timp condiția e adevărată. Ai grijă să se schimbe ceva în buclă, altfel nu se mai oprește.",
            "Un tabel cu valorile la fiecare pas e cel mai sigur mod de a înțelege o buclă.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 5 */
    {
      slug: "liste",
      title: "Liste",
      summary:
        "Mai multe valori într-o singură variabilă: index, lungime, parcurgere, adăugare și ștergere.",
      durationMin: 35,
      blocks: [
        {
          type: "paragraph",
          text: "Listele din programare sunt exact ca în viața reală: o enumerare de lucruri pe care vrei să le ții împreună. Lista de cumpărături, lista invitaților, scorurile dintr-un joc.",
        },
        {
          type: "code",
          code: `cumparaturi = ["mere", "pâine", "lapte"]
scoruri = [12, 7, 21]
amestec = [4, "pepene", True]
print(cumparaturi)`,
          output: "['mere', 'pâine', 'lapte']",
        },
        {
          type: "callout",
          tone: "info",
          text: "O listă se scrie între paranteze drepte `[]`, cu elementele separate prin virgulă. Poate conține orice fel de valori, chiar amestecate.",
        },
        { type: "heading", text: "Indexul: numărătoarea începe de la 0" },
        {
          type: "table",
          columns: ["Index", "0", "1", "2"],
          rows: [["Element", '`"măr"`', '`"banană"`', '`"portocală"`']],
        },
        {
          type: "code",
          code: `fructe = ["măr", "banană", "portocală"]
print(fructe[0])
print(fructe[2])
print(fructe[-1])
print(len(fructe))`,
          output: "măr\nportocală\nportocală\n3",
        },
        {
          type: "callout",
          tone: "tip",
          text: "Indicii negativi numără de la final: `[-1]` e ultimul element, `[-2]` penultimul. Funcția `len()` îți spune câte elemente are lista.",
        },
        {
          type: "callout",
          tone: "warning",
          text: "Dacă ceri un index care nu există, de exemplu `fructe[3]` într-o listă de trei elemente, primești eroarea `IndexError: list index out of range`.",
        },
        { type: "heading", text: "Parcurgerea cu while" },
        {
          type: "code",
          code: `lista = ["măr", "banană", "portocală", "pepene"]
i = 0
while i < len(lista):
    print(lista[i])
    i = i + 1`,
          output: "măr\nbanană\nportocală\npepene",
        },
        {
          type: "trace",
          columns: ["i", "i < 4?", "Afișează"],
          rows: [
            ["0", "True", "măr"],
            ["1", "True", "banană"],
            ["2", "True", "portocală"],
            ["3", "True", "pepene"],
            ["4", "False", "— (bucla se oprește)"],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          text: "În lecția 8 vei vedea bucla `for`, care face același lucru mai scurt: `for fruct in lista:`.",
        },
        { type: "heading", text: "Adăugare și ștergere" },
        {
          type: "cards",
          items: [
            {
              title: "append",
              code: "lista.append(x)",
              text: "Adaugă `x` la **sfârșitul** listei.",
              accent: "green",
            },
            {
              title: "pop()",
              code: "lista.pop()",
              text: "Scoate **ultimul** element și ți-l dă înapoi.",
              accent: "orange",
            },
            {
              title: "pop(i)",
              code: "lista.pop(0)",
              text: "Scoate elementul de la indexul `i` (aici, primul).",
              accent: "pink",
            },
          ],
        },
        {
          type: "code",
          code: `lista = [1, 2]
lista.append(3)
print(lista)
ultimul = lista.pop()
print(ultimul, lista)
lista.pop(0)
print(lista)
print(type(lista))`,
          output: "[1, 2, 3]\n3 [1, 2]\n[2]\n<class 'list'>",
        },
        {
          type: "exercise",
          title: "Media notelor",
          text: "Ai lista `note = [9, 7, 10, 8]`. Calculează cu un `while` suma și media notelor.",
          solution: {
            language: "python",
            code: `note = [9, 7, 10, 8]
suma = 0
i = 0
while i < len(note):
    suma = suma + note[i]
    i = i + 1
print("Suma:", suma)
print("Media:", suma / len(note))`,
          },
          output: "Suma: 34\nMedia: 8.5",
        },
        {
          type: "exercise",
          title: "Lista de invitați",
          text: "Pornește de la o listă goală, `invitati = []`. Citește nume cu `input()` până se scrie `gata` și adaugă-le în listă. La final, afișează lista și numărul de invitați.",
          solution: {
            language: "python",
            code: `invitati = []
nume = input("Invitat: ")
while nume != "gata":
    invitati.append(nume)
    nume = input("Invitat: ")
print(invitati)
print("Ai", len(invitati), "invitați")`,
          },
          output:
            "Invitat: Ana\nInvitat: Luca\nInvitat: gata\n['Ana', 'Luca']\nAi 2 invitați",
        },
        {
          type: "exercise",
          title: "Cel mai mare număr",
          text: "Găsește cel mai mare număr din `numere = [4, 17, 9, 23, 5]`, fără funcția `max()`.",
          hint: "Pornește cu primul element ca „cel mai mare de până acum” și compară-l pe rând cu celelalte.",
          solution: {
            language: "python",
            code: `numere = [4, 17, 9, 23, 5]
maxim = numere[0]
i = 1
while i < len(numere):
    if numere[i] > maxim:
        maxim = numere[i]
    i = i + 1
print(maxim)`,
          },
          output: "23",
        },
        {
          type: "keypoints",
          items: [
            "O listă ține mai multe valori, în ordine: `[1, 2, 3]`.",
            "Indexul începe de la 0; `[-1]` e ultimul element; `len()` dă numărul de elemente.",
            "`append()` adaugă la final, `pop()` scoate ultimul element, `pop(i)` pe cel de la poziția `i`.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 6 */
    {
      slug: "siruri",
      title: "Șiruri de caractere",
      summary:
        "Textul în Python: lipire, indexul fiecărei litere, feliere, repetare, lungime și căutare.",
      durationMin: 35,
      blocks: [
        {
          type: "paragraph",
          text: "Un **șir de caractere** (în engleză, *string*) e text: litere, cifre, spații, simboluri. În Python îl scrii între ghilimele `\"...\"` sau între apostrofuri `'...'`.",
        },
        { type: "heading", text: "Lipirea șirurilor" },
        {
          type: "code",
          code: `nume = "Ana"
salut = "Bună, " + nume + "!"
print(salut)`,
          output: "Bună, Ana!",
        },
        {
          type: "callout",
          tone: "warning",
          text: 'Poți lipi doar text cu text. `"Am " + 15` dă eroare; scrie `"Am " + str(15)`. Funcția `str()` transformă un număr în text.',
        },
        { type: "heading", text: "Indexul fiecărei litere" },
        {
          type: "paragraph",
          text: "Fiecare literă are o poziție, ca o casă cu număr. Ca la liste, numărătoarea începe de la 0, iar indicii negativi numără de la final.",
        },
        {
          type: "chars",
          text: "Python",
          caption:
            "`text[0]` este `P`, `text[3]` este `h`, `text[-1]` este `n`.",
        },
        { type: "heading", text: "Felierea" },
        {
          type: "paragraph",
          text: "Cu `text[start:stop]` iei o bucată din șir: de la `start` inclusiv, până la `stop` **fără** el. Dacă lipsește `start`, pornești de la început; dacă lipsește `stop`, mergi până la final.",
        },
        {
          type: "chars",
          text: "Hello there",
          highlight: [3, 4, 5, 6],
          caption:
            '`text[3:7]` ia indicii 3, 4, 5 și 6, adică `"lo t"`. Spațiul e și el un caracter.',
        },
        {
          type: "code",
          code: `text = "Hello there"
print(text[:4])
print(text[6:])
print(text[3:7])`,
          output: "Hell\nthere\nlo t",
        },
        { type: "heading", text: "Trucuri rapide" },
        {
          type: "cards",
          items: [
            {
              title: "Repetare",
              code: '"BUM! " * 3',
              text: "Un șir înmulțit cu un număr se repetă: `BUM! BUM! BUM!`",
              accent: "pink",
            },
            {
              title: "Lungime",
              code: 'len("Python")',
              text: "Câte caractere are șirul: 6.",
              accent: "cyan",
            },
            {
              title: "Căutare",
              code: '"test".find("es")',
              text: "Indexul unde începe prima apariție: 1. Dacă nu găsește nimic, dă `-1`.",
              accent: "yellow",
            },
          ],
        },
        {
          type: "code",
          code: `print("BUM! " * 3)
print(len("Python"))
cuvant = "test"
print(cuvant.find("t"))
print(cuvant.find("es"))
print(cuvant.find("x"))`,
          output: "BUM! BUM! BUM! \n6\n0\n1\n-1",
        },
        {
          type: "callout",
          tone: "tip",
          text: 'Ca să verifici doar dacă un cuvânt apare, poți folosi și `in`: `"es" in "test"` este `True`.',
        },
        {
          type: "exercise",
          title: "Linia de #",
          text: "Citește un număr `x` și construiește, cu un `while`, un șir format din `x` caractere `#`. Afișează-l.",
          hint: 'Pornește de la un șir gol, `linie = ""`, și adaugă câte un `#` la fiecare pas.',
          solution: {
            language: "python",
            code: `x = int(input("Lungimea: "))
linie = ""
i = 0
while i < x:
    linie = linie + "#"
    i = i + 1
print(linie)`,
          },
          output: "Lungimea: 5\n#####",
          explanation:
            'Varianta scurtă, cu repetarea: `print("#" * x)`. E bine să le știi pe amândouă.',
        },
        {
          type: "exercise",
          title: "Dreptunghiul",
          text: "Citește înălțimea `h` și lățimea `w` și desenează un dreptunghi plin de `#`.",
          hint: "O buclă pentru rânduri; în interiorul ei, construiești un rând de `w` caractere.",
          solution: {
            language: "python",
            code: `h = int(input("Înălțime: "))
w = int(input("Lățime: "))
rand = 0
while rand < h:
    linie = ""
    col = 0
    while col < w:
        linie = linie + "#"
        col = col + 1
    print(linie)
    rand = rand + 1`,
          },
          output: "Înălțime: 3\nLățime: 4\n####\n####\n####",
          explanation:
            'Bucla din interior e **imbricată**: rulează complet pentru fiecare rând. Mai scurt: un singur `print("#" * w)` în bucla de rânduri.',
        },
        {
          type: "exercise",
          title: "A doua și penultima literă",
          text: "Citește un cuvânt și afișează `True` dacă a doua literă e aceeași cu penultima.",
          hint: "A doua literă are indexul `1`, penultima are indexul `-2`.",
          solution: {
            language: "python",
            code: `cuvant = input("Cuvânt: ")
print(cuvant[1] == cuvant[-2])`,
          },
          output: "Cuvânt: rotor\nTrue",
          explanation:
            "În „rotor”, a doua literă e `o`, iar penultima tot `o`.",
        },
        {
          type: "exercise",
          title: "Lungimea fără len()",
          text: "Numără caracterele unui șir fără să folosești `len()`.",
          hint: "`text[i:i + 1]` e litera de la poziția `i`. După ultima literă, felia devine un șir gol, fără să dea eroare.",
          solution: {
            language: "python",
            code: `text = input("Text: ")
nr = 0
while text[nr:nr + 1] != "":
    nr = nr + 1
print(nr)`,
          },
          output: "Text: Python\n6",
          explanation:
            'Spre deosebire de `text[nr]`, care dă eroare după ultima literă, felierea întoarce pur și simplu `""`. Așa știm când ne oprim.',
        },
        {
          type: "keypoints",
          items: [
            "Șirurile se lipesc cu `+`; numerele se transformă în text cu `str()`.",
            "`text[i]` e o literă, `text[a:b]` e o felie (fără indexul `b`).",
            "`*` repetă, `len()` numără, `find()` caută (și dă `-1` dacă nu găsește).",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 7 */
    {
      slug: "functii",
      title: "Funcții: def, parametri și return",
      summary:
        "Cum îți scrii propriile funcții, cum le dai date și cum primești rezultatul înapoi.",
      durationMin: 35,
      blocks: [
        {
          type: "paragraph",
          text: "O **funcție** e un bloc de cod cu nume, care face o sarcină anume. În loc să scrii aceiași 10 pași de fiecare dată, îi grupezi într-o funcție și o „strigi” pe nume când ai nevoie. Nu e magie, e organizare.",
        },
        {
          type: "machine",
          input: "ouă, făină, lapte",
          name: "fa_clatite()",
          output: "clătite",
          caption:
            "Ca o rețetă: ingredientele sunt **parametrii**, pașii sunt codul funcției, iar rezultatul e ce întoarce `return`.",
        },
        { type: "heading", text: "Funcții gata făcute și funcții proprii" },
        {
          type: "cards",
          items: [
            {
              title: "Încorporate",
              code: "print()  input()  len()",
              text: "Vin cu Python; le poți folosi oriunde, fără să le scrii tu.",
              accent: "cyan",
            },
            {
              title: "Proprii",
              code: "def nume():",
              text: "Le scrii tu, cu cuvântul cheie `def`.",
              accent: "pink",
            },
          ],
        },
        {
          type: "code",
          code: `def salut():
    print("Salut! Bine ai venit.")

salut()
salut()`,
          output: "Salut! Bine ai venit.\nSalut! Bine ai venit.",
        },
        {
          type: "callout",
          tone: "remember",
          text: "`def` doar învață programul rețeta. Codul din funcție rulează abia când o **apelezi**: `salut()`.",
        },
        { type: "heading", text: "Parametri: ce primește funcția" },
        {
          type: "code",
          code: `def salut(nume):
    print("Salut, " + nume + "!")

salut("Ana")
salut("Mihai")`,
          output: "Salut, Ana!\nSalut, Mihai!",
        },
        {
          type: "paragraph",
          text: '`nume` e un **parametru**: o variabilă care primește valoarea dată la apel. Și funcțiile gata făcute au parametri: `print("Hi!")` primește textul de afișat, iar `input("Nume? ")` primește întrebarea.',
        },
        { type: "heading", text: "return: păstrezi rezultatul" },
        {
          type: "compare",
          wrong: {
            language: "python",
            label: "Doar afișează",
            code: `def dublu(x):
    print(x * 2)

rezultat = dublu(5)
print(rezultat + 1)`,
          },
          right: {
            language: "python",
            label: "Întoarce rezultatul",
            code: `def dublu(x):
    return x * 2

rezultat = dublu(5)
print(rezultat + 1)`,
          },
          note: "`print` doar arată valoarea pe ecran: funcția din stânga întoarce `None`, iar `None + 1` dă eroare. `return` trimite valoarea înapoi în program, ca s-o poți salva și folosi. Varianta din dreapta afișează `11`.",
        },
        { type: "heading", text: "De ce merită" },
        {
          type: "list",
          items: [
            "**Nu te repeți** (*Don't Repeat Yourself*): ai nevoie de ceva în 10 locuri? Scrii o funcție și o apelezi de 10 ori.",
            "**Repari într-un singur loc**: o greșeală din funcție o corectezi o dată și se repară peste tot.",
            "**Cod ușor de citit**: un program cu funcții bine numite (`calculeaza_media`, `afiseaza_meniu`) se citește ca o listă de pași.",
          ],
        },
        {
          type: "exercise",
          title: "De mai multe ori",
          text: "Scrie funcția `print_many_times(text, times)`, care afișează `text` de `times` ori.",
          solution: {
            language: "python",
            code: `def print_many_times(text, times):
    i = 0
    while i < times:
        print(text)
        i = i + 1

print_many_times("Python este extraordinar", 2)
print_many_times("salutare", 3)`,
          },
          output:
            "Python este extraordinar\nPython este extraordinar\nsalutare\nsalutare\nsalutare",
        },
        {
          type: "exercise",
          title: "Maximul",
          text: "Scrie `maxim(a, b)`, care **întoarce** numărul mai mare. Apoi folosește-o ca să afli maximul a trei numere.",
          hint: "Maximul a trei numere e maximul dintre primul și maximul celorlalte două.",
          solution: {
            language: "python",
            code: `def maxim(a, b):
    if a > b:
        return a
    return b

print(maxim(4, 9))
print(maxim(maxim(4, 9), 7))`,
          },
          output: "9\n9",
          explanation:
            "Când ajunge la `return`, funcția se oprește imediat. De aceea al doilea `return` rulează doar dacă `a > b` a fost fals.",
        },
        {
          type: "exercise",
          title: "Palindromul",
          text: "Scrie `este_palindrom(cuvant)`, care întoarce `True` dacă un cuvânt se citește la fel de la coadă la cap, ca `rotor` sau `cojoc`.",
          hint: "Inversul unui șir e `cuvant[::-1]`. Vei vedea în lecția 8 de ce.",
          solution: {
            language: "python",
            code: `def este_palindrom(cuvant):
    return cuvant == cuvant[::-1]

print(este_palindrom("rotor"))
print(este_palindrom("python"))`,
          },
          output: "True\nFalse",
        },
        {
          type: "keypoints",
          items: [
            "O funcție se definește cu `def nume(parametri):` și rulează când o apelezi.",
            "Parametrii sunt datele pe care le primește funcția.",
            "`return` trimite rezultatul înapoi; `print` doar îl afișează.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 8 */
    {
      slug: "for-si-range",
      title: "Bucla for și range()",
      summary:
        "Parcurgi liste și șiruri element cu element, generezi numere și tai felii cu pas.",
      durationMin: 35,
      blocks: [
        {
          type: "paragraph",
          text: "Bucla `for` repetă codul **pentru fiecare** element dintr-o colecție (o listă, un șir). Imaginează-ți o bandă rulantă: `for` e robotul care ia obiectele de pe bandă, pe rând.",
        },
        {
          type: "callout",
          tone: "remember",
          text: "`while` repetă **cât timp** o condiție e adevărată. `for` repetă **pentru fiecare** element. Când știi exact ce ai de parcurs, `for` e mai simplu.",
        },
        {
          type: "code",
          code: `fructe = ["măr", "banană"]
for fruct in fructe:
    print("Îmi place " + fruct)

for litera in "cod":
    print(litera)`,
          output: "Îmi place măr\nÎmi place banană\nc\no\nd",
        },
        { type: "heading", text: "range(): generatorul de numere" },
        {
          type: "table",
          columns: ["Apel", "Numere", "Ce înseamnă"],
          rows: [
            ["`range(5)`", "0, 1, 2, 3, 4", "de la 0 până la 5, fără 5"],
            ["`range(3, 7)`", "3, 4, 5, 6", "de la 3 până la 7, fără 7"],
            ["`range(1, 9, 2)`", "1, 3, 5, 7", "din 2 în 2"],
            ["`range(5, 0, -1)`", "5, 4, 3, 2, 1", "înapoi, cu pas negativ"],
          ],
        },
        {
          type: "code",
          title: "Cu for: contorul se schimbă singur",
          code: `for i in range(5):
    print(i)`,
          output: "0\n1\n2\n3\n4",
        },
        {
          type: "code",
          title: "Același lucru cu while",
          code: `i = 0
while i < 5:
    print(i)
    i = i + 1`,
        },
        { type: "heading", text: "Liste: insert, felii cu pas, min și max" },
        {
          type: "code",
          code: `fructe = ["măr", "banană"]
fructe.insert(1, "portocală")
print(fructe)`,
          output: "['măr', 'portocală', 'banană']",
        },
        {
          type: "paragraph",
          text: "`insert(i, x)` pune `x` la poziția `i` și le împinge pe celelalte la dreapta. Spre deosebire de `append()`, care pune mereu la final.",
        },
        {
          type: "paragraph",
          text: "Felierea are și un al treilea număr, **pasul**: `[start:stop:pas]`.",
        },
        {
          type: "chars",
          text: "exemplary",
          highlight: [0, 2, 4, 6],
          caption:
            '`"exemplary"[0:7:2]` ia indicii 0, 2, 4 și 6, adică `"eepa"`.',
        },
        {
          type: "code",
          code: `cuvant = "exemplary"
print(cuvant[0:7:2])
numere = [2, 10, 5, 1, 8]
print(numere[::-1])
print(min(numere), max(numere))`,
          output: "eepa\n[8, 1, 5, 10, 2]\n1 10",
        },
        {
          type: "callout",
          tone: "tip",
          text: "`[::-1]` inversează o listă sau un șir: un pas negativ înseamnă „de la coadă la cap”.",
        },
        {
          type: "table",
          columns: ["Ce", "Ce face", "Exemplu"],
          caption: "Recapitulare",
          rows: [
            [
              "`for x in lista:`",
              "repetă pentru fiecare element",
              "`for nota in note:`",
            ],
            ["`range(a, b, pas)`", "generează numere", "`range(0, 10, 2)`"],
            [
              "`insert(i, x)`",
              "adaugă `x` la poziția `i`",
              '`lista.insert(0, "primul")`',
            ],
            ["`[a:b:pas]`", "taie o porțiune", "`text[2:5]`"],
            [
              "`min()` / `max()`",
              "cel mai mic / cel mai mare element",
              "`max([1, 5, 2])` → `5`",
            ],
          ],
        },
        {
          type: "exercise",
          title: "Tabla înmulțirii",
          text: "Afișează tabla înmulțirii cu 7, de la `7 x 1 = 7` până la `7 x 10 = 70`.",
          solution: {
            language: "python",
            code: `for i in range(1, 11):
    print("7 x", i, "=", 7 * i)`,
          },
          output:
            "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
        },
        {
          type: "exercise",
          title: "Suma numerelor pare",
          text: "Calculează suma numerelor pare de la 1 la 100, folosind `range()` cu pas.",
          solution: {
            language: "python",
            code: `suma = 0
for i in range(2, 101, 2):
    suma = suma + i
print(suma)`,
          },
          output: "2550",
        },
        {
          type: "exercise",
          title: "De câte ori apare fiecare literă",
          text: "Scrie o funcție care primește un cuvânt și afișează de câte ori apare fiecare literă.",
          hint: "Pentru fiecare literă, parcurge din nou cuvântul și numără aparițiile. Ca să nu afișezi aceeași literă de mai multe ori, ține minte literele deja verificate.",
          solution: {
            language: "python",
            code: `def aparitii(cuvant):
    vazute = []
    for litera in cuvant:
        if litera not in vazute:
            vazute.append(litera)
            nr = 0
            for l in cuvant:
                if l == litera:
                    nr = nr + 1
            print(litera + ":", nr)

aparitii("banana")`,
          },
          output: "b: 1\na: 3\nn: 2",
          explanation:
            "Fără lista `vazute`, litera `a` ar fi afișată de trei ori. În lecția 9 vei rezolva problema și mai simplu, cu un dicționar.",
        },
        {
          type: "keypoints",
          items: [
            "`for` parcurge pe rând elementele unei liste sau literele unui șir.",
            "`range(start, stop, pas)` generează numere, fără `stop`.",
            "`insert()` adaugă la o poziție; `[a:b:pas]` taie cu pas; `[::-1]` inversează; `min()` și `max()` dau extremele.",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ 9 */
    {
      slug: "dictionare",
      title: "Dicționare",
      summary:
        "Perechi cheie–valoare: cum le creezi, le parcurgi, le combini și le modifici.",
      durationMin: 35,
      blocks: [
        {
          type: "paragraph",
          text: "Un **dicționar** păstrează informații în perechi **cheie–valoare**, ca un dicționar adevărat: cauți cuvântul (cheia) și găsești definiția (valoarea).",
        },
        {
          type: "cards",
          items: [
            {
              title: "Cheia",
              code: '"Ana"',
              text: "Unică, ca un cuvânt din dicționar: nu pot exista două chei identice.",
              accent: "pink",
            },
            {
              title: "Valoarea",
              code: "15",
              text: "Informația legată de cheie. Poate fi orice: număr, text, chiar o listă.",
              accent: "cyan",
            },
          ],
        },
        {
          type: "code",
          code: `varste = {
    "Ana": 15,
    "Mihai": 16,
    "Ioana": 14,
}
print(varste["Ana"])
varste["Luca"] = 15
varste["Ana"] = 16
print(varste)`,
          output: "15\n{'Ana': 16, 'Mihai': 16, 'Ioana': 14, 'Luca': 15}",
        },
        {
          type: "callout",
          tone: "info",
          text: 'Accesezi o valoare după cheie, nu după poziție: `varste["Ana"]`. Dacă atribui o cheie nouă, perechea se adaugă; dacă cheia există deja, i se schimbă valoarea.',
        },
        { type: "heading", text: "Parcurgerea cu items()" },
        {
          type: "code",
          code: `varste = {"Ana": 15, "Mihai": 16}
for nume, varsta in varste.items():
    print(nume + ": " + str(varsta))`,
          output: "Ana: 15\nMihai: 16",
        },
        { type: "heading", text: "zip(): două liste devin un dicționar" },
        {
          type: "code",
          code: `nume = ["Ana", "Mihai"]
varste = [15, 16]
print(dict(zip(nume, varste)))`,
          output: "{'Ana': 15, 'Mihai': 16}",
        },
        {
          type: "callout",
          tone: "analogy",
          text: "`zip()` e ca un fermoar: ia câte un element din fiecare listă, în ordine, și le prinde în perechi.",
        },
        { type: "heading", text: "Alte unelte utile" },
        {
          type: "table",
          columns: ["Ce", "Ce face", "Exemplu"],
          rows: [
            ["`del d[cheie]`", "șterge perechea", '`del varste["Ana"]`'],
            [
              "`d.pop(cheie)`",
              "scoate perechea și îți dă valoarea",
              '`v = varste.pop("Mihai")`',
            ],
            [
              "`text.split()`",
              "împarte un text în cuvinte",
              "`\"a b c\".split()` → `['a', 'b', 'c']`",
            ],
            [
              "`sorted(x)`",
              "întoarce o listă nouă, ordonată",
              "`sorted([3, 1, 2])` → `[1, 2, 3]`",
            ],
          ],
        },
        {
          type: "paragraph",
          text: "Cu `pop()` poți redenumi o cheie: scoți valoarea de sub cheia veche și o pui sub una nouă.",
        },
        {
          type: "code",
          code: `date = {"nume": "Kelly", "oras": "Cluj"}
date["locatie"] = date.pop("oras")
print(date)`,
          output: "{'nume': 'Kelly', 'locatie': 'Cluj'}",
        },
        {
          type: "exercise",
          title: "Filtrul de nume",
          text: 'Ai listele `nume = ["Andrei", "Ana", "Maria", "Ion", "Gabriela"]` și `varste = [11, 15, 14, 17, 21]`. Construiește un dicționar doar cu persoanele care au numele mai lung de 4 litere **și** vârsta impară.',
          hint: "Parcurge perechile cu `for n, v in zip(nume, varste):` și adaugă în dicționar doar ce trece de ambele condiții.",
          solution: {
            language: "python",
            code: `nume = ["Andrei", "Ana", "Maria", "Ion", "Gabriela"]
varste = [11, 15, 14, 17, 21]

def filtreaza(nume, varste):
    rezultat = {}
    for n, v in zip(nume, varste):
        if len(n) > 4 and v % 2 == 1:
            rezultat[n] = v
    return rezultat

print(filtreaza(nume, varste))`,
          },
          output: "{'Andrei': 11, 'Gabriela': 21}",
          explanation:
            "Maria are numele destul de lung, dar 14 e par; Ana și Ion au numele prea scurte.",
        },
        {
          type: "exercise",
          title: "Literele, cu dicționar",
          text: "Refă exercițiul din lecția 8: numără de câte ori apare fiecare literă, de data aceasta cu un dicționar.",
          solution: {
            language: "python",
            code: `def aparitii(cuvant):
    numar = {}
    for litera in cuvant:
        if litera in numar:
            numar[litera] = numar[litera] + 1
        else:
            numar[litera] = 1
    return numar

print(aparitii("banana"))`,
          },
          output: "{'b': 1, 'a': 3, 'n': 2}",
          explanation:
            "O singură trecere prin cuvânt, fără lista de litere „văzute”: dicționarul ține minte singur fiecare literă.",
        },
        {
          type: "exercise",
          title: "Cuvintele în ordine",
          text: "Citește o propoziție, împarte-o în cuvinte și afișează-le în ordine alfabetică.",
          solution: {
            language: "python",
            code: `propozitie = input("Propoziție: ")
cuvinte = propozitie.split()
for c in sorted(cuvinte):
    print(c)`,
          },
          output: "Propoziție: zebra are un ac\nac\nare\nun\nzebra",
        },
        {
          type: "keypoints",
          items: [
            "Un dicționar ține perechi `cheie: valoare`, între acolade `{}`.",
            'Accesezi și modifici după cheie: `d["cheie"] = valoare`.',
            "`items()` parcurge perechile, `zip()` combină liste, `del` și `pop()` șterg, `split()` și `sorted()` ajută la text și ordine.",
          ],
        },
      ],
    },

    /* ----------------------------------------------------------------- 10 */
    {
      slug: "module-si-fisiere",
      title: "Module și fișiere",
      summary:
        "Unelte gata făcute cu import, numere la întâmplare și lucrul cu fișiere: scriere, adăugare, citire.",
      durationMin: 40,
      blocks: [
        {
          type: "paragraph",
          text: "Python vine cu „cutii” de unelte gata făcute, numite **module**. Ca să folosești o unealtă dintr-o cutie, deschizi cutia cu `import`.",
        },
        {
          type: "code",
          code: `import os
print(os.getcwd())`,
        },
        {
          type: "paragraph",
          text: "`os` (de la *operating system*) lucrează cu fișierele și folderele calculatorului. `getcwd()` îți spune în ce folder rulează programul.",
        },
        { type: "heading", text: "Modulul random: surprize" },
        {
          type: "code",
          code: `import random
zar = random.randint(1, 6)
print("Ai dat", zar)
fructe = ["măr", "banană", "cireașă"]
print(random.choice(fructe))`,
        },
        {
          type: "callout",
          tone: "info",
          text: "`randint(a, b)` alege un număr întreg între `a` și `b`, **inclusiv** capetele. `choice(lista)` alege un element la întâmplare. Rezultatul diferă la fiecare rulare.",
        },
        { type: "heading", text: "Fișiere: scriere, adăugare, citire" },
        {
          type: "cards",
          items: [
            {
              title: "Modul w",
              code: 'open("note.txt", "w")',
              text: "**Scriere**: creează fișierul sau îl golește și scrie de la zero.",
              accent: "orange",
            },
            {
              title: "Modul a",
              code: 'open("note.txt", "a")',
              text: "**Adăugare**: nu șterge nimic, scrie la final.",
              accent: "green",
            },
            {
              title: "Modul r",
              code: 'open("note.txt", "r")',
              text: "**Citire**: deschizi fișierul ca să vezi ce scrie în el.",
              accent: "cyan",
            },
          ],
        },
        {
          type: "code",
          code: `f = open("agenda.txt", "w")
f.write("Luni: Python\\n")
f.write("Miercuri: web\\n")
f.close()

f = open("agenda.txt", "r")
linii = f.readlines()
f.close()
print(linii)`,
          output: "['Luni: Python\\n', 'Miercuri: web\\n']",
        },
        {
          type: "callout",
          tone: "info",
          text: "`readlines()` citește tot fișierul și îți dă o listă, în care fiecare rând e un element. `\\n` de la finalul rândurilor înseamnă „rând nou”.",
        },
        { type: "heading", text: "with open(): fișierul se închide singur" },
        {
          type: "code",
          code: `with open("agenda.txt", "r") as f:
    print(f.read())
# aici fișierul e deja închis`,
          output: "Luni: Python\nMiercuri: web\n",
        },
        {
          type: "callout",
          tone: "tip",
          text: "Rândul gol de la final apare pentru că textul citit se termină deja cu `\\n`, iar `print()` mai adaugă unul. Dacă uiți `f.close()`, datele pot să nu ajungă în fișier. Cu `with`, Python îl închide singur, chiar dacă apare o eroare. Folosește mereu varianta cu `with`.",
        },
        { type: "heading", text: "Copiere, redenumire, ștergere" },
        {
          type: "table",
          columns: ["Funcție", "Ce face"],
          rows: [
            [
              '`shutil.copy("a.txt", "b.txt")`',
              "face o copie identică a fișierului (cu `import shutil`)",
            ],
            [
              '`os.rename("vechi.txt", "nou.txt")`',
              "schimbă numele fișierului",
            ],
            ['`os.remove("nou.txt")`', "șterge fișierul definitiv"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          text: "`os.remove()` nu trimite fișierul în Coșul de gunoi: îl șterge de tot. Verifică de două ori numele înainte.",
        },
        {
          type: "exercise",
          title: "Familie și prieteni",
          text: 'Salvează lista `familie = ["mama", "tata", "sora"]` în `familie.txt`, cu elementele separate prin virgulă și spațiu. Apoi citește `prieteni.txt` (scris la fel) și pune toate numele împreună în `toti.txt`.',
          hint: '`", ".join(lista)` lipește elementele cu `, ` între ele; `text.split(", ")` face invers.',
          solution: {
            language: "python",
            code: `familie = ["mama", "tata", "sora"]
with open("familie.txt", "w") as f:
    f.write(", ".join(familie))

with open("prieteni.txt", "r") as f:
    prieteni = f.read().split(", ")

with open("toti.txt", "w") as f:
    f.write(", ".join(familie + prieteni))`,
          },
        },
        {
          type: "exercise",
          title: "Rândul norocos",
          text: "Scrie o funcție care întoarce un rând ales la întâmplare dintr-un fișier.",
          solution: {
            language: "python",
            code: `import random

def rand_norocos(nume_fisier):
    with open(nume_fisier, "r") as f:
        linii = f.readlines()
    return random.choice(linii)

print(rand_norocos("citate.txt"))`,
          },
        },
        {
          type: "exercise",
          title: "Jurnalul",
          text: "Fă un program care, la fiecare rulare, adaugă în `jurnal.txt` un rând nou cu ce scrie utilizatorul, fără să șteargă rândurile vechi.",
          hint: "Ce mod de deschidere nu șterge nimic din fișier?",
          solution: {
            language: "python",
            code: `nota = input("Ce ai făcut azi? ")
with open("jurnal.txt", "a") as f:
    f.write(nota + "\\n")
print("Am salvat.")`,
          },
          output: "Ce ai făcut azi? Am terminat lecția 10\nAm salvat.",
        },
        {
          type: "keypoints",
          items: [
            "`import` deschide un modul: `os` pentru fișiere și foldere, `random` pentru alegeri la întâmplare.",
            "Modurile de deschidere: `w` scrie de la zero, `a` adaugă la final, `r` citește.",
            "Folosește `with open(...) as f:`, ca fișierul să se închidă singur.",
          ],
        },
      ],
    },

    /* ----------------------------------------------------------------- 11 */
    {
      slug: "hackathon",
      title: "Hackathon: proiectul tău",
      summary:
        "Alegi o misiune, o construiești de la idee la demo și o prezinți ca un programator.",
      durationMin: 90,
      blocks: [
        {
          type: "paragraph",
          text: "**Hackathon** = *hack* (programare creativă) + *maraton* (în timp scurt). Construiești un proiect al tău, de la idee până la demo, folosind tot ce ai învățat în acest modul.",
        },
        { type: "heading", text: "Planul tău" },
        {
          type: "steps",
          items: [
            {
              title: "Planifică",
              text: "Alege o misiune și scrie pe hârtie pașii programului.",
            },
            {
              title: "Codifică",
              text: "Scrie codul bucată cu bucată și rulează-l des.",
            },
            {
              title: "Testează",
              text: "Încearcă și date neobișnuite. Repară bug-urile găsite.",
            },
            {
              title: "Prezintă",
              text: "Arată ce ai construit și ce ai învățat pe drum.",
            },
          ],
        },
        { type: "heading", text: "Alege o misiune" },
        {
          type: "cards",
          items: [
            {
              title: "Banca",
              text: "Ține evidența economiilor: depuneri, retrageri, sold. **Folosești**: variabile, `if`, `while`, funcții.",
              accent: "green",
            },
            {
              title: "Agentul",
              text: "Un asistent care răspunde la mesaje secrete și comenzi. **Folosești**: `input()`, `if`/`elif`, dicționare.",
              accent: "cyan",
            },
            {
              title: "Biblioteca digitală",
              text: "Titluri și autori într-un dicționar, salvați în `biblioteca.txt`. **Folosești**: dicționare, fișiere.",
              accent: "yellow",
            },
            {
              title: "Criptorul secret",
              text: "Ascunde și decodifică mesaje cu cifrul lui Cezar. **Folosești**: șiruri, `for`, `find()`.",
              accent: "pink",
            },
          ],
        },
        { type: "heading", text: "Cifrul lui Cezar, pe scurt" },
        {
          type: "paragraph",
          text: "Agenții secreți nu trimit mesaje simple, pentru că pot fi interceptate. Cifrul lui Cezar mută fiecare literă cu câteva poziții în alfabet: cu cheia 3, `a` devine `d`, `b` devine `e` și așa mai departe.",
        },
        {
          type: "code",
          title: "Un început pentru criptor",
          code: `alfabet = "abcdefghijklmnopqrstuvwxyz"
cheie = 3
mesaj = "salut"
criptat = ""
for litera in mesaj:
    poz = alfabet.find(litera)
    criptat = criptat + alfabet[(poz + cheie) % 26]
print(criptat)`,
          output: "vdoxw",
        },
        {
          type: "callout",
          tone: "tip",
          text: "`% 26` face ca după `z` să revii la `a`. Pentru decodificare, scazi cheia în loc s-o aduni. Ce se întâmplă cu spațiile și cu majusculele? E prima ta provocare.",
        },
        { type: "heading", text: "Cum prezinți ca un profesionist" },
        {
          type: "list",
          items: [
            "**Povestea**: ce problemă rezolvă programul și de ce l-ai ales.",
            "**Codul**: arată o bucată de care ești mândru, de exemplu o funcție sau un `if` isteț.",
            "**Demo**: rulează-l live. Dacă apare un bug, explică-l: face parte din meseria de programator.",
            "**Viitorul**: ce ai mai adăuga dacă ai avea încă o săptămână.",
          ],
        },
        {
          type: "exercise",
          title: "Decodificatorul",
          text: "Mesajul `vdoxw` a fost criptat cu cifrul lui Cezar, cu cheia 3. Scrie programul care îl decodifică și afișează mesajul inițial.",
          hint: "Faci drumul invers: în loc să aduni cheia la poziția literei, o scazi. `% 26` are grijă de literele de la începutul alfabetului.",
          solution: {
            language: "python",
            code: `alfabet = "abcdefghijklmnopqrstuvwxyz"
cheie = 3
criptat = "vdoxw"
mesaj = ""
for litera in criptat:
    poz = alfabet.find(litera)
    mesaj = mesaj + alfabet[(poz - cheie) % 26]
print(mesaj)`,
          },
          output: "salut",
          explanation:
            "Pentru „a”, poziția 0 minus 3 dă -3, iar `-3 % 26` este 23, adică „x”. Așa alfabetul se „închide în cerc” și în sens invers.",
        },
        {
          type: "exercise",
          title: "Contul din bancă",
          text: "Scrie funcțiile `depune(sold, suma)` și `retrage(sold, suma)`, care întorc soldul nou. Dacă vrei să retragi mai mult decât ai, `retrage` afișează `Fonduri insuficiente` și lasă soldul neschimbat. Pornește de la 0, depune 100, retrage 30, apoi încearcă să retragi 500.",
          hint: "Fiecare funcție primește soldul actual și îl întoarce pe cel nou, cu `return`. În program, salvezi rezultatul înapoi: `sold = depune(sold, 100)`.",
          solution: {
            language: "python",
            code: `def depune(sold, suma):
    return sold + suma

def retrage(sold, suma):
    if suma > sold:
        print("Fonduri insuficiente")
        return sold
    return sold - suma

sold = 0
sold = depune(sold, 100)
sold = retrage(sold, 30)
sold = retrage(sold, 500)
print("Sold:", sold)`,
          },
          output: "Fonduri insuficiente\nSold: 70",
          explanation:
            "E începutul misiunii „Banca”: adaugă un meniu cu `while` și `input()`, și ai un program complet.",
        },
        {
          type: "keypoints",
          title: "La final",
          items: [
            "Ai trecut prin variabile, decizii, bucle, liste, șiruri, funcții, dicționare și fișiere.",
            "Un proiect mic, terminat și prezentat, valorează mai mult decât unul mare, neterminat.",
            "Hacking mode: **ON**.",
          ],
        },
      ],
    },
  ],
};
