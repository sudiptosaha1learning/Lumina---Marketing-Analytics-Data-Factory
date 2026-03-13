"use client";

import { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { PipelineOutput, PipelineStep } from "@/lib/data-product-types";
import { GitBranch, ChevronDown, ChevronUp, Clock, List } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const STEP_TYPE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  extract:   { bg: "rgba(99,102,241,0.12)",  text: "#818cf8", border: "rgba(99,102,241,0.3)" },
  transform: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  load:      { bg: "rgba(16,185,129,0.12)",  text: "#34d399", border: "rgba(16,185,129,0.3)" },
  test:      { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
};

export function PipelinePanel({ output }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<PipelineOutput>;

  const steps = (data.steps as PipelineStep[]) ?? [];
  const dbtModels = (data.dbtModels as string[]) ?? [];
  const orchestrationSteps = (data.orchestrationSteps as string[]) ?? [];
  const scheduleFrequency = (data.scheduleFrequency as string) ?? "";

  const [expandedSQL, setExpandedSQL] = useState<number | null>(null);

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Schedule */}
      {scheduleFrequency && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className={`text-xs ${isDark ? "text-white/70" : "text-slate-700"}`}>
            <span className="font-semibold">Schedule:</span>{" "}{scheduleFrequency}
          </span>
        </div>
      )}

      {/* Pipeline Steps */}
      <div>
        <label className={labelClass}>Pipeline Steps ({steps.length})</label>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const typeStyle = STEP_TYPE_STYLE[step.type] ?? STEP_TYPE_STYLE.transform;
            const isExpanded = expandedSQL === i;

            return (
              <div key={i} className="rounded-xl overflow-hidden" style={cardStyle}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}` }}
                  >
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{step.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
                        style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}` }}
                      >
                        {step.type}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-600"}`}>{step.description}</p>
                  </div>
                  {step.sql && (
                    <button
                      onClick={() => setExpandedSQL(isExpanded ? null : i)}
                      className={`flex items-center gap-1 text-[10px] transition-colors flex-shrink-0 ${isDark ? "text-white/35 hover:text-white/65" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      SQL
                    </button>
                  )}
                </div>

                {isExpanded && step.sql && (
                  <div
                    className="px-4 pb-4"
                    style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <pre
                      className="mt-3 p-3 rounded-lg font-mono text-[10px] leading-relaxed overflow-auto max-h-60"
                      style={{
                        background: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.04)",
                        color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)",
                        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      {step.sql}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* dbt Models */}
      {dbtModels.length > 0 && (
        <div>
          <label className={labelClass}>dbt Models</label>
          <div className="flex flex-wrap gap-2">
            {dbtModels.map((model, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}
              >
                <GitBranch className="w-3 h-3 flex-shrink-0" />
                {model}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orchestration */}
      {orchestrationSteps.length > 0 && (
        <div>
          <label className={labelClass}>Orchestration Steps</label>
          <div className="space-y-1.5">
            {orchestrationSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <List className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span className={`text-xs ${isDark ? "text-white/60" : "text-slate-700"}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
