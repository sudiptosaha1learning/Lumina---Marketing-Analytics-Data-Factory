"use client";

import { useState, useRef } from "react";
import { Cpu, Zap, ChevronRight, CheckCircle } from "lucide-react";
import { reasoningSteps, missions as allMissions, type Region } from "@/lib/dashboard-data";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { cn } from "@/lib/utils";

interface ReasoningEngineProps {
  onComplete: () => void;
  onHighlightModels: (ids: string[]) => void;
  region: Region;
}

export function ReasoningEngine({ onComplete, onHighlightModels, region }: ReasoningEngineProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isThinking, setIsThinking] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const totalCustomers = allMissions.reduce((sum, m) => sum + (m.targetCustomers[region] ?? 0), 0);

  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.60)";
  const textMuted = isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.45)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const logBg = isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)";
  const logBorder = isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)";
  const stepTextActive = isDark ? "#93c5fd" : "#1d4ed8";
  const stepTextDone = isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.50)";
  const stepNum = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)";

  const startSynthesis = () => {
    setIsThinking(true);
    setVisibleSteps([]);
    setIsComplete(false);
    setProgress(0);
    onHighlightModels([]);

    reasoningSteps.forEach((step) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step.id]);
        setProgress(Math.round((step.id / reasoningSteps.length) * 100));
        if (step.models.length > 0) onHighlightModels(step.models);
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
        if (step.id === reasoningSteps.length) {
          setTimeout(() => setIsComplete(true), 600);
        }
      }, step.delay);
    });
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        background: isThinking
          ? isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)"
          : surfaceBg,
        border: isThinking
          ? "1px solid rgba(59,130,246,0.3)"
          : surfaceBorder,
        backdropFilter: "blur(16px)",
        boxShadow: isThinking
          ? isDark ? "0 0 40px rgba(59,130,246,0.12)" : "0 0 30px rgba(59,130,246,0.08)"
          : isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${dividerColor}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{ background: isThinking ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.12)" }}
          >
            <Cpu className={cn("w-5 h-5 text-blue-500", isThinking && "animate-pulse")} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm" style={{ color: textPrimary }}>
              Meridian Reasoning Engine
            </h3>
            <p className="text-xs" style={{ color: textMuted }}>
              Cross-model synthesis &amp; mission generation
            </p>
          </div>
        </div>

        {isThinking && !isComplete && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <span className="text-blue-500 text-xs font-medium">Thinking...</span>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600 text-xs font-medium">Synthesis Complete</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {!isThinking && !isComplete && (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                The Reasoning Engine synthesises all 8 intelligence models simultaneously, identifies cross-model patterns, and generates prioritised strategic missions with full explainability chains.
              </p>
            </div>
            <button
              onClick={startSynthesis}
              className="flex items-center gap-3 px-7 py-4 rounded-2xl font-heading font-semibold text-sm text-white transition-all duration-200 hover:scale-105 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 0 24px rgba(59,130,246,0.4), 0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <Zap className="w-4.5 h-4.5" fill="currentColor" />
              SYNTHESISE MISSIONS
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isThinking && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: textMuted }}>Processing models...</span>
                <span className="text-blue-500 text-xs font-semibold">{progress}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                    boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                  }}
                />
              </div>
            </div>

            {/* Log */}
            <div
              ref={logRef}
              className="h-48 overflow-y-auto rounded-xl p-4 scrollbar-thin space-y-2 font-mono"
              style={{ background: logBg, border: logBorder }}
            >
              {visibleSteps.map((stepId) => {
                const step = reasoningSteps.find((s) => s.id === stepId);
                if (!step) return null;
                const isLast = stepId === Math.max(...visibleSteps);
                return (
                  <div key={stepId}
                    className="flex items-start gap-2 text-[11px] leading-relaxed"
                    style={{ color: isLast ? stepTextActive : stepTextDone }}
                  >
                    <span className="select-none flex-shrink-0" style={{ color: stepNum }}>
                      {String(stepId).padStart(2, "0")}
                    </span>
                    <span className={cn(isLast && "animate-pulse")}>{step.text}</span>
                    {isLast && !isComplete && (
                      <span className="text-blue-500"
                        style={{ animation: "typing-cursor 1s ease-in-out infinite" }}>_</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete action */}
            {isComplete && (
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <div>
                  <div className="text-green-600 font-semibold text-sm font-heading">
                    3 Strategic Missions Generated
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: textSecondary }}>
                    Combined revenue potential: $72.2M · Confidence: 91.3%
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-green-600">
                      Opportunity Cluster Detected for {totalCustomers.toLocaleString()} Customers
                    </span>
                  </div>
                </div>
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 0 16px rgba(16,185,129,0.35)",
                  }}
                >
                  View Missions
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
