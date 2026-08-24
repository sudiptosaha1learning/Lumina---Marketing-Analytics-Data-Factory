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
  Search, Database, BarChart3, Shield, FileText, Cpu, GitBranch,
  FlaskConical, BookOpen, Lock, Upload, AlertTriangle,
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
  isViewingApproved?: boolean;
  qualityThreshold?: number;
  onApprove: (stepId: AgentStepId, editedOutput?: Record<string, unknown>) => void;
  onReject: (stepId: AgentStepId, note?: string) => void;
  onGoBack: (stepId: AgentStepId) => void;
  onRerunStale?: (stepId: AgentStepId) => void;
}

interface ThoughtEntry {
  icon: React.ElementType;
  color: string;
  label: string;
  text: string;
}

// ── Step-specific natural-language chain-of-thought traces ────────────────
// These explain what each agent is doing in plain English for explainability.

const STEP_COT: Record<AgentStepId, ThoughtEntry[]> = {
  opportunity: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reading the business request to understand the core objective, target customers, and intended outcome." },
    { icon: Search, color: "#f59e0b", label: "Analysing", text: "Identifying the key business problem — what decision or action this data product needs to enable." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Formulating a clear problem statement that frames the gap between current state and the desired analytical capability." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Defining the purpose: what the data product will do, who it serves, and what value it delivers to the business." },
    { icon: Search, color: "#2dd4bf", label: "Scoping", text: "Determining the boundaries — what data domains, time horizons, and customer segments are in scope." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Documenting key assumptions and initial KPI candidates to guide downstream agents." },
  ],
  persona: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing the opportunity statement and scope to identify which business roles will consume and govern this data product." },
    { icon: Search, color: "#f59e0b", label: "Analysing", text: "Determining mandatory governance roles: Data Product Owner, Data Steward, Data Analyst, and GDPR Champion are always required." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Identifying additional domain-specific personas based on the use case — e.g. CRM Manager, Campaign Analyst." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "For each persona, articulating the jobs-to-be-done: what decisions or analyses they need to perform using this data product." },
    { icon: Search, color: "#2dd4bf", label: "Observing", text: "Mapping pain points — the friction, gaps, and limitations each persona experiences today without this data product." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Generating user stories in 'As a [persona], I want [goal] so that [benefit]' format to anchor downstream design decisions." },
  ],
  discovery: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing the opportunity scope and personas to determine which data domains are likely to contain relevant signals." },
    { icon: Database, color: "#f59e0b", label: "Scanning", text: "Scanning the enterprise data catalog for source systems in the Customer, Marketing, Digital, and Sales domains." },
    { icon: Search, color: "#2dd4bf", label: "Evaluating", text: "Assessing each candidate source for semantic relevance: does it contain the entities and fields needed to support the defined KPIs?" },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Cross-referencing customer identifiers across sources to identify viable join paths — e.g. customer_id links CRM to email events to orders." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Scoring each source on relevance, freshness, and join coverage. Flagging PII fields that will require masking or access control." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Producing a ranked list of candidate data sources with join hypotheses, field-level relevance, and identified gaps." },
  ],
  quality: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing the selected data sources to assess their fitness-for-purpose for the defined analytics use case." },
    { icon: BarChart3, color: "#f59e0b", label: "Profiling", text: "Running completeness checks — what percentage of records have non-null values for key fields like customer_id, email, and event timestamps?" },
    { icon: Search, color: "#2dd4bf", label: "Analysing", text: "Checking uniqueness constraints: are customer IDs truly unique? Are there duplicate order records that could distort propensity scores?" },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Assessing referential integrity — do all customer_id values in email events match records in the CRM master? Quantifying orphan rates." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Evaluating data freshness and latency against the required update frequency for the target use case." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Calculating an overall quality score per source and an aggregated readiness score, with prioritised remediation recommendations." },
  ],
  kpi: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing the opportunity output and persona jobs-to-be-done to derive measurable KPIs that directly serve the stated business objective." },
    { icon: BarChart3, color: "#f59e0b", label: "Designing", text: "For each KPI, defining a precise formula using available fields from the confirmed data sources." },
    { icon: Search, color: "#2dd4bf", label: "Validating", text: "Checking that each KPI can actually be computed from the selected sources — no required fields are missing or of insufficient quality." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Defining update frequency, the target layer (e.g. gold / semantic), and the business owner for each metric." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Producing a KPI specification that will anchor the data model design and validation test suite in downstream steps." },
  ],
  model: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Analysing the confirmed KPIs and data sources to determine the optimal target schema for analytics consumption." },
    { icon: Database, color: "#f59e0b", label: "Designing", text: "Selecting the grain of the primary fact table — one row per customer per scoring period is appropriate for a propensity use case." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Mapping source fields to target columns, applying naming conventions, and deciding on derived vs pass-through attributes." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Designing supporting dimension tables for account, campaign, and distributor to enable slice-and-dice analysis without joins in BI tools." },
    { icon: Shield, color: "#2dd4bf", label: "Governance", text: "Flagging PII fields (name, email, phone) for column-level masking policies and marking foreign keys for lineage tracking." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Producing a target schema with table definitions, field types, relationships, and annotation for governance controls." },
  ],
  pipeline: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing the data model and source discovery outputs to design the ingestion, transformation, and loading pipeline." },
    { icon: GitBranch, color: "#f59e0b", label: "Designing", text: "Defining pipeline stages: Extract from source systems → Transform (cleanse, join, derive KPIs) → Load to the target analytical layer." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Writing dbt-compatible SQL transformation logic for each step, including CTEs for readability and incremental load patterns." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Adding data quality checks as pipeline assertions — row count thresholds, null rate alerts, and referential integrity tests." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Generating a complete pipeline specification with SQL code, orchestration schedule, and monitoring configuration." },
  ],
  validation: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing the pipeline design and KPI specifications to derive a comprehensive test suite for the data product." },
    { icon: FlaskConical, color: "#f59e0b", label: "Generating", text: "Creating schema tests: not-null constraints, uniqueness checks, accepted values, and referential integrity assertions." },
    { icon: BarChart3, color: "#2dd4bf", label: "Analysing", text: "Designing business logic tests — e.g. propensity scores must fall between 0 and 1, no future event dates, customer lifetime value must be non-negative." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Defining freshness SLA tests: the data product must be updated within the agreed latency window before triggering alerts." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Producing a test manifest with test names, severity levels, expected pass rates, and the team responsible for remediation." },
  ],
  documentation: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Synthesising all upstream outputs — opportunity, model design, pipeline, and KPIs — into unified human-readable documentation." },
    { icon: BookOpen, color: "#f59e0b", label: "Writing", text: "Drafting the data product overview: purpose, scope, target consumers, update frequency, and SLA commitments." },
    { icon: Database, color: "#2dd4bf", label: "Documenting", text: "Generating field-level descriptions for every column in the target schema, including business definitions and example values." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Creating a lineage diagram narrative — tracing each output field back to its source system and transformation logic." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Producing a publication-ready data product specification that enables self-service consumption without requiring producer support." },
  ],
  governance: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Reviewing all PII-flagged fields, access patterns, and persona data requirements to design the governance framework." },
    { icon: Shield, color: "#f59e0b", label: "Assessing", text: "Identifying all fields containing personal data under GDPR Article 4: names, emails, postcodes, and account contact identifiers." },
    { icon: Lock, color: "#2dd4bf", label: "Configuring", text: "Defining column-level masking policies: email and phone masked for non-owners, postcode truncated to district level for analytics." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Setting role-based access control: Data Product Owner has full access; Data Analyst has read access to non-PII fields; GDPR Champion has audit access." },
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Defining the data retention schedule, deletion obligations, and consent linkage requirements for this data product." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Generating a governance manifest with access policies, PII register, retention rules, and data quality SLA for publication." },
  ],
  publishing: [
    { icon: Brain, color: "#818cf8", label: "Reasoning", text: "Performing a final pre-publication checklist: all required approvals collected, governance controls applied, tests passing." },
    { icon: Upload, color: "#f59e0b", label: "Preparing", text: "Packaging the data product: schema, pipeline code, tests, documentation, and governance manifest into a publishable artefact." },
    { icon: Zap, color: "#f59e0b", label: "Action", text: "Registering the data product in the enterprise catalog with metadata, lineage, SLA commitments, and contact information." },
    { icon: Lock, color: "#2dd4bf", label: "Securing", text: "Applying access control policies and generating API endpoints for consumer team onboarding." },
    { icon: CheckCircle2, color: "#4ade80", label: "Result", text: "Data product published and discoverable in the catalog. Lineage, tests, and documentation are live. Consumer teams can request access." },
  ],
};

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

