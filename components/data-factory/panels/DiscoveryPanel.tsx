"use client";

import { useState, useCallback } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { DiscoveryOutput, DataSource } from "@/lib/data-product-types";
import { ECOSYSTEM_CATALOG, type CatalogSource, type CatalogEntity } from "@/lib/data-product-types";
import {
  CheckCircle2, Circle, Database, Zap, Search, X,
  ChevronDown, ChevronUp, ChevronRight, Plus, Loader2,
  Shield, Key, Eye, Tag, Layers,
} from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const DOMAINS = ["All", "Customer", "Marketing", "Digital", "Sales", "After-Sales", "Finance"];

const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Customer:    { bg: "rgba(59,130,246,0.1)",  text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  Marketing:   { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.25)" },
  Digital:     { bg: "rgba(20,184,166,0.1)",  text: "#2dd4bf", border: "rgba(20,184,166,0.25)" },
  Sales:       { bg: "rgba(34,197,94,0.1)",   text: "#4ade80", border: "rgba(34,197,94,0.25)" },
  "After-Sales":{ bg: "rgba(245,158,11,0.1)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  Finance:     { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", border: "rgba(99,102,241,0.25)" },
};

function qColor(score: number) {
  return score >= 90 ? "#22c55e" : score >= 80 ? "#f59e0b" : "#ef4444";
}

