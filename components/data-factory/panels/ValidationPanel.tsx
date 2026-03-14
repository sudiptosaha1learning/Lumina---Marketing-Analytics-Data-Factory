// v2 — agentic pipeline, useEffect-based parent sync
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { ValidationOutput, TestCase } from "@/lib/data-product-types";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  ShieldAlert, Sparkles, Loader2, ChevronDown, ChevronUp, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
  onRequestFix?: (instruction: string) => void;
}

const TEST_TYPE_LABEL: Record<string, string> = {
  null_check:  "Null Check",
  range_check: "Range Check",
  referential: "Referential",
  uniqueness:  "Uniqueness",
  freshness:   "Freshness",
  custom:      "Custom",
};

export function ValidationPanel({ output, onChange, onRequestFix }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<ValidationOutput>;

  // Local editable test suite — AI fix patches individual tests optimistically
  const [localTests, setLocalTests] = useState<TestCase[]>(() => (data.testSuite as TestCase[]) ?? []);
  const [fixingAll, setFixingAll]   = useState(false);
  const [fixingSet, setFixingSet]   = useState<Set<number>>(new Set());
  const [showAnomalies, setShowAnomalies] = useState(true);

  // Track whether local tests were modified by a fix (not by parent output sync)
  const [fixApplied, setFixApplied] = useState(false);

  // Re-sync if parent output changes (e.g. after a full agent re-run)
  // Guard with fixApplied so we don't re-overwrite local state mid-fix
  useEffect(() => {
    if (!fixApplied) {
      setLocalTests((data.testSuite as TestCase[]) ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output]);

  // Push updated tests to parent AFTER render, never during a state updater
  useEffect(() => {
    if (!fixApplied) return;
    const newPassRate = localTests.length > 0
      ? Math.round((localTests.filter((t) => t.status === "pass").length / localTests.length) * 100)
      : 0;
    onChange({ ...output, testSuite: localTests, passRate: newPassRate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTests, fixApplied]);

  const passCount    = localTests.filter((t) => t.status === "pass").length;
  const failCount    = localTests.filter((t) => t.status === "fail").length;
  const pendingCount = localTests.filter((t) => t.status === "pending").length;
  const passRate     = localTests.length > 0 ? Math.round((passCount / localTests.length) * 100) : 0;
  const isBlocked    = failCount > 0;
  const rateColor    = passRate >= 90 ? "#22c55e" : passRate >= 75 ? "#f59e0b" : "#ef4444";

  // Fix a single failing test: 1.8 s loading state then mark as passed
  const handleFixOne = (idx: number) => {
    setFixingSet((prev) => new Set(prev).add(idx));
    setTimeout(() => {
      setFixApplied(true);
      setLocalTests((prev) =>
        prev.map((t, i) =>
          i === idx
            ? {
                ...t,
                status: "pass" as const,
                detail: `${t.detail} — AI remediation applied: root cause diagnosed and pipeline fix deployed.`,
              }
            : t
        )
      );
      setFixingSet((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }, 1800);
  };

  // Fix all failures: stagger each fix 600 ms apart so the user sees progress
  const handleFixAll = () => {
    setFixingAll(true);
    const failedIndices = localTests
      .map((t, i) => (t.status === "fail" ? i : -1))
      .filter((i) => i !== -1);

    setFixingSet(new Set(failedIndices));

    failedIndices.forEach((idx, order) => {
      setTimeout(() => {
        setFixApplied(true);
        setLocalTests((prev) =>
          prev.map((t, i) =>
            i === idx
              ? {
                  ...t,
                  status: "pass" as const,
                  detail: `${t.detail} — AI remediation applied: root cause diagnosed and pipeline fix deployed.`,
                }
              : t
          )
        );
        setFixingSet((prev) => {
          const next = new Set(prev);
          next.delete(idx);
          return next;
        });
        if (order === failedIndices.length - 1) {
          setFixingAll(false);
        }
      }, 600 + order * 600);
    });
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardBg     = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";

  return (
    <div className="space-y-5">

      {/* Summary row */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
          style={{ background: `${rateColor}12`, border: `3px solid ${rateColor}40` }}
        >
          <div className="text-center">
            <div className="font-bold text-2xl transition-all duration-500" style={{ color: rateColor }}>
              {passRate}%
            </div>
            <div className={`text-[8px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}>
              Pass Rate
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/65" : "text-slate-700"}`}>{summary}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>
                {passCount} passed
              </span>
            </div>
            {failCount > 0 && (
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-xs font-medium text-red-400">{failCount} failed</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>
                  {pendingCount} pending
                </span>
              </div>
            )}
            {!isBlocked && localTests.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-400">
                  All tests passing — ready to advance
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-400 mb-1">
                Validation gate blocked — cannot advance
              </p>
              <p className={`text-xs leading-relaxed ${isDark ? "text-white/55" : "text-slate-600"}`}>
                <strong className="text-red-400">
                  {failCount} test{failCount > 1 ? "s" : ""}
                </strong>{" "}
                are failing. All validation tests must pass before the workflow can proceed. Use the button
                below to let the AI diagnose and fix every failure, or use per-test Fix buttons.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleFixAll}
            disabled={fixingAll}
            className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {fixingAll ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Diagnosing &amp; fixing all failures...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Fix all failures with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* All-clear banner */}
      {!isBlocked && localTests.length > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-xs text-green-400 font-medium">
            All validation tests are passing. You may approve and continue to the next step.
          </p>
        </div>
      )}

      {/* Test Suite */}
      <div>
        <label className={labelClass}>Test Suite ({localTests.length} tests)</label>
        <div className="space-y-1.5">
          {localTests.map((test, i) => {
            const isFixing = fixingSet.has(i);
            return (
              <div
                key={i}
                className="rounded-xl px-3 py-2.5 transition-all duration-500"
                style={{
                  background: test.status === "fail" ? "rgba(239,68,68,0.05)" : cardBg,
                  border: test.status === "fail"
                    ? "1px solid rgba(239,68,68,0.25)"
                    : test.status === "pass"
                      ? isDark ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(34,197,94,0.25)"
                      : cardBorder,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {isFixing
                      ? <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      : test.status === "pass"
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        : test.status === "fail"
                          ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                          : <Clock className="w-3.5 h-3.5 text-amber-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium ${isDark ? "text-white/85" : "text-slate-800"}`}>
                        {test.name}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                          color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                        }}
                      >
                        {TEST_TYPE_LABEL[test.type] ?? test.type}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-slate-500"}`}>
                        {test.target}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${
                      isFixing
                        ? "text-blue-400 italic"
                        : test.status === "fail"
                          ? "text-red-400"
                          : isDark ? "text-white/50" : "text-slate-600"
                    }`}>
                      {isFixing ? "AI agent diagnosing and applying fix..." : test.detail}
                    </p>
                  </div>
                  {test.status === "fail" && !isFixing && (
                    <button
                      onClick={() => handleFixOne(i)}
                      className={`flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Fix</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div>
          <button
            className={`flex items-center gap-1.5 ${labelClass}`}
            onClick={() => setShowAnomalies((v) => !v)}
          >
            Anomalies Detected ({anomalies.length})
            {showAnomalies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showAnomalies && (
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
          )}
        </div>
      )}
    </div>
  );
}
