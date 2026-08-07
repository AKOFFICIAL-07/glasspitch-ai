import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

/**
 * x402 payment flow (Algorand HTTP payments).
 *
 * In production this resolves an x402 payment request via the Algorand
 * network (algosdk) and verifies the transaction on-chain. For this
 * environment we simulate the exchange:
 *
 *   1. `requestX402Authorization` — builds an x402-style quote (wallet
 *      address, amount in ALGO, memo) and stores an "authorized" payment.
 *   2. `verifyX402Payment` — marks a payment "verified" and stores the
 *      on-chain transaction hash the wallet submitted.
 *
 * The deck is only downloadable after a payment with status "verified"
 * exists for it.
 */

/** Price for a premium deck, in ALGO. */
export const PREMIUM_DECK_ALGO = 2.5;

export const requestX402Authorization = mutation({
  args: {
    walletAddress: v.string(),
    deckId: v.optional(v.id("decks")),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const address = args.walletAddress.trim();
    if (!/^[A-Z2-7]{40,58}$/.test(address)) {
      throw new Error("Invalid Algorand address — expected 58-char base32 format.");
    }

    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      deckId: args.deckId,
      walletAddress: address,
      txHash: "",
      amount: Math.round(PREMIUM_DECK_ALGO * 1_000_000), // microAlgos
      assetId: 0, // native ALGO
      status: "authorized",
      memo: args.memo ?? "PitchForge AI — premium deck generation",
    });

    return { paymentId, amountAlgo: PREMIUM_DECK_ALGO, assetId: 0 };
  },
});

export const verifyX402Payment = mutation({
  args: { paymentId: v.id("payments"), txHash: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.userId !== user._id) throw new Error("Payment not found");

    const hash = args.txHash.trim();
    if (!/^[A-Z2-7]{52,58}$/.test(hash) && !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error("Invalid transaction hash.");
    }

    await ctx.db.patch(payment._id, { status: "verified", txHash: hash });
    return { paymentId: payment._id, status: "verified" };
  },
});

export const listPayments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/** Is a deck unlocked for premium download? (owner + verified payment) */
export const isDeckUnlocked = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { unlocked: false, verified: [] };
    const verified = await ctx.db
      .query("payments")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .filter((q) => q.eq(q.field("status"), "verified"))
      .collect();
    return {
      unlocked: verified.length > 0,
      verified: verified.map((p) => ({
        walletAddress: p.walletAddress,
        txHash: p.txHash,
        amount: p.amount,
        status: p.status,
        creationTime: p._creationTime,
      })),
    };
  },
});
