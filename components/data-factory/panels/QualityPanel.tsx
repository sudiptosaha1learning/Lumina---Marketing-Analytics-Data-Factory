"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { QualityOutput, QualityIssue } from "@/lib/data-product-types";
import { AlertTriangle, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function QualityPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<QualityOutput>;

  const score = (data.overallScore as number) ?? 0;
  const issues = (data.issues as QualityIssue[]) ?? [];
  const remediations = (data.remediations as string[]) ?? [];
  const readiness = (data.readinessAssessment as string) ?? "";

  const scoreColor = score >= 85 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444";

  const toggleOverride = (idx: number) => {
    const updatedIssues = issues.map((issue, i) =>
      i === idx ? { ...issue, overridden: !issue.overridden } : issue
    );
    onChange({ ...output, issues: updatedIssues });
  };

  const severityStyle = (severity: string) => {
    switch (severity) {
      case "high": return { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" };
      case "medium": return { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" };
      default: return { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" };
    }
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;

  return (
    <div className="space-y-5">
      {/* Score gauge */}
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${scoreColor}15`, border: `3px solid ${scoreColor}40` }}
        >
          <div className="text-center">
            <div className="font-heading font-bold text-2xl" style={{ color: scoreColor }}>{score}</div>
            <div className={`text-[8px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}>Quality</div>
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/65" : "text-slate-700"}`}>{readiness}</p>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div>
          <label className={labelClass}>Quality Issues ({issues.length})</label>
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: issue.overridden
                    ? isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
                    : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: issue.overridden
                    ? isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)"
                    : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  opacity: issue.overridden ? 0.55 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={severityStyle(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium ${isDark ? "text-white/80" : "text-slate-800"}`}>{issue.source}.{issue.field}</span>
                      <span className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-500"}`}>{issue.issueType}</span>
                    </div>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-600"}`}>{issue.suggestion}</p>
                  </div>
                  <button
                    onClick={() => toggleOverride(i)}
                    className="flex items-center gap-1 flex-shrink-0 text-[10px] transition-colors"
                    style={{ color: issue.overridden ? "#22c55e" : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}
                    title={issue.overridden ? "Remove override" : "Override this issue"}
                  >
                    {issue.overridden
                      ? <><ToggleRight className="w-4 h-4" /> <span>Overridden</span></>
                      : <><ToggleLeft className="w-4 h-4" /> <span>Override</span></>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remediations */}
      {remediations.length > 0 && (
        <div>
          <label className={labelClass}>Remediation Steps</label>
          <div className="space-y-1.5">
            {remediations.map((rem, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? "text-white/60" : "text-slate-700"}`}>{rem}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
