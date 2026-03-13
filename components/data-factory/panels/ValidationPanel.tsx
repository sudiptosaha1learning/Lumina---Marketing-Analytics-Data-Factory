"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { ValidationOutput, TestCase } from "@/lib/data-product-types";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const TEST_TYPE_LABEL: Record<string, string> = {
  null_check:   "Null Check",
  range_check:  "Range Check",
  referential:  "Referential",
  uniqueness:   "Uniqueness",
  freshness:    "Freshness",
  custom:       "Custom",
};

export function ValidationPanel({ output }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<ValidationOutput>;

  const tests = (data.testSuite as TestCase[]) ?? [];
  const passRate = (data.passRate as number) ?? 0;
  const anomalies = (data.anomalies as string[]) ?? [];
  const summary = (data.summary as string) ?? "";

  const passCount = tests.filter((t) => t.status === "pass").length;
  const failCount = tests.filter((t) => t.status === "fail").length;
  const pendingCount = tests.filter((t) => t.status === "pending").length;

  const rateColor = passRate >= 90 ? "#22c55e" : passRate >= 75 ? "#f59e0b" : "#ef4444";

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${rateColor}12`, border: `3px solid ${rateColor}40` }}
        >
          <div className="text-center">
            <div className="font-heading font-bold text-2xl" style={{ color: rateColor }}>{passRate}%</div>
            <div className={`text-[8px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}>Pass Rate</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/65" : "text-slate-700"}`}>{summary}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{passCount} passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3 h-3 text-red-400" />
              <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{failCount} failed</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{pendingCount} pending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Suite */}
      <div>
        <label className={labelClass}>Test Suite ({tests.length} tests)</label>
        <div className="space-y-1.5">
          {tests.map((test, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5"
              style={{
                ...cardStyle,
                borderColor: test.status === "fail"
                  ? "rgba(239,68,68,0.25)"
                  : test.status === "pass"
                    ? isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                    : "rgba(245,158,11,0.2)",
                background: test.status === "fail"
                  ? "rgba(239,68,68,0.05)"
                  : cardStyle.background,
              }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {test.status === "pass"
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  : test.status === "fail"
                    ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                    : <Clock className="w-3.5 h-3.5 text-amber-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium ${isDark ? "text-white/85" : "text-slate-800"}`}>{test.name}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                    style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}
                  >
                    {TEST_TYPE_LABEL[test.type] ?? test.type}
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-slate-500"}`}>{test.target}</span>
                </div>
                <p className={`text-xs mt-0.5 ${test.status === "fail" ? "text-red-400" : isDark ? "text-white/50" : "text-slate-600"}`}>
                  {test.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div>
          <label className={labelClass}>Anomalies Detected</label>
          <div className="space-y-1.5">
            {anomalies.map((anomaly, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? "text-white/65" : "text-slate-700"}`}>{anomaly}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
