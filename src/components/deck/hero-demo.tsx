import { AuroraBlobs, ParticleField } from "@/components/background";
import { BrandMark } from "@/components/brand";
import {
  SAMPLE_README_RICH,
  SECTION_META,
  SECTION_ORDER,
  type SectionKey,
} from "@/lib/deck";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Cpu,
  Crosshair,
  Flame,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
  problem: Flame,
  features: Sparkles,
  tech: Cpu,
  market: TrendingUp,
  revenue: BarChart3,
  competitors: Crosshair,
};

type DemoPhase = "readme" | "cards" | "cover";

/**
 * Looping README → floating glass cards → cover animation.
 * The signature "AI is thinking" moment for Deckify AI.
 */
export function HeroDemo() {
  const [phase, setPhase] = useState<DemoPhase>("readme");
  const demoLines = useMemo(() => SAMPLE_README_RICH.split("\n").slice(0, 8), []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("cards"), 2600),
      setTimeout(() => setPhase("cover"), 5600),
      setTimeout(() => setPhase("readme"), 8800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl p-3 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[linear-gradient(145deg,oklch(0.21_0.045_205),oklch(0.165_0.03_210))]">
        <AuroraBlobs className="absolute inset-0 opacity-90" />
        <div className="bg-grid absolute inset-0 opacity-70" />
        <ParticleField count={26} className="absolute inset-0" />

        <AnimatePresence mode="wait">
          {phase === "readme" && (
            <motion.div
              key="readme"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <div className="glass-strong relative h-full w-full max-w-md overflow-hidden rounded-xl p-5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/70" />
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-white/45">
                    README.md
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 font-mono text-[10px] leading-relaxed text-white/45">
                  {demoLines.map((line, i) => (
                    <div
                      key={i}
                      className={cn("whitespace-pre-wrap truncate", i > 3 && "opacity-25")}
                    >
                      {line.slice(0, 52) || " "}
                    </div>
                  ))}
                </div>
                <div
                  className="pointer-events-none absolute inset-x-4 h-6"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(34,211,238,0.28), transparent)",
                    animation: "scan-line 1.6s ease-in-out infinite alternate",
                  }}
                />
              </div>
            </motion.div>
          )}

          {phase === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {SECTION_ORDER.map((key, i) => {
                const meta = SECTION_META[key];
                const Icon = SECTION_ICONS[key];
                const angle = (i / SECTION_ORDER.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * 78;
                const y = Math.sin(angle) * 58;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: [0, x, x, x * 0.85, x],
                      y: [0, y, y, y * 0.85, y],
                    }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={{
                      duration: 2.8,
                      times: [0, 0.3, 0.7, 0.85, 1],
                      delay: i * 0.08,
                      ease: "easeInOut",
                    }}
                    className="absolute left-1/2 top-1/2"
                    style={{ marginLeft: -78, marginTop: -34 }}
                  >
                    <div className="shimmer w-40 overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.22_0.05_205/0.6)] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-7 w-7 place-items-center rounded-lg text-white"
                          style={{ background: meta.accent, boxShadow: `0 0 14px ${meta.accent}55` }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="leading-tight">
                          <div className="text-[11px] font-bold text-white/85">{meta.title}</div>
                          <div className="text-[9px] uppercase tracking-wider text-white/45">
                            {meta.eyebrow}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {phase === "cover" && (
            <motion.div
              key="cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -3, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                className="relative h-full max-h-[280px] w-full max-w-[500px] overflow-hidden rounded-xl bg-[oklch(0.2_0.045_205/0.7)] shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                style={{ aspectRatio: "16/10" }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#2dd4bf,#38bdf8)" }}
                />
                <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
                  <BrandMark className="h-9 w-9" />
                  <p className="mt-3 text-[15px] font-bold text-white">Volta</p>
                  <p className="mt-1 text-[10px] text-white/55">Liquid Staking — investor pitch</p>
                  <div className="mt-3 flex gap-1.5">
                    {SECTION_ORDER.slice(0, 5).map((k) => (
                      <span
                        key={k}
                        className="rounded-full px-2 py-0.5 text-[8px] font-semibold text-white"
                        style={{ background: SECTION_META[k].accent }}
                      >
                        {SECTION_META[k].title}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* phase indicator */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
          {(["readme", "cards", "cover"] as DemoPhase[]).map((p) => (
            <span
              key={p}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                phase === p ? "w-5 bg-cyan-300" : "w-1.5 bg-white/30",
              )}
            />
          ))}
          <span className="ml-2 text-[10px] font-medium text-white/45">live demo</span>
        </div>
      </div>
    </div>
  );
}
