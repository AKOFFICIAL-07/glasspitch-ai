import { AuroraBlobs, BackgroundFX, ParticleField } from "@/components/background";
import { Brand, BrandMark } from "@/components/brand";
import { SlideContent } from "@/components/deck/slides";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SAMPLE_README_RICH,
  SECTION_META,
  SECTION_ORDER,
  buildDeck,
  type SectionKey,
} from "@/lib/deck";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  Cpu,
  Crosshair,
  FileText,
  Flame,
  LayoutTemplate,
  Link2,
  MonitorDown,
  Presentation,
  Rocket,
  Sparkles,
  TrendingUp,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
  problem: Flame,
  features: Sparkles,
  tech: Cpu,
  market: TrendingUp,
  revenue: BarChart3,
  competitors: Crosshair,
};

const FEATURES: { icon: LucideIcon; title: string; copy: string }[] = [
  {
    icon: FileText,
    title: "Paste or upload a README",
    copy: "Drop in any markdown — from a GitHub repo or a fresh idea. GlassPitch reads the structure, not just the words.",
  },
  {
    icon: Wand2,
    title: "Watch it transform",
    copy: "Your README reorganizes into floating glass cards for Problem, Features, Tech Stack, Market, Revenue and Competitors.",
  },
  {
    icon: Presentation,
    title: "A deck that presents itself",
    copy: "Seven polished, 16:9 slides with cover and closing — navigable by keyboard, ready for the room.",
  },
  {
    icon: MonitorDown,
    title: "Download as PDF",
    copy: "Export a pixel-perfect PDF with one click. Print styles render every slide at full quality.",
  },
  {
    icon: Link2,
    title: "Share with one link",
    copy: "Every deck gets a public share link. Send it to investors and let them flip through your story.",
  },
  {
    icon: LayoutTemplate,
    title: "Structured for investors",
    copy: "The six sections investors actually ask about, ordered into a narrative — not a feature dump.",
  },
];

const STEPS = [
  {
    icon: FileText,
    step: "01",
    title: "Paste your README",
    copy: "Start from any markdown file. Use a sample to see the magic in seconds.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Watch it think",
    copy: "GlassPitch scans, extracts and rebuilds your content into floating story cards.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Present & share",
    copy: "Flip through your deck, download the PDF, or share a link with anyone.",
  },
];

/* ------------------------------------------------------------------ */
/* Hero demo — looping README → cards → cover                          */
/* ------------------------------------------------------------------ */

type DemoPhase = "readme" | "cards" | "cover";

