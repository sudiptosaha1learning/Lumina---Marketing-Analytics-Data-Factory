"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Input } from "@/components/ui/input";
import type { KPIOutput, KPIDefinition } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function KPIPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<KPIOutput>;

  const kpis = (data.kpis as KPIDefinition[]) ?? [];
  const scoreBands = (data.scoreBands as Record<string, string>) ?? {};

  const updateKPI = (idx: number, field: keyof KPIDefinition, value: string) => {
    const updated = kpis.map((kpi, i) =>
      i === idx ? { ...kpi, [field]: value } : kpi
    );
    onChange({ ...output, kpis: updated });
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
        <label className={labelClass}>KPI Definitions ({kpis.length})</label>
        <div className="space-y-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={cardStyle}>
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
                  className={`${inputClass} font-semibold`}
                  placeholder="KPI name"
                />
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

              <div>
                <p className={`text-[9px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Description</p>
                <p className={`text-xs leading-relaxed ${isDark ? "text-white/55" : "text-slate-600"}`}>{kpi.description}</p>
              </div>

              {kpi.threshold && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${isDark ? "text-white/35" : "text-slate-500"}`}>Threshold:</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}
                  >
                    {kpi.threshold}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Score Bands */}
      {Object.keys(scoreBands).length > 0 && (
        <div>
          <label className={labelClass}>Score Bands</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(scoreBands).map(([band, desc]) => (
              <div key={band} className="rounded-xl px-3 py-2.5" style={cardStyle}>
                <div className={`text-xs font-semibold mb-0.5 ${isDark ? "text-white/80" : "text-slate-800"}`}>{band}</div>
                <div className={`text-[10px] ${isDark ? "text-white/45" : "text-slate-500"}`}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
