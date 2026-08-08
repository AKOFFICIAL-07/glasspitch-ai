import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { AnalyticsOverview } from "@/convex/analytics";
import { DECK_TEMPLATES, type DeckTemplate } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Link2,
  Palette,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

/* ------------------------------------------------------------------ */
/* Template Card                                                       */
/* ------------------------------------------------------------------ */

function TemplateCard({
  template,
  index,
  selected,
  onSelect,
}: {
  template: DeckTemplate;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        selected
          ? "border-emerald-400/50 bg-white/[0.07] shadow-[0_0_30px_rgba(0,168,107,0.15)]"
          : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.15] hover:bg-white/[0.06]",
      )}
    >
      {/* Slide preview mock */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${template.bg[0]}, ${template.bg[1]}, ${template.bg[2]})`,
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div
            className="mb-3 h-1 w-12 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${template.accent}, ${template.accent2})`,
              boxShadow: `0 0 12px ${template.accent}66`,
            }}
          />
          <div
            className={cn(
              "text-[15px] font-bold leading-tight tracking-tight",
              template.dark ? "text-white" : "text-gray-900",
            )}
          >
            Project Name
          </div>
          <div
            className={cn(
              "mt-1 text-[10px] leading-snug",
              template.dark ? "text-white/50" : "text-gray-500",
            )}
          >
            Transform your docs into investor decks
          </div>
          <div className="mt-4 flex w-full max-w-[180px] flex-col gap-1.5">
            {[0.9, 0.75, 0.6].map((w, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: template.accent }}
                />
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${w * 100}%`,
                    background: template.dark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1">
            {["Prob", "Feat", "Tech", "Mkt"].map((label, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[7px] font-bold",
                  template.dark ? "text-white" : "text-gray-900",
                )}
                style={{ background: `${template.accent}22` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {selected && (
          <div className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[14px] font-semibold text-white">
            {template.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-white/45">{template.tagline}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-[10px] font-medium text-white/35">
            Palette
          </span>
          <div
            className="h-4 w-4 rounded-full border border-white/10 shadow-sm"
            style={{ background: template.accent }}
            title={`Accent: ${template.accent}`}
          />
          <div
            className="h-4 w-4 rounded-full border border-white/10 shadow-sm"
            style={{ background: template.accent2 }}
            title={`Secondary: ${template.accent2}`}
          />
          <div
            className="h-4 w-4 rounded-full border border-white/10 shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${template.bg[0]}, ${template.bg[2]})`,
            }}
            title="Background"
          />
          <span className="ml-1 text-[9.5px] font-mono text-white/30">
            {template.accent}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              template.dark
                ? "bg-white/[0.07] text-white/50"
                : "bg-gray-200 text-gray-600",
            )}
          >
            {template.dark ? "Dark" : "Light"}
          </span>
        </div>
        <div className="mt-auto pt-1">
          <Link to="/auth?returnTo=/dashboard">
            <Button
              size="sm"
              variant={selected ? "default" : "outline"}
              className={cn(
                "w-full gap-1.5 rounded-xl text-[12px]",
                selected
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Sparkles className="h-3 w-3" />
              {selected ? "Selected" : "Use template"}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Templates Page                                                      */
/* ------------------------------------------------------------------ */

export function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "dark" | "light">("all");

  const filtered = useMemo(() => {
    let list = DECK_TEMPLATES;
    if (filter === "dark") list = list.filter((t) => t.dark);
    if (filter === "light") list = list.filter((t) => !t.dark);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.accent.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, filter]);

  const darkCount = DECK_TEMPLATES.filter((t) => t.dark).length;
  const lightCount = DECK_TEMPLATES.filter((t) => !t.dark).length;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-emerald-300">
              <Palette className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Deck Templates
              </h1>
              <p className="mt-0.5 text-[14px] text-white/45">
                {DECK_TEMPLATES.length} professionally designed themes — pick
                one and your deck inherits the palette instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-strong mb-8 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search templates — e.g. "ocean", "violet", "minimal"…'
              className="h-10 rounded-xl border-white/10 bg-white/5 pl-10 text-[13px] text-white placeholder:text-white/30 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-white/30 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { key: "all" as const, label: "All", count: DECK_TEMPLATES.length },
              { key: "dark" as const, label: "Dark", count: darkCount },
              { key: "light" as const, label: "Light", count: lightCount },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12px] font-semibold transition",
                  filter === f.key
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:bg-white/5 hover:text-white/60",
                )}
              >
                {f.label}
                <span className="ml-1.5 text-[10px] text-white/25">
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-soft flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
            <Palette className="h-8 w-8 text-white/20" />
            <p className="max-w-sm text-[14px] leading-relaxed text-white/45">
              No templates match your search. Try a different name or color.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="gap-1.5 rounded-xl border-white/10 bg-white/5 text-white/60"
            >
              <X className="h-3 w-3" /> Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                selected={selectedId === template.id}
                onSelect={() =>
                  setSelectedId((prev) =>
                    prev === template.id ? null : template.id,
                  )
                }
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="glass-strong inline-flex flex-col items-center gap-3 rounded-2xl px-8 py-6 sm:flex-row sm:gap-5">
            <div className="text-left">
              <p className="text-[14px] font-semibold text-white">
                Ready to forge your deck?
              </p>
              <p className="mt-0.5 text-[12.5px] text-white/45">
                Templates are applied automatically when you generate — or
                switch later in the deck editor.
              </p>
            </div>
            <Link to="/auth?returnTo=/dashboard">
              <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-[13px] text-white shadow-[0_8px_20px_rgba(0,168,107,0.3)]">
                <Sparkles className="h-4 w-4" />
                Start generating
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics Page                                                      */
/* ------------------------------------------------------------------ */

