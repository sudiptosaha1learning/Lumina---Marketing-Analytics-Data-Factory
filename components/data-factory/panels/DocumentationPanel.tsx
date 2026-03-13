"use client";

import { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentationOutput } from "@/lib/data-product-types";
import { FileText, Code2, ChevronDown, ChevronUp, GitMerge } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function DocumentationPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<DocumentationOutput>;

  const productDescription = (data.productDescription as string) ?? "";
  const fieldDescriptions = (data.fieldDescriptions as Record<string, string>) ?? {};
  const lineageSummary = (data.lineageSummary as string) ?? "";
  const usageNotes = (data.usageNotes as string) ?? "";
  const sampleQueries = (data.sampleQueries as string[]) ?? [];

  const [expandedQuery, setExpandedQuery] = useState<number | null>(0);

  const inputClass = `text-xs resize-none ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/25 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-400/50"}`;
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Product Description */}
      <div>
        <label className={labelClass}>Product Description</label>
        <Textarea
          value={productDescription}
          onChange={(e) => onChange({ ...output, productDescription: e.target.value })}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Lineage Summary */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <GitMerge className="w-3 h-3" />
            Data Lineage Summary
          </span>
        </label>
        <Textarea
          value={lineageSummary}
          onChange={(e) => onChange({ ...output, lineageSummary: e.target.value })}
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Usage Notes */}
      <div>
        <label className={labelClass}>Usage Notes</label>
        <Textarea
          value={usageNotes}
          onChange={(e) => onChange({ ...output, usageNotes: e.target.value })}
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Field Descriptions */}
      {Object.keys(fieldDescriptions).length > 0 && (
        <div>
          <label className={labelClass}>Field Dictionary ({Object.keys(fieldDescriptions).length} fields)</label>
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="divide-y" style={{ divideColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              {Object.entries(fieldDescriptions).map(([field, desc]) => (
                <div key={field} className="flex items-start gap-3 px-4 py-2.5">
                  <span className={`text-[11px] font-mono font-semibold flex-shrink-0 w-44 ${isDark ? "text-blue-400" : "text-blue-600"}`}>{field}</span>
                  <span className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sample Queries */}
      {sampleQueries.length > 0 && (
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3 h-3" />
              Sample Queries ({sampleQueries.length})
            </span>
          </label>
          <div className="space-y-2">
            {sampleQueries.map((query, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={cardStyle}>
                <button
                  onClick={() => setExpandedQuery(expandedQuery === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}
                    >
                      SQL
                    </span>
                    <span className={`text-xs ${isDark ? "text-white/65" : "text-slate-700"}`}>
                      Query {i + 1}
                    </span>
                  </div>
                  {expandedQuery === i
                    ? <ChevronUp className={`w-3 h-3 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                    : <ChevronDown className={`w-3 h-3 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                  }
                </button>
                {expandedQuery === i && (
                  <pre
                    className="px-4 pb-4 font-mono text-[10px] leading-relaxed overflow-auto max-h-56"
                    style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}
                  >
                    {query}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
