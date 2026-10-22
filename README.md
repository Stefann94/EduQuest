# EduQuest

Platformă web pentru mentori de programare și elevii lor: quiz-uri live sincronizate,
jocuri rapide, teme cu cod și progres (XP, niveluri, insigne).

> **Stadiu:** primul design. Paginile folosesc date demonstrative din
> [`src/lib/demo-data.ts`](src/lib/demo-data.ts). Urmează conectarea la Supabase.

## Stack

| Strat      | Tehnologie                                                   |
| ---------- | ------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Cache Components, React Compiler)    |
| Limbaj     | TypeScript                                                   |
| UI         | Tailwind CSS v4 + shadcn/ui (Base UI) + lucide-react         |
| Backend    | Supabase: Postgres + RLS, Auth, Realtime, Storage (în curând) |
| Hosting    | Vercel                                                       |
| Calitate   | Biome (lint + format)                                        |
| Pachete    | pnpm                                                         |

## Pornire rapidă

Ai nevoie de **Node.js 22+** și **pnpm 10+** (`npm i -g pnpm`).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### Scripturi

| Comandă          | Ce face                                     |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Server de dezvoltare                        |
| `pnpm build`     | Build de producție                          |
| `pnpm start`     | Pornește build-ul de producție              |
| `pnpm lint`      | Verifică codul cu Biome                     |
| `pnpm format`    | Formatează codul                            |
| `pnpm typecheck` | Verifică tipurile TypeScript                |

Înainte de un commit rulează `pnpm lint && pnpm typecheck`.

## Pagini

| Rută               | Ce este                                        |
| ------------------ | ---------------------------------------------- |
| `/`                 | Acasă (elev): nivel, teme, exerciții, PIN      |
| `/quiz`             | Quiz live cu PIN, exersare, istoric            |
| `/teme`             | Temele: de făcut / trimise / corectate         |
| `/exercitii`        | Exerciții de programare, filtrate pe teme      |
| `/exercitii/[id]`   | Un exercițiu: cerință, indiciu, editor de cod  |
| `/intra`            | Intrare în joc cu PIN + nickname (invitați)    |
| `/autentificare`    | Login elev (utilizator) / mentor (email)       |
| `/mentor`           | Panoul mentorului: grupe, teme, quiz-uri       |
| `/mentor/sesiune`   | Lobby-ul quiz-ului live (PIN pe proiector)     |
| `/live`             | Quiz live jucabil (demo, local)                |

## Structură

```
src/
├── app/
│   ├── (elev)/          # paginile elevului (rădăcina site-ului)
│   └── mentor/          # paginile mentorului
├── components/
│   ├── ui/              # componente shadcn/ui (generate, le putem modifica)
│   ├── app/             # meniul lateral, bara de sus, carduri comune
│   ├── personalize/     # alegerea culorii și a avatarului
│   ├── quiz/            # quiz live, formulare PIN
│   ├── fx/              # efecte (steluțele la click)
│   ├── brand/           # logo, mascota Bit
│   ├── site/            # cadrul paginilor de intrare/login
│   └── auth/            # formular de login
└── lib/                 # teme, preferințe, utilitare, date demo
```

### Teme de culoare

Cele 8 teme sunt în [`src/app/globals.css`](src/app/globals.css) (`[data-theme="..."]`).
Fiecare definește o nuanță (`--h`) și culoarea principală; restul culorilor se
calculează din nuanță. Folosiți clasele de temă (`bg-primary`, `bg-secondary`,
`text-muted-foreground` etc.), nu culori fixe, ca toată interfața să urmeze
alegerea copilului.

Componente shadcn noi: `pnpm dlx shadcn@latest add <nume>`.

## Cum lucrăm în echipă

1. `main` e mereu funcțional. Nu se face push direct pe `main`.
2. Pentru fiecare lucru nou: `git switch -c feature/<ce-faci>` (ex. `feature/quiz-live`).
3. Commit-uri mici, cu mesaje clare.
4. Push pe ramură și deschizi un **Pull Request**. Celălalt îl citește, apoi se face merge.
5. După conectarea la Vercel, fiecare PR primește automat un link de preview.

## Securitate (reguli de bază)

- Nicio cheie secretă în cod. Fișierele `.env*` sunt ignorate de git.
- Cheia `service_role` de la Supabase stă **doar** pe server, niciodată cu prefix `NEXT_PUBLIC_`.
- Fiecare tabel din baza de date are **Row Level Security** activat.
- Scorurile și răspunsurile corecte la quiz se verifică pe server, nu în browser.
