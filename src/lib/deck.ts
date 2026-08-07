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
  problem: { title: "Problem", eyebrow: "The pain", icon: "flame", accent: "#22d3ee" },
  features: { title: "Features", eyebrow: "The solution", icon: "sparkles", accent: "#818cf8" },
  tech: { title: "Tech Stack", eyebrow: "Built on", icon: "cpu", accent: "#34d399" },
  market: { title: "Market", eyebrow: "The opportunity", icon: "trending-up", accent: "#a78bfa" },
  revenue: { title: "Revenue", eyebrow: "The model", icon: "line-chart", accent: "#f59e0b" },
  competitors: { title: "Competitors", eyebrow: "The landscape", icon: "crosshair", accent: "#94a3b8" },
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
  revenue: ["revenue", "business model", "monetiz", "pricing", "commercial", "how we make", "business", "token"],
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

    const bulletMatch = /^\s*(?:[-*+•]|\d+[.)])\s+(.+)$/.exec(raw);
    if (bulletMatch) {
      const bullet = stripInlineMarkdown(bulletMatch[1]);
      if (bullet && !isBadLine(bullet) && bullet.length > 2) {
        if (current) current.bullets.push(bullet);
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
      "Existing workflows are slow, fragmented, and held together by manual process",
      "Teams lose time stitching together disconnected tools and data",
      "The gap compounds as teams and protocols scale",
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
      "Modern TypeScript tooling on a battle-tested stack",
      "Open-source libraries instead of reinventing infrastructure",
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
        derived = block.bullets.length < 3;
      }
    } else {
      bullets = smartFallback(key, fallbackCtx);
      derived = true;
    }

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
      (parsed.preamble[0] ? stripInlineMarkdown(parsed.preamble[0]) : "A focused solution to a real problem — built to ship."),
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

export const SAMPLE_README_RICH = `# Volta — Liquid Staking, One Transaction

Volta turns any staked ETH position into instantly spendable yield. Deposit once, and Volta re-stakes across leading protocols to maximize returns while keeping every position liquid, audited, and withdrawable in a single transaction.

## The Problem

Staking on Ethereum locks capital for weeks, fragments yield across a dozen protocols, and forces users to manage multiple positions and unlock periods manually. Retail stakers are losing yield they can't see, and the complexity keeps new capital out of the ecosystem.

## Features

- One-click restaking across EigenLayer and leading LRT protocols
- Auto-compounding rewards settled every epoch, no gas rush
- Instant liquidity: withdraw or spend staked positions anytime
- Battle-tested smart contracts with public audits and invariants
- SDK and API for wallets, exchanges, and DAO treasuries

## Tech Stack

- Solidity and Foundry for audited smart contracts
- EigenLayer AVS infrastructure for restaking
- TypeScript, React, and Viem for the dApp and SDK
- PostgreSQL + Redis backend for indexing and rewards

## Market

$36B+ is currently staked on Ethereum, yet fewer than 12% of holders participate in restaking due to complexity. Liquid staking tokens already trade at premiums, and the addressable market grows with every L2 and rollup that settles to Ethereum.

## Revenue

Volta takes a 10% performance fee on rewards generated through restaking. At scale, the fee compounds: deeper yield attracts more TVL, more TVL attracts more protocols, and protocols pay to integrate Volta's API.

## Competitors

Lido dominates plain liquid staking but offers no restaking. EigenLayer is infrastructure, not a product — users still manage positions manually. Rocket Pool requires capital and node operators. No one combines one-click deposits with automated restaking across the ecosystem.
`;

export const SAMPLE_README_MINIMAL = `# merkle-feed

A command-line tool that watches any EVM contract and streams its state changes as signed, verifiable data feeds. Built for hackathon teams that need reliable on-chain data without running their own indexer.

\`\`\`bash
npx merkle-feed watch 0x7a250d5630b4cf539739df2c5dacb4c659f2488d --abi ./abi.json
\`\`\`

## Installation

Install globally with npm, or run it directly with npx. It works against any EVM-compatible chain — Ethereum, Arbitrum, Base, or Polygon — with nothing but an RPC URL.

## Usage

Point it at a contract, pick the events to watch, and it emits signed JSON feeds with cryptographic proofs you can verify off-chain. Perfect for oracles, demo-day dashboards, and cross-chain data relays.
`;
