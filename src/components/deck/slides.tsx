import { AuroraBlobs } from "@/components/background";
import type { DeckSection, PitchDeck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Cpu,
  Crosshair,
  Flame,
  Layers,
  Rocket,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  sparkles: Sparkles,
  cpu: Cpu,
  "trending-up": TrendingUp,
  "line-chart": BarChart3,
  crosshair: Crosshair,
  rocket: Rocket,
  layers: Layers,
};

export function SectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Layers;
  return <Icon className={className} strokeWidth={1.9} />;
}

/* ------------------------------------------------------------------ */
/* Slide list                                                          */
/* ------------------------------------------------------------------ */

export type SlideDef =
  | { kind: "cover" }
  | { kind: "section"; section: DeckSection }
  | { kind: "closing" };

export function deckSlides(deck: PitchDeck): SlideDef[] {
  return [
    { kind: "cover" },
    ...deck.sections.map((section) => ({ kind: "section", section }) as SlideDef),
    { kind: "closing" },
  ];
}

export function slideLabel(slide: SlideDef): string {
  if (slide.kind === "cover") return "Cover";
  if (slide.kind === "closing") return "Closing";
  return slide.section.title;
}

function slideAccent(slide: SlideDef): string {
  if (slide.kind === "section") return slide.section.accent;
  if (slide.kind === "cover") return "#6366f1";
  return "#0ea5e9";
}

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function SlideFrame({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.99 0.004 255) 0%, oklch(0.975 0.012 250) 50%, oklch(0.98 0.008 210) 100%)",
      }}
    >
      <AuroraBlobs className="absolute inset-0 opacity-70" />
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-25 blur-3xl"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: accent }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
      {/* edge highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
    </div>
  );
}

function Watermark({ index, total }: { index: number; total: number }) {
  return (
    <div className="absolute bottom-5 left-8 right-8 flex items-center justify-between text-[13px] font-medium tracking-wide text-slate-400">
      <span className="flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 text-[9px] font-bold text-white">
          G
        </span>
        GlassPitch
      </span>
      <span>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slides                                                              */
/* ------------------------------------------------------------------ */

function CoverSlide({ deck }: { deck: PitchDeck }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.22em] text-indigo-500 shadow-sm backdrop-blur-md"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Investor pitch · generated from README
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 max-w-[960px] text-[76px] font-bold leading-[1.02] tracking-tight text-slate-800"
      >
        <span className="text-gradient">{deck.title}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-[820px] text-[25px] leading-snug text-slate-500"
      >
        {deck.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
      >
        {deck.sections.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-[15px] font-medium text-slate-600 shadow-sm backdrop-blur-md"
          >
            <span
              className="grid h-5 w-5 place-items-center rounded-md text-white"
              style={{ background: s.accent }}
            >
              <SectionIcon name={s.key === "tech" ? "cpu" : s.key === "revenue" ? "line-chart" : s.key === "competitors" ? "crosshair" : s.key === "market" ? "trending-up" : s.key === "features" ? "sparkles" : "flame"} className="h-3 w-3" />
            </span>
            {s.title}
          </span>
        ))}
      </motion.div>

      {/* floating deco cards */}
      <div className="animate-float pointer-events-none absolute right-20 top-24 hidden rounded-2xl border border-white/80 bg-white/60 px-4 py-3 shadow-lg backdrop-blur-md sm:block">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-100 text-sky-500">
            <Flame className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium">Problem defined</span>
        </div>
      </div>
      <div
        className="animate-float-x pointer-events-none absolute left-24 top-36 hidden rounded-2xl border border-white/80 bg-white/60 px-4 py-3 shadow-lg backdrop-blur-md sm:block"
        style={{ animationDelay: "-2s" }}
      >
        <div className="flex items-center gap-2 text-slate-500">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-teal-500">
            <Cpu className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium">Stack surfaced</span>
        </div>
      </div>
      <Watermark index={0} total={8} />
    </div>
  );
}

