import { cn } from "@/lib/utils";

/** Glass-cards brand mark used across the app. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-teal-400 text-white shadow-[0_8px_24px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.6)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]">
        {/* back card */}
        <rect
          x="6.2"
          y="8.4"
          width="11.6"
          height="8.6"
          rx="1.8"
          fill="rgba(255,255,255,0.35)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="0.9"
          transform="rotate(-7 12 12.7)"
        />
        {/* front card */}
        <rect
          x="5.6"
          y="6.4"
          width="12.8"
          height="9.6"
          rx="1.9"
          fill="rgba(255,255,255,0.92)"
          stroke="rgba(255,255,255,1)"
          strokeWidth="0.8"
        />
        {/* slide lines */}
        <rect x="8.4" y="9.4" width="7.2" height="1.1" rx="0.55" fill="#6366f1" opacity="0.9" />
        <rect x="8.4" y="11.4" width="4.6" height="1.1" rx="0.55" fill="#94a3b8" opacity="0.7" />
        <rect x="8.4" y="13.4" width="5.6" height="1.1" rx="0.55" fill="#94a3b8" opacity="0.7" />
        {/* sparkle */}
        <path
          d="M17.8 4.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"
          fill="#a7f3d0"
        />
      </svg>
    </span>
  );
}

export function Brand({
  className,
  markClassName,
  compact = false,
}: {
  className?: string;
  markClassName?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-9 w-9", markClassName)} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            GlassPitch
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            README → Pitch deck
          </span>
        </span>
      )}
    </span>
  );
}
