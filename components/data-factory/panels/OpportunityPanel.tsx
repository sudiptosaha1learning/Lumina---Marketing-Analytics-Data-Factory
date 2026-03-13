"use client";

import { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { OpportunityOutput } from "@/lib/data-product-types";
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink, PackageCheck, X } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

// Mock existing data product catalog — in production this would come from a registry API
const EXISTING_DATA_PRODUCTS = [
  {
    id: "dp-001",
    name: "Customer Propensity Score v2",
    description: "ML model scoring customers 0–100 on likelihood to purchase a new vehicle within 90 days. Trained on CRM, web, and email signals.",
    domain: "Customer Analytics",
    owner: "Advanced Analytics",
    status: "Published",
    matchScore: 94,
    matchReasons: ["Same prediction target (vehicle purchase intent)", "Identical data sources (CRM, website, email)", "Same 90-day horizon"],
    capabilities: ["Purchase propensity 0–100", "90-day purchase window", "CRM + Web + Email features", "Daily refresh"],
  },
  {
    id: "dp-002",
    name: "Defender Model Interest Index",
    description: "Engagement scoring model for Defender-specific customer interest using configurator, brochure, and campaign response data.",
    domain: "Model Analytics",
    owner: "Digital Analytics",
    status: "Published",
    matchScore: 71,
    matchReasons: ["Defender model focus", "Marketing engagement signals", "Campaign effectiveness use case"],
    capabilities: ["Defender interest score", "Multi-channel engagement", "Weekly refresh"],
  },
  {
    id: "dp-003",
    name: "Marketing Attribution Dataset",
    description: "Multi-touch attribution model across email, paid, and CRM channels linking marketing touchpoints to confirmed orders.",
    domain: "Marketing Analytics",
    owner: "Campaign Analytics",
    status: "Draft",
    matchScore: 58,
    matchReasons: ["Marketing effectiveness objective", "CRM and email data overlap"],
    capabilities: ["Multi-touch attribution", "Channel ROI", "Campaign response tracking"],
  },
];

function matchColor(score: number) {
  if (score >= 85) return { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "#4ade80", label: "Strong match" };
  if (score >= 65) return { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", text: "#fbbf24", label: "Partial match" };
  return { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", text: "#818cf8", label: "Related" };
}

export function OpportunityPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<OpportunityOutput>;

  const [similarDismissed, setSimilarDismissed] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const update = (field: keyof OpportunityOutput, value: unknown) => {
    onChange({ ...output, [field]: value });
  };

  const inputClass = `text-xs ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/25 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-400/50"}`;

  // Only show if there's actual output content
  const hasContent = data.problemStatement || data.purpose || data.scope;

  return (
    <div className="space-y-5">

      {/* ── Similar Data Products Banner ───────────────────────────────── */}
      {hasContent && !similarDismissed && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)",
            border: isDark ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(99,102,241,0.18)",
          }}
        >
          {/* Banner header */}
          <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)" }}>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <PackageCheck className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-semibold ${isDark ? "text-white/90" : "text-slate-800"}`}>
                Similar data products found in your catalog
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-white/45" : "text-slate-500"}`}>
                The agent identified {EXISTING_DATA_PRODUCTS.length} existing data products that may meet your objective. Review before building new.
              </div>
            </div>
            <button
              onClick={() => setSimilarDismissed(true)}
              className={`p-1 rounded transition-colors ${isDark ? "text-white/25 hover:text-white/60 hover:bg-white/[0.06]" : "text-slate-300 hover:text-slate-600 hover:bg-black/[0.04]"}`}
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product cards */}
          <div className="p-3 space-y-2">
            {EXISTING_DATA_PRODUCTS.map((dp) => {
              const colors = matchColor(dp.matchScore);
              const isExpanded = expandedProduct === dp.id;
              return (
                <div
                  key={dp.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.8)", border: `1px solid ${colors.border}` }}
                >
                  <button
                    onClick={() => setExpandedProduct(isExpanded ? null : dp.id)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors"
                    style={{ background: colors.bg }}
                  >
                    {/* Match score */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: `${colors.text}18`, border: `1px solid ${colors.text}30`, color: colors.text }}
                    >
                      {dp.matchScore}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${isDark ? "text-white/90" : "text-slate-800"}`}>{dp.name}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase"
                          style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                        >
                          {colors.label}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={
                            dp.status === "Published"
                              ? { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                              : { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                          }
                        >
                          {dp.status}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-0.5 truncate ${isDark ? "text-white/45" : "text-slate-500"}`}>
                        {dp.description}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 opacity-40 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div
                      className="px-4 py-3 space-y-3 border-t"
                      style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
                    >
                      {/* Why it matches */}
                      <div>
                        <div className={`text-[9px] uppercase tracking-wider font-semibold mb-1.5 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                          Why it matches your objective
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dp.matchReasons.map((reason, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-2 py-0.5 rounded-lg ${isDark ? "bg-white/[0.05] text-white/55" : "bg-slate-100 text-slate-600"}`}
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Capabilities */}
                      <div>
                        <div className={`text-[9px] uppercase tracking-wider font-semibold mb-1.5 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                          Capabilities
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dp.capabilities.map((cap, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-2 py-0.5 rounded-lg ${isDark ? "bg-white/[0.04] text-white/50 border border-white/[0.06]" : "bg-white text-slate-600 border border-slate-200"}`}
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          View in catalog
                        </button>
                        <button
                          onClick={() => setSimilarDismissed(true)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${isDark ? "bg-white/[0.04] text-white/50 hover:bg-white/[0.07] border border-white/[0.07]" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"}`}
                        >
                          <AlertCircle className="w-2.5 h-2.5" />
                          Proceed with new product
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Problem Statement ──────────────────────────────────────────── */}
      <Field label="Problem Statement" isDark={isDark}>
        <Textarea
          value={(data.problemStatement as string) ?? ""}
          onChange={(e) => update("problemStatement", e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Purpose */}
      <Field label="Purpose" isDark={isDark}>
        <Textarea
          value={(data.purpose as string) ?? ""}
          onChange={(e) => update("purpose", e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Scope */}
      <Field label="Scope" isDark={isDark}>
        <Input
          value={(data.scope as string) ?? ""}
          onChange={(e) => update("scope", e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Assumptions */}
      <Field label="Assumptions" isDark={isDark}>
        <div className="space-y-2">
          {((data.assumptions as string[]) ?? []).map((assumption, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.6)" }}
              />
              <Input
                value={assumption}
                onChange={(e) => {
                  const newAssumptions = [...((data.assumptions as string[]) ?? [])];
                  newAssumptions[i] = e.target.value;
                  update("assumptions", newAssumptions);
                }}
                className={`${inputClass} flex-1`}
              />
            </div>
          ))}
        </div>
      </Field>

      {/* Initial KPIs */}
      <Field label="Initial KPI Signals" isDark={isDark}>
        <div className="flex flex-wrap gap-2">
          {((data.initialKPIs as string[]) ?? []).map((kpi, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#60a5fa",
              }}
            >
              {kpi}
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children, isDark }: { label: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <label className={`block text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>
        {label}
      </label>
      {children}
    </div>
  );
}
