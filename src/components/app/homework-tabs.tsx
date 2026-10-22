"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { demoHomework, HomeworkStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { HOMEWORK_STATUS, HomeworkBadge } from "./homework-status";

type Homework = (typeof demoHomework)[number];

const TABS: HomeworkStatus[] = ["de-facut", "predata", "corectata"];

export function HomeworkTabs({ homework }: { homework: Homework[] }) {
  return (
    <Tabs defaultValue="de-facut">
      <TabsList className="grid w-full grid-cols-3 sm:w-fit">
        {TABS.map((status) => (
          <TabsTrigger key={status} value={status} className="sm:px-5">
            {HOMEWORK_STATUS[status].emoji} {HOMEWORK_STATUS[status].text}
            <span className="ml-1 hidden rounded-full bg-primary/15 px-2 text-sm sm:inline">
              {homework.filter((h) => h.status === status).length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((status) => {
        const items = homework.filter((h) => h.status === status);
        return (
          <TabsContent key={status} value={status} className="mt-5">
            {items.length === 0 ? (
              <p className="sticker p-8 text-center font-bold text-lg text-muted-foreground">
                Nimic aici. 🎉
              </p>
            ) : (
              <ul className="stagger-rise grid gap-4">
                {items.map((h) => (
                  <HomeworkCard key={h.id} homework={h} />
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function HomeworkCard({ homework: h }: { homework: Homework }) {
  return (
    <li className="sticker grid gap-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-3xl"
        >
          {HOMEWORK_STATUS[h.status].emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold font-heading text-2xl">{h.title}</p>
          <p className="font-semibold text-muted-foreground">
            {h.topic} · termen {h.due}
          </p>
        </div>
        <HomeworkBadge status={h.status} />
      </div>

      <p className="font-semibold text-lg">{h.description}</p>

      {h.feedback ? (
        <div className="flex gap-3 rounded-2xl bg-primary-soft p-4">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 -rotate-6 place-items-center rounded-2xl bg-primary font-bold font-heading text-primary-foreground text-xl"
          >
            {h.grade}
          </span>
          <div>
            <p className="font-bold">Feedback de la mentor</p>
            <p className="font-semibold text-muted-foreground">{h.feedback}</p>
          </div>
        </div>
      ) : null}

      <Link
        href={`/exercitii/${h.exerciseId}`}
        className={cn(
          buttonVariants({
            variant: h.status === "de-facut" ? "default" : "outline",
          }),
          "w-fit",
        )}
      >
        {h.status === "de-facut" ? "Începe tema 🚀" : "Vezi codul"}
      </Link>
    </li>
  );
}
