"use client";

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
    <div className="sticker p-6 sm:p-8">
      <h1 className="font-bold text-3xl">Bine ai revenit! 👋</h1>
      <p className="mt-1 font-semibold text-muted-foreground">
        Cine intră azi?
      </p>

      <Tabs defaultValue="elev" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="elev">🎒 Sunt elev</TabsTrigger>
          <TabsTrigger value="mentor">🧑‍🏫 Sunt mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="elev">
          <form onSubmit={demoSubmit("/elev")} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="font-bold text-base">
                Utilizator
              </Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="ex. andrei.p"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-password" className="font-bold text-base">
                Parolă
              </Label>
              <Input
                id="student-password"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" size="lg" className="mt-2">
              Intră 🚀
            </Button>
            <p className="text-center font-semibold text-muted-foreground text-sm">
              Ți-ai uitat parola? Roagă-ți mentorul să o reseteze.
            </p>
          </form>
        </TabsContent>

        <TabsContent value="mentor">
          <form onSubmit={demoSubmit("/mentor")} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nume@exemplu.ro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mentor-password" className="font-bold text-base">
                Parolă
              </Label>
              <Input
                id="mentor-password"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" size="lg" className="mt-2">
              Intră ca mentor
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
