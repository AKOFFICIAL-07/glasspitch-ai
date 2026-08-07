import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Wallet as WalletIcon,
  Zap,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type WalletKind = "pera" | "defly";
type FounderStep = "idle" | "wallet" | "pay" | "done";

function FounderUpgradeDialog({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const requestFounder = useMutation(api.payments.requestFounderPayment);
  const verifyPayment = useMutation(api.payments.verifyX402Payment);
  const config = useQuery(api.payments.getX402Config);

  const [step, setStep] = useState<FounderStep>("wallet");
  const [walletKind, setWalletKind] = useState<WalletKind | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep("wallet");
    setWalletKind(null);
    setWalletAddress("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleWalletConnect = async (kind: WalletKind) => {
    setBusy(true);
    try {
      if (kind === "pera") {
        const { connectPera } = await import("@/lib/algorand");
        const address = await connectPera();
        setWalletKind("pera");
        setWalletAddress(address);
      } else if (kind === "defly") {
        const { connectDefly } = await import("@/lib/algorand");
        const address = await connectDefly();
        setWalletKind("defly");
        setWalletAddress(address);
      }
      setStep("pay");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not connect wallet");
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    if (!walletKind || !config) return;
    setBusy(true);
    try {
      const res = await requestFounder({ walletAddress });
      const { payWithWallet } = await import("@/lib/algorand");
      const { txId } = await payWithWallet({
        kind: walletKind,
        walletAddress,
        to: config.receiverAddress,
        amountMicro: res.amountMicro,
        note: "Deckify AI — Founder upgrade via secure crypto payment",
        algodUrl: config.algodUrl,
      });

      await verifyPayment({ paymentId: res.paymentId, txHash: txId });
      setStep("done");
      toast.success("Founder plan activated — enjoy unlimited decks!");
      setTimeout(onComplete, 1200);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
      setStep("wallet");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-strong mx-4 w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {step === "done" ? "Welcome to Founder" : "Upgrade to Founder"}
          </h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-white/40 transition hover:text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "wallet" && (
          <div className="mt-6 space-y-3">
            <p className="text-[13px] text-white/55">
              Connect your Algorand wallet to pay 19 ALGO via secure crypto payment.
            </p>
            <button
              onClick={() => handleWalletConnect("pera")}
              disabled={busy}
              className="w-full rounded-2xl border border-[#4338ca]/30 bg-gradient-to-r from-[#4338ca] to-[#6366f1] px-4 py-3.5 text-left text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <WalletIcon className="h-5 w-5" />
                <span>
                  <span className="block">Pera Wallet</span>
                  <span className="text-[11px] font-normal text-white/60">Algorand Mobile</span>
                </span>
              </span>
            </button>
            <button
              onClick={() => handleWalletConnect("defly")}
              disabled={busy}
              className="glass w-full rounded-2xl px-4 py-3.5 text-left text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <WalletIcon className="h-5 w-5 text-[#818cf8]" />
                <span>
                  <span className="block">Defly Wallet</span>
                  <span className="text-[11px] font-normal text-white/60">Algorand Desktop</span>
                </span>
              </span>
            </button>
          </div>
        )}

        {step === "pay" && (
          <div className="mt-6 space-y-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/60">Amount</span>
                <span className="text-lg font-bold text-white">19 ALGO</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[13px] text-white/60">Wallet</span>
                <span className="font-mono text-[12px] text-[#818cf8]">
                  {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[13px] text-white/60">Network</span>
                <span className="text-[12px] font-medium text-white/80">{config?.network ?? "testnet"}</span>
              </div>
            </div>
            <Button
              onClick={handlePay}
              disabled={busy}
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.35)]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing payment…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Pay 19 ALGO
                </>
              )}
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="mt-6 flex flex-col items-center gap-3 py-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-indigo-500/15 text-indigo-300">
              <Check className="h-7 w-7" />
            </span>
            <p className="text-[14px] font-semibold text-white">Founder plan activated!</p>
            <p className="text-[12px] text-white/50">Unlimited decks · Catalog · Priority · Voice pitch</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Wallet() {
  const billing = useQuery(api.billing.getBilling);
  const x402Config = useQuery(api.payments.getX402Config);
  const payments = useQuery(api.payments.listPayments);
  const nfts = useQuery(api.nfts.listMyNfts);
  const [founderOpen, setFounderOpen] = useState(false);

  const plan = billing?.plan ?? "free";
  const deckCount = billing?.deckCount ?? 0;
  const isPro = plan === "pro";
  const freeLimit = 2;
  const pct = Math.min(100, (deckCount / freeLimit) * 100);

  return (
    <AppShell>
      <FounderUpgradeDialog open={founderOpen} onClose={() => setFounderOpen(false)} onComplete={() => {}} />

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
              className={cn(
                isPro
                  ? "w-fit border-transparent bg-indigo-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-300"
                  : "w-fit border-transparent bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-400",
              )}
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
            </div>

            {/* Pricing comparison */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Free */}
              <div className={cn(
                "glass relative flex flex-col rounded-3xl p-5 transition-all duration-300",
                plan === "free" && "ring-1 ring-indigo-400/30",
              )}>
                {plan === "free" && (
                  <Badge className="absolute right-3 top-3 border-transparent bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-300">
                    Current
                  </Badge>
                )}
                <h3 className="text-[14px] font-semibold text-slate-100">Free</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-100">0</span>
                  <span className="text-[11px] text-slate-500">ALGO</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">No wallet needed</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-[12px] text-slate-400">
                  {[
                    [true, "2 pitch decks"],
                    [true, "PDF export"],
                    [true, "Share links"],
                    [true, "Comment on any deck"],
                    [false, "PPTX export"],
                    [false, "Publish to catalog"],
                    [false, "Priority quality"],
                  ].map(([ok, label]) => (
                    <li key={String(label)} className="flex items-center gap-2">
                      {ok ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" strokeWidth={2.5} />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-slate-600" strokeWidth={2} />
                      )}
                      {label}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" disabled className="glass-soft mt-4 w-full rounded-xl text-[12px] text-slate-500">
                  Free forever
                </Button>
              </div>

              {/* Per-Deck */}
              <div className="glass relative flex flex-col rounded-3xl p-5">
                <Badge className="absolute right-3 top-3 border-transparent bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-300">
                  crypto
                </Badge>
                <h3 className="text-[14px] font-semibold text-slate-100">Per-Deck</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-100">2.5</span>
                  <span className="text-[11px] text-slate-500">ALGO</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Pay only for what you use</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-[12px] text-slate-400">
                  {[
                    [true, "Unlimited premium decks"],
                    [true, "Full AI analysis + scoring"],
                    [true, "PDF + PPTX export"],
                    [true, "Share links"],
                    [true, "Comment on any deck"],
                    [false, "Publish to catalog"],
                    [false, "Priority quality"],
                  ].map(([ok, label]) => (
                    <li key={String(label)} className="flex items-center gap-2">
                      {ok ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" strokeWidth={2.5} />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-slate-600" strokeWidth={2} />
                      )}
                      {label}
                    </li>
                  ))}
                </ul>
                <Button disabled className="mt-4 w-full gap-1.5 rounded-xl bg-indigo-500/15 text-[12px] text-indigo-300">
                  <Zap className="h-3.5 w-3.5" />
                  Pay per deck in DeckView
                </Button>
              </div>

              {/* Founder */}
              <div className={cn(
                "edge-highlight relative flex flex-col overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-b from-[oklch(0.24_0.05_262/0.7)] to-[oklch(0.18_0.03_262/0.6)] p-5 backdrop-blur-xl",
                isPro && "ring-1 ring-indigo-400/50",
              )}>
                {isPro ? (
                  <Badge className="absolute right-3 top-3 border-transparent bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-200">
                    Active
                  </Badge>
                ) : (
                  <Badge className="absolute right-3 top-3 border-transparent bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-300">
                    Best value
                  </Badge>
                )}
                <h3 className="text-[14px] font-semibold text-slate-100">Founder</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-100">19</span>
                  <span className="text-[11px] text-slate-500">ALGO</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">One-time, lifetime access</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-[12px] text-slate-300">
                  {[
                    [true, "Everything in Per-Deck"],
                    [true, "Unlimited premium decks"],
                    [true, "Publish to the catalog"],
                    [true, "Priority deck quality"],
                    [true, "Early access to new formats"],
                    [true, "AI voice pitch"],
                    [true, "Custom templates"],
                  ].map(([ok, label]) => (
                    <li key={String(label)} className="flex items-center gap-2">
                      {ok ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-indigo-300" strokeWidth={2.5} />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-slate-600" strokeWidth={2} />
                      )}
                      {label}
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <Button disabled className="mt-4 w-full rounded-xl bg-indigo-500/15 text-[12px] text-indigo-300">
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Founder active
                  </Button>
                ) : (
                  <Button
                    onClick={() => setFounderOpen(true)}
                    className="mt-4 w-full gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Upgrade via crypto
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* On-chain crypto payments */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                On-chain
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
                Crypto payment history
              </h2>
              <p className="mt-1 text-[13px] text-slate-400">
                ALGO payments made on the Algorand{" "}
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
