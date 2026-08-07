import { BackgroundFX } from "@/components/background";
import { SlideThumb, useSlideNavigation } from "@/components/deck/presenter";
import { DeckStage, PrintDeck, ReadinessRing, deckSlides } from "@/components/deck/slides";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { DECK_TEMPLATES, getTemplate, type PitchDeck } from "@/lib/deck";
import { exportPptx } from "@/lib/pptx";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Globe,
  Link2,
  Loader2,
  MessageSquare,
  Mic,
  Palette,
  Send,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function DeckView() {
  const { id = "" } = useParams();
  const deckId = id as Id<"decks">;
  const navigate = useNavigate();
  const { user } = useAuth();
  const deckDoc = useQuery(api.decks.getDeck, { deckId });
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const publishDeck = useMutation(api.decks.publishDeck);
  const setDeckTemplate = useMutation(api.decks.setDeckTemplate);
  const [shareCopied, setShareCopied] = useState(false);
  const [template, setTemplate] = useState<string | null>(null);
  const [voicePlaying, setVoicePlaying] = useState<"30" | "60" | "180" | null>(null);

  const deck: PitchDeck | null = useMemo(() => {
    if (!deckDoc) return null;
    return {
      title: deckDoc.title,
      tagline: deckDoc.tagline,
      sections: deckDoc.sections.map((s) => ({
        key: s.key as PitchDeck["sections"][number]["key"],
        title: s.title,
        eyebrow: s.eyebrow,
        bullets: s.bullets,
        accent: s.accent,
        derived: s.derived,
      })),
      stats: deckDoc.stats,
      insights: deckDoc.insights,
      readiness: {
        overall: deckDoc.readiness.overall,
        metrics: deckDoc.readiness.metrics.map((m) => ({
          key: m.key as PitchDeck["readiness"]["metrics"][number]["key"],
          label: m.label,
          score: m.score,
          note: m.note,
        })),
      },
      template: template ?? deckDoc.template ?? "glass",
    };
  }, [deckDoc, template]);

  const total = deck ? deckSlides(deck).length : 0;
  const { index, direction, goTo, next, prev, isFirst, isLast } = useSlideNavigation(total);

  const handleShare = async () => {
    if (!deckDoc) return;
    const url = `${window.location.origin}/d/${deckDoc.shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const handlePrint = () => {
    if (!deckDoc) return;
    const prevTitle = document.title;
    document.title = `${deckDoc.title} — Investor Deck`;
    window.print();
    setTimeout(() => (document.title = prevTitle), 1500);
  };

  const handlePptx = async () => {
    if (!deck) return;
    try {
      toast.loading("Building PPTX…", { id: "pptx" });
      await exportPptx(deck);
      toast.success("PPTX downloaded", { id: "pptx" });
    } catch (error) {
      console.error(error);
      toast.error("Could not export PPTX", { id: "pptx" });
    }
  };

  const handleTemplate = async (tpl: string) => {
    setTemplate(tpl);
    try {
      await setDeckTemplate({ deckId, template: tpl });
      toast.success(`Template switched to ${getTemplate(tpl).name}`);
    } catch {
      /* local preview still updates */
    }
  };

  const handleVoice = (duration: "30" | "60" | "180") => {
    if (!deck) return;
    if (voicePlaying) window.speechSynthesis.cancel();
    setVoicePlaying(duration);
    const script = buildVoiceScript(deck, duration);
    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = duration === "30" ? 1.05 : 0.98;
    utter.pitch = 1;
    utter.onend = () => setVoicePlaying(null);
    utter.onerror = () => setVoicePlaying(null);
    window.speechSynthesis.speak(utter);
    toast.success(
      duration === "30"
        ? "Playing the 30-second elevator pitch"
        : duration === "60"
          ? "Playing the 60-second investor pitch"
          : "Playing the 3-minute investor presentation",
    );
  };

  const handleDelete = async () => {
    try {
      await deleteDeck({ deckId });
      toast.success("Deck deleted");
      navigate("/decks");
    } catch {
      toast.error("Could not delete deck");
    }
  };

  const handlePublish = async () => {
    try {
      await publishDeck({ deckId, published: !deckDoc?.published });
      toast.success(
        deckDoc?.published
          ? "Deck removed from catalog"
          : "Deck published to the catalog",
      );
    } catch {
      toast.error("Could not update catalog status");
    }
  };

  useEffect(() => {
    if (deckDoc) document.title = `${deckDoc.title} — PitchForge AI`;
    return () => window.speechSynthesis.cancel();
  }, [deckDoc]);

  const slides = deck ? deckSlides(deck) : [];

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={30} />
      {deck && <PrintDeck deck={deck} />}

      <div className="no-print relative z-10 mx-auto max-w-[1400px] px-3 pb-8 pt-3 sm:px-5">
        {/* Top bar */}
        <header className="glass-strong flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3">
          <Link to="/decks">
            <Button variant="outline" size="icon" className="glass-soft h-10 w-10 rounded-xl text-white/70 hover:bg-white/10">
              <ArrowLeft className="h-[18px] w-[18px]" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold text-white">
              {deckDoc?.title ?? "Loading deck…"}
            </h1>
            <p className="truncate text-[12px] text-white/45">
              {deckDoc
                ? `13 slides · ${deckDoc.stats.words.toLocaleString()} words distilled${deckDoc.published ? " · published to catalog" : ""}`
                : ""}
            </p>
          </div>

          {/* Template switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur-md">
            <Palette className="h-3.5 w-3.5 text-white/50" />
            {DECK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.name}
                onClick={() => handleTemplate(t.id)}
                className={cn(
                  "h-6 w-6 rounded-lg transition-all duration-200",
                  (template ?? deckDoc?.template ?? "glass") === t.id
                    ? "scale-110 ring-2 ring-white/70 ring-offset-2 ring-offset-[oklch(0.16_0.03_170)]"
                    : "opacity-60 hover:scale-105 hover:opacity-100",
                )}
                style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <VoicePitchMenu playing={voicePlaying} onPlay={handleVoice} deck={deck} />
            <X402Gate deckId={deckId} deck={deck} />
            <Button
              variant="outline"
              onClick={handlePublish}
              className={cn(
                "gap-2 rounded-xl text-[13px]",
                deckDoc?.published
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  : "glass-soft text-white/70 hover:bg-white/10",
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{deckDoc?.published ? "Published" : "Publish"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className={cn(
                "glass-soft gap-2 rounded-xl text-[13px]",
                shareCopied ? "border-emerald-400/30 text-emerald-300" : "text-white/70 hover:bg-white/10",
              )}
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">{shareCopied ? "Copied!" : "Share link"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="glass-soft gap-2 rounded-xl text-[13px] text-white/70 hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={handlePptx}
              disabled={!deck}
              className="glass-soft gap-2 rounded-xl text-[13px] text-white/70 hover:bg-white/10"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PPTX</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="glass-soft h-10 w-10 rounded-xl text-white/40 hover:bg-rose-500/10 hover:text-rose-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-strong rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{deckDoc?.title ?? "this deck"}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the deck and its share link permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="glass-soft rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-500 text-white hover:bg-rose-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {!deckDoc || !deck ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-4 py-24 text-center">
            <Skeleton className="h-[420px] w-full max-w-4xl rounded-2xl bg-white/5" />
            <p className="text-[13.5px] text-white/45">Loading your deck…</p>
          </div>
        ) : (
          <div className="mt-5 flex gap-5">
            {/* Thumbnail rail */}
            <aside
              className="no-scrollbar hidden w-[178px] shrink-0 flex-col gap-2.5 overflow-y-auto pb-2 lg:flex"
              style={{ maxHeight: "calc(100vh - 150px)" }}
            >
              {slides.map((slide, i) => (
                <SlideThumb
                  key={`${i}-${slide.kind}`}
                  deck={deck}
                  slide={slide}
                  active={i === index}
                  onClick={() => goTo(i)}
                />
              ))}
            </aside>

            {/* Stage + insights */}
            <div className="min-w-0 flex-1">
              <div className="relative">
                <DeckStage deck={deck} index={index} direction={direction} />

                {!isFirst && (
                  <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={prev}
                    className="glass-strong absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/70 shadow-lg transition hover:scale-105 hover:text-emerald-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {!isLast && (
                  <button
                    type="button"
                    aria-label="Next slide"
                    onClick={next}
                    className="glass-strong absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/70 shadow-lg transition hover:scale-105 hover:text-emerald-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Bottom controls */}
              <div className="glass-soft mt-4 flex items-center gap-4 rounded-2xl px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  disabled={isFirst}
                  className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-white/70 hover:bg-white/10 disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </Button>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    animate={{ width: `${((index + 1) / total) * 100}%` }}
                    transition={{ ease: "easeInOut", duration: 0.4 }}
                  />
                </div>
                <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-white/60">
                  {index + 1} / {total}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={next}
                  disabled={isLast}
                  className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-white/70 hover:bg-white/10 disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Readiness panel */}
              <div className="glass mt-4 grid gap-5 rounded-2xl p-5 sm:grid-cols-[auto_1fr]">
                <ReadinessRing score={deck.readiness.overall} size={124} stroke={9} />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {deck.readiness.metrics.map((m) => (
                    <div key={m.key} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-[12px] font-semibold text-white/70">{m.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${m.score}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-[12px] font-bold tabular-nums text-emerald-300">
                        {m.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide caption */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] font-medium text-white/45">
                {slides[index]?.kind === "section" ? (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: getTemplate(deck.template ?? "glass").accent,
                    }}
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                )}
                {slides[index]?.kind === "cover"
                  ? "Cover"
                  : slides[index]?.kind === "closing"
                    ? "Thank You"
                    : slides[index]?.kind === "section"
                      ? (slides[index] as { section: { title: string } }).section.title
                      : slideLabelShort(slides[index] as { insight: string })}
              </div>

              {/* Comments */}
              <CommentSection deckId={deckId} currentUser={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function slideLabelShort(slide: { insight: string }): string {
  const LABELS: Record<string, string> = {
    product: "Product",
    market: "Market Sizing",
    gtm: "Go-To-Market",
    roadmap: "Roadmap",
    financials: "Financials",
    ask: "Investment Ask",
  };
  return LABELS[slide.insight] ?? "Slide";
}

/* ------------------------------------------------------------------ */
/* Voice pitch                                                         */
/* ------------------------------------------------------------------ */

function buildVoiceScript(deck: PitchDeck, duration: "30" | "60" | "180"): string {
  const ins = deck.insights;
  if (duration === "30") {
    return ins.elevatorPitch;
  }
  if (duration === "60") {
    return `${ins.elevatorPitch} Here's the problem: ${deck.sections.find((s) => s.key === "problem")?.bullets[0] ?? "the status quo doesn't work"}. Our solution: ${deck.sections.find((s) => s.key === "features")?.bullets[0] ?? "a focused, fast product"}. ${ins.fundingAsk}`;
  }
  return [
    ins.executiveSummary,
    `The problem: ${deck.sections.find((s) => s.key === "problem")?.bullets.slice(0, 2).join(" And ")}`,
    `Our solution: ${ins.elevatorPitch}`,
    `Market: TAM ${ins.tam}, SAM ${ins.sam}, SOM ${ins.som}. ${ins.marketNote}`,
    `Business model: ${ins.businessModel}`,
    `Roadmap: ${ins.roadmap.map((p) => `${p.phase} in ${p.timeline}`).join(", ")}.`,
    `We're aware of the risks: ${ins.risks.slice(0, 2).join(" And ")}`,
    ins.fundingAsk,
    `Thank you — we'd love to build this together.`,
  ].join(" ");
}

