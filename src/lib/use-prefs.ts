"use client";

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { DEFAULT_PREFS, PREFS_KEY, type Prefs, parsePrefs } from "./themes";

const listeners = new Set<() => void>();
let cache: Prefs | null = null;

function read(): Prefs {
  if (cache) return cache;
  try {
    cache = parsePrefs(localStorage.getItem(PREFS_KEY));
  } catch {
    cache = DEFAULT_PREFS;
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sincronizează și alte tab-uri deschise.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== PREFS_KEY) return;
    cache = parsePrefs(e.newValue);
    document.documentElement.dataset.theme = cache.theme;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Salvează preferințele. La schimbarea temei, noua culoare „se întinde” pe ecran
 * ca un cerc care pornește din punctul apăsat (View Transitions API).
 * Fără suport în browser sau cu „reduce motion” activ, tema se schimbă instant.
 */
export function setPrefs(
  patch: Partial<Prefs>,
  origin?: { x: number; y: number },
) {
  const next = { ...read(), ...patch };
  const themeChanged = next.theme !== read().theme;

  const commit = () => {
    cache = next;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // Fără localStorage (mod privat strict): tema se aplică doar până la reîncărcare.
    }
    document.documentElement.dataset.theme = next.theme;
    // Actualizăm React sincron, ca noua stare să intre în „poza” de după tranziție.
    flushSync(() => {
      for (const listener of listeners) listener();
    });
  };

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!themeChanged || reduceMotion || !document.startViewTransition) {
    commit();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(commit);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 800,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      // Tranziția a fost întreruptă (ex. alt click rapid); tema e deja aplicată.
    });
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS);
}
