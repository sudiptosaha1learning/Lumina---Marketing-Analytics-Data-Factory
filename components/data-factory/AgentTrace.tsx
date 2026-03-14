"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import {
  Brain, Wrench, CheckCircle2, Loader2, ChevronDown, ChevronUp,
  Database, Search, BarChart3, Shield, FileText, Zap, Code2,
  TestTubeDiagonal, Globe, RefreshCw, AlertCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

export type TraceEventType =
  | "thinking"
  | "tool_call_start"
  | "tool_call_complete"
  | "tool_call_error"
  | "model_output";

export interface TraceEvent {
  id: string;
  type: TraceEventType;
  timestamp: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: Record<string, unknown>;
  text?: string;
  durationMs?: number;
}

interface Props {
  events: TraceEvent[];
  isStreaming: boolean;
  modelId?: string;
  stepLabel?: string;
  defaultOpen?: boolean;
}

// ── Tool metadata ─────────────────────────────────────────────────────────

const TOOL_META: Record<string, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  description: string;
}> = {
  searchDataCatalog: {
    icon: Search, label: "Search Data Catalog", color: "#60a5fa", bg: "rgba(59,130,246,0.12)",
    description: "Querying JLR enterprise catalog for matching source tables",
  },
  profileDataSource: {
    icon: Database, label: "Profile Data Source", color: "#a78bfa", bg: "rgba(124,58,237,0.12)",
    description: "Retrieving schema, field definitions, and quality metrics",
  },
  computeQualityScore: {
    icon: BarChart3, label: "Compute Quality Score", color: "#34d399", bg: "rgba(16,185,129,0.12)",
    description: "Analysing null rates, referential integrity, and freshness",
  },
  generateSQLTransform: {
    icon: Code2, label: "Generate SQL Transform", color: "#fb923c", bg: "rgba(249,115,22,0.12)",
    description: "Producing dbt-compatible SQL for pipeline stage",
  },
  runValidationTest: {
    icon: TestTubeDiagonal, label: "Run Validation Test", color: "#f472b6", bg: "rgba(236,72,153,0.12)",
    description: "Executing data quality assertion against target field",
  },
  lookupKPIGlossary: {
    icon: FileText, label: "Lookup KPI Glossary", color: "#fbbf24", bg: "rgba(245,158,11,0.12)",
    description: "Fetching approved business definition and formula",
  },
  checkGDPRCompliance: {
    icon: Shield, label: "Check GDPR Compliance", color: "#f87171", bg: "rgba(239,68,68,0.12)",
    description: "Retrieving masking rules, retention periods, and DPO requirements",
  },
  estimateCardinality: {
    icon: Zap, label: "Estimate Cardinality", color: "#2dd4bf", bg: "rgba(20,184,166,0.12)",
    description: "Analysing field distribution to inform model design decisions",
  },
};

const TOOL_ICON_DEFAULT = Globe;
const TOOL_COLOR_DEFAULT = "#94a3b8";

// ── Duration formatter ────────────────────────────────────────────────────

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Tool call row ─────────────────────────────────────────────────────────