function SectionSlide({
  section,
  number,
  index,
  total,
}: {
  section: DeckSection;
  number: number;
  index: number;
  total: number;
}) {
  return (
    <div className="flex h-full w-full items-center px-20">
      {/* Left column */}
      <div className="relative z-10 w-[46%] shrink-0">
        <motion.div
          initial={{ opacity: 0, x: -26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -left-4 -top-24 select-none text-[210px] font-black leading-none"
          style={{ color: section.accent, opacity: 0.13 }}
        >
          {String(number).padStart(2, "0")}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg"
            style={{ background: section.accent, boxShadow: `0 10px 24px ${section.accent}55` }}
          >
            <SectionIcon name={section.key === "tech" ? "cpu" : section.key === "revenue" ? "line-chart" : section.key} className="h-5 w-5" />
          </span>
          <span
            className="rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ background: `${section.accent}1f`, color: section.accent }}
          >
            {section.eyebrow}
          </span>
          {section.derived && (
            <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-400">
              AI-derived
            </span>
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-[62px] font-bold leading-none tracking-tight text-slate-800"
        >
          {section.title}
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 h-1.5 w-28 origin-left rounded-full"
          style={{ background: section.accent }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mt-6 max-w-[420px] text-[18px] leading-relaxed text-slate-400"
        >
          Slide {String(index + 1).padStart(2, "0")} — {section.title.toLowerCase()} at a glance
        </motion.p>
      </div>

      {/* Right column — glass bullet panel */}
      <motion.div
        initial={{ opacity: 0, x: 34 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="ml-10 w-[54%]"
      >
        <div className="relative rounded-3xl border border-white/80 bg-white/55 p-9 shadow-[0_24px_60px_rgba(80,110,200,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="space-y-5">
            {section.bullets.map((bullet, bi) => (
              <motion.div
                key={`${bullet}-${bi}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.38 + bi * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4"
              >
                <span
                  className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white shadow-md"
                  style={{ background: section.accent }}
                >
                  {bi + 1}
                </span>
                <p className="text-[21px] leading-snug text-slate-600">{bullet}</p>
              </motion.div>
            ))}
          </div>
          <div
            className="pointer-events-none absolute -bottom-7 -right-7 h-24 w-24 rounded-2xl border border-white/70 bg-white/40 backdrop-blur-md"
            style={{ transform: "rotate(8deg)" }}
          >
            <div
              className="grid h-full w-full place-items-center rounded-2xl"
              style={{ background: `${section.accent}14` }}
            >
              <SectionIcon name={section.key === "tech" ? "cpu" : section.key === "revenue" ? "line-chart" : section.key} className="h-9 w-9" />
            </div>
          </div>
        </div>
      </motion.div>

      <Watermark index={index} total={total} />
    </div>
  );
}

function ClosingSlide({ deck }: { deck: PitchDeck }) {
  const stats = [
    { label: "Slides", value: String(deck.sections.length + 2) },
    { label: "Words distilled", value: String(deck.stats.words).replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
    { label: "Sections found", value: `${deck.stats.sectionsFound}/${deck.sections.length}` },
  ];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-500 to-teal-400 text-white shadow-[0_18px_44px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]"
      >
        <Rocket className="h-9 w-9" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 text-[64px] font-bold leading-tight tracking-tight text-slate-800"
      >
        Let&apos;s build <span className="text-gradient">this together.</span>
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 flex items-center gap-6"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/80 bg-white/60 px-7 py-5 shadow-sm backdrop-blur-md"
          >
            <div className="text-[34px] font-bold tracking-tight text-slate-800">{s.value}</div>
            <div className="mt-1 text-[13px] font-medium uppercase tracking-[0.16em] text-slate-400">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-9 max-w-[720px] text-[20px] text-slate-500"
      >
        {deck.tagline}
      </motion.p>
      <Watermark index={deck.sections.length + 1} total={deck.sections.length + 2} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

export function SlideContent({ deck, slide, index, total }: { deck: PitchDeck; slide: SlideDef; index: number; total: number }) {
  if (slide.kind === "cover") {
    return (
      <SlideFrame accent="#6366f1">
        <CoverSlide deck={deck} />
      </SlideFrame>
    );
  }
  if (slide.kind === "closing") {
    return (
      <SlideFrame accent="#0ea5e9">
        <ClosingSlide deck={deck} />
      </SlideFrame>
    );
  }
  const sectionIndex = deck.sections.findIndex((s) => s.key === slide.section.key);
  return (
    <SlideFrame accent={slide.section.accent}>
      <SectionSlide section={slide.section} number={sectionIndex + 1} index={index} total={total} />
    </SlideFrame>
  );
}

export function useStageScale(designWidth = 1280) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / designWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);
  return { ref, scale };
}

const stageVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 90 : -90, opacity: 0, scale: 0.988 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -90 : 90, opacity: 0, scale: 0.988 }),
};

export function DeckStage({
  deck,
  index,
  direction,
  className,
}: {
  deck: PitchDeck;
  index: number;
  direction: number;
  className?: string;
}) {
  const slides = deckSlides(deck);
  const total = slides.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const slide = slides[safeIndex];
  const { ref, scale } = useStageScale();

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className="relative mx-auto" style={{ width: 1280 * scale, height: 720 * scale }}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: 1280, height: 720, transform: `scale(${scale})` }}
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={safeIndex}
              custom={direction}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <SlideContent deck={deck} slide={slide} index={safeIndex} total={total} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Print renderer                                                      */
/* ------------------------------------------------------------------ */

const PRINT_SCALE = 1123 / 1280;

export function PrintDeck({ deck }: { deck: PitchDeck }) {
  const slides = deckSlides(deck);
  return (
    <div className="print-only hidden">
      {slides.map((slide, i) => (
        <div key={`${i}-${slide.kind}`} className="print-slide">
          <div className="mx-auto" style={{ width: 1123, height: 632 }}>
            <div
              className="origin-top-left"
              style={{ width: 1280, height: 720, transform: `scale(${PRINT_SCALE})` }}
            >
              <SlideContent deck={deck} slide={slide} index={i} total={slides.length} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { slideAccent };
