"use client";

import { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { KPIOutput, KPIDefinition } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const EMPTY_KPI: KPIDefinition = {
  name: "",
  formula: "",
  lookbackWindow: "30 days",
  description: "",
  threshold: "",
  updateFrequency: "Daily",
  targetLayer: "gold",
  businessOwner: "",
};

export function KPIPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<KPIOutput>;

  const kpis = (data.kpis as KPIDefinition[]) ?? [];
  const scoreBands = (data.scoreBands as Record<string, string>) ?? {};

  const updateKPI = (idx: number, field: keyof KPIDefinition, value: string) => {
    const updated = kpis.map((kpi, i) => (i === idx ? { ...kpi, [field]: value } : kpi));
    onChange({ ...output, kpis: updated });
  };

  const deleteKPI = (idx: number) => {
    onChange({ ...output, kpis: kpis.filter((_, i) => i !== idx) });
  };

  const addKPI = () => {
    onChange({ ...output, kpis: [...kpis, { ...EMPTY_KPI }] });
  };

  const updateScoreBand = (band: string, value: string) => {
    onChange({ ...output, scoreBands: { ...scoreBands, [band]: value } });
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const inputClass = `text-xs ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/25 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-400/50"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`${labelClass} mb-0`}>KPI Definitions ({kpis.length})</label>
          <Button
            size="sm"
            variant="outline"
            onClick={addKPI}
            className={`text-[10px] h-6 px-2 gap-1 ${isDark ? "border-white/[0.1] text-white/55 hover:text-white/90 hover:bg-white/[0.06]" : "border-slate-200 text-slate-600 hover:text-slate-900"}`}
          >
            <Plus className="w-3 h-3" />
            Add KPI
          </Button>
        </div>

        <div className="space-y-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={cardStyle}>
              {/* Name row + delete */}
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}
                >
                  KPI
                </div>
                <Input
                  value={kpi.name}
                  onChange={(e) => updateKPI(i, "name", e.target.value)}
                  className={`${inputClass} font-semibold flex-1`}
                  placeholder="KPI name"
                />
                <button
                  onClick={() => deleteKPI(i)}
                  title="Delete KPI"
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${isDark ? "text-white/25 hover:text-red-400 hover:bg-red-500/10" : "text-slate-300 hover:text-red-500 hover:bg-red-50"}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Formula</p>
                  <Input
                    value={kpi.formula}
                    onChange={(e) => updateKPI(i, "formula", e.target.value)}
                    className={`${inputClass} font-mono text-[11px]`}
                    placeholder="e.g. SUM(orders) / COUNT(customers)"
                  />
                </div>
                <div>
                  <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Lookback Window</p>
                  <Input
                    value={kpi.lookbackWindow}
                    onChange={(e) => updateKPI(i, "lookbackWindow", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 90 days"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Threshold</p>
                  <Input
                    value={kpi.threshold ?? ""}
                    onChange={(e) => updateKPI(i, "threshold", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. >= 0.6"
                  />
                </div>
                <div>
                  <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Update Frequency</p>
                  <Input
                    value={kpi.updateFrequency ?? ""}
                    onChange={(e) => updateKPI(i, "updateFrequency", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Daily"
                  />
                </div>
              </div>

              <div>
                <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Description</p>
                <Input
                  value={kpi.description}
                  onChange={(e) => updateKPI(i, "description", e.target.value)}
                  className={inputClass}
                  placeholder="Plain English description of this KPI"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Target Layer</p>
                  <Input
                    value={kpi.targetLayer ?? ""}
                    onChange={(e) => updateKPI(i, "targetLayer", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. gold"
                  />
                </div>
                <div>
                  <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Business Owner</p>
                  <Input
                    value={kpi.businessOwner ?? ""}
                    onChange={(e) => updateKPI(i, "businessOwner", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Marketing Analytics"
                  />
                </div>
              </div>
            </div>
          ))}

          {kpis.length === 0 && (
            <button
              onClick={addKPI}
              className={`w-full rounded-xl py-5 flex flex-col items-center gap-2 border-2 border-dashed transition-colors ${isDark ? "border-white/[0.08] text-white/30 hover:border-blue-500/30 hover:text-blue-400" : "border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"}`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-medium">Add your first KPI</span>
            </button>
          )}
        </div>
      </div>

      {/* Score Bands */}
      {Object.keys(scoreBands).length > 0 && (
        <div>
          <label className={labelClass}>Score Bands</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(scoreBands).map(([band, desc]) => (
              <div key={band} className="rounded-xl px-3 py-2.5" style={cardStyle}>
                <div className={`text-xs font-semibold mb-1 ${isDark ? "text-white/80" : "text-slate-800"}`}>{band}</div>
                <Input
                  value={desc}
                  onChange={(e) => updateScoreBand(band, e.target.value)}
                  className={`${inputClass} text-[11px]`}
                  placeholder="Band description"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
