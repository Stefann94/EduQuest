"use client";

import { BookOpen, Puzzle, Search, SearchX } from "lucide-react";
import { useId, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkedProblem } from "@/lib/data/types";
import {
  type LearningMaterial,
  LearningMaterialRow,
} from "./learning-material-row";
import { ProblemRow } from "./problem-row";

export type LearningProblem = Pick<
  WorkedProblem,
  "id" | "classId" | "title" | "topic" | "difficulty" | "publishedAt"
> & { className?: string };

const ALL = "all";
const GLOBAL = "global";

/** Normalizare pentru căutare: fără diacritice și fără majuscule. */
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Materialele și problemele rezolvate, cu filtre în browser (text, temă, sursă). */
export function LearningBrowser({
  materials,
  problems,
  classes,
}: {
  materials: LearningMaterial[];
  problems: LearningProblem[];
  classes: { id: string; name: string }[];
}) {
  const ids = useId();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>(ALL);
  const [source, setSource] = useState<string>(ALL);

  const topics = [
    ...new Set([...materials, ...problems].map((x) => x.topic)),
  ].sort((a, b) => a.localeCompare(b, "ro"));
  const topicItems = [
    { value: ALL, label: "Toate temele" },
    ...topics.map((t) => ({ value: t, label: t })),
  ];
  const sourceItems = [
    { value: ALL, label: "Toate" },
    { value: GLOBAL, label: "Resurse globale" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const q = normalize(query.trim());
  const matches = (x: {
    title: string;
    topic: string;
    classId: string | null;
    description?: string;
    tags?: string[];
  }) =>
    (topic === ALL || x.topic === topic) &&
    (source === ALL ||
      (source === GLOBAL ? x.classId === null : x.classId === source)) &&
    (q === "" ||
      normalize(
        [x.title, x.topic, x.description ?? "", ...(x.tags ?? [])].join(" "),
      ).includes(q));

  const shownMaterials = materials.filter(matches);
  const shownProblems = problems.filter(matches);
  const filtered = q !== "" || topic !== ALL || source !== ALL;

  const reset = () => {
    setQuery("");
    setTopic(ALL);
    setSource(ALL);
  };

  const noResults = (
    <EmptyState
      icon={SearchX}
      title="Niciun rezultat"
      description="Încearcă alt cuvânt sau schimbă filtrele."
      action={
        <Button variant="outline" size="sm" onClick={reset}>
          Șterge filtrele
        </Button>
      }
    />
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-1.5">
          <Label htmlFor={`${ids}-q`}>Caută</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={`${ids}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Titlu, temă sau etichetă"
              className="pl-9"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${ids}-topic`}>Temă</Label>
          <Select
            items={topicItems}
            value={topic}
            onValueChange={(v) => setTopic(v ?? ALL)}
          >
            <SelectTrigger id={`${ids}-topic`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {topicItems.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${ids}-source`}>Sursă</Label>
          <Select
            items={sourceItems}
            value={source}
            onValueChange={(v) => setSource(v ?? ALL)}
          >
            <SelectTrigger id={`${ids}-source`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sourceItems.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="materials">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="materials" className="px-3">
              Cursuri și materiale ({shownMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="problems" className="px-3">
              Probleme rezolvate ({shownProblems.length})
            </TabsTrigger>
          </TabsList>
          {filtered ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              Șterge filtrele
            </Button>
          ) : null}
        </div>
        <p className="sr-only" aria-live="polite">
          {`${shownMaterials.length} materiale și ${shownProblems.length} probleme afișate`}
        </p>

        <TabsContent value="materials" className="mt-3">
          {materials.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Niciun material disponibil"
              description="Materialele publicate de mentori și resursele globale apar aici."
            />
          ) : shownMaterials.length === 0 ? (
            noResults
          ) : (
            <ul className="stagger grid gap-1 rounded-xl border bg-card p-2 shadow-xs">
              {shownMaterials.map((m) => (
                <li key={m.id}>
                  <LearningMaterialRow material={m} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="problems" className="mt-3">
          {problems.length === 0 ? (
            <EmptyState
              icon={Puzzle}
              title="Nicio problemă rezolvată"
              description="Problemele cu soluții explicate pas cu pas apar aici."
            />
          ) : shownProblems.length === 0 ? (
            noResults
          ) : (
            <ul className="stagger grid gap-1 rounded-xl border bg-card p-2 shadow-xs">
              {shownProblems.map((p) => (
                <li key={p.id}>
                  <ProblemRow problem={p} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
