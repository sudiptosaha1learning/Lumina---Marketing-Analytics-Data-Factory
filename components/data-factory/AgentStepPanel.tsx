"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import {
  type AgentStepId,
  type AgentStep,
  AGENT_STEP_DEFINITIONS,
} from "@/lib/data-product-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, XCircle, RotateCcw, Loader2, ChevronDown,
  ChevronUp, ShieldAlert, Terminal, Sparkles, Brain, Zap,
  Eye, EyeOff, ArrowRight, Clock, User,
} from "lucide-react";

import { OpportunityPanel }   from "./panels/OpportunityPanel";
import { PersonaPanel }        from "./panels/PersonaPanel";
import { DiscoveryPanel }      from "./panels/DiscoveryPanel";
import { QualityPanel }        from "./panels/QualityPanel";
import { KPIPanel }            from "./panels/KPIPanel";
import { ModelPanel }          from "./panels/ModelPanel";
import { PipelinePanel }       from "./panels/PipelinePanel";
import { ValidationPanel }     from "./panels/ValidationPanel";
import { DocumentationPanel }  from "./panels/DocumentationPanel";
import { GovernancePanel }     from "./panels/GovernancePanel";
import { PublishingPanel }     from "./panels/PublishingPanel";

// ── Types ─────────────────────────────────────────────────────────────────

interface Props {
  stepId: AgentStepId;
  step: AgentStep;
  streamingText: string;
  isStreaming: boolean;
  onApprove: (stepId: AgentStepId, editedOutput?: Record<string, unknown>) => void;
  onReject: (stepId: AgentStepId, note?: string) => void;
}

interface ThoughtEntry {
  type: "thinking" | "action" | "observation" | "result";
  text: string;
  ts: number;
}

// ── Panel renderer ────────────────────────────────────────────────────────

function renderPanel(
  stepId: AgentStepId,
  output: Record<string, unknown>,
  onChange: (updated: Record<string, unknown>) => void,
) {
  switch (stepId) {
    case "opportunity":   return <OpportunityPanel   output={output} onChange={onChange} />;
    case "persona":       return <PersonaPanel       output={output} onChange={onChange} />;
    case "discovery":     return <DiscoveryPanel     output={output} onChange={onChange} />;
    case "quality":       return <QualityPanel       output={output} onChange={onChange} />;
    case "kpi":           return <KPIPanel           output={output} onChange={onChange} />;
    case "model":         return <ModelPanel         output={output} onChange={onChange} />;
    case "pipeline":      return <PipelinePanel      output={output} onChange={onChange} />;
    case "validation":    return <ValidationPanel    output={output} onChange={onChange} />;
    case "documentation": return <DocumentationPanel output={output} onChange={onChange} />;
    case "governance":    return <GovernancePanel    output={output} onChange={onChange} />;
    case "publishing":    return <PublishingPanel    output={output} onChange={onChange} />;
    default: return null;
  }
}

// ── Parse chain-of-thought lines from raw stream text ────────────────────

function parseThoughts(raw: string): ThoughtEntry[] {
  const lines = raw.split("\n").filter(Boolean);
  const entries: ThoughtEntry[] = [];
  let now = Date.now() - lines.length * 600;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("{") || trimmed.startsWith("[")) continue;

    const type: ThoughtEntry["type"] =
      trimmed.startsWith("Action:") || trimmed.startsWith("Tool:") || trimmed.startsWith("Calling") ? "action"
      : trimmed.startsWith("Observation:") || trimmed.startsWith("Result:") ? "observation"
      : trimmed.startsWith("Thought:") || trimmed.startsWith("Reasoning:") || trimmed.startsWith("I need") || trimmed.startsWith("Let me") || trimmed.startsWith("First") || trimmed.startsWith("To ") ? "thinking"
      : trimmed.length > 30 ? "thinking"
      : "observation";

    entries.push({ type, text: trimmed.replace(/^(Thought:|Action:|Observation:|Result:|Reasoning:)\s*/i, ""), ts: now });
    now += 600;
  }
  return entries.slice(-18); // keep last 18 entries for readability
}

