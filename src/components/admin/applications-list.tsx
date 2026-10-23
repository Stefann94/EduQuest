"use client";

import {
  ChevronRight,
  FileQuestion,
  Inbox,
  type LucideIcon,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { ApplicationStatusBadge } from "@/components/common/status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApplicationStatus, MentorApplication } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

type TabId = ApplicationStatus | "all";

const TABS: {
  id: TabId;
  label: string;
  empty: { icon: LucideIcon; title: string; text: string };
}[] = [
  {
    id: "pending",
    label: "În așteptare",
    empty: {
      icon: Inbox,
      title: "Nicio aplicație în așteptare",
      text: "Aplicațiile noi apar aici. Vei primi și o notificare.",
    },
  },
  {
    id: "needs_info",
    label: "Informații necesare",
    empty: {
      icon: FileQuestion,
      title: "Nicio aplicație în așteptarea unui răspuns",
      text: "Când ceri informații suplimentare unui aplicant, aplicația apare aici până răspunde.",
    },
  },
  {
    id: "approved",
    label: "Aprobate",
    empty: {
      icon: ShieldCheck,
      title: "Nicio aplicație aprobată",
      text: "Aplicațiile aprobate rămân aici pentru evidență.",
    },
  },
  {
    id: "rejected",
    label: "Respinse",
    empty: {
      icon: XCircle,
      title: "Nicio aplicație respinsă",
      text: "Aplicațiile respinse rămân aici pentru evidență, cu motivul deciziei.",
    },
  },
  {
    id: "all",
    label: "Toate",
    empty: {
      icon: Inbox,
      title: "Nicio aplicație încă",
      text: "Când cineva aplică pentru un cont de mentor, aplicația apare aici.",
    },
  },
];

export function ApplicationsList({
  applications,
}: {
  applications: MentorApplication[];
}) {
  const byTab = (id: TabId) =>
    id === "all" ? applications : applications.filter((a) => a.status === id);

  return (
    <Tabs defaultValue="pending" className="gap-4">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList aria-label="Filtrează după stare">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="px-3">
              {t.label}
              <span className="rounded-full bg-foreground/8 px-1.5 text-xs tabular-nums">
                {byTab(t.id).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {TABS.map((t) => {
        const list = byTab(t.id);
        return (
          <TabsContent key={t.id} value={t.id}>
            {list.length > 0 ? (
              <ul className="stagger grid gap-2">
                {list.map((a) => (
                  <li key={a.id}>
                    <ApplicationRow application={a} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={t.empty.icon}
                title={t.empty.title}
                description={t.empty.text}
              />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function ApplicationRow({
  application: a,
}: {
  application: MentorApplication;
}) {
  return (
    <Link
      href={`/admin/aplicatii/${a.id}`}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-4 py-3.5 shadow-xs outline-none transition-colors hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/40 sm:flex-nowrap"
    >
      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        <p className="truncate font-medium">{a.fullName}</p>
        <p className="truncate text-muted-foreground text-sm">{a.email}</p>
      </div>
      <p className="text-muted-foreground text-sm sm:w-40">
        <span className="sr-only">Trimisă pe </span>
        {formatDate(a.submittedAt)}
      </p>
      <ApplicationStatusBadge status={a.status} />
      <span className="ml-auto flex items-center gap-0.5 font-medium text-primary text-sm">
        {a.status === "pending" || a.status === "needs_info"
          ? "Verifică"
          : "Vezi"}
        <ChevronRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
