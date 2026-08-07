import { BackgroundFX } from "@/components/background";
import { Brand } from "@/components/brand";
import { useSlideNavigation } from "@/components/deck/presenter";
import { DeckStage, PrintDeck, deckSlides } from "@/components/deck/slides";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { PitchDeck } from "@/lib/deck";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";

export default function ShareView() {
  const { shareCode = "" } = useParams();
  const deckDoc = useQuery(api.decks.getDeckByShareCode, { shareCode });

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
    };
  }, [deckDoc]);

  const total = deck ? deckSlides(deck).length : 0;
  const { index, direction, next, prev, isFirst, isLast } = useSlideNavigation(total);

  const handlePrint = () => {
    if (!deckDoc) return;
    const prevTitle = document.title;
    document.title = `${deckDoc.title} — Pitch Deck`;
    window.print();
    setTimeout(() => (document.title = prevTitle), 1500);
  };

  if (!deckDoc || !deck) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <BackgroundFX />
        <div className="glass-strong mx-4 max-w-md rounded-3xl p-10 text-center">
          <p className="text-lg font-semibold text-slate-700">
            {deckDoc === undefined ? "Loading shared deck…" : "This deck doesn’t exist"}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">
            {deckDoc === undefined
              ? "Hang tight — fetching the deck."
              : "The share link may have been removed by its owner."}
          </p>
          {deckDoc === null && (
            <Link to="/" className="mt-6 inline-block">
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500">
                <Sparkles className="h-4 w-4" />
                Create your own deck
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={34} />
      <PrintDeck deck={deck} />

      <div className="no-print relative z-10 mx-auto max-w-6xl px-3 pb-8 pt-3 sm:px-5">
        <header className="glass-strong flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <Link to="/" className="shrink-0">
            <Brand compact />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[14px] font-bold text-slate-800">{deck.title}</p>
            <p className="truncate text-[11.5px] text-slate-400">
              shared deck · {total} slides
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-slate-600 hover:bg-white/80"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Link to="/auth?returnTo=/dashboard">
              <Button
                size="sm"
                className="shimmer gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 text-[12.5px] shadow-[0_8px_20px_rgba(99,102,241,0.4)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Make your own</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="mt-5">
          <div className="relative">
            <DeckStage deck={deck} index={index} direction={direction} />

            {!isFirst && (
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="glass-strong absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-slate-600 shadow-lg transition hover:scale-105 hover:text-indigo-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="glass-strong absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-slate-600 shadow-lg transition hover:scale-105 hover:text-indigo-500"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="glass-soft mt-4 flex items-center gap-4 rounded-2xl px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={isFirst}
              className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-slate-600 hover:bg-white/80 disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-white/70 bg-white/60">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-teal-400"
                animate={{ width: `${((index + 1) / total) * 100}%` }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
              />
            </div>
            <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-slate-500">
              {index + 1} / {total}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={next}
              disabled={isLast}
              className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-slate-600 hover:bg-white/80 disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-center gap-2 text-[12px] font-medium text-slate-400">
          <span className="grid h-4 w-4 place-items-center rounded bg-gradient-to-br from-sky-400 to-indigo-500 text-[7px] font-bold text-white">
            G
          </span>
          Presented with GlassPitch —{" "}
          <Link to="/" className="text-indigo-500 underline-offset-2 hover:underline">
            turn your README into a deck
          </Link>
        </footer>
      </div>
    </div>
  );
}
