"use client";

import { useSyncExternalStore } from "react";
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

export function setPrefs(patch: Partial<Prefs>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(cache));
  } catch {
    // Fără localStorage (mod privat strict): tema se aplică doar până la reîncărcare.
  }
  document.documentElement.dataset.theme = cache.theme;
  for (const listener of listeners) listener();
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS);
}
