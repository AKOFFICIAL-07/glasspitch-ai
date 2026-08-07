export type SectionKey =
  | "problem"
  | "features"
  | "tech"
  | "market"
  | "revenue"
  | "competitors";

export interface DeckSection {
  key: SectionKey;
  title: string;
  eyebrow: string;
  bullets: string[];
  accent: string;
  /** true when the section was inferred rather than found in the README */
  derived: boolean;
}

export interface DeckStats {
  words: number;
  lines: number;
  sectionsFound: number;
}

export interface PitchDeck {
  title: string;
  tagline: string;
  sections: DeckSection[];
  stats: DeckStats;
}

export const SECTION_ORDER: SectionKey[] = [
  "problem",
  "features",
  "tech",
  "market",
  "revenue",
  "competitors",
];

export const SECTION_META: Record<
  SectionKey,
  { title: string; eyebrow: string; icon: string; accent: string }
> = {
  problem: { title: "Problem", eyebrow: "The pain", icon: "flame", accent: "#38bdf8" },
  features: { title: "Features", eyebrow: "The solution", icon: "sparkles", accent: "#6366f1" },
  tech: { title: "Tech Stack", eyebrow: "Built on", icon: "cpu", accent: "#14b8a6" },
  market: { title: "Market", eyebrow: "The opportunity", icon: "trending-up", accent: "#8b5cf6" },
  revenue: { title: "Revenue", eyebrow: "The model", icon: "line-chart", accent: "#10b981" },
  competitors: { title: "Competitors", eyebrow: "The landscape", icon: "crosshair", accent: "#64748b" },
};

/* ------------------------------------------------------------------ */
/* Markdown helpers                                                    */
/* ------------------------------------------------------------------ */

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/(^|\s)\*([^*]*)\*/g, "$1$2")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBadLine(line: string): boolean {
  const t = line.trim().toLowerCase();
  if (!t) return true;
  if (t.startsWith("![") || t.startsWith("<img") || t.startsWith("|")) return true;
  if (t.startsWith("<!--") || t.startsWith("```") || t.startsWith("~~~")) return true;
  if (t.startsWith("![") || t.startsWith("[![")) return true;
  if (/^(badges|shields|coverage|license|build|ci)[:|]?/i.test(t) && t.length < 40) return true;
  return false;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => stripInlineMarkdown(s).trim())
    .filter((s) => s.length > 25);
}

const HEADING_KEYWORDS: Record<SectionKey, string[]> = {
  problem: ["problem", "pain", "why ", "motivation", "background", "challenge", "issue", "gap"],
  features: ["feature", "capabilit", "what it does", "what can", "highlights", "how it work", "function", "key abilities"],
  tech: ["tech", "stack", "architecture", "built with", "built on", "dependency", "librar", "framework", "getting started", "installation", "setup"],
  market: ["market", "audience", "who is", "who should", "use case", "user", "customer", "target", "community"],
  revenue: ["revenue", "business model", "monetiz", "pricing", "commercial", "how we make", "business"],
  competitors: ["competitor", "alternativ", "comparison", "vs.", " v ", "landscape", "related work", "other tools"],
};

