# Convenții de cod — EduQuest

Specificația produsului este în [`PROJECT.md`](PROJECT.md). Acest document descrie **cum** construim.

## Limbă și ton

- Interfața este **în română, cu diacritice** (ă, â, î, ș, ț). Comentariile din cod tot în română.
- Ton profesional și prietenos, potrivit pentru elevi: fraze scurte, clare. Fără exclamații în exces, fără emoji în texte.
- Nu folosim note numerice pentru teme (PROJECT.md §7.4). Feedback-ul este text, iar recompensa este XP.

## Arhitectură

```
src/
├── app/
│   ├── (auth)/        # autentificare, înregistrare, aplicație mentor, parole
│   ├── (student)/     # zona elevului, la rădăcina site-ului (/)
│   ├── mentor/        # zona mentorului (/mentor)
│   └── admin/         # zona administratorului (/admin)
├── components/
│   ├── ui/            # componente shadcn/ui (Base UI)
│   ├── shell/         # meniul lateral, bara de sus, notificări, căutare, cont
│   ├── common/        # piese reutilizabile: antet de pagină, stări, XP, avatar, cod
│   ├── classes/ assignments/ learning/ ...   # componente pe domenii
└── lib/
    ├── data/types.ts    # modelul de date (oglindește viitoarea schemă Supabase)
    ├── data/demo.ts     # date demo
    ├── data/queries.ts  # SINGURUL loc din care paginile citesc date
    └── format.ts        # formatarea datelor (ro-RO, Europe/Bucharest), XP, pluraluri
```

- **Paginile citesc date doar prin funcțiile din `lib/data/queries.ts`** (sau dintr-un fișier `lib/data/<zonă>-queries.ts` nou). Când trecem pe Supabase se schimbă doar implementarea lor.
- Fiecare funcție primește utilizatorul (`getViewer(role)`) și **verifică accesul pe server**. O pagină a unei resurse la care utilizatorul nu are acces apelează `notFound()`.
- Server Components implicit. `"use client"` doar pentru interacțiune (formulare, dialoguri, tab-uri cu stare, quiz).
- **Modificările** (trimiteri, review, prezență, aprobări) se fac prin **Server Actions** (`actions.ts` lângă pagină, cu `"use server"`). În demo, acțiunea validează datele și întoarce un rezultat, fără să salveze nimic. Interfața confirmă cu un mesaj (`toast` din `sonner`) și menționează discret că salvarea reală vine cu baza de date.

## Next.js 16 (citește `node_modules/next/dist/docs/` la nevoie)

- `params` este un `Promise`. Proiectul are `cacheComponents` activ, deci **orice acces la `params` trebuie pus într-un `<Suspense>`**, iar rutele dinamice au `generateStaticParams` (folosește `demoIds` din `queries.ts`):

```tsx
type Props = PageProps<"/clase/[id]">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  // ...
}
```

  La fel în `layout.tsx` care citește `params` (`LayoutProps<"/clase/[id]">`).
- Nu folosi `searchParams` (face pagina dinamică). Filtrele și tab-urile țin starea în client.
- Nu folosi `new Date()` fără argumente și nici `Date.now()` în Server Components. Pentru „acum” folosește `now()` din `lib/format.ts`.
- Datele se afișează **doar** cu funcțiile din `lib/format.ts` (`formatDay`, `formatDateTime`, `relativeDays` etc.), ca serverul și browserul să afișeze același text.

## Design

Direcție (PROJECT.md §13): profesional, modern, prietenos, organizat. **Nu** jucăuș: fără emoji în interfață (excepție: avatarele elevilor), fără animații decorative, fără culori stridente.

- **Culori** (`globals.css`): fundal neutru, `primary` = indigo, accent `xp` = chihlimbar (doar pentru XP/recompense). Stări: `success`, `warning`, `info`, `destructive`, fiecare cu varianta `-soft` pentru fundal.
- **Stările nu depind doar de culoare**: folosește `StatusBadge` (iconiță + text) și variantele gata făcute din `components/common/status.tsx`: `SubmissionStatusBadge`, `AssignmentTypeBadge`, `PublicationBadge`, `ApplicationStatusBadge`, `DifficultyBadge`, `XpBadge`.
- **Iconițe**: doar `lucide-react`, `size-4` în text, `size-[18px]` în meniu.
- **Carduri**: `rounded-xl border bg-card shadow-xs`. Pentru blocuri cu titlu folosește `Section` din `components/common/section.tsx`.
- **Antetul paginii**: `PageHeader` (titlu, descriere, acțiuni, link „înapoi”, meta).
- **Liste goale**: `EmptyState` (iconiță, titlu, explicație, acțiune).
- **Cod**: `CodeBlock` (Server Component, evidențiere cu Shiki).
- **Avatar**: `UserAvatar` (personajul ales sau inițialele).
- **Mișcare**: doar clasa `stagger` pe liste (elementele apar rapid, pe rând) și `page-enter` din `template.tsx`. Fără alte animații.
- Spațiere: pagini cu `grid gap-6`/`gap-8`; carduri cu `p-5`; liste cu `gap-2`/`gap-3`.
- Butoane: `Button` / `buttonVariants` din `components/ui/button.tsx`. Linkurile care arată ca butoane: `<Link className={buttonVariants(...)}>`. Pentru triggerele Base UI: `render={<Button />}`.
- Acțiunile distructive (ștergere, revocare cod, suspendare cont) cer confirmare într-un `Dialog`.

## Accesibilitate

- Fiecare câmp are `Label`. Erorile de validare apar sub câmp, cu `role="alert"` și `aria-invalid`.
- Tot ce se poate apăsa e accesibil din tastatură și are focus vizibil (componentele `ui/` îl au deja).
- Iconițele decorative au `aria-hidden="true"`.

## Verificări înainte de commit

```bash
pnpm lint        # Biome
pnpm typecheck   # tipuri
pnpm build       # build de producție
```
