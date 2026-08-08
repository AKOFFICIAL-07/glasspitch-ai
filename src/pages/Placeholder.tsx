import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DECK_TEMPLATES, type DeckTemplate } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ExternalLink,
  Palette,
  Search,
  Sparkles,
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
        {/* Simulated slide elements */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {/* Accent bar */}
          <div
            className="mb-3 h-1 w-12 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${template.accent}, ${template.accent2})`,
              boxShadow: `0 0 12px ${template.accent}66`,
            }}
          />
          {/* Title */}
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

          {/* Bullet placeholders */}
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

          {/* Section pills */}
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

        {/* Shimmer overlay on hover */}
        <div className="shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Selected badge */}
        {selected && (
          <div className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[14px] font-semibold text-white">
            {template.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-white/45">{template.tagline}</p>
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-white/35 mr-1">Palette</span>
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

        {/* Dark / Light badge */}
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

        {/* CTA */}
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
/* Page                                                                */
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
        {/* Header */}
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

        {/* Search + filter bar */}
        <div className="glass-strong mb-8 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates — e.g. “ocean”, “violet”, “minimal”…"
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

        {/* Grid */}
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

        {/* CTA footer */}
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

export function AnalyticsPage() {
  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center"
      >
        <div className="glass glass-hover relative w-full overflow-hidden p-10 sm:p-14">
          <div className="shimmer pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-center">
            <span className="glass-soft grid h-16 w-16 place-items-center rounded-2xl text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <BarChart3 className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Analytics
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              See who opened your deck, which slides investors linger on, and how
              your story performs. Analytics will connect to your share links
              automatically.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Badge className="border-transparent bg-emerald-500/10 text-emerald-300">
                <Sparkles className="h-3 w-3" /> Coming soon
              </Badge>
              {["Deck views", "Slide dwell time", "Share opens", "Section heat"].map(
                (chip) => (
                  <Badge
                    key={chip}
                    variant="secondary"
                    className="border-white/10 bg-white/5 text-muted-foreground"
                  >
                    {chip}
                  </Badge>
                ),
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_10px_24px_rgba(34,211,238,0.25)]">
                  <BarChart3 className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
