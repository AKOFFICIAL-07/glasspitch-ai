import { Brand, BrandMark } from "@/components/brand";
import { HeroDemo } from "@/components/deck/hero-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BeamsBackground } from "@/components/ui/beams-background";
import { SECTION_META, SECTION_ORDER, type SectionKey } from "@/lib/deck";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Check,
  Cpu,
  Crosshair,
  FileText,
  Flame,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
  problem: Flame,
  features: Sparkles,
  tech: Cpu,
  market: TrendingUp,
  revenue: BarChart3,
  competitors: Crosshair,
};

const HEADLINE_WORDS = ["Transform", "technical", "documentation", "into"];
const ACCENT_WORDS = ["investor-ready", "pitch", "decks"];

const TRUST_CHIPS = ["13 slides in seconds", "AI readiness score", "x402 blockchain payments"];

const STATS: { value: string; label: string }[] = [
  { value: "13", label: "investor slides" },
  { value: "6", label: "scored dimensions" },
  { value: "3", label: "export formats" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const navigate = useNavigate();
  const goForge = () => navigate("/auth?returnTo=/dashboard");

  return (
    <div className="relative min-h-screen overflow-x-clip bg-neutral-950">
      {/* Beams background — fixed full-viewport procedural canvas */}
      <div className="fixed inset-0 z-0" aria-hidden>
        <BeamsBackground intensity="strong" />
      </div>

      {/* Floating glass nav */}
      <header className="no-print relative z-30 px-4 pt-4 sm:px-6">
        <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <Link to="/" className="shrink-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["#demo", "Live demo"],
              ["#why", "Why Deckify"],
              ["/catalog", "Catalog"],
              ["/#pricing", "Pricing"],
            ].map(([href, label]) =>
              href.startsWith("/") ? (
                <Link
                  key={href}
                  to={href}
                  className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-white/55 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-white/55 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button
                variant="ghost"
                className="rounded-xl text-[13.5px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/auth?returnTo=/dashboard">
              <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 text-white shadow-[0_10px_26px_rgba(99,102,241,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(99,102,241,0.5)]">
                Open the forge
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="demo" className="relative z-10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          {/* Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={container}
            className="flex flex-col items-start gap-6"
          >
            <motion.div variants={fadeUp}>
              <Badge className="border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200 backdrop-blur-md">
                README → investor-ready pitch deck · for web3 teams
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-[4.4rem]"
            >
              <span className="sr-only">
                Transform technical documentation into investor-ready pitch decks
              </span>
              <span aria-hidden>
                {HEADLINE_WORDS.map((w) => (
                  <motion.span key={w} variants={word} className="mr-[0.26em] inline-block">
                    {w}
                  </motion.span>
                ))}
                <br />
                {ACCENT_WORDS.map((w, i) => (
                  <motion.span
                    key={w}
                    variants={word}
                    className="text-gradient mr-[0.26em] inline-block"
                    aria-hidden={i > 0}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-[16px] leading-relaxed text-white/60 sm:text-lg"
            >
              Upload a README, Markdown, PDF, DOCX, or GitHub repository. Deckify AI
              analyzes your architecture and business model, enriches what's missing,
              and forges a professional investor presentation — gated by real
              on-chain payments.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={goForge}
                className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 text-[15px] font-semibold text-white shadow-[0_16px_44px_rgba(99,102,241,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(99,102,241,0.5)]"
              >
                <FileText className="h-[18px] w-[18px]" />
                Upload README — free
                <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goForge}
                className="glass-soft rounded-2xl px-7 text-[15px] text-white/85 hover:bg-white/10"
              >
                Paste GitHub Repository
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {TRUST_CHIPS.map((chip) => (
                <span key={chip} className="flex items-center gap-2 text-[13px] font-medium text-white/65">
                  <Check className="h-3.5 w-3.5 text-indigo-300" strokeWidth={2.5} />
                  {chip}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-2 flex gap-8 border-t border-white/10 pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold tracking-tight text-white">{s.value}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-white/40">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Live demo — the AI thinking moment */}
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 55% at 50% 45%, rgba(99,102,241,0.3), rgba(59,130,246,0.12), transparent 70%)",
              }}
            />
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <HeroDemo />
            </motion.div>
            <p className="mt-4 text-center text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Watch the forge run — live
            </p>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#marquee"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="relative z-10 mx-auto mb-6 flex w-max flex-col items-center gap-1 text-white/40 transition hover:text-white/70"
          aria-label="Scroll for more"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.a>
      </section>

      {/* Section marquee */}
      <section id="marquee" className="relative z-10 border-y border-white/5 bg-white/[0.02] py-4 backdrop-blur-sm">
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
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/70"
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

      {/* Why Deckify — three glass cards */}
      <section id="why" className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Badge className="border-transparent bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Why Deckify AI
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white">
            Built for the demo-day <span className="text-gradient">trial by fire</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "An AI that thinks like an analyst",
              copy: "Reads your architecture, APIs, and stack — then generates the business story: TAM/SAM/SOM, pricing, GTM, risks, and the ask. Missing facts are flagged, never fabricated.",
            },
            {
              icon: BarChart3,
              title: "A readiness score that judges you",
              copy: "Six scored dimensions — innovation, technology, business, scalability, market, presentation — rolled into one animated ring that shows investors where you shine.",
            },
            {
              icon: Cpu,
              title: "On-chain by default",
              copy: "Premium exports are gated by Algorand x402: connect Pera or Lute, approve a real payment, verify on-chain, and unlock. Your deck can even be minted as an ARC-3 NFT.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-hover group relative overflow-hidden p-6"
            >
              <div className="shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="glass-soft grid h-11 w-11 place-items-center rounded-xl text-indigo-300 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[16.5px] font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{f.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6">
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
                "linear-gradient(120deg, rgba(59,130,246,0.4), rgba(99,102,241,0.35), rgba(129,140,248,0.28))",
            }}
          />
          <div className="relative">
            <BrandMark className="mx-auto h-14 w-14" />
            <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your repo is already your pitch.{" "}
              <span className="text-gradient">Forge it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
              Free to start. No design skills required. Your first deck is one paste
              away — before demo day.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth?returnTo=/dashboard">
                <Button
                  size="lg"
                  className="shimmer gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 text-[15px] font-semibold text-white shadow-[0_16px_40px_rgba(99,102,241,0.4)] transition-transform hover:-translate-y-0.5"
                >
                  <FileText className="h-[18px] w-[18px]" />
                  Upload README — free
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-soft rounded-2xl px-7 text-[15px] text-white/80 hover:bg-white/10"
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
          <Link to="/">
            <Brand />
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-white/55">
            <Link to="/" className="transition hover:text-white">Landing</Link>
            <Link to="/catalog" className="transition hover:text-white">Catalog</Link>
            <a href="#demo" className="transition hover:text-white">Live demo</a>
            <Link to="/auth" className="transition hover:text-white">Sign in</Link>
          </nav>
          <p className="text-[12px] text-white/40">
            Secured by{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/55 underline-offset-2 hover:underline"
            >
              freebuff.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
