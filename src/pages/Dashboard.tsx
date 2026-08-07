import { AppShell } from "@/components/app-shell";
import { TransformExperience } from "@/components/deck/transform";
import { SectionIcon } from "@/components/deck/slides";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import {
  SAMPLE_README_MINIMAL,
  SAMPLE_README_RICH,
  SECTION_META,
  buildDeck,
  type PitchDeck,
} from "@/lib/deck";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Presentation,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [markdown, setMarkdown] = useState("");
  const [phase, setPhase] = useState<"idle" | "transforming">("idle");
  const [saving, setSaving] = useState(false);

  const createDeck = useMutation(api.decks.createDeck);
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const decks = useQuery(api.decks.listDecks);

  const analysis = useMemo(() => {
    if (markdown.trim().length < 20) return null;
    try {
      return buildDeck(markdown);
    } catch {
      return null;
    }
  }, [markdown]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setMarkdown(text);
  };

  const handleGenerate = () => {
    if (markdown.trim().length < 20) {
      toast.error("Paste a README first — a few sentences is enough to start.");
      return;
    }
    setPhase("transforming");
  };

  const handleDone = async (deck: PitchDeck) => {
    if (saving) return;
    setSaving(true);
    try {
      const { deckId } = await createDeck({
        projectName: deck.title,
        sourceMarkdown: markdown,
        title: deck.title,
        tagline: deck.tagline,
        sections: deck.sections.map((s) => ({
          key: s.key,
          title: s.title,
          eyebrow: s.eyebrow,
          bullets: s.bullets,
          accent: s.accent,
          derived: s.derived,
        })),
        stats: deck.stats,
      });
      setPhase("idle");
      navigate(`/deck/${deckId}`);
    } catch (error) {
      console.error(error);
      setSaving(false);
      setPhase("idle");
      toast.error("Could not save the deck. Please try again.");
    }
  };

  return (
    <AppShell>
      <AnimatePresence>
        {phase === "transforming" && markdown && (
          <TransformExperience
            markdown={markdown}
            deck={analysis ?? buildDeck(markdown)}
            onDone={handleDone}
            onSkip={() => handleDone(analysis ?? buildDeck(markdown))}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Deck studio
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
              Turn a README into a pitch deck
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-slate-500">
              Paste your project&apos;s markdown and GlassPitch will extract the
              story — Problem, Features, Tech Stack, Market, Revenue and
              Competitors — then assemble it into a polished deck.
            </p>
          </div>
          <Link to="/decks">
            <Button variant="outline" className="glass-soft gap-2 rounded-xl text-slate-600 hover:bg-white/80">
              <Presentation className="h-4 w-4" />
              My decks
            </Button>
          </Link>
        </header>

        {/* Generator */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.12fr_1fr]">
          {/* Input */}
          <div className="glass overflow-hidden">
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="glass-soft grid h-9 w-9 place-items-center rounded-xl text-indigo-500">
                    <FileText className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[15px] font-semibold text-slate-800">Source README</p>
                    <p className="text-[12px] text-slate-400">Markdown or plain text</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,text/markdown,text/plain"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-soft gap-2 rounded-lg text-[12.5px] text-slate-600 hover:bg-white/80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
              </div>

              <div className="relative mt-4 flex-1">
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder={"# My Startup\n\nWe fix the way teams…\n\n## Features\n- …"}
                  className="h-full min-h-[280px] resize-none rounded-2xl border-white/80 bg-white/60 font-mono text-[13px] leading-relaxed text-slate-700 shadow-inner backdrop-blur-md placeholder:text-slate-300 focus-visible:border-indigo-300 focus-visible:ring-indigo-200/50"
                  spellCheck={false}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-slate-400">Try a sample:</span>
                  <button
                    type="button"
                    onClick={() => setMarkdown(SAMPLE_README_RICH)}
                    className="rounded-full border border-white/80 bg-white/60 px-3 py-1 text-[12px] font-medium text-slate-600 backdrop-blur-md transition hover:bg-white/90"
                  >
                    ✨ Lumina · AI meetings
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkdown(SAMPLE_README_MINIMAL)}
                    className="rounded-full border border-white/80 bg-white/60 px-3 py-1 text-[12px] font-medium text-slate-600 backdrop-blur-md transition hover:bg-white/90"
                  >
                    ⚡ OpenShelf · CLI tool
                  </button>
                </div>
                <span className="text-[12px] tabular-nums text-slate-400">
                  {markdown.length.toLocaleString()} chars
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={markdown.trim().length < 20 || phase === "transforming"}
                className="shimmer mt-5 h-12 w-full gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-[15px] font-semibold shadow-[0_14px_34px_rgba(99,102,241,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.55)] disabled:opacity-50"
              >
                <Wand2 className="h-5 w-5" />
                Generate pitch deck
                <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </div>

          {/* Live analysis */}
          <div className="glass overflow-hidden">
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center gap-2.5">
                <span className="glass-soft grid h-9 w-9 place-items-center rounded-xl text-teal-500">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div className="leading-tight">
                  <p className="text-[15px] font-semibold text-slate-800">Live analysis</p>
                  <p className="text-[12px] text-slate-400">What GlassPitch sees — updates as you type</p>
                </div>
              </div>

              {analysis ? (
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Words", value: analysis.stats.words.toLocaleString() },
                      { label: "Lines", value: analysis.stats.lines.toLocaleString() },
                      {
                        label: "Sections",
                        value: `${analysis.stats.sectionsFound}/${analysis.sections.length}`,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-center backdrop-blur-md"
                      >
                        <div className="text-xl font-bold tabular-nums text-slate-800">{s.value}</div>
                        <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1 no-scrollbar">
                    {analysis.sections.map((section) => {
                      const meta = SECTION_META[section.key];
                      return (
                        <motion.div
                          key={section.key}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/55 px-3.5 py-2.5 backdrop-blur-md"
                        >
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
                            style={{ background: meta.accent }}
                          >
                            <SectionIcon name={section.key === "tech" ? "cpu" : section.key === "revenue" ? "line-chart" : section.key} className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1 text-[13.5px] font-semibold text-slate-700">
                            {section.title}
                          </span>
                          <span className="text-[11px] tabular-nums text-slate-400">
                            {section.bullets.length} pts
                          </span>
                          <Badge
                            className={cn(
                              "border-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              section.derived
                                ? "bg-amber-50 text-amber-500"
                                : "bg-teal-50 text-teal-600",
                            )}
                          >
                            {section.derived ? "derived" : "found"}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/30 px-6 py-12 text-center">
                  <span className="glass-soft grid h-14 w-14 place-items-center rounded-2xl text-slate-300">
                    <FileText className="h-6 w-6" />
                  </span>
                  <p className="mt-4 max-w-[260px] text-[13.5px] leading-relaxed text-slate-400">
                    Start typing (or paste) on the left — your six story sections
                    will surface here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent decks */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-800">
              Your recent decks
            </h2>
            <Link
              to="/decks"
              className="flex items-center gap-1 text-[13px] font-semibold text-indigo-500 transition hover:text-indigo-600"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {decks === undefined ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-36 rounded-2xl bg-white/60" />
              ))}
            </div>
          ) : decks.length === 0 ? (
            <div className="glass-soft mt-4 flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
              <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-slate-300">
                <Presentation className="h-5 w-5" />
              </span>
              <p className="text-[14px] text-slate-500">
                No decks yet{user?.name ? `, ${user.name}` : ""}. Paste a README above
                and generate your first one.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {decks.slice(0, 6).map((deck, i) => (
                <motion.div
                  key={deck._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="glass glass-hover group relative overflow-hidden rounded-2xl p-5"
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
                    style={{ background: deck.sections[0]?.accent ?? "#6366f1" }}
                  />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-[15.5px] font-bold text-slate-800">
                        {deck.title}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            aria-label="Delete deck"
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete “{deck.title}”?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes the deck permanently. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="glass-soft rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-xl bg-rose-500 text-white hover:bg-rose-600"
                              onClick={async () => {
                                try {
                                  await deleteDeck({ deckId: deck._id });
                                  toast.success("Deck deleted");
                                } catch {
                                  toast.error("Could not delete deck");
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
                      {deck.tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {deck.sections.slice(0, 6).map((s) => (
                        <span
                          key={s.key}
                          className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                          style={{ background: `${s.accent}1a`, color: s.accent }}
                        >
                          {s.title}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11.5px] font-medium text-slate-400">
                        {deck.sections.length + 2} slides
                      </span>
                      <Link
                        to={`/deck/${deck._id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5"
                      >
                        Open <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </AppShell>
  );
}