const EVENT_LABELS: Record<string, string> = {
  view: "Deck viewed",
  slide_dwell: "Slide viewed",
  share_click: "Share link clicked",
  download: "PDF downloaded",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  view: <Eye className="h-3.5 w-3.5" />,
  slide_dwell: <Clock className="h-3.5 w-3.5" />,
  share_click: <Share2 className="h-3.5 w-3.5" />,
  download: <Download className="h-3.5 w-3.5" />,
};

function StatCard({
  icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover relative overflow-hidden p-5"
    >
      <div className="shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="glass-soft grid h-9 w-9 place-items-center rounded-xl text-emerald-300">
            {icon}
          </span>
        </div>
        <p className="mt-3 text-[28px] font-bold tabular-nums tracking-tight text-white">
          {value}
        </p>
        <p className="mt-0.5 text-[12.5px] font-medium text-white/45">
          {label}
        </p>
        {sub && (
          <p className="mt-1 text-[11px] text-white/30">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AnalyticsPage() {
  const overview = useQuery(api.analytics.getOverview) as AnalyticsOverview | undefined;
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);

  if (overview === undefined) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
            <div>
              <Skeleton className="h-7 w-40 rounded bg-white/5" />
              <Skeleton className="mt-1 h-4 w-64 rounded bg-white/5" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />
            ))}
          </div>
          <Skeleton className="mt-8 h-64 rounded-2xl bg-white/5" />
        </div>
      </AppShell>
    );
  }

  const {
    totalViews,
    totalShareClicks,
    totalDownloads,
    totalSlideDwells,
    avgDwellMs,
    decks,
    recentEvents,
    viewsByDay,
  } = overview;

  const hasData = totalViews > 0 || totalShareClicks > 0 || totalDownloads > 0;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-emerald-300">
              <BarChart3 className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Analytics
              </h1>
              <p className="mt-0.5 text-[14px] text-white/45">
                Track who viewed your decks, which slides hold attention, and
                how your share links perform.
              </p>
            </div>
          </div>
        </div>

        {/* Overview stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Eye className="h-4 w-4" />}
            label="Total views"
            value={totalViews}
            sub="Across all shared decks"
            delay={0.05}
          />
          <StatCard
            icon={<Link2 className="h-4 w-4" />}
            label="Share clicks"
            value={totalShareClicks}
            sub="Link opened from a share"
            delay={0.1}
          />
          <StatCard
            icon={<Download className="h-4 w-4" />}
            label="PDF downloads"
            value={totalDownloads}
            sub="Print / export actions"
            delay={0.15}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Avg. dwell"
            value={avgDwellMs > 0 ? formatMs(avgDwellMs) : "—"}
            sub={`${totalSlideDwells} slide views tracked`}
            delay={0.2}
          />
        </div>

        {/* Views by day chart */}
        {viewsByDay.some((d) => d.count > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="glass mt-6 overflow-hidden rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">
                Views — last 14 days
              </h2>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewsByDay}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <XAxis
                    dataKey="day"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,10,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "white",
                    }}
                    labelFormatter={(d) => String(d)}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {viewsByDay.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.count > 0
                            ? "rgba(16,185,129,0.6)"
                            : "rgba(255,255,255,0.05)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Per-deck breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass mt-6 overflow-hidden rounded-2xl p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-white">
              Per-deck breakdown
            </h2>
            <span className="text-[12px] text-white/30">
              {decks.length} deck{decks.length === 1 ? "" : "s"}
            </span>
          </div>

          {!hasData ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <BarChart3 className="h-8 w-8 text-white/15" />
              <p className="max-w-sm text-[13.5px] leading-relaxed text-white/40">
                No analytics yet. Share a deck via its share link and open it —
                views, dwell time, and downloads will appear here automatically.
              </p>
              <Link to="/dashboard">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl border-white/10 bg-white/5 text-white/60"
                >
                  Go to dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {decks.map((d) => {
                const isExpanded = expandedDeck === d.deckId;
                return (
                  <div key={d.deckId}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDeck(isExpanded ? null : d.deckId)
                      }
                      className="flex w-full items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-white">
                          {d.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-white/35">
                          {d.projectName}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-5 text-[12px] tabular-nums text-white/50">
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          {d.views}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5 text-blue-400" />
                          {d.shareClicks}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5 text-amber-400" />
                          {d.downloads}
                        </span>
                        {d.avgDwellMs > 0 && (
                          <span className="hidden items-center gap-1.5 sm:flex">
                            <Clock className="h-3.5 w-3.5 text-violet-400" />
                            {formatMs(d.avgDwellMs)}
                          </span>
                        )}
                      </div>
                      <ChevronIcon expanded={isExpanded} />
                    </button>

                    {/* Slide dwell breakdown */}
                    {isExpanded && d.slideDwells.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 ml-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="mb-3 text-[12px] font-semibold text-white/50">
                            Slide dwell time
                          </p>
                          <div className="space-y-2">
                            {d.slideDwells.map((sd) => {
                              const maxMs = Math.max(
                                ...d.slideDwells.map((x) => x.avgMs),
                              );
                              const pct = maxMs > 0 ? (sd.avgMs / maxMs) * 100 : 0;
                              return (
                                <div
                                  key={sd.slide}
                                  className="flex items-center gap-3"
                                >
                                  <span className="w-12 shrink-0 text-right text-[11px] font-medium text-white/40">
                                    Slide {sd.slide + 1}
                                  </span>
                                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                                    <div
                                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-white/35">
                                    {formatMs(sd.avgMs)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        {recentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass mt-6 overflow-hidden rounded-2xl p-5"
          >
            <h2 className="mb-4 text-[15px] font-semibold text-white">
              Recent activity
            </h2>
            <div className="space-y-1.5">
              {recentEvents.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.04]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-white/50">
                    {EVENT_ICONS[e.event] ?? (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-white/70">
                      <span className="font-medium text-white/90">
                        {EVENT_LABELS[e.event] ?? e.event}
                      </span>{" "}
                      — {e.deckTitle}
                      {e.slideIndex !== undefined && (
                        <span className="text-white/40">
                          {" "}
                          · slide {e.slideIndex + 1}
                        </span>
                      )}
                      {e.duration !== undefined && (
                        <span className="text-white/40">
                          {" "}
                          · {formatMs(e.duration)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-white/30">
                    {formatDistanceToNow(new Date(e.time), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        "h-4 w-4 shrink-0 text-white/30 transition-transform duration-200",
        expanded && "rotate-180",
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
