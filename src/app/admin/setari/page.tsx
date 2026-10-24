import {
  CircleHelp,
  KeyRound,
  Lock,
  type LucideIcon,
  MailCheck,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { StatusBadge, XpBadge } from "@/components/common/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Setări platformă" };

// Regulile inițiale din docs/PROJECT.md §10.2.
const XP_RULES: { activity: string; xp: number | string; note?: string }[] = [
  {
    activity: "Prezență la o întâlnire eligibilă",
    xp: 2,
    note: "O singură dată pe întâlnire",
  },
  {
    activity: "Trimiterea validă a unei teme",
    xp: 2,
    note: "O singură dată pe temă",
  },
  {
    activity: "Bonus pentru calitatea temei",
    xp: "0–5",
    note: "Acordat de mentor, până la maximul temei",
  },
  { activity: "Quiz live, locul 1", xp: 5 },
  { activity: "Quiz live, locul 2", xp: 4 },
  { activity: "Quiz live, locul 3", xp: 3 },
  { activity: "Quiz live, locul 4", xp: 2 },
  {
    activity: "Quiz live, ceilalți participanți",
    xp: 1,
    note: "Minimum garantat pentru participare",
  },
];

const INVITE_POLICY = [
  "Fiecare clasă are un cod de invitație de 6 caractere: litere mari și cifre (de exemplu PY7K2Q).",
  "Doar mentorul clasei poate vedea, regenera sau revoca codul.",
  "Un cod regenerat îl înlocuiește imediat pe cel vechi; codul revocat nu mai poate fi folosit.",
  "Clasele arhivate nu mai primesc elevi noi, chiar dacă cineva are codul.",
  "Elevii văd un mesaj clar pentru coduri greșite, expirate sau revocate.",
];

const SECURITY: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ServerCog,
    title: "Autorizare pe server",
    text: "Fiecare citire și modificare verifică rolul pe server. Ascunderea unui buton nu este considerată protecție.",
  },
  {
    icon: MailCheck,
    title: "Email verificat",
    text: "Conturile de elev se confirmă prin email. Mentorii își activează contul dintr-un link unic, după aprobarea aplicației.",
  },
  {
    icon: KeyRound,
    title: "Parole",
    text: "Parolele nu se trimit niciodată pe email. Linkurile de resetare sunt valabile 60 de minute și pot fi folosite o singură dată.",
  },
  {
    icon: Lock,
    title: "Fără enumerarea conturilor",
    text: "Recuperarea parolei afișează același mesaj, indiferent dacă adresa are cont sau nu.",
  },
  {
    icon: ShieldCheck,
    title: "Fără auto-promovare",
    text: "Niciun utilizator nu își poate acorda singur drepturi. Rolul de mentor vine doar dintr-o aplicație aprobată.",
  },
];

// Deciziile deschise din docs/PROJECT.md §17 care afectează administrarea.
const OPEN_DECISIONS = [
  "Dacă o clasă poate avea mai mulți mentori în prima versiune.",
  "Dacă elevii păstrează accesul nelimitat la materialele claselor arhivate.",
  "Regulile de XP pentru quiz-urile individuale de exersare.",
  "Departajarea la egalitate în clasamentul quiz-urilor live.",
  "Regulile pentru termene ratate și teme trimise cu întârziere.",
  "Dacă elevii pot comunica direct cu mentorii.",
  "Preferințele finale pentru notificări.",
  "Politicile de retenție a datelor și de ștergere a conturilor.",
];

export default async function PlatformSettingsPage() {
  await requireUser("admin");

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Setări platformă"
        description="Regulile care se aplică tuturor claselor. Pentru moment sunt doar pentru consultare."
        meta={
          <StatusBadge icon={Lock} tone="neutral">
            Doar citire
          </StatusBadge>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Section
            title="Reguli XP"
            description="XP-ul este o recompensă pentru participare, nu o notă."
            bodyClassName="p-0"
          >
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Activitate</TableHead>
                  <TableHead className="pr-5 text-right">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {XP_RULES.map((r) => (
                  <TableRow key={r.activity}>
                    <TableCell className="whitespace-normal py-3 pl-5">
                      <p className="font-medium">{r.activity}</p>
                      {r.note ? (
                        <p className="text-muted-foreground text-xs">
                          {r.note}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      {typeof r.xp === "number" ? (
                        <XpBadge amount={r.xp} />
                      ) : (
                        <span className="inline-flex h-6 items-center rounded-full bg-xp-soft px-2.5 font-semibold text-xp-foreground text-xs tabular-nums">
                          {r.xp} XP
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="flex items-start gap-2 border-t px-5 py-3.5 text-muted-foreground text-xs">
              <CircleHelp
                className="mt-px size-3.5 shrink-0"
                aria-hidden="true"
              />
              Valorile se schimbă din configurația platformei, nu din această
              pagină. Orice modificare se aplică doar recompenselor viitoare;
              istoricul XP existent rămâne neschimbat.
            </p>
          </Section>

          <Section
            title="Coduri de invitație"
            description="Cum intră elevii într-o clasă"
          >
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg border bg-muted/40 px-3 py-1.5 font-mono text-lg tracking-[0.3em]">
                  PY7K2Q
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Ticket className="size-4" aria-hidden="true" />6 caractere,
                  litere și cifre
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Regenerabil de mentor
                </span>
              </div>
              <ul className="grid gap-2 text-sm">
                {INVITE_POLICY.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>

        <div className="grid gap-6">
          <Section title="Securitate" bodyClassName="p-3">
            <ul className="grid gap-1">
              {SECURITY.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-lg p-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-muted-foreground text-sm">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Decizii de confirmat"
            description="Până la confirmare, platforma aplică varianta cea mai simplă și sigură."
          >
            <ul className="grid gap-2.5 text-sm">
              {OPEN_DECISIONS.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <CircleHelp
                    className="mt-0.5 size-4 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