export function DiscoveryPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<DiscoveryOutput>;

  const sources     = (data.candidateSources as DataSource[]) ?? [];
  const joinHyp     = (data.joinHypotheses as string[]) ?? [];
  const gaps        = (data.gaps as string[]) ?? [];

  // Catalog browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [domainFilter, setDomainFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set(sources.map((s) => s.id)));

  // ── toggle existing candidate source ───────────────────────────────────
  const toggleSource = (id: string) => {
    const updated = sources.map((s) => s.id === id ? { ...s, selected: !s.selected } : s);
    onChange({ ...output, candidateSources: updated });
  };

  // ── "Add to Discovery" from catalog — simulates agent processing ─────────
  const handleAddFromCatalog = useCallback(async (cat: CatalogSource) => {
    if (processedIds.has(cat.id)) return;
    setProcessing(cat.id);

    // Simulate agent processing delay
    await new Promise((r) => setTimeout(r, 1400));

    const newSource: DataSource = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      fields: cat.fields,
      freshness: cat.freshness,
      owner: cat.owner,
      qualityScore: cat.qualityScore,
      selected: true,
    };

    setProcessedIds((prev) => new Set([...prev, cat.id]));
    setProcessing(null);

    onChange({
      ...output,
      candidateSources: [...sources, newSource],
    });
  }, [processedIds, sources, output, onChange]);

  // ── filtered catalog list ───────────────────────────────────────────────
  const filteredCatalog = ECOSYSTEM_CATALOG.filter((cat) => {
    const matchDomain = domainFilter === "All" || cat.domain === domainFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q) || cat.tags.some((t) => t.includes(q));
    return matchDomain && matchSearch;
  });

  const cardBase = {
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-3 block ${isDark ? "text-white/40" : "text-slate-400"}`;

  return (
    <div className="space-y-5">

      {/* ── Candidate Data Sources ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Candidate Data Sources — click to toggle selection
          </label>
          <button
            onClick={() => setShowBrowser(!showBrowser)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: showBrowser ? "rgba(59,130,246,0.15)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              border: showBrowser ? "1px solid rgba(59,130,246,0.35)" : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              color: showBrowser ? "#60a5fa" : isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
            }}
          >
            <Database className="w-3 h-3" />
            Browse Ecosystem Catalog
          </button>
        </div>

        <div className="space-y-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className="w-full text-left rounded-xl p-4 transition-all duration-200"
              style={{
                ...cardBase,
                background: source.selected
                  ? isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.06)"
                  : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                borderColor: source.selected ? "rgba(59,130,246,0.35)" : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {source.selected
                    ? <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    : <Circle className={`w-4 h-4 ${isDark ? "text-white/20" : "text-slate-300"}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{source.name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: qColor(source.qualityScore) }} />
                      <span className={`text-[9px] font-semibold ${isDark ? "text-white/50" : "text-slate-500"}`}>Q: {source.qualityScore}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {source.freshness}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>{source.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {source.fields.slice(0, 6).map((f) => (
                      <span key={f} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isDark ? "bg-white/[0.05] text-white/45" : "bg-slate-100 text-slate-500"}`}>{f}</span>
                    ))}
                    {source.fields.length > 6 && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDark ? "text-white/30" : "text-slate-400"}`}>+{source.fields.length - 6} more</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {sources.length === 0 && (
            <div className={`text-xs text-center py-6 rounded-xl ${isDark ? "text-white/30 bg-white/[0.02]" : "text-slate-400 bg-black/[0.02]"}`} style={cardBase}>
              No candidate sources yet. Browse the ecosystem catalog to add sources.
            </div>
          )}
        </div>
      </div>

      {/* ── Ecosystem Catalog Browser ─────────────────────────────────── */}
      {showBrowser && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.03)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          {/* Browser header */}
          <div
            className="px-4 py-3 flex items-center gap-3 border-b"
            style={{ borderColor: "rgba(59,130,246,0.15)", background: "rgba(59,130,246,0.08)" }}
          >
            <Database className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-300">Ecosystem Data Catalog</div>
              <div className="text-[10px] text-blue-400/60">Customer &amp; Marketing Analytics domains — select a source to add to discovery</div>
            </div>
            <button
              onClick={() => setShowBrowser(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 flex flex-wrap gap-2 items-center border-b" style={{ borderColor: "rgba(59,130,246,0.1)" }}>
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sources, tags..."
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none"
                style={{
                  background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
                }}
              />
            </div>

            {/* Domain pills */}
            <div className="flex flex-wrap gap-1">
              {DOMAINS.map((d) => {
                const isActive = domainFilter === d;
                const dc = DOMAIN_COLORS[d];
                return (
                  <button
                    key={d}
                    onClick={() => setDomainFilter(d)}
                    className="text-[10px] px-2 py-1 rounded-lg font-medium transition-all"
                    style={{
                      background: isActive ? (dc?.bg ?? "rgba(255,255,255,0.1)") : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                      border: isActive ? `1px solid ${dc?.border ?? "rgba(255,255,255,0.2)"}` : isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
                      color: isActive ? (dc?.text ?? "#fff") : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog list */}
          <div className="divide-y" style={{ divideColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", maxHeight: 520, overflowY: "auto" }}>
            {filteredCatalog.length === 0 && (
              <div className={`text-xs text-center py-8 ${isDark ? "text-white/30" : "text-slate-400"}`}>No sources match the current filters.</div>
            )}
            {filteredCatalog.map((cat) => {
              const isExpanded = expandedCatalogId === cat.id;
              const isAlreadyAdded = processedIds.has(cat.id);
              const isProcessing = processing === cat.id;
              const dc = DOMAIN_COLORS[cat.domain] ?? DOMAIN_COLORS.Customer;

              return (
                <div key={cat.id} style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedCatalogId(isExpanded ? null : cat.id)}
                      className="mt-0.5 flex-shrink-0 transition-colors"
                      style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-slate-900"}`}>{cat.name}</span>
                        {/* Domain pill */}
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                          {cat.domain}
                        </span>
                        {/* Quality */}
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: qColor(cat.qualityScore) }} />
                          <span className={`text-[9px] font-semibold ${isDark ? "text-white/45" : "text-slate-500"}`}>Q: {cat.qualityScore}</span>
                        </div>
                        {/* Freshness */}
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                          {cat.freshness}
                        </span>
                        {/* System */}
                        <span className={`text-[9px] ${isDark ? "text-white/30" : "text-slate-400"}`}>{cat.system}</span>
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "text-white/45" : "text-slate-500"}`}>{cat.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cat.tags.map((tag) => (
                          <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded ${isDark ? "bg-white/[0.04] text-white/35" : "bg-slate-100 text-slate-400"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Field preview */}
                      {!isExpanded && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cat.fields.slice(0, 5).map((f) => (
                            <span key={f} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isDark ? "bg-white/[0.04] text-white/40" : "bg-slate-100 text-slate-400"}`}>{f}</span>
                          ))}
                          {cat.fields.length > 5 && (
                            <span className={`text-[9px] ${isDark ? "text-white/25" : "text-slate-400"}`}>+{cat.fields.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Add button */}
                    <div className="flex-shrink-0">
                      {isAlreadyAdded ? (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Added
                        </div>
                      ) : isProcessing ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddFromCatalog(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            color: "#60a5fa",
                          }}
                        >
                          <Plus className="w-3 h-3" />
                          Add to Discovery
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded entity/field browser */}
                  {isExpanded && (
                    <div className="px-10 pb-4 space-y-2">
                      {(cat.entities ?? []).map((entity: CatalogEntity) => {
                        const entityKey = `${cat.id}_${entity.name}`;
                        const isEntityExpanded = expandedEntity === entityKey;
                        return (
                          <div
                            key={entity.name}
                            className="rounded-xl overflow-hidden"
                            style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.7)", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}
                          >
                            <button
                              onClick={() => setExpandedEntity(isEntityExpanded ? null : entityKey)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
                              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                            >
                              <Layers className={`w-3 h-3 flex-shrink-0 ${isDark ? "text-white/40" : "text-slate-400"}`} />
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-semibold font-mono ${isDark ? "text-white/80" : "text-slate-700"}`}>{entity.name}</span>
                                <span className={`text-[10px] ml-2 ${isDark ? "text-white/35" : "text-slate-400"}`}>{entity.description}</span>
                              </div>
                              {entity.rowCount && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded mr-2 ${isDark ? "bg-white/[0.05] text-white/35" : "bg-slate-100 text-slate-400"}`}>
                                  {entity.rowCount} rows
                                </span>
                              )}
                              {isEntityExpanded ? <ChevronDown className="w-3 h-3 text-current opacity-40" /> : <ChevronRight className="w-3 h-3 text-current opacity-40" />}
                            </button>

                            {isEntityExpanded && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-[10px]">
                                  <thead>
                                    <tr style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                                      {["Field", "Type", "Description", "Flags"].map((h) => (
                                        <th key={h} className={`text-left px-3 py-2 font-semibold uppercase tracking-wide ${isDark ? "text-white/30" : "text-slate-400"}`}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entity.fields.map((field, fi) => (
                                      <tr
                                        key={fi}
                                        style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" }}
                                      >
                                        <td className={`px-3 py-2 font-mono font-medium ${isDark ? "text-white/80" : "text-slate-800"}`}>{field.name}</td>
                                        <td className={`px-3 py-2 font-mono ${isDark ? "text-white/40" : "text-slate-500"}`}>{field.type}</td>
                                        <td className={`px-3 py-2 ${isDark ? "text-white/50" : "text-slate-600"}`}>
                                          {field.description}
                                          {field.sample && <span className={`ml-1.5 font-mono ${isDark ? "text-white/25" : "text-slate-400"}`}>e.g. {field.sample}</span>}
                                        </td>
                                        <td className="px-3 py-2">
                                          <div className="flex items-center gap-1">
                                            {field.isPII && (
                                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                                                <Shield className="w-2 h-2" />PII
                                              </span>
                                            )}
                                            {field.isForeignKey && (
                                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                                                <Key className="w-2 h-2" />FK
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Browser footer */}
          <div
            className="px-4 py-2.5 flex items-center justify-between border-t"
            style={{ borderColor: "rgba(59,130,246,0.15)", background: "rgba(59,130,246,0.06)" }}
          >
            <span className={`text-[10px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
              {filteredCatalog.length} source{filteredCatalog.length !== 1 ? "s" : ""} shown · {processedIds.size} added to discovery
            </span>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#60a5fa" }}>
              <Eye className="w-3 h-3" />
              <span>Selecting a source triggers the Discovery Agent to profile and validate it</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Join Hypotheses ─────────────────────────────────────────────── */}
      {joinHyp.length > 0 && (
        <div>
          <label className={labelClass}>Join Hypotheses</label>
          <div className="space-y-2">
            {joinHyp.map((jh, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ ...cardBase, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                <Zap className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? "text-white/60" : "text-slate-700"}`}>{jh}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gaps ─────────────────────────────────────────────────────────── */}
      {gaps.length > 0 && (
        <div>
          <label className={labelClass}>Identified Gaps</label>
          <div className="space-y-2">
            {gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Database className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? "text-white/60" : "text-slate-700"}`}>{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-3 block`;
