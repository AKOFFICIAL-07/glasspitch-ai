import { deckSlides, slideLabel } from "@/components/deck/slides";
import { extractTechStack, getTemplate, type PitchDeck } from "@/lib/deck";

/**
 * Minimal surface of pptxgenjs we use. The upstream package's type resolution
 * is awkward with bundlers, so we declare a small local interface instead of
 * depending on its `PptxGenJS` namespace types.
 */
interface PptxTextItem {
  text: string;
  options?: Record<string, unknown>;
}
interface PptxTextOptions {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right" | "justify";
  valign?: "top" | "middle" | "bottom";
  charSpacing?: number;
  fontFace?: string;
  breakLine?: boolean;
  bullet?: { code?: string; indent?: number };
}
interface PptxShapeOptions {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fill?: { color?: string; transparency?: number };
  line?: { color?: string; width?: number };
  rectRadius?: number;
  rotate?: number;
  shadow?: {
    type?: string;
    angle?: number;
    opacity?: number;
    blur?: number;
    color?: string;
    offset?: number;
  };
}
type ShapeName =
  | "rect"
  | "roundRect"
  | "ellipse"
  | "line"
  | "triangle"
  | "rightTriangle"
  | "diamond"
  | "arc"
  | "chevron"
  | "blockArc"
  | "pie"
  | "ring";

interface PptxGenLike {
  defineLayout(o: { name: string; width: number; height: number }): void;
  layout: string;
  author: string;
  title: string;
  background: { color: string };
  ShapeType: Record<ShapeName, ShapeName>;
  addSlide(): unknown;
  addText(text: string | PptxTextItem[], options?: PptxTextOptions): unknown;
  addShape(shape: ShapeName, options?: PptxShapeOptions): unknown;
  writeFile(opts: { fileName: string }): Promise<void>;
}

const EMERALD = "00A86B";
const WHITE = "FFFFFF";
const BODY = "E4E4E7";
const MUTED = "A1A1AA";

