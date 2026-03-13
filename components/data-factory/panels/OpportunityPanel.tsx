"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { OpportunityOutput } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function OpportunityPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<OpportunityOutput>;

  const update = (field: keyof OpportunityOutput, value: unknown) => {
    onChange({ ...output, [field]: value });
  };

  const inputClass = `text-xs ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/25 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-400/50"}`;

  return (
    <div className="space-y-5">
      {/* Problem Statement */}
      <Field label="Problem Statement" isDark={isDark}>
        <Textarea
          value={(data.problemStatement as string) ?? ""}
          onChange={(e) => update("problemStatement", e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Purpose */}
      <Field label="Purpose" isDark={isDark}>
        <Textarea
          value={(data.purpose as string) ?? ""}
          onChange={(e) => update("purpose", e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Scope */}
      <Field label="Scope" isDark={isDark}>
        <Input
          value={(data.scope as string) ?? ""}
          onChange={(e) => update("scope", e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Assumptions */}
      <Field label="Assumptions" isDark={isDark}>
        <div className="space-y-2">
          {((data.assumptions as string[]) ?? []).map((assumption, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.6)" }}
              />
              <Input
                value={assumption}
                onChange={(e) => {
                  const newAssumptions = [...((data.assumptions as string[]) ?? [])];
                  newAssumptions[i] = e.target.value;
                  update("assumptions", newAssumptions);
                }}
                className={`${inputClass} flex-1`}
              />
            </div>
          ))}
        </div>
      </Field>

      {/* Initial KPIs */}
      <Field label="Initial KPI Signals" isDark={isDark}>
        <div className="flex flex-wrap gap-2">
          {((data.initialKPIs as string[]) ?? []).map((kpi, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#60a5fa",
              }}
            >
              {kpi}
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children, isDark }: { label: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <label className={`block text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>
        {label}
      </label>
      {children}
    </div>
  );
}
