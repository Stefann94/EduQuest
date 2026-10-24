import type { Metadata, Viewport } from "next";
import { Geist_Mono, Saira, Saira_Condensed } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// latin-ext aduce diacriticele românești: ă, â, î, ș, ț.
const saira = Saira({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

// Titlurile: condensat, cu majuscule (stilul „meniu de joc”).
const sairaCondensed = Saira_Condensed({
  variable: "--font-heading",
  weight: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "EduQuest",
    template: "%s · EduQuest",
  },
  description:
    "Platformă de învățare a programării: clase, materiale, teme, quiz-uri și progres.",
};

export const viewport: Viewport = {
  themeColor: "#1a0f2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${saira.variable} ${sairaCondensed.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
