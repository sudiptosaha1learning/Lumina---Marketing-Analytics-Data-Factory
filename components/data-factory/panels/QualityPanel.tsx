"use client";

import { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { QualityOutput, QualityIssue } from "@/lib/data-product-types";
import {
  AlertTriangle, CheckCircle2, XCircle, ToggleLeft, ToggleRight,
  ShieldAlert, Sparkles, Loader2, ChevronDown, ChevronUp, Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
  qualityThreshold?: number;
  onRequestRemediation?: (instruction: string) => void;
}

export function QualityPanel({ output, onChange, qualityThreshold = 80, onRequestRemediation }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<QualityOutput>;

  const score = (data.overallScore as number) ?? 0;
  const issues = (data.issues as QualityIssue[]) ?? [];
  const remediations = (data.remediations as string[]) ?? [];
  const readiness = (data.readinessAssessment as string) ?? "";

  const [remediating, setRemediating] = useState(false);
  const [showIssues, setShowIssues] = useState(true);
  const [localThreshold, setLocalThreshold] = useState(qualityThreshold);
  const [showThresholdEdit, setShowThresholdEdit] = useState(false);

  const threshold = localThreshold;
  const nonOverriddenHigh = issues.filter((i) => !i.overridden && i.severity === "high");
  const isBlocked = score < threshold && nonOverriddenHigh.length > 0;

  const scoreColor = score >= 85 ? "#22c55e" : score >= threshold ? "#f59e0b" : "#ef4444";

  const toggleOverride = (idx: number) => {
    const updatedIssues = issues.map((issue, i) =>
      i === idx ? { ...issue, overridden: !issue.overridden } : issue
    );
    onChange({ ...output, issues: updatedIssues });
  };

  const handleAIRemediate = async () => {
    if (!onRequestRemediation) return;
    setRemediating(true);
    const highIssues = nonOverriddenHigh.map((i) => `${i.source}.${i.field}: ${i.issueType}`).join("; ");
    onRequestRemediation(
      `The quality score is ${score}, below the threshold of ${threshold}. ` +
      `The following high-severity issues need remediation: ${highIssues}. ` +
      `Please apply data remediation actions to resolve these issues and improve the overall quality score above ${threshold}.`
    );
  };

  const severityStyle = (severity: string) => {
    switch (severity) {
      case "high":   return { background: "rgba(239,68,68,0.1)",  border: "1px solid rgba(239,68,68,0.25)",  color: "#f87171" };
      case "medium": return { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" };
      default:       return { background: "rgba(34,197,94,0.1)",  border: "1px solid rgba(34,197,94,0.25)",  color: "#4ade80" };
    }
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;

  return (
    <div className="space-y-5">
      {/* Score gauge + threshold */}
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 relative"
          style={{ background: `${scoreColor}15`, border: `3px solid ${scoreColor}40` }}
        >
          <div className="text-center">
            <div className="font-heading font-bold text-2xl" style={{ color: scoreColor }}>{score}</div>
            <div className={`text-[8px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}>Quality</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/65" : "text-slate-700"}`}>{readiness}</p>
          {/* Threshold indicator */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors"
              style={{
                background: isBlocked ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                border: isBlocked ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(34,197,94,0.2)",
              }}
              onClick={() => setShowThresholdEdit((v) => !v)}
              title="Click to adjust quality gate threshold"
            >
              {isBlocked
                ? <ShieldAlert className="w-3 h-3 text-red-400" />
                : <CheckCircle2 className="w-3 h-3 text-green-400" />
              }
              <span className={`text-[10px] font-medium ${isBlocked ? "text-red-400" : "text-green-400"}`}>
                Gate: {threshold} &mdash; {isBlocked ? `Blocked (${nonOverriddenHigh.length} critical issue${nonOverriddenHigh.length > 1 ? "s" : ""})` : "Cleared"}
              </span>
              <Settings2 className={`w-2.5 h-2.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
            </div>
          </div>
          {showThresholdEdit && (
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <span className={`text-[10px] ${isDark ? "text-white/50" : "text-slate-500"}`}>Threshold:</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={localThreshold}
                onChange={(e) => setLocalThreshold(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className={`text-xs font-bold w-7 text-right ${isDark ? "text-white" : "text-slate-900"}`}>{localThreshold}</span>
            </div>
          )}
        </div>
      </div>

      {/* Blocked banner + AI remediation CTA */}
      {isBlocked && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-400 mb-1">Quality gate blocked — cannot advance</p>
              <p className={`text-xs leading-relaxed ${isDark ? "text-white/55" : "text-slate-600"}`}>
                The overall quality score ({score}) is below the configured threshold ({threshold}) and there are{" "}
                <strong className="text-red-400">{nonOverriddenHigh.length} unresolved high-severity issue{nonOverriddenHigh.length > 1 ? "s" : ""}</strong>.
                You must either resolve the issues, let the AI apply remediations, or override individual issues below to proceed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAIRemediate}
              disabled={remediating || !onRequestRemediation}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {remediating
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Applying remediations...</>
                : <><Sparkles className="w-3 h-3" /> Let AI remediate &amp; re-profile</>
              }
            </Button>
            <span className={`text-[10px] ${isDark ? "text-white/35" : "text-slate-400"}`}>
              or override individual issues below
            </span>
          </div>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div>
          <button
            className={`flex items-center gap-1.5 mb-2 ${labelClass}`}
            onClick={() => setShowIssues((v) => !v)}
          >
            Quality Issues ({issues.length})
            {showIssues ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showIssues && (
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{
                    background: issue.overridden
                      ? isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
                      : issue.severity === "high" && !issue.overridden
                        ? "rgba(239,68,68,0.05)"
                        : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: issue.overridden
                      ? isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)"
                      : issue.severity === "high" && !issue.overridden
                        ? "1px solid rgba(239,68,68,0.2)"
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
                        <span className={`text-xs font-medium ${isDark ? "text-white/80" : "text-slate-800"}`}>
                          {issue.source}.{issue.field}
                        </span>
                        <span className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-500"}`}>{issue.issueType}</span>
                      </div>
                      <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-600"}`}>{issue.suggestion}</p>
                    </div>
                    <button
                      onClick={() => toggleOverride(i)}
                      className="flex items-center gap-1 flex-shrink-0 text-[10px] transition-colors whitespace-nowrap"
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
          )}
        </div>
      )}

      {/* Remediations */}
      {remediations.length > 0 && (
        <div>
          <label className={labelClass}>Remediation Steps Applied</label>
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
