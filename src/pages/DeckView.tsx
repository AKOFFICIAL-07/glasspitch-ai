import { BackgroundFX } from "@/components/background";
import { SlideThumb, useSlideNavigation } from "@/components/deck/presenter";
import { DeckStage, PrintDeck, deckSlides } from "@/components/deck/slides";
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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SECTION_META, type PitchDeck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Link2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function DeckView() {
  const { id = "" } = useParams();
  const deckId = id as Id<"decks">;
  const navigate = useNavigate();
  const deckDoc = useQuery(api.decks.getDeck, { deckId });
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const [shareCopied, setShareCopied] = useState(false);

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
    document.title = `${deckDoc.title} — Pitch Deck`;
    window.print();
    setTimeout(() => (document.title = prevTitle), 1500);
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

  useEffect(() => {
    if (deckDoc) document.title = `${deckDoc.title} — GlassPitch`;
  }, [deckDoc]);

  const slides = deck ? deckSlides(deck) : [];

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={30} />
      {deck && <PrintDeck deck={deck} />}

      <div className="no-print relative z-10 mx-auto max-w-[1400px] px-3 pb-8 pt-3 sm:px-5">
        {/* Top bar */}
        <header className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3">
          <Link to="/decks">
            <Button variant="outline" size="icon" className="glass-soft h-10 w-10 rounded-xl text-slate-600 hover:bg-white/80">
              <ArrowLeft className="h-[18px] w-[18px]" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold text-slate-800">
              {deckDoc?.title ?? "Loading deck…"}
            </h1>
            <p className="truncate text-[12px] text-slate-400">
              {deckDoc ? `${total} slides · ${deckDoc.stats.words.toLocaleString()} words distilled` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className={cn(
                "glass-soft gap-2 rounded-xl text-[13px]",
                shareCopied ? "border-teal-200 text-teal-600" : "text-slate-600 hover:bg-white/80",
              )}
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">{shareCopied ? "Copied!" : "Share link"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="glass-soft gap-2 rounded-xl text-[13px] text-slate-600 hover:bg-white/80"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="glass-soft h-10 w-10 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500">
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
            <Skeleton className="h-[420px] w-full max-w-4xl rounded-2xl bg-white/50" />
            <p className="text-[13.5px] text-slate-400">Loading your deck…</p>
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

            {/* Stage */}
            <div className="min-w-0 flex-1">
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

              {/* Bottom controls */}
              <div className="glass-soft mt-4 flex items-center gap-4 rounded-2xl px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  disabled={isFirst}
                  className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-slate-600 hover:bg-white/80 disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prev</span>
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
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Slide caption */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] font-medium text-slate-400">
                {slides[index]?.kind === "section" ? (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        SECTION_META[(slides[index] as { section: { key: keyof typeof SECTION_META } }).section.key]
                          .accent,
                    }}
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                )}
                {slides[index]?.kind === "cover"
                  ? "Cover"
                  : slides[index]?.kind === "closing"
                    ? "Closing"
                    : (slides[index] as { section: { title: string } }).section.title}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