function classifyHeading(text: string): SectionKey | null {
  const t = " " + text.toLowerCase().trim() + " ";
  let best: SectionKey | null = null;
  let bestScore = 0;
  for (const key of SECTION_ORDER) {
    let score = 0;
    for (const kw of HEADING_KEYWORDS[key]) {
      if (t.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return bestScore >= 4 ? best : null;
}

/* ------------------------------------------------------------------ */
/* Parser                                                              */
/* ------------------------------------------------------------------ */

interface ParsedBlock {
  key: SectionKey;
  heading: string;
  bullets: string[];
}

function parseReadme(markdown: string): {
  title: string;
  tagline: string;
  preamble: string[];
  blocks: ParsedBlock[];
  codeLangs: string[];
} {
  const rawLines = markdown.split(/\r?\n/);
  const lines = rawLines.filter((l) => !l.trim().startsWith("<!--"));

  let title = "";
  let tagline = "";
  const preamble: string[] = [];
  const blocks: ParsedBlock[] = [];
  const codeLangs: string[] = [];

  let inFence = false;
  let current: ParsedBlock | null = null;
  let paragraph: string[] = [];
  const seenKeys = new Set<SectionKey>();

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (!text || isBadLine(text)) return;
    const clean = stripInlineMarkdown(text);
    if (!clean) return;
    if (!title) {
      title = clean;
      return;
    }
    if (!tagline && clean.length > 12) {
      tagline = clean;
      return;
    }
    if (!current) {
      preamble.push(clean);
    } else {
      // Paragraph inside a detected section becomes a bullet candidate.
      const sentences = splitSentences(clean);
      current.bullets.push(...sentences);
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (/^```/.test(line) || /^~~~/.test(line)) {
      if (!inFence && /^```\s*([\w+#.-]+)/.test(line)) {
        codeLangs.push(line.replace(/^```\s*/, "").split(/\s/)[0]);
      }
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Headings
    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      const heading = stripInlineMarkdown(headingMatch[2]);
      if (headingMatch[1] === "#" && !title) {
        title = heading;
        current = null;
        continue;
      }
      const key = classifyHeading(heading);
      if (key) {
        if (current) blocks.push(current);
        current = { key, heading, bullets: [] };
        seenKeys.add(key);
      } else {
        if (current) blocks.push(current);
        current = null;
      }
      continue;
    }

    // Bullet lists
    const bulletMatch = /^\s*(?:[-*+•]|\d+[.)])\s+(.+)$/.exec(raw);
    if (bulletMatch) {
      const bullet = stripInlineMarkdown(bulletMatch[1]);
      if (bullet && !isBadLine(bullet) && bullet.length > 2) {
        if (current) current.bullets.push(bullet);
        else if (!title && !tagline) preamble.push(bullet);
        else preamble.push(bullet);
      }
      continue;
    }

    if (!line) {
      flushParagraph();
      continue;
    }
    if (isBadLine(line)) continue;

    paragraph.push(line);
  }
  flushParagraph();
  if (current) blocks.push(current);

  return { title, tagline, preamble, blocks, codeLangs };
}

/* ------------------------------------------------------------------ */
/* Fallbacks                                                           */
/* ------------------------------------------------------------------ */

const FALLBACK: Record<SectionKey, { bullets: string[]; derived: boolean }> = {
  problem: {
    bullets: [
      "Existing workflows are slow, fragmented, and require expensive tooling",
      "Teams lose time stitching together disconnected solutions",
      "The gap compounds as teams and projects scale",
    ],
    derived: true,
  },
  features: {
    bullets: [
      "Streamlined, focused core workflows that remove busywork",
      "Fast and reliable by default, with a developer-first experience",
      "Works out of the box with minimal setup and configuration",
    ],
    derived: true,
  },
  tech: {
    bullets: [
      "Modern TypeScript tooling and a battle-tested stack",
      "Leverages open-source libraries instead of reinventing infrastructure",
      "Deployable to any cloud with minimal operational overhead",
    ],
    derived: true,
  },
  market: {
    bullets: [
      "Early adopters: developers and operators solving this problem today",
      "Expands to adjacent teams as adoption and trust grow",
      "Global demand for faster, simpler, more focused tooling",
    ],
    derived: true,
  },
  revenue: {
    bullets: [
      "Freemium core with paid team plans as the growth engine",
      "Usage-based pricing scales naturally with customer value",
      "Expansion revenue from adjacent features and integrations",
    ],
    derived: true,
  },
  competitors: {
    bullets: [
      "Legacy incumbents burdened by heavy, complex workflows",
      "Point solutions that solve one slice but don't integrate",
      "Our focus and speed are the moat",
    ],
    derived: true,
  },
};

function smartFallback(key: SectionKey, ctx: { preamble: string[]; blocks: ParsedBlock[]; codeLangs: string[] }): string[] {
  const fallback = FALLBACK[key];
  const out: string[] = [];

  if (key === "problem") {
    for (const p of ctx.preamble) out.push(...splitSentences(p));
  }
  if (key === "features") {
    const extras: string[] = [];
    for (const b of ctx.blocks) if (b.key !== key) extras.push(...b.bullets);
    out.push(...extras);
    const headings = ctx.blocks.map((b) => b.heading);
    if (out.length === 0) out.push(...headings.filter((h) => h.length < 60));
  }
  if (key === "tech" && ctx.codeLangs.length > 0) {
    const langs = [...new Set(ctx.codeLangs)].slice(0, 3);
    out.push(...langs.map((l) => `Built with ${l.charAt(0).toUpperCase() + l.slice(1)}`));
  }

  for (const b of fallback.bullets) {
    out.push(b);
  }
  return [...new Set(out)].slice(0, 5);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function buildDeck(markdown: string): PitchDeck {
  const parsed = parseReadme(markdown);

  const fallbackCtx = {
    preamble: parsed.preamble,
    blocks: parsed.blocks,
    codeLangs: parsed.codeLangs,
  };

  const sections: DeckSection[] = SECTION_ORDER.map((key) => {
    const block = parsed.blocks.find((b) => b.key === key);
    const meta = SECTION_META[key];
    let bullets: string[] = [];
    let derived = false;

    if (block) {
      bullets = [...block.bullets];
      if (bullets.length < 3) {
        bullets.push(...smartFallback(key, fallbackCtx));
        derived = bullets.length >= 3 && bullets.length <= 3 ? true : false;
        derived = block.bullets.length < 3;
      }
    } else {
      bullets = smartFallback(key, fallbackCtx);
      derived = true;
    }

    // Clean, dedupe, cap.
    bullets = [...new Set(bullets)]
      .map((b) => stripInlineMarkdown(b).trim())
      .filter((b) => b.length >= 8)
      .slice(0, 5);
    if (bullets.length < 3) {
      const fb = smartFallback(key, fallbackCtx).filter((b) => !bullets.includes(b));
      bullets.push(...fb.slice(0, 5 - bullets.length));
      derived = true;
    }

    return {
      key,
      title: meta.title,
      eyebrow: meta.eyebrow,
      bullets,
      accent: meta.accent,
      derived,
    };
  });

  const nonEmpty = markdown.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const sectionsFound = sections.filter((s) => !s.derived).length;

  return {
    title: parsed.title || "Untitled Project",
    tagline:
      parsed.tagline ||
      (parsed.preamble[0] ? stripInlineMarkdown(parsed.preamble[0]) : "A focused solution for a real problem — built to ship."),
    sections,
    stats: {
      words,
      lines: nonEmpty.length,
      sectionsFound,
    },
  };
}

/** Number of cards in the transformation sequence — six sections. */
export const CARD_KEYS = SECTION_ORDER;

/* ------------------------------------------------------------------ */
/* Sample READMEs                                                      */
/* ------------------------------------------------------------------ */

export const SAMPLE_README_RICH = `# Lumina — AI Meeting Intelligence

Lumina turns every meeting into searchable, actionable intelligence. It joins your calls, captures decisions, and drafts follow-ups so teams never lose context again.

## The Problem

Teams waste hours every week hunting for what was decided in meetings. Notes are scattered across documents, decisions live in people's heads, and follow-ups slip through the cracks. Existing tools capture recordings but not meaning, and searching them is painfully slow.

## Features

- Automatic meeting transcription with speaker identification
- Decision and action-item extraction in real time
- Semantic search across every meeting your team has ever had
- One-click summaries delivered to Slack and email
- Integrations with Zoom, Meet, and Teams

## Tech Stack

- TypeScript, React, and Node.js
- WebRTC for real-time audio capture
- Pinecone vector database for semantic search
- Serverless edge deployment on Vercel

## Market

Knowledge workers lose an average of 3.6 hours per week to meeting follow-up. With 900M+ knowledge workers worldwide, even a 10% productivity gain represents a $2.4T annual opportunity. We launch in the SMB segment and expand to enterprise.

## Revenue

We monetize with a freemium model: free for individuals, $12/user/month for teams, and custom enterprise plans with SSO and compliance features.

## Competitors

Zoom and Microsoft Teams offer basic transcriptions, but not intelligence. Otter.ai focuses on transcription, while Fireflies.ai covers notes — neither delivers decision extraction or cross-meeting semantic search out of the box.
`;

export const SAMPLE_README_MINIMAL = `# OpenShelf

A tiny command-line tool that turns any folder of markdown files into a searchable offline documentation site. No build step, no config, just content.

\`\`\`bash
npx openshelf ./docs
\`\`\`

## Installation

Install it globally with npm, or run it directly with npx. It works with any markdown files and generates a static site you can host anywhere.

## Usage

Point it at a folder, pick a theme, and it generates a fast, dependency-free site with full-text search, keyboard navigation, and dark mode support.
`;
