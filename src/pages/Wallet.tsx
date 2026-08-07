import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, Check, CreditCard, Loader2, Lock, Wallet as WalletIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export default function Wallet() {
  const billing = useQuery(api.billing.getBilling);
  const createCheckoutSession = useAction(api.billing.createCheckoutSession);
  const markPro = useMutation(api.billing.markPro);
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
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
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
                  ? "w-fit border-transparent bg-cyan-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300"
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
              <span className="glass-soft grid h-11 w-11 place-items-center rounded-xl text-cyan-300">
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
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-700"
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
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" disabled className="glass-soft mt-6 w-full rounded-xl text-slate-500">
                  Current plan
                </Button>
              </div>

              {/* Pro */}
              <div className="edge-highlight relative flex flex-col overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-[oklch(0.24_0.05_262/0.7)] to-[oklch(0.18_0.03_262/0.6)] p-6 backdrop-blur-xl">
                <Badge className="absolute right-4 top-4 border-transparent bg-cyan-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
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
                      <Check className="h-4 w-4 shrink-0 text-cyan-300" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <Button disabled className="mt-6 w-full rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">
                    <Check className="mr-2 h-4 w-4" />
                    Pro active
                  </Button>
                ) : (
                  <Button
                    onClick={handleUpgrade}
                    disabled={checkingOut}
                    className="shimmer mt-6 w-full gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 shadow-[0_12px_30px_rgba(34,211,238,0.25)]"
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
      </motion.div>
    </AppShell>
  );
}
