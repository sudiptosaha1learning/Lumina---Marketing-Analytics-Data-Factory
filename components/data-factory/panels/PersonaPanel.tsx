"use client";

import { useState } from "react";
import { Plus, Trash2, X, PlusCircle, GripVertical } from "lucide-react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { PersonaOutput, Persona } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, #3b82f6, #6366f1)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #14b8a6, #3b82f6)",
];

export function PersonaPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<PersonaOutput>;

  const personas: Persona[] = (data.personas as Persona[]) ?? [];
  const userStories: string[] = (data.userStories as string[]) ?? [];

  // Track which JTBD / pain point fields are being edited inline
  const [editingJtbd, setEditingJtbd] = useState<{ pi: number; ji: number } | null>(null);
  const [editingPain, setEditingPain] = useState<{ pi: number; ji: number } | null>(null);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [editingStory, setEditingStory] = useState<number | null>(null);

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };
  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
    color: isDark ? "rgba(255,255,255,0.85)" : "#1e293b",
  };
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const sectionLabel = `text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`;

  function updatePersonas(updated: Persona[]) {
    onChange({ ...output, personas: updated });
  }

  function updateRole(pi: number, value: string) {
    const updated = personas.map((p, i) => (i === pi ? { ...p, role: value } : p));
    updatePersonas(updated);
  }

  function updateJtbd(pi: number, ji: number, value: string) {
    const updated = personas.map((p, i) => {
      if (i !== pi) return p;
      const jobs = [...(p.jobsToBeDone ?? [])];
      jobs[ji] = value;
      return { ...p, jobsToBeDone: jobs };
    });
    updatePersonas(updated);
  }

  function addJtbd(pi: number) {
    const updated = personas.map((p, i) => {
      if (i !== pi) return p;
      return { ...p, jobsToBeDone: [...(p.jobsToBeDone ?? []), ""] };
    });
    updatePersonas(updated);
    setEditingJtbd({ pi, ji: personas[pi].jobsToBeDone?.length ?? 0 });
  }

  function removeJtbd(pi: number, ji: number) {
    const updated = personas.map((p, i) => {
      if (i !== pi) return p;
      const jobs = (p.jobsToBeDone ?? []).filter((_, idx) => idx !== ji);
      return { ...p, jobsToBeDone: jobs };
    });
    updatePersonas(updated);
  }

  function updatePain(pi: number, ji: number, value: string) {
    const updated = personas.map((p, i) => {
      if (i !== pi) return p;
      const pains = [...(p.painPoints ?? [])];
      pains[ji] = value;
      return { ...p, painPoints: pains };
    });
    updatePersonas(updated);
  }

  function addPain(pi: number) {
    const updated = personas.map((p, i) => {
      if (i !== pi) return p;
      return { ...p, painPoints: [...(p.painPoints ?? []), ""] };
    });
    updatePersonas(updated);
    setEditingPain({ pi, ji: personas[pi].painPoints?.length ?? 0 });
  }

  function removePain(pi: number, ji: number) {
    const updated = personas.map((p, i) => {
      if (i !== pi) return p;
      const pains = (p.painPoints ?? []).filter((_, idx) => idx !== ji);
      return { ...p, painPoints: pains };
    });
    updatePersonas(updated);
  }

  function removePersona(pi: number) {
    updatePersonas(personas.filter((_, i) => i !== pi));
  }

  function addPersona() {
    const newPersona: Persona = { role: "New Persona", jobsToBeDone: [""], painPoints: [] };
    updatePersonas([...personas, newPersona]);
    setEditingRole(personas.length);
  }

  function updateStory(si: number, value: string) {
    const updated = [...userStories];
    updated[si] = value;
    onChange({ ...output, userStories: updated });
  }

  function addStory() {
    const updated = [...userStories, "As a [persona], I want to [goal] so that [benefit]."];
    onChange({ ...output, userStories: updated });
    setEditingStory(userStories.length);
  }

  function removeStory(si: number) {
    onChange({ ...output, userStories: userStories.filter((_, i) => i !== si) });
  }

  return (
    <div className="space-y-5">
      {/* Personas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`${labelClass} mb-0`}>Personas ({personas.length})</label>
          <button
            onClick={addPersona}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}
          >
            <Plus className="w-3 h-3" />
            Add Persona
          </button>
        </div>

        <div className="space-y-3">
          {personas.map((persona, pi) => (
            <div key={pi} className="rounded-xl p-4 space-y-3 group" style={cardStyle}>
              {/* Header row — editable role name */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 select-none"
                  style={{ background: AVATAR_COLORS[pi % AVATAR_COLORS.length] }}
                >
                  {(persona.role ?? "?").charAt(0).toUpperCase()}
                </div>

                {editingRole === pi ? (
                  <input
                    autoFocus
                    value={persona.role}
                    onChange={(e) => updateRole(pi, e.target.value)}
                    onBlur={() => setEditingRole(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingRole(null)}
                    className="flex-1 text-sm font-semibold rounded-md px-2 py-0.5 outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <button
                    onClick={() => setEditingRole(pi)}
                    className={`flex-1 text-left text-sm font-semibold rounded-md px-2 py-0.5 transition-colors ${
                      isDark
                        ? "text-white hover:bg-white/[0.05]"
                        : "text-slate-900 hover:bg-black/[0.04]"
                    }`}
                    title="Click to rename"
                  >
                    {persona.role}
                  </button>
                )}

                <button
                  onClick={() => removePersona(pi)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-500/10 text-red-400"
                  title="Remove persona"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Jobs to be Done */}
              <div>
                <p className={sectionLabel}>Jobs to be Done</p>
                <ul className="space-y-1">
                  {(persona.jobsToBeDone ?? []).map((jtbd, ji) => (
                    <li key={ji} className="flex items-start gap-2 group/item">
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {editingJtbd?.pi === pi && editingJtbd?.ji === ji ? (
                        <div className="flex-1 flex gap-1">
                          <input
                            autoFocus
                            value={jtbd}
                            onChange={(e) => updateJtbd(pi, ji, e.target.value)}
                            onBlur={() => setEditingJtbd(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingJtbd(null)}
                            className="flex-1 text-xs rounded-md px-2 py-0.5 outline-none"
                            style={inputStyle}
                          />
                        </div>
                      ) : (
                        <span
                          className={`flex-1 text-xs cursor-text rounded px-1 py-0.5 -mx-1 transition-colors ${
                            isDark
                              ? "text-white/65 hover:bg-white/[0.05]"
                              : "text-slate-700 hover:bg-black/[0.04]"
                          }`}
                          onClick={() => setEditingJtbd({ pi, ji })}
                        >
                          {jtbd || <span className="italic opacity-40">Click to edit…</span>}
                        </span>
                      )}
                      <button
                        onClick={() => removeJtbd(pi, ji)}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded hover:bg-red-500/10 text-red-400 mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => addJtbd(pi)}
                  className={`mt-2 flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    isDark ? "text-blue-400/70 hover:text-blue-400" : "text-blue-500/70 hover:text-blue-600"
                  }`}
                >
                  <PlusCircle className="w-3 h-3" />
                  Add job
                </button>
              </div>

              {/* Pain Points */}
              <div>
                <p className={sectionLabel}>Pain Points</p>
                <div className="flex flex-wrap gap-1.5">
                  {(persona.painPoints ?? []).map((pain, ji) => (
                    <span
                      key={ji}
                      className="inline-flex items-center gap-1 group/tag rounded-full text-[10px] px-2 py-0.5"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                    >
                      {editingPain?.pi === pi && editingPain?.ji === ji ? (
                        <input
                          autoFocus
                          value={pain}
                          onChange={(e) => updatePain(pi, ji, e.target.value)}
                          onBlur={() => setEditingPain(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingPain(null)}
                          className="bg-transparent outline-none text-[10px] w-40"
                          style={{ color: "#f87171" }}
                        />
                      ) : (
                        <span
                          className="cursor-text"
                          onClick={() => setEditingPain({ pi, ji })}
                          title="Click to edit"
                        >
                          {pain || <em className="opacity-50">edit…</em>}
                        </span>
                      )}
                      <button
                        onClick={() => removePain(pi, ji)}
                        className="opacity-0 group-hover/tag:opacity-100 transition-opacity hover:text-red-300"
                        title="Remove"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => addPain(pi)}
                    className="inline-flex items-center gap-1 rounded-full text-[10px] px-2 py-0.5 transition-all"
                    style={{
                      background: "rgba(239,68,68,0.05)",
                      border: "1px dashed rgba(239,68,68,0.3)",
                      color: "#f87171",
                    }}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}

          {personas.length === 0 && (
            <div
              className="rounded-xl p-6 text-center"
              style={cardStyle}
            >
              <p className={`text-xs ${isDark ? "text-white/35" : "text-slate-400"}`}>
                No personas yet. Click "Add Persona" to create one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Stories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`${labelClass} mb-0`}>User Stories ({userStories.length})</label>
          <button
            onClick={addStory}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
          >
            <Plus className="w-3 h-3" />
            Add Story
          </button>
        </div>
        <div className="space-y-2">
          {userStories.map((story, si) => (
            <div key={si} className="rounded-xl px-3 py-2.5 flex gap-2 items-start group" style={cardStyle}>
              {editingStory === si ? (
                <textarea
                  autoFocus
                  value={story}
                  onChange={(e) => updateStory(si, e.target.value)}
                  onBlur={() => setEditingStory(null)}
                  rows={2}
                  className="flex-1 text-xs leading-relaxed rounded-md px-2 py-1 outline-none resize-none"
                  style={inputStyle}
                />
              ) : (
                <p
                  className={`flex-1 text-xs leading-relaxed cursor-text rounded px-1 -mx-1 py-0.5 transition-colors ${
                    isDark
                      ? "text-white/65 hover:bg-white/[0.05]"
                      : "text-slate-700 hover:bg-black/[0.04]"
                  }`}
                  onClick={() => setEditingStory(si)}
                >
                  {story}
                </p>
              )}
              <button
                onClick={() => removeStory(si)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded hover:bg-red-500/10 text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
