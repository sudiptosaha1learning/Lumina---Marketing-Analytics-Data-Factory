"use client";

import { useState, useEffect, useRef } from "react";
import { Cpu, Zap, ChevronRight, CheckCircle } from "lucide-react";
import { reasoningSteps } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface ReasoningEngineProps {
  onComplete: () => void;
  onHighlightModels: (ids: string[]) => void;
}

export function ReasoningEngine({ onComplete, onHighlightModels }: ReasoningEngineProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const startSynthesis = () => {
    setIsThinking(true);
    setVisibleSteps([]);
    setIsComplete(false);
    setProgress(0);
    onHighlightModels([]);

    const totalDuration = 9200;

    reasoningSteps.forEach((step) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step.id]);
        setProgress(Math.round((step.id / reasoningSteps.length) * 100));
        if (step.models.length > 0) {
          onHighlightModels(step.models);
        }
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
        if (step.id === reasoningSteps.length) {
          setTimeout(() => {
            setIsComplete(true);
          }, 600);
        }
      }, step.delay);
    });
  };

  const handleProceed = () => {
    onComplete();
  };

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all duration-500",
      isThinking
        ? "ring-1 ring-blue-500/40"
        : ""
    )}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: isThinking ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        boxShadow: isThinking ? "0 0 40px rgba(59,130,246,0.12)" : "none",
      }}>

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
            isThinking ? "cobalt-glow-sm" : ""
          )}
            style={{ background: isThinking ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.12)" }}>
            <Cpu className={cn("w-5 h-5 text-blue-400", isThinking && "animate-pulse")} />
          </div>
          <div>
            <h3 className="font-heading text-white font-semibold text-sm">Meridian Reasoning Engine</h3>
            <p className="text-white/40 text-xs">Cross-model synthesis & mission generation</p>
          </div>
        </div>

        {isThinking && !isComplete && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <span className="text-blue-400 text-xs font-medium">Thinking...</span>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-xs font-medium">Synthesis Complete</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {!isThinking && !isComplete && (
          /* Pre-synthesis state */
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-white/55 text-sm leading-relaxed">
                The Reasoning Engine synthesises all 7 intelligence models simultaneously, identifies cross-model patterns, and generates prioritised strategic missions with full explainability chains.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { label: "7 Models", sub: "cross-correlated" },
                  { label: "14,820", sub: "prospects evaluated" },
                  { label: "3 Missions", sub: "will be generated" },
                  { label: "$72.2M", sub: "opportunity scoped" },
                ].map((stat) => (
                  <div key={stat.label} className="px-3 py-2 rounded-xl"
                    style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}>
                    <div className="text-blue-300 font-bold text-sm font-heading">{stat.label}</div>
                    <div className="text-white/40 text-[10px]">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={startSynthesis}
              className="flex items-center gap-3 px-7 py-4 rounded-2xl font-heading font-semibold text-sm text-white transition-all duration-200 hover:scale-105 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 0 24px rgba(59,130,246,0.4), 0 4px 16px rgba(0,0,0,0.4)",
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
                <span className="text-white/40 text-xs">Processing models...</span>
                <span className="text-blue-400 text-xs font-semibold">{progress}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}>
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
            <div ref={logRef}
              className="h-48 overflow-y-auto rounded-xl p-4 scrollbar-thin space-y-2 font-mono"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {visibleSteps.map((stepId) => {
                const step = reasoningSteps.find((s) => s.id === stepId);
                if (!step) return null;
                const isLast = stepId === Math.max(...visibleSteps);
                return (
                  <div key={stepId}
                    className={cn(
                      "flex items-start gap-2 text-[11px] leading-relaxed",
                      isLast ? "text-blue-300" : "text-white/50"
                    )}>
                    <span className="text-white/20 select-none flex-shrink-0">{String(stepId).padStart(2, "0")}</span>
                    <span className={cn(isLast && "animate-pulse")}>{step.text}</span>
                    {isLast && !isComplete && (
                      <span className="text-blue-400" style={{ animation: "typing-cursor 1s ease-in-out infinite" }}>_</span>
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
                  <div className="text-green-400 font-semibold text-sm font-heading">3 Strategic Missions Generated</div>
                  <div className="text-white/50 text-xs mt-0.5">Combined revenue potential: $72.2M · Confidence: 91.3%</div>
                </div>
                <button
                  onClick={handleProceed}
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
