"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { DiscoveryOutput, DataSource } from "@/lib/data-product-types";
import { CheckCircle2, Circle, Database, Zap } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function DiscoveryPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<DiscoveryOutput>;

  const sources = (data.candidateSources as DataSource[]) ?? [];
  const joinHypotheses = (data.joinHypotheses as string[]) ?? [];
  const gaps = (data.gaps as string[]) ?? [];

  const toggleSource = (id: string) => {
    const updated = sources.map((s) => s.id === id ? { ...s, selected: !s.selected } : s);
    onChange({ ...output, candidateSources: updated });
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-3 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardBase = {
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Data Sources */}
      <div>
        <label className={labelClass}>
          Candidate Data Sources — click to toggle selection
        </label>
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
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: source.qualityScore >= 90 ? "#22c55e" : source.qualityScore >= 80 ? "#f59e0b" : "#ef4444" }}
                      />
                      <span className={`text-[9px] font-semibold ${isDark ? "text-white/50" : "text-slate-500"}`}>Q: {source.qualityScore}</span>
                    </div>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
                    >
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
        </div>
      </div>

      {/* Join Hypotheses */}
      {joinHypotheses.length > 0 && (
        <div>
          <label className={labelClass}>Join Hypotheses</label>
          <div className="space-y-2">
            {joinHypotheses.map((jh, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ ...cardBase, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                <Zap className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? "text-white/60" : "text-slate-700"}`}>{jh}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
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
