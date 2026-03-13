"use client";

import React from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { ModelOutput, ModelTable, FieldDefinition } from "@/lib/data-product-types";
import { Table, KeyRound, Link } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  fact: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  dimension: { bg: "rgba(99,102,241,0.12)", text: "#818cf8" },
  bridge: { bg: "rgba(16,185,129,0.12)", text: "#34d399" },
};

export function ModelPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<ModelOutput>;

  const tables = (data.tables as ModelTable[]) ?? [];
  const relationships = (data.relationships as string[]) ?? [];
  const grain = (data.grain as string) ?? "";

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-5">
      {/* Grain */}
      {grain && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <KeyRound className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className={`text-xs ${isDark ? "text-white/60" : "text-slate-600"}`}>
            <span className={`font-semibold ${isDark ? "text-white/90" : "text-slate-800"}`}>Model Grain:</span>{" "}
            {grain}
          </span>
        </div>
      )}

      {/* Tables */}
      <div>
        <label className={labelClass}>Tables ({tables.length})</label>
        <div className="space-y-3">
          {tables.map((table, i) => {
            const typeStyle = TYPE_COLORS[table.type] ?? TYPE_COLORS.fact;
            return (
              <div key={i} className="rounded-xl overflow-hidden" style={cardStyle}>
                {/* Table header */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}
                >
                  <Table className="w-4 h-4 flex-shrink-0" style={{ color: typeStyle.text }} />
                  <span className={`text-sm font-semibold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{table.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: typeStyle.bg, color: typeStyle.text }}>
                    {table.type}
                  </span>
                  {table.grain && (
                    <span className={`text-[10px] ml-auto ${isDark ? "text-white/35" : "text-slate-400"}`}>Grain: {table.grain}</span>
                  )}
                </div>

                {/* Fields */}
                <div className="px-4 py-3">
                  <div className="grid grid-cols-[1fr_80px_100px_60px] gap-x-3 gap-y-1">
                    <div className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-white/30" : "text-slate-400"}`}>Field</div>
                    <div className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-white/30" : "text-slate-400"}`}>Type</div>
                    <div className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-white/30" : "text-slate-400"}`}>Source</div>
                    <div className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-white/30" : "text-slate-400"}`}>PII</div>

                    {(table.fields ?? []).map((field: FieldDefinition, fi: number) => (
                      <React.Fragment key={fi}>
                        <div className={`text-xs font-mono py-0.5 ${isDark ? "text-white/80" : "text-slate-800"}`}>{field.name}</div>
                        <div className={`text-[10px] py-0.5 ${isDark ? "text-white/45" : "text-slate-500"}`}>{field.type}</div>
                        <div className={`text-[10px] py-0.5 truncate ${isDark ? "text-white/35" : "text-slate-400"}`}>{field.sourceTable}</div>
                        <div className="py-0.5">
                          {field.isPII && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>PII</span>
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relationships */}
      {relationships.length > 0 && (
        <div>
          <label className={labelClass}>Relationships</label>
          <div className="space-y-1.5">
            {relationships.map((rel, i) => (
              <div key={i} className="flex items-center gap-2">
                <Link className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className={`text-xs font-mono ${isDark ? "text-white/60" : "text-slate-700"}`}>{rel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
