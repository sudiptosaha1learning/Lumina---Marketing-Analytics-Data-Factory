"use client";

import React, { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, KeyRound, Link, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { ModelOutput, ModelTable, FieldDefinition } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const TYPE_OPTIONS = ["fact", "dimension", "bridge"] as const;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  fact:      { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa" },
  dimension: { bg: "rgba(99,102,241,0.12)",  text: "#818cf8" },
  bridge:    { bg: "rgba(16,185,129,0.12)",  text: "#34d399" },
};

const EMPTY_FIELD: FieldDefinition = {
  name: "",
  type: "varchar(255)",
  description: "",
  sourceTable: "",
  isPII: false,
};

export function ModelPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<ModelOutput>;

  const tables   = (data.tables        as ModelTable[]) ?? [];
  const rels     = (data.relationships as string[])     ?? [];
  const grain    = (data.grain         as string)       ?? "";

  const [expandedTables, setExpandedTables] = useState<Record<number, boolean>>(
    () => Object.fromEntries(tables.map((_, i) => [i, true]))
  );

  // ── helpers ────────────────────────────────────────────────────────────────

  const updateGrain = (value: string) => onChange({ ...output, grain: value });

  const updateTable = (ti: number, patch: Partial<ModelTable>) => {
    const updated = tables.map((t, i) => (i === ti ? { ...t, ...patch } : t));
    onChange({ ...output, tables: updated });
  };

  const deleteTable = (ti: number) => {
    onChange({ ...output, tables: tables.filter((_, i) => i !== ti) });
  };

  const addTable = () => {
    const newTable: ModelTable = {
      name: "new_table",
      grain: "one row per ...",
      type: "dimension",
      fields: [{ ...EMPTY_FIELD, name: "id", type: "varchar(36)", description: "Primary key", sourceTable: "" }],
    };
    const newTables = [...tables, newTable];
    onChange({ ...output, tables: newTables });
    setExpandedTables((prev) => ({ ...prev, [newTables.length - 1]: true }));
  };

  const updateField = (ti: number, fi: number, patch: Partial<FieldDefinition>) => {
    const updated = tables.map((t, i) => {
      if (i !== ti) return t;
      return { ...t, fields: t.fields.map((f, j) => (j === fi ? { ...f, ...patch } : f)) };
    });
    onChange({ ...output, tables: updated });
  };

  const deleteField = (ti: number, fi: number) => {
    const updated = tables.map((t, i) => {
      if (i !== ti) return t;
      return { ...t, fields: t.fields.filter((_, j) => j !== fi) };
    });
    onChange({ ...output, tables: updated });
  };

  const addField = (ti: number) => {
    const updated = tables.map((t, i) => {
      if (i !== ti) return t;
      return { ...t, fields: [...t.fields, { ...EMPTY_FIELD }] };
    });
    onChange({ ...output, tables: updated });
  };

  const updateRel = (ri: number, value: string) => {
    onChange({ ...output, relationships: rels.map((r, i) => (i === ri ? value : r)) });
  };

  const addRel = () => onChange({ ...output, relationships: [...rels, ""] });
  const deleteRel = (ri: number) => onChange({ ...output, relationships: rels.filter((_, i) => i !== ri) });

  // ── styles ─────────────────────────────────────────────────────────────────

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`;
  const inputSm = `text-xs h-7 ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/20 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-400/50"}`;
  const inputXs = `text-[11px] h-6 px-2 font-mono ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white/80 placeholder:text-white/20 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-700 focus-visible:ring-blue-400/50"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };
  const deleteBtn = `flex-shrink-0 p-1 rounded transition-colors ${isDark ? "text-white/20 hover:text-red-400 hover:bg-red-500/10" : "text-slate-300 hover:text-red-500 hover:bg-red-50"}`;

  return (
    <div className="space-y-5">
      {/* Grain */}
      <div className="flex items-center gap-3">
        <KeyRound className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span className={`text-[10px] font-semibold flex-shrink-0 ${isDark ? "text-white/50" : "text-slate-600"}`}>Model Grain</span>
        <Input
          value={grain}
          onChange={(e) => updateGrain(e.target.value)}
          className={inputSm}
          placeholder="e.g. one row per customer per scoring period"
        />
      </div>

      {/* Tables */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={labelClass}>Tables ({tables.length})</span>
          <Button
            size="sm" variant="outline" onClick={addTable}
            className={`text-[10px] h-6 px-2 gap-1 ${isDark ? "border-white/[0.1] text-white/55 hover:text-white/90 hover:bg-white/[0.06]" : "border-slate-200 text-slate-600 hover:text-slate-900"}`}
          >
            <Plus className="w-3 h-3" />
            Add table
          </Button>
        </div>

        <div className="space-y-3">
          {tables.map((table, ti) => {
            const typeStyle = TYPE_COLORS[table.type] ?? TYPE_COLORS.fact;
            const isExpanded = expandedTables[ti] ?? true;
            return (
              <div key={ti} className="rounded-xl overflow-hidden" style={cardStyle}>
                {/* Table header row */}
                <div
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    borderBottom: isExpanded ? (isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)") : "none",
                  }}
                >
                  <Table className="w-3.5 h-3.5 flex-shrink-0" style={{ color: typeStyle.text }} />

                  {/* Editable table name */}
                  <Input
                    value={table.name}
                    onChange={(e) => updateTable(ti, { name: e.target.value })}
                    className={`${inputXs} font-semibold flex-1 min-w-0`}
                    placeholder="table_name"
                  />

                  {/* Type selector */}
                  <select
                    value={table.type}
                    onChange={(e) => updateTable(ti, { type: e.target.value as ModelTable["type"] })}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 cursor-pointer ${isDark ? "bg-white/[0.06] border border-white/[0.1] text-white/70" : "bg-black/[0.04] border border-black/[0.1] text-slate-700"}`}
                    style={{ color: typeStyle.text }}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t} style={{ background: isDark ? "#1e2030" : "#fff" }}>{t}</option>
                    ))}
                  </select>

                  {/* Grain */}
                  <Input
                    value={table.grain ?? ""}
                    onChange={(e) => updateTable(ti, { grain: e.target.value })}
                    className={`${inputXs} w-40 flex-shrink-0`}
                    placeholder="grain..."
                  />

                  <button onClick={() => setExpandedTables((p) => ({ ...p, [ti]: !isExpanded }))} className={`flex-shrink-0 p-1 rounded ${isDark ? "text-white/30 hover:text-white/70" : "text-slate-400 hover:text-slate-700"}`}>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteTable(ti)} className={deleteBtn} title="Delete table">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fields */}
                {isExpanded && (
                  <div className="px-3 py-3 space-y-1.5">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_90px_100px_44px_32px] gap-x-2 mb-1">
                      {["Field name", "Type", "Source table", "PII", ""].map((h, hi) => (
                        <span key={hi} className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-white/25" : "text-slate-400"}`}>{h}</span>
                      ))}
                    </div>

                    {(table.fields ?? []).map((field, fi) => (
                      <div key={fi} className="grid grid-cols-[1fr_90px_100px_44px_32px] gap-x-2 items-center">
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(ti, fi, { name: e.target.value })}
                          className={inputXs}
                          placeholder="field_name"
                        />
                        <Input
                          value={field.type}
                          onChange={(e) => updateField(ti, fi, { type: e.target.value })}
                          className={inputXs}
                          placeholder="varchar"
                        />
                        <Input
                          value={field.sourceTable ?? ""}
                          onChange={(e) => updateField(ti, fi, { sourceTable: e.target.value })}
                          className={inputXs}
                          placeholder="source"
                        />
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={field.isPII ?? false}
                            onChange={(e) => updateField(ti, fi, { isPII: e.target.checked })}
                            className="w-3.5 h-3.5 rounded accent-red-500 cursor-pointer"
                            title="PII field"
                          />
                        </div>
                        <button onClick={() => deleteField(ti, fi)} className={`${deleteBtn} flex items-center justify-center`} title="Remove field">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addField(ti)}
                      className={`mt-1 flex items-center gap-1 text-[10px] transition-colors ${isDark ? "text-white/30 hover:text-blue-400" : "text-slate-400 hover:text-blue-500"}`}
                    >
                      <Plus className="w-3 h-3" />
                      Add column
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {tables.length === 0 && (
            <button
              onClick={addTable}
              className={`w-full rounded-xl py-5 flex flex-col items-center gap-2 border-2 border-dashed transition-colors ${isDark ? "border-white/[0.08] text-white/30 hover:border-blue-500/30 hover:text-blue-400" : "border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"}`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-medium">Add your first table</span>
            </button>
          )}
        </div>
      </div>

      {/* Relationships */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={labelClass}>Relationships ({rels.length})</span>
          <button
            onClick={addRel}
            className={`flex items-center gap-1 text-[10px] transition-colors ${isDark ? "text-white/30 hover:text-blue-400" : "text-slate-400 hover:text-blue-500"}`}
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        <div className="space-y-1.5">
          {rels.map((rel, ri) => (
            <div key={ri} className="flex items-center gap-2">
              <Link className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <Input
                value={rel}
                onChange={(e) => updateRel(ri, e.target.value)}
                className={`${inputSm} font-mono flex-1`}
                placeholder="e.g. fact_propensity.customer_id → dim_customer.customer_id"
              />
              <button onClick={() => deleteRel(ri)} className={deleteBtn} title="Remove relationship">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
