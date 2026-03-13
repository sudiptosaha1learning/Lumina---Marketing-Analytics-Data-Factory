"use client";

import { useState } from "react";
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
  CheckCircle2,
  XCircle,
  RotateCcw,
  Edit3,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Terminal,
  Sparkles,
} from "lucide-react";

// Sub-panel renderers
import { OpportunityPanel } from "./panels/OpportunityPanel";
import { PersonaPanel } from "./panels/PersonaPanel";
import { DiscoveryPanel } from "./panels/DiscoveryPanel";
import { QualityPanel } from "./panels/QualityPanel";
import { KPIPanel } from "./panels/KPIPanel";
import { ModelPanel } from "./panels/ModelPanel";
import { PipelinePanel } from "./panels/PipelinePanel";
import { ValidationPanel } from "./panels/ValidationPanel";
import { DocumentationPanel } from "./panels/DocumentationPanel";
import { GovernancePanel } from "./panels/GovernancePanel";
import { PublishingPanel } from "./panels/PublishingPanel";

interface Props {
  stepId: AgentStepId;
  step: AgentStep;
  streamingText: string;
  isStreaming: boolean;
  onApprove: (stepId: AgentStepId, editedOutput?: Record<string, unknown>) => void;
  onReject: (stepId: AgentStepId, note?: string) => void;
}

function renderPanel(
  stepId: AgentStepId,
  output: Record<string, unknown>,
  onChange: (updated: Record<string, unknown>) => void
) {
  switch (stepId) {
    case "opportunity": return <OpportunityPanel output={output} onChange={onChange} />;
    case "persona": return <PersonaPanel output={output} onChange={onChange} />;
    case "discovery": return <DiscoveryPanel output={output} onChange={onChange} />;
    case "quality": return <QualityPanel output={output} onChange={onChange} />;
    case "kpi": return <KPIPanel output={output} onChange={onChange} />;
    case "model": return <ModelPanel output={output} onChange={onChange} />;
    case "pipeline": return <PipelinePanel output={output} onChange={onChange} />;
    case "validation": return <ValidationPanel output={output} onChange={onChange} />;
    case "documentation": return <DocumentationPanel output={output} onChange={onChange} />;
    case "governance": return <GovernancePanel output={output} onChange={onChange} />;
    case "publishing": return <PublishingPanel output={output} onChange={onChange} />;
    default: return null;
  }
}

export function AgentStepPanel({
  stepId,
  step,
  streamingText,
  isStreaming,
  onApprove,
  onReject,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const def = AGENT_STEP_DEFINITIONS[stepId];

  const [editedOutput, setEditedOutput] = useState<Record<string, unknown> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  const displayOutput = editedOutput ?? step.editedOutput ?? step.output;

  const handleOutputChange = (updated: Record<string, unknown>) => {
    setEditedOutput(updated);
    setHasEdits(true);
  };

  const handleApprove = () => {
    onApprove(stepId, hasEdits ? (editedOutput ?? undefined) : undefined);
  };

  const handleReject = () => {
    onReject(stepId, rejectNote || undefined);
    setShowRejectForm(false);
    setRejectNote("");
  };

  const confidenceColor =
    (step.confidence ?? 0) >= 85 ? "#22c55e" :
    (step.confidence ?? 0) >= 70 ? "#f59e0b" : "#ef4444";

  // ─── RUNNING STATE ────────────────────────────────────────────────────────
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
          style={{
            background: "rgba(59,130,246,0.08)",
            borderColor: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)",
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>
          <div>
            <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{def.label}</div>
            <div className={`text-xs ${isDark ? "text-white/45" : "text-slate-500"}`}>{def.agentName} is running...</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-blue-400 font-medium">AI generating</span>
          </div>
        </div>

        {/* Streaming output */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className={`text-xs font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}>Agent output stream</span>
          </div>
          <div
            className="rounded-xl p-4 font-mono text-xs leading-relaxed overflow-auto max-h-96 scrollbar-thin"
            style={{
              background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            }}
          >
            {streamingText || (
              <span className="text-white/30 animate-pulse">Initialising agent...</span>
            )}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 animate-pulse" style={{ verticalAlign: "text-bottom" }} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── AWAITING REVIEW ─────────────────────────────────────────────────────
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
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Agent output panel */}
          <div>
            {renderPanel(stepId, displayOutput, handleOutputChange)}
          </div>

          {/* Raw JSON toggle */}
          <div>
            <button
              onClick={() => setShowRawJSON(!showRawJSON)}
              className={`flex items-center gap-1.5 text-[10px] transition-colors ${isDark ? "text-white/35 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}
            >
              {showRawJSON ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showRawJSON ? "Hide" : "Show"} raw JSON
            </button>
            {showRawJSON && (
              <pre
                className="mt-2 rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-auto max-h-72 scrollbar-thin"
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
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <p className="text-xs font-medium text-red-400">Reject &amp; re-run this step. Add a note for the agent (optional):</p>
              <Textarea
                placeholder="e.g. The scope is too broad, focus only on Range Rover customers..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
                className={`text-xs resize-none ${isDark ? "bg-black/30 border-red-500/20 text-white placeholder:text-white/25" : "bg-white border-red-300 text-slate-900 placeholder:text-slate-400"}`}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reject &amp; re-run
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRejectForm(false)}
                  className={`text-xs ${isDark ? "text-white/50 hover:text-white/80" : "text-slate-500"}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{
            background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <div className="flex items-center gap-2 text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
            {step.interventions.length > 0 && (
              <span>{step.interventions.length} intervention{step.interventions.length > 1 ? "s" : ""} recorded</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!showRejectForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                className={`text-xs gap-1.5 ${isDark ? "border-white/10 text-white/60 hover:text-white/90 hover:bg-white/[0.06]" : "border-slate-200 text-slate-600 hover:text-slate-900"}`}
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                Reject &amp; re-run
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleApprove}
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

  // ─── APPROVED ─────────────────────────────────────────────────────────────
  if (step.status === "approved") {
    const approvedOutput = step.editedOutput ?? step.output;
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}
      >
        <div className="px-6 py-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(34,197,94,0.15)", background: "rgba(34,197,94,0.06)" }}>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <div>
            <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{def.label}</div>
            <div className="text-xs text-green-400">Approved{step.editedOutput ? " with edits" : ""}</div>
          </div>
          {step.confidence !== null && (
            <div className="ml-auto text-[10px] font-semibold text-green-400">{step.confidence}% confidence</div>
          )}
        </div>
        <div className="p-6">
          {approvedOutput && renderPanel(stepId, approvedOutput, () => {})}
        </div>
      </div>
    );
  }

  // ─── FALLBACK / PENDING ───────────────────────────────────────────────────
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