function HeroDemo() {
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
    <div className="glass-strong relative overflow-hidden rounded-3xl p-3 shadow-[0_30px_80px_rgba(90,110,220,0.25)]">
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/80" />
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,oklch(0.99_0.004_255),oklch(0.96_0.02_240))]">
        <AuroraBlobs className="absolute inset-0 opacity-70" />
        <div className="bg-grid absolute inset-0 opacity-60" />
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
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    README.md
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 font-mono text-[10px] leading-relaxed text-slate-400">
                  {demoLines.map((line, i) => (
                    <div key={i} className={cn("whitespace-pre-wrap truncate", i > 3 && "opacity-30")}>
                      {line.slice(0, 52) || " "}
                    </div>
                  ))}
                </div>
                <div
                  className="pointer-events-none absolute inset-x-4 h-6"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(56,189,248,0.3), transparent)",
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
                    <div className="shimmer w-40 overflow-hidden rounded-xl border border-white/80 bg-white/75 p-3 shadow-[0_14px_34px_rgba(80,110,200,0.18)] backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-7 w-7 place-items-center rounded-lg text-white"
                          style={{ background: meta.accent }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="leading-tight">
                          <div className="text-[11px] font-bold text-slate-700">{meta.title}</div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">
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
                className="relative h-full max-h-[280px] w-full max-w-[500px] overflow-hidden rounded-xl bg-white/80 shadow-[0_24px_60px_rgba(80,110,200,0.25)] backdrop-blur-xl"
                style={{ aspectRatio: "16/10" }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{ background: "linear-gradient(135deg,#38bdf8,#6366f1,#14b8a6)" }}
                />
                <div className="relative flex h-full flex-col items-center justify-center text-center px-8">
                  <BrandMark className="h-9 w-9" />
                  <p className="mt-3 text-[15px] font-bold text-slate-800">Lumina</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    AI Meeting Intelligence — investor pitch
                  </p>
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
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1.5 backdrop-blur-md">
          {(["readme", "cards", "cover"] as DemoPhase[]).map((p) => (
            <span
              key={p}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                phase === p ? "w-5 bg-indigo-500" : "w-1.5 bg-slate-300",
              )}
            />
          ))}
          <span className="ml-2 text-[10px] font-medium text-slate-400">live demo</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.35]);

  const showcaseDeck = useMemo(() => buildDeck(SAMPLE_README_RICH), []);
  const showcaseSlides = showcaseDeck.sections.slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <BackgroundFX particleCount={54} />

      {/* Nav */}
      <header className="no-print relative z-30 px-4 pt-4 sm:px-6">
        <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <Link to="/" className="shrink-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["#product", "Product"],
              ["#how-it-works", "How it works"],
              ["#features", "Sections"],
              ["#showcase", "Showcase"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-slate-500 transition hover:bg-white/60 hover:text-slate-800"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="rounded-xl text-[13.5px] font-medium text-slate-600 hover:bg-white/70">
                Sign in
              </Button>
            </Link>
            <Link to="/auth?returnTo=/dashboard">
              <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 shadow-[0_10px_26px_rgba(99,102,241,0.45)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(99,102,241,0.55)]">
                Launch app
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        id="product"
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pt-24"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-1.5 text-[12.5px] font-semibold text-indigo-600 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            README → investor-ready pitch deck
            <span className="ml-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-teal-600">
              v1
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[42px] font-bold leading-[1.05] tracking-tight text-slate-800 sm:text-[54px]"
          >
            Your README, reborn as a <span className="text-gradient">pitch deck</span> investors love.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-slate-500"
          >
            Paste any project README and watch GlassPitch rebuild it into floating
            glass cards — Problem, Features, Tech Stack, Market, Revenue and
            Competitors — then merge them into a polished deck you can present,
            download, and share in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/auth?returnTo=/dashboard">
              <Button
                size="lg"
                className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-7 text-[15px] shadow-[0_16px_40px_rgba(99,102,241,0.5)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(99,102,241,0.6)]"
              >
                Generate my deck
                <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="glass-soft rounded-2xl px-6 text-[15px] text-slate-700 hover:bg-white/80"
              >
                See it in action
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-400"
          >
            {["No design skills needed", "7 slides in seconds", "Share with one link"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-teal-500" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="animate-float absolute -left-6 top-10 z-20 hidden rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-xl lg:block">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-100 text-indigo-500">
                <Sparkles className="h-4 w-4" />
              </span>
              6 story cards extracted
            </div>
          </div>
          <div
            className="animate-float-x absolute -right-4 bottom-16 z-20 hidden rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-xl lg:block"
            style={{ animationDelay: "-3s" }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-teal-500">
                <Link2 className="h-4 w-4" />
              </span>
              Share link ready
            </div>
          </div>
          <HeroDemo />
        </motion.div>
      </motion.section>

      {/* Section marquee */}
      <section className="relative z-10 border-y border-white/60 bg-white/30 py-4 backdrop-blur-sm">
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-3 pr-3">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-3">
                {SECTION_ORDER.map((key) => {
                  const meta = SECTION_META[key];
                  const Icon = SECTION_ICONS[key];
                  return (
                    <span
                      key={`${dup}-${key}`}
                      className="flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm"
                    >
                      <span
                        className="grid h-5 w-5 place-items-center rounded-md text-white"
                        style={{ background: meta.accent }}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      {meta.title}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-4 py-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Badge className="border-transparent bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
            How it works
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-800">
            From plain markdown to pitch-ready in{" "}
            <span className="text-gradient">three moves</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-hover group relative overflow-hidden p-7"
            >
              <div className="shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-indigo-500">
                    <step.icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                  </span>
                  <span className="text-[44px] font-black leading-none text-slate-200 transition-colors duration-300 group-hover:text-indigo-100">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-800">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{step.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Badge className="border-transparent bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Product
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-800">
            Everything a founder needs to <span className="text-gradient">go raise</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Version one is deliberately focused: turn a README into a beautiful,
            structured pitch deck. Nothing more, nothing less.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-hover group relative overflow-hidden p-6"
            >
              <span className="glass-soft grid h-11 w-11 place-items-center rounded-xl text-indigo-500 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[16.5px] font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{f.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Showcase — real slides */}
      <section id="showcase" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Badge className="border-transparent bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Showcase
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-800">
            Generated from a README, <span className="text-gradient">no hand-holding</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500">
            These are real slides from the sample deck — every card, bullet and
            accent was extracted automatically.
          </p>
        </motion.div>

        <div className="mt-14 flex flex-col items-center gap-8">
          <div className="glass-strong w-full overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="flex w-max items-stretch gap-5">
                {showcaseSlides.map((section, i) => (
                  <div key={section.key} className="shrink-0">
                    <div
                      className="overflow-hidden rounded-xl shadow-[0_18px_44px_rgba(80,110,200,0.2)] ring-1 ring-white/80"
                      style={{ width: 560 * 0.42, height: 315 * 0.42 }}
                    >
                      <div style={{ transform: "scale(0.42)", transformOrigin: "top left", width: 560, height: 315 }}>
                        <SlideContent
                          deck={showcaseDeck}
                          slide={{ kind: "section", section }}
                          index={i + 1}
                          total={8}
                        />
                      </div>
                    </div>
                    <p className="mt-2.5 text-center text-[12.5px] font-semibold text-slate-500">
                      {section.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Link to="/auth?returnTo=/dashboard">
            <Button
              size="lg"
              className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-7 text-[15px] shadow-[0_16px_40px_rgba(99,102,241,0.5)]"
            >
              Turn my README into this
              <ArrowRight className="h-[18px] w-[18px]" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong relative overflow-hidden rounded-[2rem] p-10 text-center sm:p-16"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(120deg, rgba(56,189,248,0.35), rgba(99,102,241,0.3), rgba(20,184,166,0.35))",
            }}
          />
          <AuroraBlobs className="absolute inset-0 opacity-50" />
          <div className="relative">
            <BrandMark className="mx-auto h-14 w-14" />
            <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
              Your README is already your pitch.{" "}
              <span className="text-gradient">Let it shine.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-500">
              Free to start. No design skills required. Your first deck is one
              paste away.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth?returnTo=/dashboard">
                <Button
                  size="lg"
                  className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 text-[15px] shadow-[0_16px_40px_rgba(99,102,241,0.55)] transition-transform hover:-translate-y-0.5"
                >
                  Generate my deck — free
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-soft rounded-2xl px-7 text-[15px] text-slate-700 hover:bg-white/80"
                >
                  Continue as guest
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/70 bg-white/30 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <Brand />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-500">
            <a href="#product" className="transition hover:text-slate-800">Product</a>
            <a href="#how-it-works" className="transition hover:text-slate-800">How it works</a>
            <a href="#features" className="transition hover:text-slate-800">Sections</a>
            <Link to="/auth" className="transition hover:text-slate-800">Sign in</Link>
          </nav>
          <p className="text-[12px] text-slate-400">
            Secured by{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-500 underline-offset-2 hover:underline"
            >
              freebuff.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
