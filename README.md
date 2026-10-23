# EduQuest

Platformă web pentru învățarea programării: elevi și mentori, clase cu coduri de invitație,
materiale și probleme rezolvate, teme cu feedback (fără note), prezență, XP, clasamente,
quiz-uri individuale și sesiuni de quiz live.

- **Specificația produsului:** [`docs/PROJECT.md`](docs/PROJECT.md)
- **Convenții de cod și design:** [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)

> **Stadiu:** interfața completă pe date demo ([`src/lib/data/demo.ts`](src/lib/data/demo.ts)).
> Urmează conectarea la Supabase (autentificare, baza de date, fișiere).

## Stack

| Strat     | Tehnologie                                                     |
| --------- | -------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Cache Components, React Compiler)      |
| Limbaj    | TypeScript                                                     |
| UI        | Tailwind CSS v4 + shadcn/ui (Base UI) + lucide-react + Geist   |
| Cod       | Shiki (evidențierea sintaxei, doar pe server)                  |
| Validare  | Zod                                                            |
| Backend   | Supabase: Postgres + RLS, Auth, Storage, Realtime (în curând)  |
| Hosting   | Vercel                                                         |
| Calitate  | Biome (lint + format)                                          |
| Pachete   | pnpm                                                           |

## Pornire rapidă

Ai nevoie de **Node.js 22+** și **pnpm 10+** (`npm i -g pnpm`).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

În demo, fiecare rol are un utilizator fix. Comuți între ele din meniul contului
(colțul din dreapta sus → „Vizualizare demo”):

| Rol            | Pornește de la | Utilizator demo  |
| -------------- | -------------- | ---------------- |
| Elev           | `/`            | Tudor Popescu    |
| Mentor         | `/mentor`      | Ana Ionescu      |
| Administrator  | `/admin`       | Echipa EduQuest  |

### Scripturi

| Comandă          | Ce face                         |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Server de dezvoltare            |
| `pnpm build`     | Build de producție              |
| `pnpm start`     | Pornește build-ul de producție  |
| `pnpm lint`      | Verifică codul cu Biome         |
| `pnpm format`    | Formatează codul                |
| `pnpm typecheck` | Verifică tipurile TypeScript    |

Înainte de un commit: `pnpm lint && pnpm typecheck`.

> **Atenție:** oprește `pnpm dev` înainte să schimbi ramura git. Altfel serverul poate păstra
> în cache stiluri vechi. Dacă se întâmplă: oprește serverul, șterge `.next/dev/cache` și
> pornește-l din nou.

## Structură

```
src/
├── app/
│   ├── (auth)/      # autentificare, înregistrare, aplicație mentor, parole
│   ├── (student)/   # zona elevului, la rădăcina site-ului
│   ├── live/        # quiz-ul live, pe tot ecranul
│   ├── mentor/      # zona mentorului
│   └── admin/       # zona administratorului
├── components/
│   ├── ui/          # componente shadcn/ui
│   ├── shell/       # bara de navigare de sus, meniul de pe telefon, notificări, căutare, cont
│   └── common/      # antet de pagină, stări, XP, avatar, cod, stări goale
└── lib/
    ├── data/        # tipuri, date demo, funcții de citire (singura sursă de date)
    └── format.ts    # date în română, XP, pluraluri
```

## Cum lucrăm în echipă

1. `main` e mereu funcțional și se publică automat pe Vercel.
2. Pentru fiecare lucru nou: `git switch -c feature/<ce-faci>`.
3. Commit-uri mici, cu mesaje clare.
4. Push pe ramură: Vercel face un link de preview. Apoi Pull Request și merge în `main`.

## Securitate (reguli de bază)

- Autorizarea se verifică **pe server**, în funcțiile de date și în Server Actions. Ascunderea
  unui buton nu protejează datele.
- Nicio cheie secretă în cod; fișierele `.env*` sunt ignorate de git.
- Cheia `service_role` de la Supabase stă doar pe server, niciodată cu prefix `NEXT_PUBLIC_`.
- Răspunsurile corecte la quiz-uri nu ajung în browser înainte de trimitere.
