"use client";

import { useState, useEffect, useRef } from "react";
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
  Eye, EyeOff, ArrowRight, Clock, User, ArrowLeft, Send,
  Search, Database, BarChart3, Shield, FileText, Cpu,
  AlertTriangle,
} from "lucide-react";

import { AgentTrace, type TraceEvent } from "./AgentTrace";
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
  isViewingApproved?: boolean;
  qualityThreshold?: number;
  traceEvents?: TraceEvent[];
  onApprove: (stepId: AgentStepId, editedOutput?: Record<string, unknown>) => void;
  onReject: (stepId: AgentStepId, note?: string) => void;
  onGoBack: (stepId: AgentStepId) => void;
  onRerunStale?: (stepId: AgentStepId) => void;
}

// ── Panel renderer ────────────────────────────────────────────────────────

function renderPanel(
  stepId: AgentStepId,
  output: Record<string, unknown>,
  onChange: (updated: Record<string, unknown>) => void,
  extra?: {
    qualityThreshold?: number;
    onRequestRemediation?: (instruction: string) => void;
    onRequestFix?: (instruction: string) => void;
  }
) {
  switch (stepId) {
    case "opportunity":   return <OpportunityPanel   output={output} onChange={onChange} />;
    case "persona":       return <PersonaPanel       output={output} onChange={onChange} />;
    case "discovery":     return <DiscoveryPanel     output={output} onChange={onChange} />;
    case "quality":       return <QualityPanel       output={output} onChange={onChange} qualityThreshold={extra?.qualityThreshold} onRequestRemediation={extra?.onRequestRemediation} />;
    case "kpi":           return <KPIPanel           output={output} onChange={onChange} />;
    case "model":         return <ModelPanel         output={output} onChange={onChange} />;
    case "pipeline":      return <PipelinePanel      output={output} onChange={onChange} />;
    case "validation":    return <ValidationPanel    output={output} onChange={onChange} onRequestFix={extra?.onRequestFix} />;
    case "documentation": return <DocumentationPanel output={output} onChange={onChange} />;
    case "governance":    return <GovernancePanel    output={output} onChange={onChange} />;
    case "publishing":    return <PublishingPanel    output={output} onChange={onChange} />;
    default: return null;
  }
}

// ── Raw stream block ──────────────────────────────────────────────────────

