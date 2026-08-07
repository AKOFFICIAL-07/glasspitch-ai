import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

const sectionValidator = v.object({
  key: v.string(),
  title: v.string(),
  eyebrow: v.string(),
  bullets: v.array(v.string()),
  accent: v.string(),
  derived: v.boolean(),
});

const statsValidator = v.object({
  words: v.number(),
  lines: v.number(),
  sectionsFound: v.number(),
});

/** Generate a short, URL-safe share code. */
function makeShareCode(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < bytes.length; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

/**
 * Persist a generated deck: creates (or reuses) a project row from the source
 * README, then stores the deck with a fresh share code. Returns ids.
 */
export const createDeck = mutation({
  args: {
    projectName: v.string(),
    sourceMarkdown: v.string(),
    title: v.string(),
    tagline: v.string(),
    sections: v.array(sectionValidator),
    stats: statsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    // Reuse an existing project with the same owner + name when present.
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("name"), args.projectName))
      .first();

    let projectId = existing?._id;
    if (!projectId) {
      projectId = await ctx.db.insert("projects", {
        ownerId: user._id,
        name: args.projectName,
        sourceMarkdown: args.sourceMarkdown,
      });
    } else {
      await ctx.db.patch(projectId, { sourceMarkdown: args.sourceMarkdown });
    }

    const deckId = await ctx.db.insert("decks", {
      ownerId: user._id,
      projectId,
      projectName: args.projectName,
      title: args.title,
      tagline: args.tagline,
      shareCode: makeShareCode(),
      sections: args.sections,
      stats: args.stats,
    });

    return { projectId, deckId };
  },
});

/** Delete a deck; also removes its project row when no other decks remain. */
export const deleteDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.ownerId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.deckId);

    if (deck.projectId) {
      const siblings = await ctx.db
        .query("decks")
        .withIndex("by_project", (q) => q.eq("projectId", deck.projectId))
        .first();
      if (!siblings) {
        const project = await ctx.db.get(deck.projectId);
        if (project && project.ownerId === user._id) {
          await ctx.db.delete(deck.projectId);
        }
      }
    }
  },
});

/** Delete a project and every deck it contains. */
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== user._id) throw new Error("Not found");

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const deck of decks) await ctx.db.delete(deck._id);
    await ctx.db.delete(args.projectId);
  },
});

/** All projects for the signed-in user, newest first. */
export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

/** All decks for the signed-in user, newest first. */
export const listDecks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("decks")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

/** A single deck, only for its owner. */
export const getDeck = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.ownerId !== user._id) return null;
    return deck;
  },
});

/** Public lookup used by the share link — no auth required. */
export const getDeckByShareCode = query({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const deck = await ctx.db
      .query("decks")
      .withIndex("by_share_code", (q) => q.eq("shareCode", args.shareCode))
      .first();
    if (!deck) return null;
    return deck;
  },
});
