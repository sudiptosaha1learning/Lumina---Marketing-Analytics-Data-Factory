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
import { FactoryRequestCapture } from "./FactoryRequestCapture";
import { FactoryStepper } from "./FactoryStepper";
import { AgentStepPanel } from "./AgentStepPanel";
import { FactoryPublishSuccess } from "./FactoryPublishSuccess";
import {
  Sparkles,
  ChevronLeft,
  RotateCcw,
  Activity,
} from "lucide-react";

type FactoryView = "request" | "factory" | "published";

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

export function DataProductFactory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [view, setView] = useState<FactoryView>("request");
  const [project, setProject] = useState<DataProductProject | null>(null);
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  // Which step is currently displayed in the right panel (may be an approved step when user clicks back)
  const [viewingStepId, setViewingStepId] = useState<AgentStepId | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ─── Build context string for an agent ────────────────────────────────────
  const buildContext = useCallback(
    (stepId: AgentStepId, proj: DataProductProject): string => {
      const parts: string[] = [`Business Request: ${proj.requestText}`];
      const prevSteps: AgentStepId[] = [
        "opportunity", "persona", "discovery", "quality",
        "kpi", "model", "pipeline", "validation", "documentation", "governance",
      ];
      for (const sid of prevSteps) {
        if (sid === stepId) break;
        const step = proj.steps[sid];
        const output = step.editedOutput ?? step.output;
        if (output) {
          parts.push(`\n${AGENT_STEP_DEFINITIONS[sid].label} Output:\n${JSON.stringify(output, null, 2)}`);
        }
      }
      if (stepId === "discovery") {
        parts.push("\nAvailable Data Sources Catalog:\n" + JSON.stringify(MOCK_DATA_CATALOG, null, 2));
      }
      return parts.join("\n");
    },
    []
  );

  // ─── Run a single agent step ───────────────────────────────────────────────
  const runAgentStep = useCallback(
    async (stepId: AgentStepId, proj: DataProductProject): Promise<DataProductProject> => {
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
                const chunk = JSON.parse(data) as { type?: string; delta?: string; text?: string };
                if (chunk.type === "text-delta" && chunk.delta) {
                  fullText += chunk.delta;
                  setStreamingText(fullText);
                } else if (chunk.type === "text" && chunk.text) {
                  fullText = chunk.text;
                  setStreamingText(fullText);
                }
              } catch {
                // skip
              }
            }
          }
        }
      } catch (err: unknown) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          console.log("[v0] Agent step error:", err);
        }
      } finally {
        setIsStreaming(false);
      }

      const parsed = tryParseJSON(fullText);
      const confidence = parsed ? Math.round(75 + Math.random() * 20) : null;

      let finalOutput = parsed;
      if (stepId === "discovery" && parsed) {
        const selectedIds = (parsed.selectedSourceIds as string[] | undefined) ?? [];
        const sources = MOCK_DATA_CATALOG.map((s) => ({ ...s, selected: selectedIds.includes(s.id) }));
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

  // ─── Approve a step ────────────────────────────────────────────────────────
  const handleApproveStep = useCallback(
    async (stepId: AgentStepId, editedOutput?: Record<string, unknown>) => {
      if (!project) return;

      const intervention = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: editedOutput ? ("edit" as const) : ("approve" as const),
        userId: "John Doe",
        note: editedOutput ? "Output edited before approval" : undefined,
      };

      const approvedProj: DataProductProject = {
        ...project,
        steps: {
          ...project.steps,
          [stepId]: {
            ...project.steps[stepId],
            status: "approved",
            editedOutput: editedOutput ?? null,
            interventions: [...project.steps[stepId].interventions, intervention],
          },
        },
      };

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

  // ─── Reject & re-run a step ────────────────────────────────────────────────
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
            interventions: [...project.steps[stepId].interventions, intervention],
          },
        },
      };

      setProject(rejectedProj);
      await runAgentStep(stepId, rejectedProj);
    },
    [project, runAgentStep]
  );

  // ─── Go back to a previous approved step ─────────────────────────────────
  // Resets this step back to awaiting_review and all downstream steps to pending
  const handleGoBackToStep = useCallback(
    (stepId: AgentStepId) => {
      if (!project) return;
      abortRef.current?.abort();
      setIsStreaming(false);

      const stepIndex = STEP_ORDER.indexOf(stepId);

      // Preserve the existing output but put the step back into awaiting_review
      // so the user can make edits and re-approve. Reset all downstream to pending.
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
      setStreamingText(project.steps[stepId].output ? JSON.stringify(project.steps[stepId].output, null, 2) : "");
    },
    [project]
  );

  // ─── Click a step in the stepper ─────────────────────────────────────────
  // Approved steps: navigate to view (read-only), Active step: already shown
  const handleStepClick = useCallback(
    (stepId: AgentStepId) => {
      if (!project) return;
      const step = project.steps[stepId];
      if (step.status === "approved" || step.status === "awaiting_review" || step.status === "running") {
        setViewingStepId(stepId);
      }
    },
    [project]
  );

  // ─── Start the factory ────────────────────────────────────────────────────
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

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    abortRef.current?.abort();
    setProject(null);
    setStreamingText("");
    setIsStreaming(false);
    setViewingStepId(null);
    setView("request");
  };

  // ─── Determine which step is "active" (running / awaiting) ───────────────
  const activeStepId: AgentStepId | null = project?.currentStep ?? (
    project
      ? (STEP_ORDER.find((sid) => {
          const s = project.steps[sid];
          return s.status === "running" || s.status === "awaiting_review";
        }) ?? null)
      : null
  );

  // What to show in the right panel — user may be viewing a different step than the active one
  const displayedStepId: AgentStepId | null = viewingStepId ?? activeStepId;
  const displayedStep: AgentStep | null = displayedStepId ? (project?.steps[displayedStepId] ?? null) : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {view !== "request" && (
              <button
                onClick={handleReset}
                className={`flex items-center gap-2 text-sm transition-colors ${isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-700"}`}
              >
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
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
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-heading text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Agentic AI Data Product Factory
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/45" : "text-slate-500"}`}>
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
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
              >
                <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium">Agent running</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]" : "text-slate-500 hover:text-slate-700 hover:bg-black/[0.05]"}`}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
        <span className={`text-[10px] uppercase tracking-widest px-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>
          {view === "request" ? "Start a new data product" : view === "published" ? "Product published" : "Factory workflow"}
        </span>
        <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
      </div>

      {/* REQUEST CAPTURE */}
      {view === "request" && (
        <FactoryRequestCapture onStart={handleStartFactory} />
      )}

      {/* FACTORY WORKFLOW */}
      {view === "factory" && project && (
        <div className="grid grid-cols-[280px_1fr] gap-6">
          {/* Stepper sidebar */}
          <FactoryStepper
            project={project}
            activeStepId={activeStepId}
            viewingStepId={displayedStepId}
            onStepClick={handleStepClick}
          />

          {/* Right panel — shows the viewed step */}
          <div className="min-w-0">
            {displayedStepId && displayedStep ? (
              <AgentStepPanel
                key={displayedStepId}
                stepId={displayedStepId}
                step={displayedStep}
                streamingText={displayedStepId === activeStepId ? streamingText : ""}
                isStreaming={displayedStepId === activeStepId ? isStreaming : false}
                isViewingApproved={displayedStep.status === "approved"}
                onApprove={handleApproveStep}
                onReject={handleRejectStep}
                onGoBack={handleGoBackToStep}
              />
            ) : (
              <div
                className="rounded-2xl p-8 flex items-center justify-center"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <span className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  Select a step from the workflow to review outputs.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PUBLISHED */}
      {view === "published" && project && (
        <FactoryPublishSuccess project={project} onReset={handleReset} />
      )}
    </div>
  );
}