function VoicePitchMenu({
  playing,
  onPlay,
  deck,
}: {
  playing: "30" | "60" | "180" | null;
  onPlay: (d: "30" | "60" | "180") => void;
  deck: PitchDeck | null;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!deck}
          className={cn(
            "glass-soft gap-2 rounded-xl text-[13px] hover:bg-white/10",
            playing ? "border-emerald-400/40 text-emerald-300" : "text-white/70",
          )}
        >
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">{playing ? "Playing…" : "AI Voice"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">AI voice pitch</DialogTitle>
          <DialogDescription className="text-white/50">
            Generate a narrated pitch read aloud with the browser&apos;s speech engine.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {(
            [
              { id: "30", label: "30-second pitch", desc: "Elevator pitch" },
              { id: "60", label: "60-second pitch", desc: "Problem → solution → ask" },
              { id: "180", label: "3-minute presentation", desc: "Full investor narrative" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onPlay(o.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                playing === o.id
                  ? "border-emerald-400/50 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-white/10",
              )}
            >
              <span>
                <span className="block text-[14px] font-semibold text-white">{o.label}</span>
                <span className="block text-[12px] text-white/45">{o.desc}</span>
              </span>
              {playing === o.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
              ) : (
                <Mic className="h-4 w-4 text-white/50" />
              )}
            </button>
          ))}
          <p className="text-[11.5px] leading-relaxed text-white/40">
            Tip: narration uses your system voices — pick a natural one in OS settings for best results.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* x402 premium gate                                                   */
