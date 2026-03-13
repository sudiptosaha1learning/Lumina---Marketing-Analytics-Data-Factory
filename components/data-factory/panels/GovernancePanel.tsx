"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { GovernanceOutput, GovernanceRule } from "@/lib/data-product-types";
import { ShieldAlert, Lock, Users, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const CLASSIFICATION_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  PII:       { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.3)" },
  Sensitive: { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  Internal:  { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", border: "rgba(99,102,241,0.3)" },
  Public:    { bg: "rgba(34,197,94,0.1)",   text: "#4ade80", border: "rgba(34,197,94,0.3)" },
};

export function GovernancePanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<GovernanceOutput>;

  const piiFindings = (data.piiFindings as GovernanceRule[]) ?? [];
  const accessMatrix = (data.accessControlMatrix as Record<string, string[]>) ?? {};
  const approvalReqs = (data.approvalRequirements as string[]) ?? [];
  const complianceNotes = (data.complianceNotes as string) ?? "";

  const toggleOverride = (idx: number) => {
    const updated = piiFindings.map((rule, i) =>
      i === idx ? { ...rule, overridden: !rule.overridden } : rule
    );
    onChange({ ...output, piiFindings: updated });
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Compliance Notes */}
      {complianceNotes && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
        >
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/70" : "text-slate-700"}`}>{complianceNotes}</p>
        </div>
      )}

      {/* PII Findings */}
      {piiFindings.length > 0 && (
        <div>
          <label className={labelClass}>PII &amp; Sensitivity Findings ({piiFindings.length} fields)</label>
          <div className="space-y-2">
            {piiFindings.map((rule, i) => {
              const classStyle = CLASSIFICATION_STYLE[rule.classification] ?? CLASSIFICATION_STYLE.Internal;
              return (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{
                    ...cardStyle,
                    opacity: rule.overridden ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{ background: classStyle.bg, color: classStyle.text, border: `1px solid ${classStyle.border}` }}
                        >
                          {rule.classification}
                        </span>
                        <span className={`text-xs font-mono font-semibold ${isDark ? "text-white/85" : "text-slate-800"}`}>{rule.field}</span>
                      </div>
                      <p className={`text-xs ${isDark ? "text-white/55" : "text-slate-600"}`}>
                        <span className="font-medium">Masking:</span>{" "}{rule.maskingRule}
                      </p>
                      {rule.approvalRequired && !rule.overridden && (
                        <p className="text-[10px] mt-1 text-amber-400">Requires approval for access</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleOverride(i)}
                      className="flex items-center gap-1 flex-shrink-0 text-[10px] transition-colors"
                      style={{ color: rule.overridden ? "#22c55e" : isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}
                    >
                      {rule.overridden
                        ? <><ToggleRight className="w-4 h-4" /><span>Overridden</span></>
                        : <><ToggleLeft className="w-4 h-4" /><span>Override</span></>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Access Control Matrix */}
      {Object.keys(accessMatrix).length > 0 && (
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              Access Control Matrix
            </span>
          </label>
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="divide-y" style={{ divideColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              {Object.entries(accessMatrix).map(([role, permissions]) => (
                <div key={role} className="flex items-start gap-4 px-4 py-2.5">
                  <span className={`text-xs font-semibold w-40 flex-shrink-0 ${isDark ? "text-white/80" : "text-slate-800"}`}>{role}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(permissions as string[]).map((perm, j) => (
                      <span
                        key={j}
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approval Requirements */}
      {approvalReqs.length > 0 && (
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Approval Requirements
            </span>
          </label>
          <div className="space-y-1.5">
            {approvalReqs.map((req, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? "text-white/60" : "text-slate-700"}`}>{req}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
