"use client";

import { useEffect } from "react";

const INTERACTIVE =
  'button:not(:disabled), a[href], [role="button"], [role="tab"], summary, label[for]';
const SHAPES = ["✦", "●", "★", "◆"];
const COUNT = 7;

/**
 * La fiecare click pe ceva interactiv, din punctul apăsat „sar” câteva steluțe
 * în culoarea temei. Se oprește singur dacă utilizatorul a cerut mai puțină animație.
 */
export function ClickBurst() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function onPointerDown(e: PointerEvent) {
      if (reduceMotion.matches || e.button !== 0) return;
      const target = e.target as Element | null;
      if (!target?.closest(INTERACTIVE)) return;

      for (let i = 0; i < COUNT; i++) {
        const particle = document.createElement("span");
        particle.textContent = SHAPES[i % SHAPES.length];
        particle.setAttribute("aria-hidden", "true");
        Object.assign(particle.style, {
          position: "fixed",
          left: `${e.clientX}px`,
          top: `${e.clientY}px`,
          zIndex: "9999",
          pointerEvents: "none",
          fontSize: `${10 + Math.random() * 8}px`,
          color: i % 2 === 0 ? "var(--primary)" : "var(--primary-shadow)",
          lineHeight: "1",
        });
        document.body.appendChild(particle);

        const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.6;
        const distance = 26 + Math.random() * 22;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        particle
          .animate(
            [
              {
                transform: "translate(-50%, -50%) scale(0.4) rotate(0deg)",
                opacity: 1,
              },
              {
                transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${dx > 0 ? 90 : -90}deg)`,
                opacity: 0,
              },
            ],
            { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          )
          .finished.then(() => particle.remove())
          .catch(() => particle.remove());
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
