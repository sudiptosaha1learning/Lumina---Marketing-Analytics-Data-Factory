"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import {
  type DataProductProject,
  type AgentStepId,
  STEP_ORDER,
  AGENT_STEP_DEFINITIONS,
} from "@/lib/data-product-types";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Clock,
  XCircle,
  ChevronRight,
  Lightbulb,
  Users,
  Search,
  ShieldCheck,
  TrendingUp,
  Database,
  GitBranch,
  FileText,
  Lock,
  Rocket,
} from "lucide-react";

const STEP_ICONS = {
  opportunity: Lightbulb,
  persona: Users,
  discovery: Search,
  quality: ShieldCheck,
  kpi: TrendingUp,
  model: Database,
  pipeline: GitBranch,
  validation: CheckCircle2,
  documentation: FileText,
  governance: Lock,
  publishing: Rocket,
};

interface Props {
  project: DataProductProject;
  activeStepId: AgentStepId | null;
}

function getStatusColor(status: string, isDark: boolean): string {
  switch (status) {
    case "approved": return "#22c55e";
    case "running": return "#3b82f6";
    case "awaiting_review": return "#f59e0b";
    case "rejected": return "#ef4444";
    case "pending": return isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
    default: return isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  }
}

export function FactoryStepper({ project, activeStepId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const approvedCount = STEP_ORDER.filter(
    (sid) => project.steps[sid].status === "approved"
  ).length;
  const totalSteps = STEP_ORDER.length;
  const progressPct = Math.round((approvedCount / totalSteps) * 100);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1 sticky top-0"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        backdropFilter: "blur(16px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
      }}
    >
      {/* Progress */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>
            Workflow Progress
          </span>
          <span className={`text-[10px] font-bold ${isDark ? "text-white/70" : "text-slate-600"}`}>
            {approvedCount}/{totalSteps}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #3b82f6, #6366f1)" }}
          />
        </div>
      </div>

      {/* Steps */}
      {STEP_ORDER.map((stepId, idx) => {
        const step = project.steps[stepId];
        const def = AGENT_STEP_DEFINITIONS[stepId];
        const Icon = STEP_ICONS[stepId] ?? Circle;
        const isActive = activeStepId === stepId;
        const statusColor = getStatusColor(step.status, isDark);

        return (
          <div
            key={stepId}
            className="relative"
          >
            {/* Connector line */}
            {idx < STEP_ORDER.length - 1 && (
              <div
                className="absolute left-[19px] top-[36px] w-px h-[calc(100%-4px)] z-0"
                style={{
                  background: step.status === "approved"
                    ? "rgba(34,197,94,0.4)"
                    : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
                }}
              />
            )}

            <div
              className={`relative z-10 flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all duration-200 cursor-default ${
                isActive
                  ? ""
                  : isDark ? "hover:bg-white/[0.03]" : "hover:bg-black/[0.02]"
              }`}
              style={isActive ? {
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              } : {}}
            >
              {/* Icon circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: step.status === "approved"
                    ? "rgba(34,197,94,0.15)"
                    : step.status === "running"
                      ? "rgba(59,130,246,0.15)"
                      : step.status === "awaiting_review"
                        ? "rgba(245,158,11,0.15)"
                        : step.status === "rejected"
                          ? "rgba(239,68,68,0.15)"
                          : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${statusColor}`,
                }}
              >
                {step.status === "running" ? (
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                ) : step.status === "approved" ? (
                  <CheckCircle2 className="w-3 h-3" style={{ color: "#22c55e" }} />
                ) : step.status === "awaiting_review" ? (
                  <Clock className="w-3 h-3" style={{ color: "#f59e0b" }} />
                ) : step.status === "rejected" ? (
                  <XCircle className="w-3 h-3" style={{ color: "#ef4444" }} />
                ) : (
                  <Icon className="w-3 h-3" style={{ color: statusColor }} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium leading-tight truncate ${
                  isActive ? (isDark ? "text-white" : "text-slate-900") :
                  step.status === "approved" ? (isDark ? "text-white/75" : "text-slate-700") :
                  step.status === "pending" ? (isDark ? "text-white/35" : "text-slate-400") :
                  isDark ? "text-white/70" : "text-slate-700"
                }`}>
                  {def.label}
                </div>
                {step.confidence !== null && (
                  <div className={`text-[9px] mt-0.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>
                    {step.confidence}% confidence
                  </div>
                )}
                {step.status === "pending" && (
                  <div className={`text-[9px] mt-0.5 ${isDark ? "text-white/25" : "text-slate-300"}`}>
                    Waiting
                  </div>
                )}
              </div>

              {isActive && <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
