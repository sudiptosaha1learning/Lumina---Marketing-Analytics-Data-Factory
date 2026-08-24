"use client";

import { useState, useCallback, useRef } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import {
  type DataProductProject,
  type AgentStepId,
  type AgentStep,
  STEP_ORDER,
  AGENT_STEP_DEFINITIONS,
  createInitialProject,
  MOCK_DATA_CATALOG,
} from "@/lib/data-product-types";
import { FactoryRequestCapture, type CatalogProduct } from "./FactoryRequestCapture";
import { FactoryStepper } from "./FactoryStepper";
import { AgentStepPanel } from "./AgentStepPanel";
import { FactoryPublishSuccess } from "./FactoryPublishSuccess";
import { Sparkles, ChevronLeft, RotateCcw, Activity, Settings2 } from "lucide-react";

type FactoryView = "request" | "factory" | "published" | "catalog";

// ── Helpers ────────────────────────────────────────────────────────────────

// Steps that gate progression when their score/pass-rate is too low
const GATED_STEPS: AgentStepId[] = ["quality", "validation"];

// Mark all approved downstream steps as stale
function markDownstreamStale(
  proj: DataProductProject,
  fromIndex: number
): DataProductProject {
  const updatedSteps = { ...proj.steps };
  STEP_ORDER.forEach((sid, idx) => {
    if (idx > fromIndex && updatedSteps[sid].status === "approved") {
      updatedSteps[sid] = { ...updatedSteps[sid], status: "stale" };
    }
  });
  return { ...proj, steps: updatedSteps };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function tryParseJSON(text: string): Record<string, unknown> | null {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace > 0) {
      try {
        return JSON.parse(cleaned.slice(0, lastBrace + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function summariseOutput(
  stepId: AgentStepId,
  output: Record<string, unknown>
): Record<string, unknown> {
  switch (stepId) {
    case "opportunity":
      return {
        problemStatement: output.problemStatement,
        purpose: output.purpose,
        scope: output.scope,
        initialKPIs: output.initialKPIs,
      };
    case "persona":
      return {
        personas:
          (output.personas as Array<{ role: string }> | undefined)?.map(
            (p) => p.role
          ) ?? [],
        userStories:
          (output.userStories as string[] | undefined)?.slice(0, 3) ?? [],
      };
    case "discovery":
      return {
        selectedSourceIds: output.selectedSourceIds,
        joinHypotheses: output.joinHypotheses,
        gaps: output.gaps,
      };
    case "quality":
      return {
        overallScore: output.overallScore,
        readinessAssessment: output.readinessAssessment,
        remediations:
          (output.remediations as string[] | undefined)?.slice(0, 3) ?? [],
      };
    case "kpi":
      return {
        kpis:
          (
            output.kpis as Array<{ name: string; formula: string }> | undefined
          )?.map((k) => ({ name: k.name, formula: k.formula })) ?? [],
      };
    default:
      return output;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function DataProductFactory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [view, setView] = useState<FactoryView>("request");
  const [project, setProject] = useState<DataProductProject | null>(null);
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewingStepId, setViewingStepId] = useState<AgentStepId | null>(null);
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Build slim context for the agent ──────────────────────────────────────
  const buildContext = useCallback(
    (stepId: AgentStepId, proj: DataProductProject): string => {
      const parts: string[] = [`Business Request: ${proj.requestText}`];
      const allPrev: AgentStepId[] = [
        "opportunity", "persona", "discovery", "quality",
        "kpi", "model", "pipeline", "validation", "documentation", "governance",
      ];
      for (const sid of allPrev) {
        if (sid === stepId) break;
        const s = proj.steps[sid];
        const raw = s.editedOutput ?? s.output;
        if (raw) {
          const slim = summariseOutput(sid as AgentStepId, raw);
          parts.push(
            `\n${AGENT_STEP_DEFINITIONS[sid].label} Summary:\n${JSON.stringify(slim)}`
          );
        }
      }
      if (stepId === "discovery") {
        const catalogSummary = MOCK_DATA_CATALOG.map((s) => ({
          id: s.id,
          name: s.name,
          fields: s.fields.slice(0, 6),
        }));
        parts.push(
          "\nAvailable Data Sources:\n" + JSON.stringify(catalogSummary)
        );
      }
      return parts.join("\n");
    },
    []
  );

  // ── Run a single agent step ────────────────────────────────────────────────
  const runAgentStep = useCallback(
    async (
      stepId: AgentStepId,
      proj: DataProductProject
    ): Promise<DataProductProject> => {
      abortRef.current = new AbortController();
      setStreamingText("");
      setIsStreaming(true);
      setViewingStepId(stepId);

      const updatedProj: DataProductProject = {
        ...proj,
        currentStep: stepId,
        status: "in_progress",
        steps: {
          ...proj.steps,
          [stepId]: {
            ...proj.steps[stepId],
            status: "running",
            startedAt: new Date().toISOString(),
          },
        },
      };
      setProject(updatedProj);

      let fullText = "";

      try {
        const context = buildContext(stepId, updatedProj);
        const response = await fetch("/api/data-product-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: stepId, context }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) throw new Error("Agent request failed");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const chunk = JSON.parse(data) as {
                  type?: string;
                  delta?: string;
                  text?: string;
                };
                if (chunk.type === "text-delta" && chunk.delta) {
                  fullText += chunk.delta;
                  setStreamingText(fullText);
                } else if (chunk.type === "text" && chunk.text) {
                  fullText = chunk.text;
                  setStreamingText(fullText);
                }
              } catch {
                // skip malformed chunk
              }
            }
          }
        }
      } catch (err: unknown) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          console.error("[v0] Agent step error:", err);
        }
      } finally {
        setIsStreaming(false);
      }

      const parsed = tryParseJSON(fullText);
      const confidence = parsed ? Math.round(75 + Math.random() * 20) : null;

      let finalOutput = parsed;
      if (stepId === "discovery" && parsed) {
        const selectedIds =
          (parsed.selectedSourceIds as string[] | undefined) ?? [];
        const sources = MOCK_DATA_CATALOG.map((s) => ({
          ...s,
          selected: selectedIds.includes(s.id),
        }));
        finalOutput = { ...parsed, candidateSources: sources };
      }

      const completedProj: DataProductProject = {
        ...updatedProj,
        steps: {
          ...updatedProj.steps,
          [stepId]: {
            ...updatedProj.steps[stepId],
            status: finalOutput ? "awaiting_review" : "rejected",
            confidence,
            completedAt: new Date().toISOString(),
            output: finalOutput ?? null,
          },
        },
      };

      setProject(completedProj);
      setStreamingText("");
      return completedProj;
    },
    [buildContext]
  );

  // ── Approve a step ─────────────────────────────────────────────────────────
  const handleApproveStep = useCallback(
    async (stepId: AgentStepId, editedOutput?: Record<string, unknown>) => {
      if (!project) return;

      // ── Quality gate ──────────────────────────────────────────────────────
      if (stepId === "quality") {
        const output = editedOutput ?? project.steps.quality.output;
        const score = (output?.overallScore as number) ?? 0;
        const threshold = project.qualityThreshold ?? 80;
        const issues = (output?.issues as Array<{ overridden: boolean; severity: string }>) ?? [];
        const nonOverriddenHigh = issues.filter((i) => !i.overridden && i.severity === "high");
        if (score < threshold && nonOverriddenHigh.length > 0) {
          // Don't advance — QualityPanel will show the blocked state
          return;
        }
      }

      // ── Validation gate ───────────────────────────────────────────────────
      if (stepId === "validation") {
        const output = editedOutput ?? project.steps.validation.output;
        const tests = (output?.testSuite as Array<{ status: string }>) ?? [];
        const failCount = tests.filter((t) => t.status === "fail").length;
        if (failCount > 0) {
          // Don't advance — ValidationPanel will show the blocked state
          return;
        }
      }

      const intervention = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: editedOutput ? ("edit" as const) : ("approve" as const),
        userId: "John Doe",
        note: editedOutput ? "Output edited before approval" : undefined,
      };

      let approvedProj: DataProductProject = {
        ...project,
        steps: {
          ...project.steps,
          [stepId]: {
            ...project.steps[stepId],
            status: "approved",
            editedOutput: editedOutput ?? null,
            interventions: [
              ...project.steps[stepId].interventions,
              intervention,
            ],
          },
        },
      };

      // ── Mark downstream stale when edits were made ────────────────────────
      if (editedOutput) {
        const stepIndex = STEP_ORDER.indexOf(stepId);
        approvedProj = markDownstreamStale(approvedProj, stepIndex);
      }

      const stepIndex = STEP_ORDER.indexOf(stepId);
      const nextStepId = STEP_ORDER[stepIndex + 1] as AgentStepId | undefined;

      if (!nextStepId) {
        const finalProj: DataProductProject = {
          ...approvedProj,
          status: "published",
          publishedAt: new Date().toISOString(),
          currentStep: null,
        };
        setProject(finalProj);
        setView("published");
        return;
      }

      setProject(approvedProj);
      await runAgentStep(nextStepId, approvedProj);
    },
    [project, runAgentStep]
  );

  // ── Reject & re-run a step ─────────────────────────────────────────────────
  const handleRejectStep = useCallback(
    async (stepId: AgentStepId, note?: string) => {
      if (!project) return;

      const intervention = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "reject" as const,
        userId: "John Doe",
        note,
      };

      const rejectedProj: DataProductProject = {
        ...project,
        steps: {
          ...project.steps,
          [stepId]: {
            ...project.steps[stepId],
            status: "rejected",
            interventions: [
              ...project.steps[stepId].interventions,
              intervention,
            ],
          },
        },
      };

      setProject(rejectedProj);
      await runAgentStep(stepId, rejectedProj);
    },
    [project, runAgentStep]
  );

  // ── Update quality threshold ───────────────────────────────────────────────
  const handleSetThreshold = useCallback((value: number) => {
    if (!project) return;
    setProject({ ...project, qualityThreshold: value });
  }, [project]);

  // ── Re-run a stale step ────────────────────────────────────────────────────
  const handleRerunStaleStep = useCallback(
    async (stepId: AgentStepId) => {
      if (!project) return;
      await runAgentStep(stepId, project);
    },
    [project, runAgentStep]
  );

  // ── Go back to a previous step ─────────────────────────────────────────────
  const handleGoBackToStep = useCallback(
    (stepId: AgentStepId) => {
      if (!project) return;
      abortRef.current?.abort();
      setIsStreaming(false);

      const stepIndex = STEP_ORDER.indexOf(stepId);
      const updatedSteps = { ...project.steps };

      STEP_ORDER.forEach((sid, idx) => {
        if (idx === stepIndex) {
          updatedSteps[sid] = {
            ...updatedSteps[sid],
            status: "awaiting_review",
            editedOutput: null,
          };
        } else if (idx > stepIndex) {
          updatedSteps[sid] = {
            ...updatedSteps[sid],
            status: "pending",
            output: null,
            editedOutput: null,
            confidence: null,
            startedAt: null,
            completedAt: null,
            interventions: [],
          };
        }
      });

      const revertedProj: DataProductProject = {
        ...project,
        currentStep: stepId,
        status: "in_progress",
        steps: updatedSteps,
      };

      setProject(revertedProj);
      setViewingStepId(stepId);
      setStreamingText(
        project.steps[stepId].output
          ? JSON.stringify(project.steps[stepId].output, null, 2)
          : ""
      );
    },
    [project]
  );

  // ── Click a step in the stepper ─────���──────────────────────────────────────
  const handleStepClick = useCallback(
    (stepId: AgentStepId) => {
      if (!project) return;
      const step = project.steps[stepId];
      if (
        step.status === "approved" ||
        step.status === "awaiting_review" ||
        step.status === "running"
      ) {
        setViewingStepId(stepId);
      }
    },
    [project]
  );

  // ── Start the factory ──────────────────────────────────────────────────────
  const handleStartFactory = useCallback(
    async (requestText: string) => {
      const id = crypto.randomUUID();
      const newProject = createInitialProject(id, requestText);
      setView("factory");
      setProject(newProject);
      await runAgentStep("opportunity", newProject);
    },
    [runAgentStep]
  );

  // ── Derive a CatalogProduct from a published project ──────────────────────
  const deriveCatalogProduct = (proj: DataProductProject): CatalogProduct => {
    const pubOutput = (proj.steps.publishing?.editedOutput ?? proj.steps.publishing?.output) as Record<string, unknown> | null;
    const card = (pubOutput?.productCard as Record<string, unknown>) ?? {};
    const docOutput = (proj.steps.documentation?.editedOutput ?? proj.steps.documentation?.output) as Record<string, unknown> | null;
    const govOutput = (proj.steps.governance?.editedOutput ?? proj.steps.governance?.output) as Record<string, unknown> | null;
    const kpiOutput = (proj.steps.kpi?.editedOutput ?? proj.steps.kpi?.output) as Record<string, unknown> | null;
    const kpis = (kpiOutput?.kpis as Array<{ name: string }> | undefined) ?? [];
    const ownerPersona = (proj.steps.persona?.editedOutput ?? proj.steps.persona?.output) as Record<string, unknown> | null;
    const personas = (ownerPersona?.personas as Array<{ role: string }> | undefined) ?? [];
    const ownerName = personas.find(p => p.role?.toLowerCase().includes("owner"))?.role ?? "Data Platform";
    const apiBase = "https://data.amcor.internal/api/v2/products";
    const slug = (card?.name as string ?? proj.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const qualityOutput = (proj.steps.quality?.editedOutput ?? proj.steps.quality?.output) as Record<string, unknown> | null;
    const qualityScore = (qualityOutput?.overallScore as number) ?? 85;
    const domain = (govOutput?.classification as Record<string,unknown>)?.domain as string ?? "Analytics";
    const tags = kpis.slice(0, 4).map((k) => k.name.toLowerCase().replace(/\s+/g, "-"));

    return {
      id: proj.id,
      name: (card?.name as string) ?? proj.name,
      domain,
      description: (card?.description as string) ?? proj.requestText.slice(0, 150),
      status: "Published",
      tier: qualityScore >= 90 ? "Gold" : qualityScore >= 75 ? "Silver" : "Bronze",
      owner: ownerName,
      updatedAt: proj.publishedAt ? new Date(proj.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      tags: tags.length > 0 ? tags : ["data-product", "analytics"],
      consumers: 0,
      quality: qualityScore,
      freshness: "Just published",
      updateSchedule: (docOutput?.updateFrequency as string) ?? "Daily",
      apiEndpoint: `${apiBase}/${slug}`,
      apiFormat: "REST / JSON",
      apiAuth: "OAuth 2.0 (Bearer token)",
      sampleQuery: `GET ${apiBase}/${slug}?limit=100`,
    };
  };

  // ── View in catalog ────────────────────────────────────────────────────────
  const handleViewCatalog = () => {
    setView("catalog");
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    abortRef.current?.abort();
    setProject(null);
    setStreamingText("");
    setIsStreaming(false);
    setViewingStepId(null);
    setView("request");
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const activeStepId: AgentStepId | null =
    project?.currentStep ??
    (project
      ? (STEP_ORDER.find((sid) => {
          const s = project.steps[sid];
          return s.status === "running" || s.status === "awaiting_review";
        }) ?? null)
      : null);

  const displayedStepId: AgentStepId | null = viewingStepId ?? activeStepId;
  const displayedStep: AgentStep | null = displayedStepId
    ? (project?.steps[displayedStepId] ?? null)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {view !== "request" && (
              <button
                onClick={handleReset}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isDark
                    ? "text-white/40 hover:text-white/70"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <ChevronLeft className="w-3 h-3" />
                </div>
                New Request
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className={`font-heading text-xl font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Agentic AI Data Product Factory
              </h1>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-white/45" : "text-slate-500"
                }`}
              >
                Governed workflow platform — discover, design, build, validate &amp; publish trusted data products
              </p>
            </div>
          </div>
        </div>

        {view === "factory" && project && (
          <div className="flex items-center gap-3">
            {isStreaming && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.25)",
                }}
              >
                <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium">
                  Agent running
                </span>
              </div>
            )}
            {/* Quality threshold config toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThresholdConfig((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isDark
                    ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-black/[0.05]"
                }`}
                title="Configure quality threshold"
              >
                <Settings2 className="w-3 h-3" />
                <span>QT: {project.qualityThreshold}</span>
              </button>
              {showThresholdConfig && (
                <div
                  className="absolute right-0 top-9 z-50 rounded-xl p-4 w-60 space-y-3 shadow-xl"
                  style={{
                    background: isDark ? "#1e2130" : "#ffffff",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <p className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-slate-800"}`}>
                    Quality Gate Threshold
                  </p>
                  <p className={`text-[11px] leading-relaxed ${isDark ? "text-white/45" : "text-slate-500"}`}>
                    Workflow will be blocked at the Quality Profiling step if the overall score is below this value (unless all high-severity issues are overridden).
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={project.qualityThreshold}
                      onChange={(e) => handleSetThreshold(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className={`text-sm font-bold w-8 text-right ${isDark ? "text-white" : "text-slate-900"}`}>
                      {project.qualityThreshold}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowThresholdConfig(false)}
                    className="text-[10px] text-blue-400 hover:text-blue-300"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDark
                  ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-black/[0.05]"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div
          className="h-px flex-1"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.08)",
          }}
        />
        <span
          className={`text-[10px] uppercase tracking-widest px-3 ${
            isDark ? "text-white/30" : "text-slate-400"
          }`}
        >
          {view === "request" || view === "catalog"
            ? "Start a new data product"
            : view === "published"
            ? "Product published"
            : "Factory workflow"}
        </span>
        <div
          className="h-px flex-1"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.08)",
          }}
        />
      </div>

      {/* REQUEST CAPTURE */}
      {view === "request" && (
        <FactoryRequestCapture onStart={handleStartFactory} />
      )}

      {/* FACTORY WORKFLOW */}
      {view === "factory" && project && (
        <div className="grid grid-cols-[280px_1fr] gap-6">
          <FactoryStepper
            project={project}
            activeStepId={activeStepId}
            viewingStepId={displayedStepId}
            onStepClick={handleStepClick}
          />

          <div className="min-w-0">
            {displayedStepId && displayedStep ? (
              <AgentStepPanel
                key={displayedStepId}
                stepId={displayedStepId}
                step={displayedStep}
                streamingText={
                  displayedStepId === activeStepId ? streamingText : ""
                }
                isStreaming={
                  displayedStepId === activeStepId ? isStreaming : false
                }
                isViewingApproved={displayedStep.status === "approved"}
                qualityThreshold={project.qualityThreshold}
                onApprove={handleApproveStep}
                onReject={handleRejectStep}
                onGoBack={handleGoBackToStep}
                onRerunStale={handleRerunStaleStep}
              />
            ) : (
              <div
                className="rounded-2xl p-8 flex items-center justify-center"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.8)",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <span
                  className={`text-sm ${
                    isDark ? "text-white/40" : "text-slate-400"
                  }`}
                >
                  Select a step from the workflow to review outputs.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PUBLISHED */}
      {view === "published" && project && (
        <FactoryPublishSuccess project={project} onReset={handleReset} onViewCatalog={handleViewCatalog} />
      )}

      {/* CATALOG — request page with newly published product highlighted */}
      {view === "catalog" && (
        <FactoryRequestCapture
          onStart={handleStartFactory}
          publishedProduct={project ? deriveCatalogProduct(project) : undefined}
          highlightId={project?.id}
        />
      )}
    </div>
  );
}
