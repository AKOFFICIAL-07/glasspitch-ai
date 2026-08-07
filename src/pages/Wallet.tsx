import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Wallet as WalletIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export default function Wallet() {
  const billing = useQuery(api.billing.getBilling);
  const createCheckoutSession = useAction(api.billing.createCheckoutSession);
  const markPro = useMutation(api.billing.markPro);
  const x402Config = useQuery(api.payments.getX402Config);
  const payments = useQuery(api.payments.listPayments);
  const nfts = useQuery(api.nfts.listMyNfts);
  const [checkingOut, setCheckingOut] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const handled = useRef(false);

  const plan = billing?.plan ?? "free";
  const deckCount = billing?.deckCount ?? 0;
  const isPro = plan === "pro";

  useEffect(() => {
    const status = searchParams.get("checkout");
    if (!status || handled.current) return;
    handled.current = true;
    if (status === "success") {
      markPro()
        .then(() => toast.success("Welcome to Founder — Pro unlocked"))
        .catch(() => toast.error("Could not activate Pro — contact support"));
    } else if (status === "cancelled") {
      toast.info("Checkout cancelled — you're still on the free plan");
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, markPro]);

  const handleUpgrade = async () => {
    setCheckingOut(true);
    try {
      const result = await createCheckoutSession({ plan: "pro" });
      if (result.ok && result.url) {
        window.location.href = result.url;
        return;
      }
      toast.error(
        "Checkout isn't configured yet — add a STRIPE_SECRET_KEY in the Keys tab to enable payments.",
      );
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const freeLimit = 2;
  const pct = Math.min(100, (deckCount / freeLimit) * 100);

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              Billing
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-100">Wallet</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
              Manage your plan, usage, and one-time Founder upgrade.
            </p>
          </div>
          {billing && (
            <Badge
              className={
                isPro
                  ? "w-fit border-transparent bg-indigo-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-300"
                  : "w-fit border-transparent bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-400"
              }
            >
              {isPro ? "Founder plan" : "Free plan"}
            </Badge>
          )}
        </header>

        {billing === undefined ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Skeleton className="h-72 rounded-3xl bg-white/5" />
            <Skeleton className="h-72 rounded-3xl bg-white/5" />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            {/* Usage */}
            <div className="glass flex flex-col rounded-3xl p-7">
              <span className="glass-soft grid h-11 w-11 place-items-center rounded-xl text-indigo-300">
                <WalletIcon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-slate-100">Deck usage</h2>
              <p className="mt-1 text-[13px] text-slate-400">
                {isPro
                  ? "Founder plan — forge unlimited decks."
                  : `Free plan includes ${freeLimit} decks.`}
              </p>
              <div className="mt-6">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-100">
                    {deckCount}
                    <span className="text-base font-semibold text-slate-500"> / {isPro ? "∞" : freeLimit}</span>
                  </span>
                  <span className="text-[12px] font-medium text-slate-500">decks forged</span>
                </div>
                <div className="relative mt-3 h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-700"
                    style={{ width: isPro ? "100%" : `${pct}%` }}
                  />
                </div>
                {!isPro && deckCount >= freeLimit && (
                  <p className="mt-3 text-[12.5px] text-amber-300">
                    You&apos;ve hit the free limit — upgrade to keep forging.
                  </p>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2 text-[12px] text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Payments processed securely via Stripe Checkout.
              </div>
            </div>

            {/* Plans */}
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Free */}
              <div className="glass glass-hover relative flex flex-col rounded-3xl p-6">
                <h3 className="text-[15px] font-semibold text-slate-100">Hacker</h3>
                <p className="mt-0.5 text-[12px] text-slate-500">Current plan</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-100">$0</span>
                  <span className="text-[12px] text-slate-500">forever</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-[13px] text-slate-300">
                  {["2 pitch decks", "PDF export", "Share links", "Comment on any deck"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-indigo-400" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" disabled className="glass-soft mt-6 w-full rounded-xl text-slate-500">
                  Current plan
                </Button>
              </div>

              {/* Pro */}
              <div className="edge-highlight relative flex flex-col overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-b from-[oklch(0.24_0.05_262/0.7)] to-[oklch(0.18_0.03_262/0.6)] p-6 backdrop-blur-xl">
                <Badge className="absolute right-4 top-4 border-transparent bg-indigo-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                  One-time
                </Badge>
                <h3 className="text-[15px] font-semibold text-slate-100">Founder</h3>
                <p className="mt-0.5 text-[12px] text-slate-400">For teams actually raising</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-100">$19</span>
                  <span className="text-[12px] text-slate-500">one-time</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-[13px] text-slate-200">
                  {["Unlimited pitch decks", "Publish to the catalog", "Priority deck quality", "Early access to new formats"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-indigo-300" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <Button disabled className="mt-6 w-full rounded-xl bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/15">
                    <Check className="mr-2 h-4 w-4" />
                    Pro active
                  </Button>
                ) : (
                  <Button
                    onClick={handleUpgrade}
                    disabled={checkingOut}
                    className="shimmer mt-6 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[0_12px_30px_rgba(99,102,241,0.25)]"
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening checkout…
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Upgrade to Founder
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {billing && !isPro && (
          <p className="mt-6 text-center text-[12.5px] text-slate-500">
            No card on file? Payments only happen when you confirm in the Stripe
            checkout — we never see your card details.
          </p>
        )}

        {/* On-chain x402 payments */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                On-chain
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
                x402 payment history
              </h2>
              <p className="mt-1 text-[13px] text-slate-400">
                ALGO payments made to unlock premium decks, verified on the Algorand{" "}
                {x402Config?.network ?? "testnet"} network.
              </p>
            </div>
            {x402Config && (
              <Badge className="w-fit border-transparent bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-300">
                {x402Config.network}
              </Badge>
            )}
          </div>

          <div className="glass mt-4 overflow-hidden rounded-3xl">
            {payments === undefined ? (
              <div className="space-y-3 p-6">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-white/5" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-indigo-300">
                  <WalletIcon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <p className="text-[14px] font-medium text-slate-200">No on-chain payments yet</p>
                <p className="max-w-sm text-[12.5px] leading-relaxed text-slate-500">
                  Open a deck and use the premium gate to pay with a Pera or Lute
                  wallet — your verified transactions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {payments.map((p) => {
                  const verified = p.status === "verified";
                  const explorer =
                    x402Config && p.txHash
                      ? `${x402Config.explorerBase}/tx/${p.txHash}`
                      : null;
                  return (
                    <div key={p._id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                          verified
                            ? "bg-indigo-500/15 text-indigo-300"
                            : "bg-white/5 text-slate-500"
                        }`}
                      >
                        {verified ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Loader2 className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-slate-100">
                            {(p.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                            ALGO
                          </span>
                          <Badge
                            className={cn(
                              "border-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              verified
                                ? "bg-indigo-500/15 text-indigo-300"
                                : p.status === "failed"
                                  ? "bg-rose-500/10 text-rose-300"
                                  : "bg-amber-500/10 text-amber-300",
                            )}
                          >
                            {p.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                          {p.walletAddress}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        {p.txHash ? (
                          explorer ? (
                            <a
                              href={explorer}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-end gap-1 font-mono text-[11px] text-indigo-300/80 underline-offset-2 hover:text-indigo-300 hover:underline"
                            >
                              {p.txHash.slice(0, 12)}…
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-[11px] text-slate-500">
                              {p.txHash.slice(0, 12)}…
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-600">No tx hash</span>
                        )}
                        <p className="mt-1 text-[11px] text-slate-600">
                          {new Date(p._creationTime).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* NFT collection */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300">
                NFT Collection
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
                Minted pitch decks
              </h2>
              <p className="mt-1 text-[13px] text-slate-400">
                ARC-3 Algorand Standard Assets — immutable on-chain records of your decks.
              </p>
            </div>
            <Badge className="w-fit border-transparent bg-purple-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-purple-300">
              {nfts?.length ?? 0} minted
            </Badge>
          </div>

          <div className="glass mt-4 overflow-hidden rounded-3xl">
            {nfts === undefined ? (
              <div className="space-y-3 p-6">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-white/5" />
                ))}
              </div>
            ) : nfts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-purple-300">
                  <Box className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <p className="text-[14px] font-medium text-slate-200">No NFTs minted yet</p>
                <p className="max-w-sm text-[12.5px] leading-relaxed text-slate-500">
                  Open a deck and click "Mint NFT" to create an immutable on-chain record on Algorand.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {nfts.map((nft) => {
                  const explorer = x402Config ? `${x402Config.explorerBase}/asset/${nft.assetId}` : null;
                  return (
                    <div key={nft._id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-500/15 text-purple-300">
                        <Box className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-slate-100">
                            {nft.assetName}
                          </span>
                          <Badge className="border-transparent bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-300">
                            {nft.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                          Asset #{nft.assetId} · {nft.unitName} · Supply 1
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        {explorer ? (
                          <a
                            href={explorer}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-end gap-1 font-mono text-[11px] text-purple-300/80 underline-offset-2 hover:text-purple-300 hover:underline"
                          >
                            #{nft.assetId}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-mono text-[11px] text-slate-500">
                            #{nft.assetId}
                          </span>
                        )}
                        <p className="mt-1 text-[11px] text-slate-600">
                          {new Date(nft._creationTime).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </AppShell>
  );
}