function RawStreamBlock({
  rawText,
  isStreaming,
  isDark,
}: {
  rawText: string;
  isStreaming: boolean;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && isStreaming) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawText, open, isStreaming]);

  if (!rawText && !isStreaming) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-[10px] transition-colors ${isDark ? "text-white/30 hover:text-white/55" : "text-slate-400 hover:text-slate-600"}`}
      >
        <Terminal className="w-3 h-3" />
        {open ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
        {open ? "Collapse" : "Show"} raw agent stream
        {isStreaming && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-0.5" />}
      </button>
      {open && (
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
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}

// ── Human-guided refinement prompt ────────────────────────────────────────

function RefinementPrompt({
  stepId,
  isDark,
  onSubmit,
}: {
  stepId: AgentStepId;
  isDark: boolean;
  onSubmit: (note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const def = AGENT_STEP_DEFINITIONS[stepId];

  const PLACEHOLDERS: Partial<Record<AgentStepId, string>> = {
    opportunity: "e.g. Focus only on Range Rover owners in the UK with contracts expiring in the next 6 months.",
    persona: "e.g. Add a Dealer Relationship Manager persona who uses this at the point of vehicle handover.",
    discovery: "e.g. Also include the Finance Contracts table — we need to see PCP end dates.",
    quality: "e.g. Flag any source with more than 15% null rate on the customer_id field as not suitable.",
    kpi: "e.g. Add a metric for email-to-test-drive conversion rate, segmented by model.",
    model: "e.g. Add a contract_end_date field to the fact table — it is critical for renewal timing.",
    pipeline: "e.g. The pipeline should run at 6am UTC daily and alert if row count drops by more than 10%.",
    validation: "e.g. Add a test that propensity scores for churned customers are always below 0.3.",
    documentation: "e.g. Add a section explaining how the propensity score is calculated for a non-technical audience.",
    governance: "e.g. The Campaign Manager role should only see aggregated scores, not individual customer records.",
    publishing: "e.g. Publish to the Marketing Analytics domain with a Bronze → Gold data tier classification.",
  };

  function handleSubmit() {
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
    setSubmitted(prompt.trim());
    setPrompt("");
    setOpen(false);
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.03)",
        border: isDark ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(59,130,246,0.18)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors"
        style={{ background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.05)" }}
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span className={`flex-1 text-[11px] font-semibold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
          Prompt the {def.agentName}
        </span>
        <span className={`text-[10px] mr-2 ${isDark ? "text-white/35" : "text-slate-400"}`}>
          Human-guided refinement
        </span>
        {submitted && !open && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full mr-2 font-medium"
            style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            1 instruction sent
          </span>
        )}
        {open ? <ChevronUp className="w-3 h-3 text-blue-400/50" /> : <ChevronDown className="w-3 h-3 text-blue-400/50" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3">
          <p className={`text-[11px] leading-relaxed ${isDark ? "text-white/45" : "text-slate-500"}`}>
            Add a natural language instruction to refine the agent&apos;s output. The agent will incorporate your guidance and regenerate this step.
          </p>
          {submitted && (
            <div
              className="rounded-lg px-3 py-2 text-[10px]"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", color: isDark ? "rgba(255,255,255,0.5)" : "#475569" }}
            >
              <span className="font-semibold text-green-400 mr-1.5">Last instruction sent:</span>
              {submitted}
            </div>
          )}
          <Textarea
            placeholder={PLACEHOLDERS[stepId] ?? "Describe what you want the agent to change or add..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className={`text-xs resize-none ${isDark ? "bg-black/30 border-blue-500/20 text-white placeholder:text-white/25 focus-visible:ring-blue-500/40" : "bg-white border-blue-300/50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400/50"}`}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          />
          <div className="flex items-center justify-between">
            <span className={`text-[10px] ${isDark ? "text-white/25" : "text-slate-400"}`}>
              Cmd+Enter to send
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${isDark ? "text-white/40 hover:text-white/60" : "text-slate-500 hover:text-slate-700"}`}
              >
                Cancel
              </button>
              <Button
                size="sm"
                disabled={!prompt.trim()}
                onClick={handleSubmit}
                className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-3 h-3" />
                Send to agent
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Approved panel ────────────────────────────────────────────────────────

function ApprovedPanel({
  stepId, step, isDark, onGoBack, traceEvents = [],
}: { stepId: AgentStepId; step: AgentStep; isDark: boolean; onGoBack: (id: AgentStepId) => void; traceEvents?: TraceEvent[] }) {
  const [logOpen, setLogOpen] = useState(false);
  const [streamOpen, setStreamOpen] = useState(false);
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
      {/* Header */}
      <div
        className="px-6 py-4 flex flex-wrap items-center gap-3 border-b"
        style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.12)" }}
      >
        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{def.label}</div>
          <div className="flex items-center gap-2 text-xs text-green-400 mt-0.5">
            Approved{step.editedOutput ? " with edits" : ""}
            {step.completedAt && (
              <span className={`flex items-center gap-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                <Clock className="w-2.5 h-2.5" />
                {new Date(step.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {step.interventions.length > 0 && (
              <span className={isDark ? "text-white/30" : "text-slate-400"}>
                · {step.interventions.length} intervention{step.interventions.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {step.confidence !== null && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${confidenceColor}18`, border: `1px solid ${confidenceColor}30`, color: confidenceColor }}
          >
            {step.confidence}% confidence
          </span>
        )}
        <button
          onClick={() => onGoBack(stepId)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isDark
              ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/90 border border-white/[0.08]"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <ArrowLeft className="w-3 h-3" />
          Go back &amp; edit
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">

        {/* Agent tool trace — collapsed by default on approved */}
        <AgentTrace
          events={traceEvents}
          isStreaming={false}
          modelId="openai/gpt-4o"
          stepLabel={def.label}
          defaultOpen={false}
        />

        {/* Output (read-only) */}
        {approvedOutput && renderPanel(stepId, approvedOutput, () => {})}

        {/* Intervention log */}
        {step.interventions.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
            <button
              onClick={() => setLogOpen(!logOpen)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-black/[0.02]"}`}
            >
              <User className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              <span className={`flex-1 text-[11px] font-semibold ${isDark ? "text-white/40" : "text-slate-500"}`}>Intervention Log</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded mr-2 ${isDark ? "bg-white/[0.06] text-white/35" : "bg-black/[0.05] text-slate-400"}`}>{step.interventions.length}</span>
              {logOpen ? <ChevronUp className="w-3 h-3 opacity-40" /> : <ChevronDown className="w-3 h-3 opacity-40" />}
            </button>
            {logOpen && (
              <div className="px-4 pb-4 pt-1 space-y-2 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                {step.interventions.map((iv) => (
                  <div key={iv.id} className="flex items-start gap-2 text-[10px]">
                    <User className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                    <div>
                      <span className={`font-semibold mr-1.5 ${isDark ? "text-white/60" : "text-slate-700"}`}>{iv.userId}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold mr-1.5 uppercase" style={iv.type === "approve" ? { background: "rgba(34,197,94,0.1)", color: "#4ade80" } : iv.type === "edit" ? { background: "rgba(245,158,11,0.1)", color: "#fbbf24" } : { background: "rgba(239,68,68,0.1)", color: "#f87171" }}>{iv.type}</span>
                      {iv.note && <span className={isDark ? "text-white/45" : "text-slate-500"}>{iv.note}</span>}
                      <span className={`ml-1.5 ${isDark ? "text-white/25" : "text-slate-400"}`}>{new Date(iv.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Raw stream */}
        <button
          onClick={() => setStreamOpen(!streamOpen)}
          className={`flex items-center gap-1.5 text-[10px] transition-colors ${isDark ? "text-white/25 hover:text-white/50" : "text-slate-300 hover:text-slate-500"}`}
        >
          <Terminal className="w-3 h-3" />
          {streamOpen ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
          {streamOpen ? "Collapse" : "Show"} raw agent output
        </button>
        {streamOpen && approvedOutput && (
          <pre className="rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-auto max-h-48" style={{ background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
            {JSON.stringify(approvedOutput, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function AgentStepPanel({
  stepId, step, streamingText, isStreaming, isViewingApproved,
  qualityThreshold, traceEvents = [], onApprove, onReject, onGoBack, onRerunStale,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const def = AGENT_STEP_DEFINITIONS[stepId];

  const [editedOutput, setEditedOutput] = useState<Record<string, unknown> | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

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

  // Callbacks forwarded to quality/validation panels for AI-driven remediation
  const handleRequestRemediation = (instruction: string) => {
    onReject(stepId, instruction);
  };

  const handleRefinementSubmit = (note: string) => {    onReject(stepId, note);
  };

  const confidenceColor =
    (step.confidence ?? 0) >= 85 ? "#22c55e" :
    (step.confidence ?? 0) >= 70 ? "#f59e0b" : "#ef4444";

  // ── STALE (approved but upstream was edited) ──────────────────────────────
  if (step.status === "stale") {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.85)",
          border: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        <div
          className="px-6 py-4 flex flex-wrap items-center gap-3 border-b"
          style={{ background: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.2)" }}
        >
          <div className="flex items-center gap-2 flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-slate-900"}`}>
                {AGENT_STEP_DEFINITIONS[stepId].label}
              </p>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                Stale — an upstream step was edited after this was approved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-2 py-1 rounded-full font-semibold"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
            >
              Stale
            </span>
            <Button
              size="sm"
              onClick={() => onRerunStale?.(stepId)}
              className="text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <RotateCcw className="w-3 h-3" />
              Re-run with updated context
            </Button>
            <button
              onClick={() => onGoBack(stepId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDark
                  ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/90 border border-white/[0.08]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
              Review previous output
            </button>
          </div>
        </div>
        {/* Show the stale output read-only */}
        <div className="p-6 opacity-60">
          <p className={`text-xs mb-3 font-medium ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Last approved output (may be outdated):
          </p>
          {approvedOutput && renderPanel(stepId, approvedOutput as Record<string, unknown>, () => {})}
        </div>
      </div>
    );
  }

  // ── APPROVED ──────────────────────────────────────────────────────────────
  if (step.status === "approved") {
    return <ApprovedPanel stepId={stepId} step={step} isDark={isDark} onGoBack={onGoBack} traceEvents={traceEvents} />;
  }

  // ── RUNNING ───────────────────────────��──────────────────��────────────────
  if (step.status === "running") {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(59,130,246,0.25)",
        }}
      >
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

        <div className="p-6 space-y-4">
          <AgentTrace
            events={traceEvents}
            isStreaming={isStreaming}
            modelId="openai/gpt-4o"
            stepLabel={def.label}
            defaultOpen={true}
          />
          <RawStreamBlock rawText={streamingText} isStreaming={isStreaming} isDark={isDark} />
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
          {/* Agent tool trace — collapsed by default after completion */}
          <AgentTrace
            events={traceEvents}
            isStreaming={false}
            modelId="openai/gpt-4o"
            stepLabel={def.label}
            defaultOpen={false}
          />

          {/* Output panel */}
          {renderPanel(stepId, displayOutput, handleOutputChange, {
            qualityThreshold,
            onRequestRemediation: handleRequestRemediation,
            onRequestFix: handleRequestRemediation,
          })}

          {/* Raw stream */}
          <RawStreamBlock rawText={streamingText} isStreaming={false} isDark={isDark} />

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

        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 space-y-3 border-t"
          style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
        >
          {/* Human-guided refinement — inline above action buttons */}
          <RefinementPrompt stepId={stepId} isDark={isDark} onSubmit={handleRefinementSubmit} />

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

          {/* Approve / Reject row */}
          <div className="flex items-center justify-between">
            <div className={`text-[10px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
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