/* ------------------------------------------------------------------ */

function X402Gate({ deckId, deck }: { deckId: Id<"decks">; deck: PitchDeck | null }) {
  const requestAuth = useMutation(api.payments.requestX402Authorization);
  const verifyPayment = useMutation(api.payments.verifyX402Payment);
  const unlock = useQuery(api.payments.isDeckUnlocked, { deckId });

  const [step, setStep] = useState<"wallet" | "authorize" | "verify" | "done">("wallet");
  const [walletAddress, setWalletAddress] = useState("");
  const [paymentId, setPaymentId] = useState<Id<"payments"> | null>(null);
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const reset = () => {
    setStep("wallet");
    setWalletAddress("");
    setPaymentId(null);
    setTxHash("");
  };

  const handleConnect = () => {
    if (!/^[A-Z2-7]{40,58}$/.test(walletAddress.trim())) {
      toast.error("Enter a valid Algorand address (58-char base32).");
      return;
    }
    setStep("authorize");
  };

  const handleAuthorize = async () => {
    setBusy(true);
    try {
      const res = await requestAuth({
        walletAddress: walletAddress.trim(),
        deckId,
        memo: `PitchForge AI premium deck — ${deck?.title ?? ""}`,
      });
      setPaymentId(res.paymentId);
      setStep("verify");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authorization failed");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!paymentId) return;
    setBusy(true);
    try {
      await verifyPayment({ paymentId, txHash: txHash.trim() });
      setStep("done");
      toast.success("Payment verified — premium deck unlocked!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const verified = unlock?.verified?.[0];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!deck}
          className={cn(
            "gap-2 rounded-xl text-[13px]",
            unlock?.unlocked
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
              : "glass-soft text-white/70 hover:bg-white/10",
          )}
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{unlock?.unlocked ? "Premium" : "Premium deck"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-4 w-4 text-emerald-400" />
            Generate premium deck
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Pay 2.5 ALGO via x402 (Algorand HTTP payments) to unlock the premium
            deck — full-res exports, PPTX, and early access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stepper */}
          <div className="flex items-center gap-1.5">
            {["Connect wallet", "Authorize", "Verify", "Done"].map((label, i) => {
              const stateIdx = ["wallet", "authorize", "verify", "done"].indexOf(step);
              const done = i < stateIdx;
              const active = i === stateIdx;
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold",
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50"
                          : "bg-white/5 text-white/40",
                    )}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={cn("text-[10px] font-medium", active ? "text-white/80" : "text-white/35")}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {step === "wallet" && (
            <div className="space-y-3">
              <p className="text-[12.5px] text-white/60">
                Connect your Algorand wallet (Pera, Daffi, or any x402-compatible wallet).
              </p>
              <input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="ALGO wallet address (e.g. 3P7Y...)"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] font-mono text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              <Button
                onClick={handleConnect}
                disabled={!walletAddress.trim()}
                className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(0,168,107,0.3)]"
              >
                <Wallet className="h-4 w-4" />
                Connect wallet
              </Button>
              <p className="text-center text-[11px] text-white/35">
                Demo mode: use any 58-char Algorand-style address to try the flow.
              </p>
            </div>
          )}

          {step === "authorize" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] p-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/60">Amount</span>
                  <span className="font-bold text-white">2.5 ALGO</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px]">
                  <span className="text-white/60">Asset</span>
                  <span className="font-semibold text-white/85">Native ALGO (ID 0)</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px]">
                  <span className="text-white/60">Wallet</span>
                  <span className="max-w-[200px] truncate font-mono text-[11px] text-emerald-300">
                    {walletAddress}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px]">
                  <span className="text-white/60">Memo</span>
                  <span className="max-w-[220px] truncate text-[11.5px] text-white/60">
                    PitchForge AI premium deck
                  </span>
                </div>
              </div>
              <Button
                onClick={handleAuthorize}
                disabled={busy}
                className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(0,168,107,0.3)]"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                {busy ? "Requesting x402 authorization…" : "Request x402 payment authorization"}
              </Button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-3">
              <p className="text-[12.5px] text-white/60">
                Sign the payment in your wallet, then paste the transaction hash to verify on-chain.
              </p>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Transaction hash (64-char)"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-[12px] text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              <Button
                onClick={handleVerify}
                disabled={busy || txHash.trim().length < 20}
                className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(0,168,107,0.3)]"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {busy ? "Verifying on-chain…" : "Verify payment"}
              </Button>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/[0.08] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-[14px] font-bold text-white">Payment verified — deck unlocked</span>
                </div>
                <div className="mt-3 space-y-2 text-[12.5px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-white/50">Wallet address</span>
                    <span className="max-w-[220px] truncate font-mono text-[11px] text-emerald-300">
                      {walletAddress}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/50">Transaction hash</span>
                    <span className="max-w-[220px] truncate font-mono text-[11px] text-emerald-300">
                      {txHash || verified?.txHash}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/50">Payment status</span>
                    <span className="font-semibold text-emerald-300">Verified ✓</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/50">Timestamp</span>
                    <span className="text-white/70">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/50">Generation status</span>
                    <span className="font-semibold text-white/85">Ready — exports unlocked</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setOpen(false)}
                className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Download className="h-4 w-4" />
                Unlock premium exports
              </Button>
            </div>
          )}

          {unlock?.unlocked && step !== "done" && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] px-4 py-2.5">
              <span className="text-[12.5px] font-semibold text-emerald-300">
                ✓ This deck is already unlocked
              </span>
              <Button size="sm" className="rounded-lg bg-emerald-500 text-white" onClick={() => setStep("done")}>
                View receipt
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Comments                                                             */
/* ------------------------------------------------------------------ */

