import type { Metadata, Viewport } from "next";
import { Fredoka, Geist_Mono, Nunito } from "next/font/google";
import { ClickBurst } from "@/components/fx/click-burst";
import { DEFAULT_PREFS, THEME_INIT_SCRIPT } from "@/lib/themes";
import "./globals.css";

// Fonturi rotunjite și prietenoase. latin-ext aduce ă, â, î, ș, ț.
const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EduQuest: programare prin joc",
    template: "%s · EduQuest",
  },
  description:
    "Quiz-uri live, jocuri rapide și teme de programare pentru copii, într-un singur loc.",
};

export const viewport: Viewport = {
  themeColor: "#fbf9ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      data-theme={DEFAULT_PREFS.theme}
      // Scriptul de mai jos poate schimba data-theme înainte ca React să preia pagina.
      suppressHydrationWarning
      className={`${nunito.variable} ${fredoka.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: script static, scris de noi, fără date de la utilizator
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <ClickBurst />
      </body>
    </html>
  );
}
