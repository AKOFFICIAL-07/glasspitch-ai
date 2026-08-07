import { deckSlides, slideLabel } from "@/components/deck/slides";
import { getTemplate, type PitchDeck } from "@/lib/deck";

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
        color: "E4E4E7",
        valign: "top",
        breakLine: false,
      },
    );
  };

  slides.forEach((slide, i) => {
    const label = slideLabel(slide);
    pptx.addSlide();

    // background
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
      color: "FFFFFF",
      align: "center",
      bold: true,
      charSpacing: 2,
    });
    pptx.addText([{ text: "13", options: { fontSize: 36, bold: true, color: "3F3F46" } }], {
      x: 11.4,
      y: 0.35,
      w: 1.2,
      h: 0.9,
      align: "right",
    });
    pptx.addText("SLIDE", {
      x: 11.4,
      y: 1.05,
      w: 1.2,
      h: 0.3,
      fontSize: 9,
      color: "52525B",
      align: "right",
      charSpacing: 3,
    });

    if (i === 0) {
      // Cover
      pptx.addText(deck.title, {
        x: 0.9,
        y: 2.1,
        w: 11.5,
        h: 1.6,
        fontSize: 44,
        bold: true,
        color: "FFFFFF",
        align: "center",
        fontFace: "Arial",
      });
      pptx.addText(deck.tagline, {
        x: 2.2,
        y: 3.8,
        w: 8.9,
        h: 1.2,
        fontSize: 18,
        color: "A1A1AA",
        align: "center",
      });
      pptx.addText(
        deck.sections.map((s) => ({ text: s.title, options: { breakLine: true } })),
        { x: 2.2, y: 5.3, w: 8.9, h: 1.2, fontSize: 13, color: EMERALD, align: "center" },
      );
      return;
    }

    if (slide.kind === "closing") {
      pptx.addText("Let's build this together.", {
        x: 0.9,
        y: 2.6,
        w: 11.5,
        h: 1.2,
        fontSize: 40,
        bold: true,
        color: "FFFFFF",
        align: "center",
      });
      pptx.addText(deck.insights.fundingAsk, {
        x: 2.2,
        y: 4.2,
        w: 8.9,
        h: 1,
        fontSize: 18,
        color: "A1A1AA",
        align: "center",
      });
      pptx.addText(
        `Investor Readiness ${deck.readiness.overall}/100`,
        { x: 2.2, y: 5.4, w: 8.9, h: 0.7, fontSize: 16, color: EMERALD, align: "center", bold: true },
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
        color: "FFFFFF",
      });
      addBullets(slide.section.bullets, { x: 6.9, y: 1.65, w: 5.6, fontSize: 15 });
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
        ask: [ins.fundingAsk, ...ins.useOfFunds],
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
        color: "FFFFFF",
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
    }
  });

  await pptx.writeFile({
    fileName: `${deck.title.replace(/[^\w\s-]/g, "").trim() || "pitch-deck"}.pptx`,
  });
}