// ── Thought entry colours & icons ─────────────────────────────────────────

const THOUGHT_META: Record<ThoughtEntry["type"], { icon: React.ElementType; color: string; label: string }> = {
  thinking:    { icon: Brain,      color: "#818cf8", label: "Reasoning" },
  action:      { icon: Zap,        color: "#f59e0b", label: "Action"    },
  observation: { icon: Eye,        color: "#2dd4bf", label: "Observation" },
  result:      { icon: CheckCircle2, color: "#4ade80", label: "Result"  },
};

// ── Collapsible stream block (shared across states) ───────────────────────

function StreamBlock({
  rawText,
  isStreaming,
  isDark,
  defaultOpen = false,
}: {
  rawText: string;
  isStreaming: boolean;
  isDark: boolean;
  defaultOpen?: boolean;
}) {
  const [streamOpen, setStreamOpen] = useState(defaultOpen);
  const [cotOpen, setCotOpen] = useState(true);

  const thoughts = parseThoughts(rawText);

  if (!rawText && !isStreaming) return null;

  return (
    <div className="space-y-2">
      {/* Chain-of-thought panel */}
      {thoughts.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: isDark ? "rgba(129,140,248,0.04)" : "rgba(99,102,241,0.03)",
            border: isDark ? "1px solid rgba(129,140,248,0.15)" : "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <button
            onClick={() => setCotOpen(!cotOpen)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
            style={{ background: isDark ? "rgba(129,140,248,0.06)" : "rgba(99,102,241,0.05)" }}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="flex-1 text-[11px] font-semibold text-indigo-400">
              Agent Chain of Thought
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded mr-2 font-medium ${isDark ? "bg-white/[0.06] text-white/40" : "bg-black/[0.06] text-slate-500"}`}>
              {thoughts.length} steps
            </span>
            {isStreaming && (
              <span className="flex items-center gap-1 text-[9px] text-indigo-400 mr-2">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                live
              </span>
            )}
            {cotOpen ? <ChevronUp className="w-3 h-3 text-indigo-400/50" /> : <ChevronDown className="w-3 h-3 text-indigo-400/50" />}
          </button>

          {cotOpen && (
            <div className="px-3 py-3 space-y-1.5">
              {thoughts.map((entry, i) => {
                const meta = THOUGHT_META[entry.type];
                const Icon = meta.icon;
                return (
                  <div key={i} className="flex items-start gap-2">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                      >
                        <Icon className="w-2.5 h-2.5" style={{ color: meta.color }} />
                      </div>
                      {i < thoughts.length - 1 && (
                        <div className="w-px flex-1 mt-0.5 mb-0" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", minHeight: 8 }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wide mr-1.5"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      {i === thoughts.length - 1 && isStreaming && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400/60 mr-1.5">
                          <ArrowRight className="w-2 h-2" />
                          running
                        </span>
                      )}
                      <span className={`text-[10px] leading-relaxed ${isDark ? "text-white/55" : "text-slate-600"}`}>{entry.text}</span>
                    </div>
                  </div>
                );
              })}
              {isStreaming && (
                <div className="flex items-center gap-1.5 pl-7 pt-1">
                  <Loader2 className="w-2.5 h-2.5 text-indigo-400 animate-spin" />
                  <span className="text-[9px] text-indigo-400/60">Agent reasoning...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Raw stream output (collapsible) */}
      <div>
        <button
          onClick={() => setStreamOpen(!streamOpen)}
          className={`flex items-center gap-1.5 text-[10px] transition-colors ${isDark ? "text-white/30 hover:text-white/55" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Terminal className="w-3 h-3" />
          {streamOpen ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
          {streamOpen ? "Collapse" : "Show"} raw agent stream
          {isStreaming && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-0.5" />}
        </button>
        {streamOpen && (
          <div
            className="mt-1.5 rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-auto max-h-64"
            style={{
              background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
              color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
            }}
          >
            {rawText || <span className="opacity-40">Waiting for agent output...</span>}
            {isStreaming && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-blue-400 animate-pulse" style={{ verticalAlign: "text-bottom" }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Approved step collapsed summary ───────────────────────────────────────

function ApprovedCollapsible({
  stepId, step, isDark,
}: { stepId: AgentStepId; step: AgentStep; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  const def = AGENT_STEP_DEFINITIONS[stepId];
  const approvedOutput = step.editedOutput ?? step.output;
  const confidenceColor =
    (step.confidence ?? 0) >= 85 ? "#22c55e" :
    (step.confidence ?? 0) >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.85)",
        border: "1px solid rgba(34,197,94,0.2)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center gap-3 text-left transition-colors"
        style={{ background: "rgba(34,197,94,0.05)" }}
      >
        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{def.label}</div>
          <div className="text-xs text-green-400">
            Approved{step.editedOutput ? " with edits" : ""}
            {step.interventions.length > 0 && <span className={`ml-2 ${isDark ? "text-white/35" : "text-slate-400"}`}>· {step.interventions.length} intervention{step.interventions.length > 1 ? "s" : ""}</span>}
          </div>
        </div>
        {step.confidence !== null && (
          <span className="text-[10px] font-semibold" style={{ color: confidenceColor }}>{step.confidence}%</span>
        )}
        {step.completedAt && (
          <div className={`flex items-center gap-1 text-[9px] ${isDark ? "text-white/25" : "text-slate-400"}`}>
            <Clock className="w-2.5 h-2.5" />
            {new Date(step.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-green-400/50 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-green-400/50 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 py-4 space-y-5 border-t" style={{ borderColor: "rgba(34,197,94,0.1)" }}>
          {approvedOutput && renderPanel(stepId, approvedOutput, () => {})}

          {/* Interventions log */}
          {step.interventions.length > 0 && (
            <div>
              <div className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${isDark ? "text-white/30" : "text-slate-400"}`}>Intervention Log</div>
              <div className="space-y-1.5">
                {step.interventions.map((iv) => (
                  <div key={iv.id} className="flex items-start gap-2 text-[10px]">
                    <User className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                    <div>
                      <span className={`font-semibold mr-1.5 ${isDark ? "text-white/60" : "text-slate-700"}`}>{iv.userId}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-semibold mr-1.5 uppercase"
                        style={
                          iv.type === "approve" ? { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                          : iv.type === "edit" ? { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                          : { background: "rgba(239,68,68,0.1)", color: "#f87171" }
                        }
                      >
                        {iv.type}
                      </span>
                      {iv.note && <span className={isDark ? "text-white/45" : "text-slate-500"}>{iv.note}</span>}
                      <span className={`ml-1.5 ${isDark ? "text-white/25" : "text-slate-400"}`}>{new Date(iv.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function AgentStepPanel({
  stepId, step, streamingText, isStreaming, onApprove, onReject,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const def = AGENT_STEP_DEFINITIONS[stepId];

  const [editedOutput, setEditedOutput] = useState<Record<string, unknown> | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  // Reset local edit state when stepId changes
  useEffect(() => {
    setEditedOutput(null);
    setHasEdits(false);
    setShowRejectForm(false);
    setRejectNote("");
    setShowRawJSON(false);
  }, [stepId]);

  const displayOutput = editedOutput ?? step.editedOutput ?? step.output;

  const handleOutputChange = (updated: Record<string, unknown>) => {
    setEditedOutput(updated);
    setHasEdits(true);
  };

  const confidenceColor =
    (step.confidence ?? 0) >= 85 ? "#22c55e" :
    (step.confidence ?? 0) >= 70 ? "#f59e0b" : "#ef4444";

  // ── APPROVED: collapsible summary ────────────────────────────────────────
  if (step.status === "approved") {
    return <ApprovedCollapsible stepId={stepId} step={step} isDark={isDark} />;
  }

  // ── RUNNING ───────────────────────────────────────────────────────────────
  if (step.status === "running") {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(59,130,246,0.25)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-4 border-b"
          style={{ background: "rgba(59,130,246,0.08)", borderColor: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>
          <div className="flex-1">
            <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{def.label}</div>
            <div className={`text-xs ${isDark ? "text-white/45" : "text-slate-500"}`}>{def.agentName} is running...</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-blue-400 font-medium">AI generating</span>
          </div>
        </div>

        <div className="p-6">
          <StreamBlock rawText={streamingText} isStreaming={isStreaming} isDark={isDark} defaultOpen={true} />
        </div>
      </div>
    );
  }

  // ── AWAITING REVIEW ───────────────────────────────────────────────────────
  if (step.status === "awaiting_review" && displayOutput) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex flex-wrap items-center gap-3 border-b"
          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
        >
          <div>
            <div className={`font-heading font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{def.label}</div>
            <div className={`text-xs ${isDark ? "text-white/45" : "text-slate-500"}`}>{def.agentName}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {step.confidence !== null && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: `${confidenceColor}18`, border: `1px solid ${confidenceColor}40`, color: confidenceColor }}
              >
                {step.confidence}% confidence
              </div>
            )}
            {hasEdits && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
                Edited
              </Badge>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
              <ShieldAlert className="w-3 h-3" />
              Awaiting Review
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Agent stream + chain-of-thought (collapsed by default once output is ready) */}
          <StreamBlock rawText={streamingText} isStreaming={isStreaming} isDark={isDark} defaultOpen={false} />

          {/* Output panel */}
          {renderPanel(stepId, displayOutput, handleOutputChange)}

          {/* Raw JSON toggle */}
          <div>
            <button
              onClick={() => setShowRawJSON(!showRawJSON)}
              className={`flex items-center gap-1.5 text-[10px] transition-colors ${isDark ? "text-white/30 hover:text-white/55" : "text-slate-400 hover:text-slate-600"}`}
            >
              {showRawJSON ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showRawJSON ? "Hide" : "Show"} raw JSON output
            </button>
            {showRawJSON && (
              <pre
                className="mt-2 rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-auto max-h-64"
                style={{
                  background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
                }}
              >
                {JSON.stringify(displayOutput, null, 2)}
              </pre>
            )}
          </div>

          {/* Reject form */}
          {showRejectForm && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-xs font-medium text-red-400">Reject &amp; re-run this step. Add a note for the agent (optional):</p>
              <Textarea
                placeholder="e.g. The scope is too broad, focus only on Range Rover customers..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
                className={`text-xs resize-none ${isDark ? "bg-black/30 border-red-500/20 text-white placeholder:text-white/25" : "bg-white border-red-300 text-slate-900 placeholder:text-slate-400"}`}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="destructive" onClick={() => { onReject(stepId, rejectNote || undefined); setShowRejectForm(false); setRejectNote(""); }} className="text-xs gap-1.5">
                  <RotateCcw className="w-3 h-3" />
                  Reject &amp; re-run
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)} className={`text-xs ${isDark ? "text-white/50 hover:text-white/80" : "text-slate-500"}`}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center gap-2 text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
            {step.interventions.length > 0 && (
              <span>{step.interventions.length} intervention{step.interventions.length > 1 ? "s" : ""} recorded</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!showRejectForm && (
              <Button
                size="sm" variant="outline"
                onClick={() => setShowRejectForm(true)}
                className={`text-xs gap-1.5 ${isDark ? "border-white/10 text-white/60 hover:text-white/90 hover:bg-white/[0.06]" : "border-slate-200 text-slate-600 hover:text-slate-900"}`}
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                Reject &amp; re-run
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onApprove(stepId, hasEdits ? (editedOutput ?? undefined) : undefined)}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {hasEdits ? "Approve with edits" : "Approve & continue"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── FALLBACK / PENDING ────────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl p-8 flex items-center justify-center"
      style={{
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.8)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <span className={`text-sm ${isDark ? "text-white/35" : "text-slate-400"}`}>
        This step has not started yet.
      </span>
    </div>
  );
}
