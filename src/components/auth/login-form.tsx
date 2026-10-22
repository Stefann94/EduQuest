"use client";

import { GraduationCap, Presentation } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const router = useRouter();

  // Demo: autentificarea reală vine odată cu Supabase Auth.
  function demoSubmit(destination: "/elev" | "/mentor") {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      router.push(destination);
    };
  }

  return (
    <div className="animate-pop rounded-3xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
      <h1 className="font-bold text-2xl tracking-tight">Bine ai revenit!</h1>
      <p className="mt-1 text-muted-foreground">Alege cum intri în cont.</p>

      <Tabs defaultValue="elev" className="mt-6">
        <TabsList className="grid h-11! w-full grid-cols-2">
          <TabsTrigger value="elev" className="gap-2">
            <GraduationCap /> Elev
          </TabsTrigger>
          <TabsTrigger value="mentor" className="gap-2">
            <Presentation /> Mentor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elev">
          <form onSubmit={demoSubmit("/elev")} className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Utilizator</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="ex. andrei.p"
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-password">Parolă</Label>
              <Input
                id="student-password"
                type="password"
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <Button type="submit" className="mt-2 h-11 text-base">
              Intră
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              Ți-ai uitat parola? Roagă-ți mentorul să o reseteze.
            </p>
          </form>
        </TabsContent>

        <TabsContent value="mentor">
          <form onSubmit={demoSubmit("/mentor")} className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nume@exemplu.ro"
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mentor-password">Parolă</Label>
              <Input
                id="mentor-password"
                type="password"
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <Button type="submit" className="mt-2 h-11 text-base">
              Intră ca mentor
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