/** Export the deck as a .pptx file and trigger a download. */
export async function exportPptx(deck: PitchDeck): Promise<void> {
  const mod = (await import("pptxgenjs")) as unknown as {
    default: new () => PptxGenLike;
  };
  const pptx = new mod.default();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "PitchForge AI";
  pptx.title = deck.title;

  const t = getTemplate(deck.template ?? "glass");
  const accent = t.accent.replace("#", "");
  const slides = deckSlides(deck);
  const total = slides.length;

  const addBullets = (
    body: string[],
    opts: { x?: number; y?: number; w?: number; h?: number; fontSize?: number } = {},
  ) => {
    pptx.addText(
      body.map((b) => ({ text: b, options: { bullet: { code: "25AA", indent: 12 } } })),
      {
        x: opts.x ?? 0.9,
        y: opts.y ?? 2.4,
        w: opts.w ?? 11.5,
        h: opts.h ?? 4.2,
        fontSize: opts.fontSize ?? 16,
        color: BODY,
        valign: "top",
        breakLine: false,
      },
    );
  };

  const addPageFrame = (i: number) => {
    // background + emerald top accent
    pptx.background = { color: "0A0A0A" };
    pptx.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color: accent } });
    pptx.addShape("roundRect", {
      x: 0.7,
      y: 0.6,
      w: 2.1,
      h: 0.55,
      fill: { color: accent },
      line: { color: accent },
      rectRadius: 0.1,
    });
    pptx.addText("PitchForge AI", {
      x: 0.7,
      y: 0.68,
      w: 2.1,
      h: 0.4,
      fontSize: 12,
      color: WHITE,
      align: "center",
      bold: true,
      charSpacing: 2,
    });
    // real per-slide numbering
    pptx.addText([{ text: String(i + 1).padStart(2, "0"), options: { fontSize: 36, bold: true, color: "3F3F46" } }], {
      x: 11.4,
      y: 0.35,
      w: 1.2,
      h: 0.9,
      align: "right",
    });
    pptx.addText(`/ ${String(total).padStart(2, "0")}`, {
      x: 11.4,
      y: 1.05,
      w: 1.2,
      h: 0.3,
      fontSize: 11,
      color: "52525B",
      align: "right",
      charSpacing: 2,
    });
  };

  slides.forEach((slide, i) => {
    const label = slideLabel(slide);
    pptx.addSlide();
    addPageFrame(i);

    if (i === 0) {
      // Cover
      pptx.addText(deck.title, {
        x: 0.9,
        y: 1.9,
        w: 11.5,
        h: 1.6,
        fontSize: 44,
        bold: true,
        color: WHITE,
        align: "center",
        fontFace: "Arial",
      });
      pptx.addText(deck.tagline, {
        x: 2.2,
        y: 3.6,
        w: 8.9,
        h: 1.2,
        fontSize: 18,
        color: MUTED,
        align: "center",
      });
      pptx.addText(
        deck.sections.map((s) => ({ text: s.title, options: { breakLine: true } })),
        { x: 2.2, y: 5.1, w: 8.9, h: 1.4, fontSize: 13, color: EMERALD, align: "center" },
      );
      pptx.addText(`Investor Readiness ${deck.readiness.overall}/100 · ${deck.stats.words.toLocaleString()} words distilled`, {
        x: 2.2,
        y: 6.6,
        w: 8.9,
        h: 0.5,
        fontSize: 13,
        color: MUTED,
        align: "center",
      });
      return;
    }

    if (slide.kind === "closing") {
      pptx.addText("Let's build this together.", {
        x: 0.9,
        y: 1.6,
        w: 11.5,
        h: 1.2,
        fontSize: 40,
        bold: true,
        color: WHITE,
        align: "center",
      });
      pptx.addText(deck.insights.fundingAsk, {
        x: 2.2,
        y: 3.0,
        w: 8.9,
        h: 1,
        fontSize: 18,
        color: MUTED,
        align: "center",
      });

      // Readiness metrics breakdown
      const metrics = deck.readiness.metrics.map(
        (m) => ({ text: `${m.label}: ${m.score}/100  —  ${m.note}`, options: { breakLine: true, fontSize: 14, color: BODY } }),
      );
      pptx.addText([{ text: `Investor Readiness ${deck.readiness.overall}/100`, options: { breakLine: true, fontSize: 20, bold: true, color: EMERALD } }, ...metrics], {
        x: 1.7,
        y: 4.2,
        w: 9.9,
        h: 2.2,
        align: "center",
        valign: "top",
      });
      pptx.addText(
        `${deck.stats.sectionsFound}/6 story sections found in your docs · ${deck.stats.lines.toLocaleString()} lines analyzed`,
        { x: 2.2, y: 6.7, w: 8.9, h: 0.4, fontSize: 12, color: "71717A", align: "center" },
      );
      return;
    }

    // Header
    pptx.addText(label.toUpperCase(), {
      x: 0.9,
      y: 1.15,
      w: 11.5,
      h: 0.5,
      fontSize: 12,
      color: accent,
      bold: true,
      charSpacing: 3,
    });

    if (slide.kind === "section") {
      pptx.addText(slide.section.title, {
        x: 0.9,
        y: 1.65,
        w: 5.6,
        h: 0.9,
        fontSize: 32,
        bold: true,
        color: WHITE,
      });
      // Technology → render the real extracted stack as chips, bullets below
      if (slide.section.key === "tech") {
        const stack = extractTechStack(slide.section.bullets);
        const chips = stack.length > 0 ? stack : null;
        if (chips) {
          const rows = Math.ceil(chips.length / 2);
          chips.forEach((tech, ti) => {
            const col = ti % 2;
            const row = Math.floor(ti / 2);
            const cx = 6.7 + col * 2.95;
            const cy = 1.6 + row * 0.75;
            pptx.addShape("roundRect", {
              x: cx,
              y: cy,
              w: 2.8,
              h: 0.62,
              fill: { color: "13201B" },
              line: { color: "1F3D31", width: 1 },
              rectRadius: 0.12,
            });
            pptx.addText(tech, {
              x: cx + 0.1,
              y: cy + 0.08,
              w: 2.6,
              h: 0.46,
              fontSize: 14,
              bold: true,
              color: EMERALD,
              align: "center",
              valign: "middle",
            });
          });
          addBullets(slide.section.bullets, { x: 6.7, y: 1.7 + rows * 0.75 + 0.25, w: 5.7, fontSize: 14 });
        } else {
          addBullets(slide.section.bullets, { x: 6.9, y: 1.65, w: 5.6, fontSize: 15 });
        }
        if (slide.section.derived) {
          pptx.addText("AI-DERIVED", {
            x: 0.9,
            y: 6.8,
            w: 2.4,
            h: 0.4,
            fontSize: 10,
            color: "F59E0B",
            charSpacing: 2,
          });
        }
        return;
      }

      // Competitive Landscape → render the real competitor cards
      if (slide.section.key === "competitors" && deck.insights.competitors.length > 0) {
        const cards = deck.insights.competitors.slice(0, 3);
        cards.forEach((card, ci) => {
          const cx = 6.6 + ci * 2.2;
          const cw = 2.05;
          pptx.addShape("roundRect", {
            x: cx,
            y: 1.6,
            w: cw,
            h: 5.2,
            fill: { color: "101414", transparency: 0 },
            line: { color: "2A2E2E", width: 1 },
            rectRadius: 0.12,
          });
          const rows: PptxTextItem[] = [
            { text: card.name, options: { breakLine: true, fontSize: 15, bold: true, color: WHITE } },
            { text: card.category, options: { breakLine: true, fontSize: 11, color: EMERALD, charSpacing: 1 } },
            { text: " ", options: { breakLine: true, fontSize: 6 } },
            { text: "STRENGTHS", options: { breakLine: true, fontSize: 9, bold: true, color: "86efac", charSpacing: 1 } },
            ...card.strengths.slice(0, 3).map((s) => ({ text: `• ${s}`, options: { breakLine: true, fontSize: 11, color: BODY } })),
            { text: " ", options: { breakLine: true, fontSize: 6 } },
            { text: "WEAKNESSES", options: { breakLine: true, fontSize: 9, bold: true, color: "FCA5A5", charSpacing: 1 } },
            ...card.weaknesses.slice(0, 3).map((w) => ({ text: `• ${w}`, options: { breakLine: true, fontSize: 11, color: BODY } })),
            { text: " ", options: { breakLine: true, fontSize: 6 } },
            { text: "OUR EDGE", options: { breakLine: true, fontSize: 9, bold: true, color: EMERALD, charSpacing: 1 } },
            { text: card.advantage, options: { breakLine: true, fontSize: 10.5, color: MUTED } },
          ];
          pptx.addText(rows, { x: cx + 0.15, y: 1.8, w: cw - 0.3, h: 4.9, valign: "top" });
        });
      } else {
        addBullets(slide.section.bullets, { x: 6.9, y: 1.65, w: 5.6, fontSize: 15 });
      }
      if (slide.section.derived) {
        pptx.addText("AI-DERIVED", {
          x: 0.9,
          y: 6.8,
          w: 2.4,
          h: 0.4,
          fontSize: 10,
          color: "F59E0B",
          charSpacing: 2,
        });
      }
      return;
    }

    // Insight slides
    if (slide.kind === "insight") {
      const ins = deck.insights;
      const content: Record<string, string[]> = {
        product: [ins.elevatorPitch, ins.executiveSummary],
        market: [`TAM ${ins.tam}  ·  SAM ${ins.sam}  ·  SOM ${ins.som}`, ins.marketNote],
        gtm: ins.gtm,
        roadmap: ins.roadmap.flatMap((p) => [`${p.phase} (${p.timeline})`, ...p.items]),
        financials: [ins.businessModel, ins.pricingStrategy],
        ask: [ins.fundingAsk, ...ins.useOfFunds, "Key risks:", ...ins.risks],
      };
      const titleMap: Record<string, string> = {
        product: "Product",
        market: "Market Sizing",
        gtm: "Go-To-Market",
        roadmap: "Roadmap",
        financials: "Financials",
        ask: "Investment Ask",
      };
      pptx.addText(titleMap[slide.insight] ?? label, {
        x: 0.9,
        y: 1.65,
        w: 11.5,
        h: 0.9,
        fontSize: 32,
        bold: true,
        color: WHITE,
      });
      addBullets(content[slide.insight] ?? [], { y: 2.8, fontSize: 15 });
      pptx.addText("AI-GENERATED — REVIEW BEFORE PITCHING", {
        x: 0.9,
        y: 6.8,
        w: 6,
        h: 0.4,
        fontSize: 10,
        color: "F59E0B",
        charSpacing: 2,
      });
      // Surface the assumptions the docs didn't state — investor-relevant.
      if (slide.insight === "ask" && ins.missing.length > 0) {
        pptx.addText(
          ins.missing.map((m) => ({ text: `⚠ ${m}`, options: { breakLine: true, fontSize: 11, color: MUTED } })),
          { x: 0.9, y: 6.35, w: 10.2, h: 1.0, valign: "top" },
        );
      }
    }
  });

  await pptx.writeFile({
    fileName: `${deck.title.replace(/[^\w\s-]/g, "").trim() || "pitch-deck"}.pptx`,
  });
}