function ToolCallRow({
  event,
  isDark,
  isLast,
}: {
  event: TraceEvent;
  isDark: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = event.toolName ? TOOL_META[event.toolName] : null;
  const Icon = meta?.icon ?? TOOL_ICON_DEFAULT;
  const color = meta?.color ?? TOOL_COLOR_DEFAULT;
  const bg = meta?.bg ?? "rgba(148,163,184,0.1)";
  const isRunning = event.type === "tool_call_start";
  const isError = event.type === "tool_call_error";
  const isComplete = event.type === "tool_call_complete";

  return (
    <div className="flex items-start gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: bg, border: `1px solid ${color}30` }}
        >
          {isRunning
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color }} />
            : isError
              ? <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              : <Icon className="w-3.5 h-3.5" style={{ color }} />
          }
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 my-1"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", minHeight: 16 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color }}
          >
            {meta?.label ?? event.toolName ?? "Tool"}
          </span>
          {isRunning && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium animate-pulse" style={{ color }}>
              <span className="w-1 h-1 rounded-full inline-block animate-pulse" style={{ background: color }} />
              running
            </span>
          )}
          {isComplete && event.durationMs && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${isDark ? "bg-white/[0.06] text-white/35" : "bg-black/[0.05] text-slate-400"}`}>
              {fmtDuration(event.durationMs)}
            </span>
          )}
          {isError && (
            <span className="text-[9px] font-semibold text-red-400 px-1.5 py-0.5 rounded-full bg-red-500/10">error</span>
          )}
          {isComplete && (
            <span className="text-[9px] font-semibold text-green-400 px-1.5 py-0.5 rounded-full bg-green-500/10">done</span>
          )}
        </div>

        <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}>
          {meta?.description ?? "Executing tool"}
        </p>

        {/* Expandable input/output */}
        {(event.toolInput || event.toolOutput) && (
          <div className="mt-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1 text-[9px] font-medium transition-colors ${isDark ? "text-white/25 hover:text-white/50" : "text-slate-400 hover:text-slate-600"}`}
            >
              {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              {expanded ? "Collapse" : "Inspect"} {event.toolInput ? "input" : ""}{event.toolInput && event.toolOutput ? " / " : ""}{event.toolOutput ? "output" : ""}
            </button>
            {expanded && (
              <div className="mt-1.5 space-y-1.5">
                {event.toolInput && (
                  <div>
                    <div className={`text-[8px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/25" : "text-slate-400"}`}>Input</div>
                    <pre
                      className="text-[9px] font-mono leading-relaxed rounded-lg px-3 py-2 overflow-x-auto"
                      style={{
                        background: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.04)",
                        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
                        color: isDark ? "rgba(147,197,253,0.8)" : "#1d4ed8",
                      }}
                    >
                      {JSON.stringify(event.toolInput, null, 2)}
                    </pre>
                  </div>
                )}
                {event.toolOutput && (
                  <div>
                    <div className={`text-[8px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/25" : "text-slate-400"}`}>Output</div>
                    <pre
                      className="text-[9px] font-mono leading-relaxed rounded-lg px-3 py-2 overflow-x-auto max-h-40"
                      style={{
                        background: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.04)",
                        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
                        color: isDark ? "rgba(134,239,172,0.8)" : "#166534",
                      }}
                    >
                      {JSON.stringify(event.toolOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Model info badge ──────────────────────────────────────────────────────

function ModelBadge({ modelId, isDark }: { modelId: string; isDark: boolean }) {
  const [provider, model] = modelId.includes("/") ? modelId.split("/") : ["", modelId];
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <Brain className="w-3 h-3 text-indigo-400 flex-shrink-0" />
      <div className="flex items-center gap-1">
        {provider && (
          <span className={`text-[9px] font-medium uppercase tracking-wider ${isDark ? "text-white/30" : "text-slate-400"}`}>{provider}</span>
        )}
        {provider && <span className={`text-[9px] ${isDark ? "text-white/20" : "text-slate-300"}`}>/</span>}
        <span className={`text-[10px] font-semibold ${isDark ? "text-white/65" : "text-slate-700"}`}>{model}</span>
      </div>
      <div
        className="ml-1 w-1.5 h-1.5 rounded-full"
        style={{ background: "#22c55e", boxShadow: "0 0 4px #22c55e" }}
      />
    </div>
  );
}

// ── Main AgentTrace panel ─────────────────────────────────────────────────

export function AgentTrace({ events, isStreaming, modelId = "openai/gpt-4o", stepLabel, defaultOpen = true }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(defaultOpen);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && isStreaming) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [events, open, isStreaming]);

  const toolCalls = events.filter(e =>
    e.type === "tool_call_start" || e.type === "tool_call_complete" || e.type === "tool_call_error"
  );
  const completedCalls = toolCalls.filter(e => e.type === "tool_call_complete").length;
  const totalCalls = new Set(toolCalls.map(e => e.toolName)).size;
  const uniqueTools = [...new Set(events.filter(e => e.toolName).map(e => e.toolName!))];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: isDark ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.02)",
        border: isDark ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(99,102,241,0.18)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
        style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)" }}
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
          <Wrench className="w-3 h-3 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-indigo-400">
              Agent Tool Activity
            </span>
            {stepLabel && (
              <span className={`text-[9px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
                — {stepLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tool call count */}
          {uniqueTools.length > 0 && (
            <div className="flex items-center gap-1.5">
              {uniqueTools.slice(0, 4).map(t => {
                const meta = TOOL_META[t];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div
                    key={t}
                    title={meta.label}
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="w-2.5 h-2.5" style={{ color: meta.color }} />
                  </div>
                );
              })}
              {uniqueTools.length > 4 && (
                <span className={`text-[9px] font-medium ${isDark ? "text-white/30" : "text-slate-400"}`}>
                  +{uniqueTools.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Status badge */}
          {isStreaming ? (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              live
            </span>
          ) : completedCalls > 0 ? (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {completedCalls} tool{completedCalls > 1 ? "s" : ""}
            </span>
          ) : null}

          {open ? <ChevronUp className="w-3 h-3 text-indigo-400/50" /> : <ChevronDown className="w-3 h-3 text-indigo-400/50" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pt-3 pb-4">
          {/* Model info row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <ModelBadge modelId={modelId} isDark={isDark} />
            <div className="flex items-center gap-1.5">
              <RefreshCw className={`w-3 h-3 ${isDark ? "text-white/25" : "text-slate-300"}`} />
              <span className={`text-[9px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
                {totalCalls} tool type{totalCalls !== 1 ? "s" : ""} · {completedCalls}/{toolCalls.filter((e, i, arr) => arr.findIndex(a => a.toolName === e.toolName && a.type === "tool_call_start") === i).length || completedCalls} completed
              </span>
            </div>
          </div>

          {/* Empty state */}
          {toolCalls.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Brain className={`w-6 h-6 ${isDark ? "text-white/15" : "text-slate-300"}`} />
              <p className={`text-[10px] text-center ${isDark ? "text-white/30" : "text-slate-400"}`}>
                No tool calls recorded for this step.
              </p>
            </div>
          )}

          {isStreaming && toolCalls.length === 0 && (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
              <span className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-500"}`}>
                Agent is reasoning — tool invocations will appear here...
              </span>
            </div>
          )}

          {/* Tool call timeline */}
          {toolCalls.length > 0 && (
            <div className="space-y-0">
              {toolCalls.map((event, i) => (
                <ToolCallRow
                  key={event.id}
                  event={event}
                  isDark={isDark}
                  isLast={i === toolCalls.length - 1 && !isStreaming}
                />
              ))}
              {isStreaming && (
                <div className="flex items-center gap-3 pl-1 py-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  </div>
                  <span className={`text-[10px] ${isDark ? "text-white/35" : "text-slate-400"}`}>
                    Agent is deciding next action...
                  </span>
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
