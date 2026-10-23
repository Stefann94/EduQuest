import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { UserAvatar } from "@/components/common/user-avatar";
import { DemoNote } from "@/components/student-activity/field-error";
import {
  EmailForm,
  NotificationPrefsForm,
  PasswordForm,
  ProfileForm,
} from "@/components/student-activity/settings-forms";
import { getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Setări cont" };

export default async function SettingsPage() {
  const me = await getViewer("student");

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Setări cont"
        description="Profilul, datele de autentificare și notificările tale."
        meta={
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <UserAvatar name={me.displayName} avatar={me.avatar} size="xs" />
            {me.displayName} · {me.username}
          </span>
        }
      />

      <ProfileForm
        displayName={me.displayName}
        username={me.username ?? ""}
        avatar={me.avatar}
      />
      <EmailForm email={me.email} />
      <PasswordForm />
      <NotificationPrefsForm />

      <section
        aria-labelledby="confidentialitate"
        className="flex gap-3 rounded-xl border bg-card p-5 shadow-xs"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="confidentialitate" className="font-semibold">
            Confidențialitate
          </h2>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            Profilul tău (numele afișat, numele de utilizator și personajul)
            este vizibil doar membrilor claselor în care ești înscris. Nu există
            un director public de utilizatori și nimeni nu te poate găsi prin
            căutare. Adresa de email și parola nu sunt afișate nimănui.
          </p>
        </div>
      </section>

      <DemoNote>
        Demo: modificările se salvează după conectarea la baza de date.
      </DemoNote>
    </div>
  );
}
