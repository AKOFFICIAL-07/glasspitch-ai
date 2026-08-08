import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Record an analytics event. Called from the frontend when a viewer
 * opens a shared deck, navigates slides, or downloads.
 */
export const recordEvent = mutation({
  args: {
    deckId: v.id("decks"),
    event: v.string(),
    slideIndex: v.optional(v.number()),
    duration: v.optional(v.number()),
    meta: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analytics", {
      deckId: args.deckId,
      event: args.event,
      slideIndex: args.slideIndex,
      duration: args.duration,
      meta: args.meta,
    });
  },
});

/**
 * Total view count for a single deck.
 */
export const deckViewCount = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("analytics")
      .withIndex("by_deck_event", (q) =>
        q.eq("deckId", args.deckId).eq("event", "view"),
      )
      .collect();
    return views.length;
  },
});

/** Per-deck analytics breakdown. */
export interface DeckAnalytics {
  deckId: string;
  title: string;
  projectName: string;
  views: number;
  shareClicks: number;
  downloads: number;
  avgDwellMs: number;
  slideDwells: { slide: number; avgMs: number; count: number }[];
}

/** A single recent analytics event. */
export interface RecentEvent {
  event: string;
  deckTitle: string;
  time: number;
  slideIndex?: number;
  duration?: number;
}

/** Aggregated analytics overview for all decks owned by the current user. */
export interface AnalyticsOverview {
  totalViews: number;
  totalShareClicks: number;
  totalDownloads: number;
  totalSlideDwells: number;
  avgDwellMs: number;
  decks: DeckAnalytics[];
  recentEvents: RecentEvent[];
  viewsByDay: { day: string; count: number }[];
}

/**
 * Aggregate analytics for all decks owned by the current user.
 * Returns overview stats, per-deck breakdowns, and slide dwell data.
 */
export const getOverview = query({
  args: {},
  handler: async (ctx): Promise<AnalyticsOverview> => {
    const allEvents = await ctx.db.query("analytics").collect();

    const deckIds = [...new Set(allEvents.map((e) => e.deckId))];
    if (deckIds.length === 0) {
      return {
        totalViews: 0,
        totalShareClicks: 0,
        totalDownloads: 0,
        totalSlideDwells: 0,
        avgDwellMs: 0,
        decks: [],
        recentEvents: [],
        viewsByDay: [],
      };
    }

    const deckMap = new Map<string, { title: string; projectName: string }>();
    for (const did of deckIds) {
      const deck = await ctx.db.get(did);
      if (deck) {
        deckMap.set(did, { title: deck.title, projectName: deck.projectName });
      }
    }

    const events = allEvents.filter((e) => deckMap.has(e.deckId));

    const totalViews = events.filter((e) => e.event === "view").length;
    const totalShareClicks = events.filter((e) => e.event === "share_click").length;
    const totalDownloads = events.filter((e) => e.event === "download").length;

    const dwells = events.filter((e) => e.event === "slide_dwell" && e.duration);
    const totalSlideDwells = dwells.length;
    const avgDwellMs =
      dwells.length > 0
        ? Math.round(dwells.reduce((sum, d) => sum + (d.duration ?? 0), 0) / dwells.length)
        : 0;

    // Per-deck breakdown
    const deckStats = new Map<
      string,
      {
        views: number;
        shareClicks: number;
        downloads: number;
        dwells: number[];
        slideDwellMap: Map<number, { totalMs: number; count: number }>;
      }
    >();

    for (const e of events) {
      if (!deckStats.has(e.deckId)) {
        deckStats.set(e.deckId, {
          views: 0,
          shareClicks: 0,
          downloads: 0,
          dwells: [],
          slideDwellMap: new Map(),
        });
      }
      const s = deckStats.get(e.deckId)!;
      if (e.event === "view") s.views++;
      if (e.event === "share_click") s.shareClicks++;
      if (e.event === "download") s.downloads++;
      if (e.event === "slide_dwell" && e.duration) {
        s.dwells.push(e.duration);
        const slide = e.slideIndex ?? 0;
        const existing = s.slideDwellMap.get(slide) ?? { totalMs: 0, count: 0 };
        existing.totalMs += e.duration;
        existing.count++;
        s.slideDwellMap.set(slide, existing);
      }
    }

    const decks: DeckAnalytics[] = [...deckStats.entries()].map(([did, s]) => {
      const meta = deckMap.get(did)!;
      return {
        deckId: did,
        title: meta.title,
        projectName: meta.projectName,
        views: s.views,
        shareClicks: s.shareClicks,
        downloads: s.downloads,
        avgDwellMs:
          s.dwells.length > 0
            ? Math.round(s.dwells.reduce((a, b) => a + b, 0) / s.dwells.length)
            : 0,
        slideDwells: [...s.slideDwellMap.entries()]
          .map(([slide, data]) => ({
            slide,
            avgMs: Math.round(data.totalMs / data.count),
            count: data.count,
          }))
          .sort((a, b) => a.slide - b.slide),
      };
    });

    const recentEvents: RecentEvent[] = events
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 20)
      .map((e) => ({
        event: e.event,
        deckTitle: deckMap.get(e.deckId)?.title ?? "Unknown",
        time: e._creationTime,
        slideIndex: e.slideIndex,
        duration: e.duration,
      }));

    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const viewEvents = events.filter(
      (e) => e.event === "view" && e._creationTime >= fourteenDaysAgo,
    );
    const dayMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }
    for (const ev of viewEvents) {
      const key = new Date(ev._creationTime).toISOString().slice(0, 10);
      if (dayMap.has(key)) {
        dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
      }
    }
    const viewsByDay = [...dayMap.entries()].map(([day, count]) => ({ day, count }));

    return {
      totalViews,
      totalShareClicks,
      totalDownloads,
      totalSlideDwells,
      avgDwellMs,
      decks,
      recentEvents,
      viewsByDay,
    };
  },
});
