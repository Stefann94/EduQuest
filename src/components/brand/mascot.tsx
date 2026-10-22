import { cn } from "@/lib/utils";

// „Bit”, robotul EduQuest. Se colorează automat după tema aleasă.
export function Mascot({
  className,
  mood = "happy",
}: {
  className?: string;
  mood?: "happy" | "wow";
}) {
  return (
    <svg
      viewBox="0 0 120 130"
      aria-hidden="true"
      className={cn("size-32 shrink-0", className)}
    >
      {/* antena */}
      <line
        x1="60"
        y1="10"
        x2="60"
        y2="26"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-primary-shadow"
      />
      <circle cx="60" cy="10" r="7" className="fill-fun-yellow" />
      {/* urechi */}
      <rect
        x="8"
        y="50"
        width="14"
        height="26"
        rx="7"
        className="fill-primary-shadow"
      />
      <rect
        x="98"
        y="50"
        width="14"
        height="26"
        rx="7"
        className="fill-primary-shadow"
      />
      {/* cap */}
      <rect
        x="16"
        y="29"
        width="88"
        height="70"
        rx="28"
        className="fill-primary-shadow"
      />
      <rect
        x="16"
        y="24"
        width="88"
        height="70"
        rx="28"
        className="fill-primary"
      />
      {/* ecran */}
      <rect x="28" y="36" width="64" height="44" rx="18" fill="white" />
      {/* ochi */}
      <circle cx="46" cy="55" r="6" className="fill-foreground" />
      <circle cx="74" cy="55" r="6" className="fill-foreground" />
      <circle cx="48" cy="53" r="2" fill="white" />
      <circle cx="76" cy="53" r="2" fill="white" />
      {/* obraji */}
      <circle
        cx="36"
        cy="66"
        r="4.5"
        className="fill-fun-pink"
        opacity="0.55"
      />
      <circle
        cx="84"
        cy="66"
        r="4.5"
        className="fill-fun-pink"
        opacity="0.55"
      />
      {/* gură */}
      {mood === "happy" ? (
        <path
          d="M51 66q9 8 18 0"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-foreground"
        />
      ) : (
        <ellipse cx="60" cy="69" rx="5" ry="6" className="fill-foreground" />
      )}
      {/* corp */}
      <rect
        x="38"
        y="99"
        width="44"
        height="26"
        rx="12"
        className="fill-primary-shadow"
      />
      <rect
        x="38"
        y="96"
        width="44"
        height="26"
        rx="12"
        className="fill-primary"
      />
      <circle cx="60" cy="109" r="5" className="fill-fun-yellow" />
    </svg>
  );
}
