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
  Link2,
  MonitorDown,
  Presentation,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
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
    title: "Paste a README, docs, or spec",
    copy: "Any markdown — a hackathon repo, technical write-up, or protocol design doc. Pitch Forge reads the structure, not just the words.",
  },
  {
    icon: Sparkles,
    title: "Watch it forge your story",
    copy: "Your docs reorganize into floating glass cards for Problem, Features, Tech Stack, Market, Revenue and Competitors — then merge into a deck.",
  },
  {
    icon: Presentation,
    title: "A deck that presents itself",
    copy: "Eight polished 16:9 slides, navigable by keyboard, built to survive a demo-day room or a 10-minute investor call.",
  },
  {
    icon: MonitorDown,
    title: "Export a pixel-perfect PDF",
    copy: "One click downloads your full deck at print quality — share it as an artifact, not a screenshot.",
  },
  {
    icon: Link2,
    title: "Share, publish, and collect feedback",
    copy: "Every deck gets a public share link. Publish to the catalog so judges and investors can find it — and comment on it.",
  },
  {
    icon: Wallet,
    title: "Built for demo day economics",
    copy: "Start free with two decks. Upgrade to Pro for unlimited decks, catalog visibility, and priority support.",
  },
];

const STEPS = [
  {
    icon: FileText,
    step: "01",
    title: "Point it at your repo",
    copy: "Paste your README or technical description. Use a sample if you want to see the forge run in seconds.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Watch it think",
    copy: "Pitch Forge scans, extracts and rebuilds your content into floating story cards, then assembles the deck.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Present, publish, and raise",
    copy: "Flip through your deck, export the PDF, publish it to the catalog, or share a link with anyone.",
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
    <div className="glass-strong relative overflow-hidden rounded-3xl p-3 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[linear-gradient(145deg,oklch(0.21_0.03_262),oklch(0.165_0.024_265))]">
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
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    README.md
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 font-mono text-[10px] leading-relaxed text-slate-500">
                  {demoLines.map((line, i) => (
                    <div key={i} className={cn("whitespace-pre-wrap truncate", i > 3 && "opacity-25")}>
                      {line.slice(0, 52) || " "}
                    </div>
                  ))}
                </div>
                <div
                  className="pointer-events-none absolute inset-x-4 h-6"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(34,211,238,0.2), transparent)",
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
                    <div className="shimmer w-40 overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.22_0.028_262/0.6)] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-7 w-7 place-items-center rounded-lg text-white"
                          style={{ background: meta.accent, boxShadow: `0 0 14px ${meta.accent}55` }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="leading-tight">
                          <div className="text-[11px] font-bold text-slate-200">{meta.title}</div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-500">
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
                className="relative h-full max-h-[280px] w-full max-w-[500px] overflow-hidden rounded-xl bg-[oklch(0.2_0.028_262/0.7)] shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                style={{ aspectRatio: "16/10" }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1,#a855f7)" }}
                />
                <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
                  <BrandMark className="h-9 w-9" />
                  <p className="mt-3 text-[15px] font-bold text-slate-100">Volta</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Liquid Staking — investor pitch
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
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
          {(["readme", "cards", "cover"] as DemoPhase[]).map((p) => (
            <span
              key={p}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                phase === p ? "w-5 bg-cyan-400" : "w-1.5 bg-slate-600",
              )}
            />
          ))}
          <span className="ml-2 text-[10px] font-medium text-slate-500">live demo</span>
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
              ["/catalog", "Catalog"],
              ["#how-it-works", "How it works"],
              ["#features", "Sections"],
              ["#pricing", "Pricing"],
            ].map(([href, label]) =>
              href.startsWith("/") ? (
                <Link
                  key={href}
                  to={href}
                  className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="rounded-xl text-[13.5px] font-medium text-slate-300 hover:bg-white/10 hover:text-white">
                Sign in
              </Button>
            </Link>
            <Link to="/auth?returnTo=/dashboard">
              <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 shadow-[0_10px_26px_rgba(34,211,238,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(99,102,241,0.4)]">
                Open the forge
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
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[12.5px] font-semibold text-cyan-300 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            README → investor-ready pitch deck
            <span className="ml-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-cyan-300">
              for web3 teams
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[42px] font-bold leading-[1.05] tracking-tight text-slate-100 sm:text-[54px]"
          >
            Forge your repo into a pitch deck <span className="text-gradient">investors take seriously.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-slate-400"
          >
            Pitch Forge reads your README, documentation, or technical spec and
            rebuilds it into structured investor slides — Problem, Features, Tech
            Stack, Market, Revenue and Competitors. Built for hackathon teams
            shipping on-chain, ready before demo day.
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
                className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-7 text-[15px] shadow-[0_16px_40px_rgba(34,211,238,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(99,102,241,0.4)]"
              >
                Forge my deck — free
                <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <Link to="/catalog">
              <Button
                size="lg"
                variant="outline"
                className="glass-soft gap-2 rounded-2xl px-6 text-[15px] text-slate-200 hover:bg-white/10"
              >
                <Search className="h-4 w-4" />
                Browse the catalog
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-500"
          >
            {["No design skills needed", "8 slides in seconds", "Free plan: 2 decks"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
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
          <div className="animate-float absolute -left-6 top-10 z-20 hidden rounded-2xl border border-white/10 bg-[oklch(0.22_0.028_262/0.7)] px-4 py-3 shadow-xl backdrop-blur-xl lg:block">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-300">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-500/15 text-cyan-300">
                <Sparkles className="h-4 w-4" />
              </span>
              6 story cards extracted
            </div>
          </div>
          <div
            className="animate-float-x absolute -right-4 bottom-16 z-20 hidden rounded-2xl border border-white/10 bg-[oklch(0.22_0.028_262/0.7)] px-4 py-3 shadow-xl backdrop-blur-xl lg:block"
            style={{ animationDelay: "-3s" }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-300">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Link2 className="h-4 w-4" />
              </span>
              Publish to catalog
            </div>
          </div>
          <HeroDemo />
        </motion.div>
      </motion.section>

      {/* Section marquee */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-4 backdrop-blur-sm">
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
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-slate-300"
                    >
                      <span
                        className="grid h-5 w-5 place-items-center rounded-md text-white"
                        style={{ background: meta.accent, boxShadow: `0 0 12px ${meta.accent}44` }}
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
          <Badge className="border-transparent bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            How it works
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-100">
            From raw docs to pitch-ready in <span className="text-gradient">three moves</span>
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
                  <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-cyan-300">
                    <step.icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                  </span>
                  <span className="text-[44px] font-black leading-none text-white/5 transition-colors duration-300 group-hover:text-cyan-400/10">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-100">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-400">{step.copy}</p>
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
          <Badge className="border-transparent bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Product
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-100">
            Everything a founder needs to <span className="text-gradient">go raise</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Focused on one job: turning technical documentation into a structured,
            credible investor story — fast enough for a hackathon weekend.
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
              <span className="glass-soft grid h-11 w-11 place-items-center rounded-xl text-cyan-300 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[16.5px] font-semibold text-slate-100">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{f.copy}</p>
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
          <Badge className="border-transparent bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Showcase
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-100">
            Forged from a README, <span className="text-gradient">zero hand-holding</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Real slides from the sample deck — a liquid-staking protocol. Every
            card, bullet and accent was extracted automatically.
          </p>
        </motion.div>

        <div className="mt-14 flex flex-col items-center gap-8">
          <div className="glass-strong w-full overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="no-scrollbar overflow-x-auto pb-2">
              <div className="flex w-max items-stretch gap-5">
                {showcaseSlides.map((section, i) => (
                  <div key={section.key} className="shrink-0">
                    <div
                      className="overflow-hidden rounded-xl shadow-[0_18px_44px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
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
                    <p className="mt-2.5 text-center text-[12.5px] font-semibold text-slate-400">
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
              className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-7 text-[15px] shadow-[0_16px_40px_rgba(34,211,238,0.3)]"
            >
              Forge my repo into this
              <ArrowRight className="h-[18px] w-[18px]" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Badge className="border-transparent bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Pricing
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-100">
            Start free. <span className="text-gradient">Upgrade when you&apos;re raising.</span>
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass glass-hover relative flex flex-col p-8"
          >
            <h3 className="text-lg font-semibold text-slate-100">Hacker</h3>
            <p className="mt-1 text-[13px] text-slate-400">For the demo-day MVP</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-slate-100">$0</span>
              <span className="text-[13px] text-slate-500">forever</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] text-slate-300">
              {["2 pitch decks", "PDF export", "Share links", "Comment on any deck"].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/auth?returnTo=/dashboard" className="mt-7">
              <Button variant="outline" className="glass-soft w-full rounded-xl text-slate-200 hover:bg-white/10">
                Start free
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="edge-highlight relative flex flex-col overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-[oklch(0.24_0.05_262/0.7)] to-[oklch(0.18_0.03_262/0.6)] p-8 backdrop-blur-xl"
          >
            <Badge className="absolute right-5 top-5 border-transparent bg-cyan-500/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-cyan-300">
              One-time
            </Badge>
            <h3 className="text-lg font-semibold text-slate-100">Founder</h3>
            <p className="mt-1 text-[13px] text-slate-400">For teams actually raising</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-slate-100">$19</span>
              <span className="text-[13px] text-slate-500">one-time</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] text-slate-200">
              {["Unlimited pitch decks", "Publish to the catalog", "Priority deck quality", "Early access to new formats"].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-cyan-300" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/auth?returnTo=/wallet" className="mt-7">
              <Button className="shimmer w-full gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 shadow-[0_12px_30px_rgba(34,211,238,0.3)]">
                Upgrade to Founder
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
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
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(120deg, rgba(34,211,238,0.35), rgba(99,102,241,0.3), rgba(168,85,247,0.35))",
            }}
          />
          <AuroraBlobs className="absolute inset-0 opacity-50" />
          <div className="relative">
            <BrandMark className="mx-auto h-14 w-14" />
            <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Your repo is already your pitch.{" "}
              <span className="text-gradient">Forge it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
              Free to start. No design skills required. Your first deck is one
              paste away — before demo day.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth?returnTo=/dashboard">
                <Button
                  size="lg"
                  className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 text-[15px] shadow-[0_16px_40px_rgba(34,211,238,0.35)] transition-transform hover:-translate-y-0.5"
                >
                  Forge my deck — free
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-soft rounded-2xl px-7 text-[15px] text-slate-200 hover:bg-white/10"
                >
                  Continue as guest
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-white/[0.02] py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <Brand />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-400">
            <Link to="/catalog" className="transition hover:text-white">Catalog</Link>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <Link to="/auth" className="transition hover:text-white">Sign in</Link>
          </nav>
          <p className="text-[12px] text-slate-500">
            Secured by{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-400 underline-offset-2 hover:underline"
            >
              freebuff.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