// ── Chain-of-thought panel ────────────────────────────────────────────────

function ChainOfThought({
  stepId,
  isStreaming,
  isDark,
  visibleCount,
  defaultOpen = false,
}: {
  stepId: AgentStepId;
  isStreaming: boolean;
  isDark: boolean;
  visibleCount: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const entries = STEP_COT[stepId] ?? [];
  const shown = entries.slice(0, Math.max(1, visibleCount));

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: isDark ? "rgba(129,140,248,0.04)" : "rgba(99,102,241,0.03)",
        border: isDark ? "1px solid rgba(129,140,248,0.18)" : "1px solid rgba(99,102,241,0.18)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
        style={{ background: isDark ? "rgba(129,140,248,0.07)" : "rgba(99,102,241,0.06)" }}
      >
        <Brain className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span className="flex-1 text-[11px] font-semibold text-indigo-400">
          Agent Reasoning &amp; Actions
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded mr-2 font-medium ${isDark ? "bg-white/[0.06] text-white/40" : "bg-black/[0.06] text-slate-500"}`}>
          {shown.length}/{entries.length} steps
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-[9px] text-indigo-400 mr-2 font-medium">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            live
          </span>
        )}
        {open ? <ChevronUp className="w-3 h-3 text-indigo-400/50" /> : <ChevronDown className="w-3 h-3 text-indigo-400/50" />}
      </button>

      {open && (
        <div className="px-4 py-3 space-y-0">
          {shown.map((entry, i) => {
            const Icon = entry.icon;
            const isLast = i === shown.length - 1;
            const isRunning = isLast && isStreaming;
            return (
              <div key={i} className="flex items-start gap-3">
                {/* Vertical timeline */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${entry.color}18`, border: `1px solid ${entry.color}35` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: entry.color }} />
                  </div>
                  {i < shown.length - 1 && (
                    <div
                      className="w-px flex-1 my-1"
                      style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", minHeight: 12 }}
                    />
                  )}
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0 pt-0.5 pb-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: entry.color }}
                    >
                      {entry.label}
                    </span>
                    {isRunning && (
                      <span className="flex items-center gap-0.5 text-[8px] text-indigo-400/60 font-medium">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                        running
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>
                    {entry.text}
                  </p>
                </div>
              </div>
            );
          })}
          {isStreaming && shown.length < entries.length && (
            <div className="flex items-center gap-2 pl-9 py-1">
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
              <span className={`text-[10px] ${isDark ? "text-white/35" : "text-slate-400"}`}>
                Agent is still working...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
    opportunity: "e.g. Focus only on European personal care accounts with contracts expiring in the next 6 months.",
    persona: "e.g. Add a Regional Distributor Liaison persona who uses this at the point of order handover.",
    discovery: "e.g. Also include the Supply Contracts table — we need to see contract end dates.",
    quality: "e.g. Flag any source with more than 15% null rate on the account_id field as not suitable.",
    kpi: "e.g. Add a metric for email-to-sample-request conversion rate, segmented by format.",
    model: "e.g. Add a contract_end_date field to the fact table — it is critical for renewal timing.",
    pipeline: "e.g. The pipeline should run at 6am UTC daily and alert if row count drops by more than 10%.",
    validation: "e.g. Add a test that propensity scores for churned accounts are always below 0.3.",
    documentation: "e.g. Add a section explaining how the propensity score is calculated for a non-technical audience.",
    governance: "e.g. The Campaign Manager role should only see aggregated scores, not individual account records.",
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
  stepId, step, isDark, onGoBack,
}: { stepId: AgentStepId; step: AgentStep; isDark: boolean; onGoBack: (id: AgentStepId) => void }) {
  const [logOpen, setLogOpen] = useState(false);
  const [streamOpen, setStreamOpen] = useState(false);
  const [cotOpen, setCotOpen] = useState(false);
  const def = AGENT_STEP_DEFINITIONS[stepId];
  const approvedOutput = step.editedOutput ?? step.output;
  const confidenceColor =
    (step.confidence ?? 0) >= 85 ? "#22c55e" :
    (step.confidence ?? 0) >= 70 ? "#f59e0b" : "#ef4444";
  const entries = STEP_COT[stepId] ?? [];

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

        {/* Chain-of-thought (collapsed by default on approved) */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: isDark ? "rgba(129,140,248,0.04)" : "rgba(99,102,241,0.03)",
            border: isDark ? "1px solid rgba(129,140,248,0.18)" : "1px solid rgba(99,102,241,0.18)",
          }}
        >
          <button
            onClick={() => setCotOpen(!cotOpen)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
            style={{ background: isDark ? "rgba(129,140,248,0.07)" : "rgba(99,102,241,0.06)" }}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="flex-1 text-[11px] font-semibold text-indigo-400">Agent Reasoning &amp; Actions</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded mr-2 font-medium ${isDark ? "bg-white/[0.06] text-white/40" : "bg-black/[0.06] text-slate-500"}`}>
              {entries.length} steps
            </span>
            {cotOpen ? <ChevronUp className="w-3 h-3 text-indigo-400/50" /> : <ChevronDown className="w-3 h-3 text-indigo-400/50" />}
          </button>
          {cotOpen && (
            <div className="px-4 py-3 space-y-0">
              {entries.map((entry, i) => {
                const Icon = entry.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ background: `${entry.color}18`, border: `1px solid ${entry.color}35` }}>
                        <Icon className="w-3 h-3" style={{ color: entry.color }} />
                      </div>
                      {i < entries.length - 1 && <div className="w-px flex-1 my-1" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", minHeight: 12 }} />}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5 pb-3">
                      <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: entry.color }}>{entry.label}</div>
                      <p className={`text-[11px] leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>{entry.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
  qualityThreshold, onApprove, onReject, onGoBack, onRerunStale,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const def = AGENT_STEP_DEFINITIONS[stepId];

  const [editedOutput, setEditedOutput] = useState<Record<string, unknown> | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  // How many CoT entries to show based on streaming progress
  const totalCotEntries = (STEP_COT[stepId] ?? []).length;
  const [visibleCotCount, setVisibleCotCount] = useState(1);

  useEffect(() => {
    setEditedOutput(null);
    setHasEdits(false);
    setShowRejectForm(false);
    setRejectNote("");
    setShowRawJSON(false);
    setVisibleCotCount(1);
  }, [stepId]);

  // Progressively reveal CoT entries while streaming
  useEffect(() => {
    if (!isStreaming) {
      setVisibleCotCount(totalCotEntries);
      return;
    }
    if (visibleCotCount >= totalCotEntries) return;
    const timer = setTimeout(() => setVisibleCotCount((n) => Math.min(n + 1, totalCotEntries)), 1400);
    return () => clearTimeout(timer);
  }, [isStreaming, visibleCotCount, totalCotEntries]);

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
    return <ApprovedPanel stepId={stepId} step={step} isDark={isDark} onGoBack={onGoBack} />;
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
          <ChainOfThought stepId={stepId} isStreaming={isStreaming} isDark={isDark} visibleCount={visibleCotCount} />
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
          {/* Chain-of-thought — collapsed by default */}
          <ChainOfThought stepId={stepId} isStreaming={false} isDark={isDark} visibleCount={totalCotEntries} defaultOpen={false} />

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
                placeholder="e.g. The scope is too broad, focus only on strategic beverage accounts..."
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