function CommentSection({
  deckId,
  currentUser,
}: {
  deckId: Id<"decks">;
  currentUser: { name?: string; email?: string } | null | undefined;
}) {
  const comments = useQuery(api.comments.listComments, { deckId });
  const addComment = useMutation(api.comments.addComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (body.trim().length < 2) return;
    setPosting(true);
    try {
      await addComment({ deckId, body: body.trim() });
      setBody("");
      toast.success("Comment posted");
    } catch {
      toast.error("Could not post comment");
    } finally {
      setPosting(false);
    }
  };

  const initials = (name?: string) =>
    name
      ?.split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PF";

  return (
    <div className="glass mt-6 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-emerald-300" />
        <h3 className="text-[15px] font-semibold text-white">Feedback</h3>
        <span className="text-[12px] text-white/45">
          {comments === undefined ? "" : `· ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-semibold text-white">
            {initials(currentUser?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a question or leave feedback for the founder…"
            className="min-h-[76px] resize-none rounded-xl border-white/10 bg-white/5 text-[13px] text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/40 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/20"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="text-[11px] text-white/40">{body.length}/500</span>
            <Button
              size="sm"
              onClick={handlePost}
              disabled={body.trim().length < 2 || posting}
              className="gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-[12.5px] text-white shadow-[0_8px_18px_rgba(0,168,107,0.25)] disabled:opacity-40"
            >
              {posting ? "Posting…" : "Post"}
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {comments === undefined ? (
          <div className="flex items-center gap-2 text-[12.5px] text-white/45">
            <Skeleton className="h-4 w-40 rounded bg-white/5" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-[12.5px] text-white/40">
            No feedback yet — be the first to comment.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-white/10 text-[10px] font-semibold text-white/80">
                  {initials(c.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/85">{c.authorName}</span>
                  <span className="text-[11px] text-white/40">
                    {new Date(c._creationTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-white/60">{c.body}</p>
              </div>
              <button
                type="button"
                aria-label="Delete comment"
                onClick={async () => {
                  try {
                    await deleteComment({ commentId: c._id });
                    toast.success("Comment deleted");
                  } catch {
                    toast.error("Could not delete comment");
                  }
                }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/30 opacity-30 transition hover:bg-rose-500/10 hover:text-rose-400 hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
