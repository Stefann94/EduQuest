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
| `/`                | Pagina de prezentare                           |
| `/intra`           | Intrare în joc cu PIN + nickname (invitați)    |
| `/autentificare`   | Login elev (utilizator) / mentor (email)       |
| `/elev`            | Panoul elevului: teme, jocuri, clasament       |
| `/mentor`          | Panoul mentorului: grupe, teme, quiz-uri       |
| `/mentor/sesiune`  | Lobby-ul quiz-ului live (PIN pe proiector)     |
| `/live`            | Quiz live jucabil (demo, local)                |

## Structură

```
src/
├── app/                 # rute (App Router)
├── components/
│   ├── ui/              # componente shadcn/ui (generate, le putem modifica)
│   ├── app/             # cadrul aplicației (meniu lateral)
│   ├── site/            # componente pentru pagina publică
│   ├── quiz/            # quiz live, formular PIN
│   └── auth/            # formular de login
└── lib/                 # utilitare, date demo
```

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
