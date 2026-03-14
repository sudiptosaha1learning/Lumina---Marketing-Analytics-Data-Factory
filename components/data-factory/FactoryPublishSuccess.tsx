"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { DataProductProject } from "@/lib/data-product-types";
import { STEP_ORDER, AGENT_STEP_DEFINITIONS } from "@/lib/data-product-types";
import {
  CheckCircle2,
  Rocket,
  RotateCcw,
  Package,
  ShieldCheck,
  FileText,
  TestTube2,
  GitBranch,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  project: DataProductProject;
  onReset: () => void;
  onViewCatalog: () => void;
}

export function FactoryPublishSuccess({ project, onReset, onViewCatalog }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const publishedOutput = project.steps.publishing?.editedOutput ?? project.steps.publishing?.output;
  const card = (publishedOutput as Record<string, unknown> | null)?.productCard as Record<string, unknown> | undefined;

  const approvedCount = STEP_ORDER.filter((sid) => project.steps[sid].status === "approved").length;
  const interventionCount = STEP_ORDER.reduce(
    (acc, sid) => acc + project.steps[sid].interventions.length,
    0
  );

  const stats = [
    { label: "Agents Completed", value: String(approvedCount), icon: CheckCircle2, color: "#22c55e" },
    { label: "Human Interventions", value: String(interventionCount), icon: ShieldCheck, color: "#f59e0b" },
    { label: "Published At", value: project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : "—", icon: Rocket, color: "#3b82f6" },
  ];

  const highlights = [
    { label: "Data lineage documented", icon: GitBranch },
    { label: "Test suite generated & executed", icon: TestTube2 },
    { label: "Governance & PII reviewed", icon: ShieldCheck },
    { label: "Documentation auto-generated", icon: FileText },
    { label: "Product card published to catalogue", icon: Package },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Success banner */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: isDark
            ? "rgba(34,197,94,0.06)"
            : "rgba(34,197,94,0.04)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.35)" }}
        >
          <Rocket className="w-8 h-8 text-green-400" />
        </div>

        <h2 className={`font-heading text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          Data Product Published
        </h2>
        <p className={`text-sm ${isDark ? "text-white/55" : "text-slate-500"}`}>
          {card?.name
            ? `"${card.name as string}" is now live in the data catalogue.`
            : "Your data product has been published to the catalogue."}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div>
              <div className={`font-heading font-bold text-lg leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</div>
              <div className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* What was included */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-4 ${isDark ? "text-white/40" : "text-slate-400"}`}>
          Included in this data product
        </p>
        <div className="space-y-2">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.12)" }}
              >
                <h.icon className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className={`text-sm ${isDark ? "text-white/75" : "text-slate-700"}`}>{h.label}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Agent step summary */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-4 ${isDark ? "text-white/40" : "text-slate-400"}`}>
          Workflow Summary
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STEP_ORDER.map((sid) => {
            const step = project.steps[sid];
            const def = AGENT_STEP_DEFINITIONS[sid];
            return (
              <div key={sid} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className={`text-xs ${isDark ? "text-white/65" : "text-slate-700"}`}>{def.label}</span>
                {step.interventions.length > 0 && (
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }}
                  >
                    {step.interventions.length} edit{step.interventions.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onReset}
          variant="outline"
          className={`gap-2 text-sm ${isDark ? "border-white/10 text-white/60 hover:text-white/90 hover:bg-white/[0.06]" : "border-slate-200 text-slate-600 hover:text-slate-900"}`}
        >
          <RotateCcw className="w-4 h-4" />
          Build another data product
        </Button>
        <Button
          onClick={onViewCatalog}
          className="gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          View in Data Catalog
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
