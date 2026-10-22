// Temele de culoare și avatarele pe care le poate alege fiecare copil.
// Culorile efective sunt în globals.css, la [data-theme="..."].

export const THEMES = [
  { id: "unicorn", name: "Unicorn", emoji: "🦄" },
  { id: "capsuna", name: "Căpșună", emoji: "🍓" },
  { id: "cireasa", name: "Cireașă", emoji: "🍒" },
  { id: "portocala", name: "Portocală", emoji: "🍊" },
  { id: "soare", name: "Soare", emoji: "☀️" },
  { id: "jungla", name: "Junglă", emoji: "🌿" },
  { id: "menta", name: "Mentă", emoji: "🍃" },
  { id: "ocean", name: "Ocean", emoji: "🌊" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const AVATARS = [
  "🦊",
  "🐼",
  "🐸",
  "🦄",
  "🐱",
  "🐶",
  "🐙",
  "🦖",
  "🐧",
  "🐯",
  "🐨",
  "🚀",
] as const;

export type Avatar = (typeof AVATARS)[number];

export type Prefs = { theme: ThemeId; avatar: Avatar };

export const DEFAULT_PREFS: Prefs = { theme: "unicorn", avatar: "🦊" };

// Deocamdată preferințele stau în browser. După Supabase le salvăm și în profilul elevului.
export const PREFS_KEY = "eduquest:prefs";

const themeIds: readonly string[] = THEMES.map((t) => t.id);
const avatarList: readonly string[] = AVATARS;

export function parsePrefs(raw: string | null): Prefs {
  try {
    const value = raw ? JSON.parse(raw) : {};
    return {
      theme: themeIds.includes(value.theme) ? value.theme : DEFAULT_PREFS.theme,
      avatar: avatarList.includes(value.avatar)
        ? value.avatar
        : DEFAULT_PREFS.avatar,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Rulează în <head>, înainte de prima afișare, ca tema aleasă să apară fără „clipire”.
 * Acceptă doar id-uri de temă cunoscute.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  PREFS_KEY,
)})||"{}");if(${JSON.stringify(themeIds)}.indexOf(p.theme)>-1)document.documentElement.setAttribute("data-theme",p.theme)}catch(e){}})()`;
