"use client";

import { useState } from "react";
import { Plus, Trash2, X, PlusCircle, Lock, Unlock } from "lucide-react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { PersonaOutput, Persona } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

const MANDATORY_ROLES = [
  "Data Product Owner",
  "Data Steward",
  "Data Analyst",
  "GDPR Champion",
];

const AVATAR_COLORS = [
  "linear-gradient(135deg, #3b82f6, #6366f1)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #14b8a6, #3b82f6)",
  "linear-gradient(135deg, #f97316, #eab308)",
];

export function PersonaPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<PersonaOutput>;

  const allPersonas: Persona[] = (data.personas as Persona[]) ?? [];
  const userStories: string[] = (data.userStories as string[]) ?? [];

  // Split into mandatory / optional
  const mandatoryPersonas = allPersonas.filter((p) =>
    MANDATORY_ROLES.some((r) => r.toLowerCase() === p.role?.toLowerCase())
  );
  // Ensure all 4 mandatory roles always appear
  const mandatoryFull: Persona[] = MANDATORY_ROLES.map((role) => {
    const existing = mandatoryPersonas.find(
      (p) => p.role?.toLowerCase() === role.toLowerCase()
    );
    return existing ?? { role, jobsToBeDone: [], painPoints: [] };
  });
  const optionalPersonas = allPersonas.filter(
    (p) => !MANDATORY_ROLES.some((r) => r.toLowerCase() === p.role?.toLowerCase())
  );

  const [editingJtbd, setEditingJtbd] = useState<{ id: string; ji: number } | null>(null);
  const [editingPain, setEditingPain] = useState<{ id: string; ji: number } | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
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
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`;
  const sectionLabel = `text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`;

  function commitUpdate(updatedMandatory: Persona[], updatedOptional: Persona[]) {
    onChange({ ...output, personas: [...updatedMandatory, ...updatedOptional] });
  }

  // ── Mandatory updaters ─────────────────────────────────────────────────────
  function updateMandatoryJtbd(role: string, ji: number, value: string) {
    const updated = mandatoryFull.map((p) => {
      if (p.role !== role) return p;
      const jobs = [...(p.jobsToBeDone ?? [])];
      jobs[ji] = value;
      return { ...p, jobsToBeDone: jobs };
    });
    commitUpdate(updated, optionalPersonas);
  }
  function addMandatoryJtbd(role: string) {
    const updated = mandatoryFull.map((p) =>
      p.role !== role ? p : { ...p, jobsToBeDone: [...(p.jobsToBeDone ?? []), ""] }
    );
    const idx = updated.find((p) => p.role === role)?.jobsToBeDone?.length ?? 0;
    commitUpdate(updated, optionalPersonas);
    setEditingJtbd({ id: `m-${role}`, ji: idx - 1 });
  }
  function removeMandatoryJtbd(role: string, ji: number) {
    const updated = mandatoryFull.map((p) =>
      p.role !== role ? p : { ...p, jobsToBeDone: (p.jobsToBeDone ?? []).filter((_, i) => i !== ji) }
    );
    commitUpdate(updated, optionalPersonas);
  }
  function updateMandatoryPain(role: string, ji: number, value: string) {
    const updated = mandatoryFull.map((p) => {
      if (p.role !== role) return p;
      const pains = [...(p.painPoints ?? [])];
      pains[ji] = value;
      return { ...p, painPoints: pains };
    });
    commitUpdate(updated, optionalPersonas);
  }
  function addMandatoryPain(role: string) {
    const updated = mandatoryFull.map((p) =>
      p.role !== role ? p : { ...p, painPoints: [...(p.painPoints ?? []), ""] }
    );
    const idx = updated.find((p) => p.role === role)?.painPoints?.length ?? 0;
    commitUpdate(updated, optionalPersonas);
    setEditingPain({ id: `m-${role}`, ji: idx - 1 });
  }
  function removeMandatoryPain(role: string, ji: number) {
    const updated = mandatoryFull.map((p) =>
      p.role !== role ? p : { ...p, painPoints: (p.painPoints ?? []).filter((_, i) => i !== ji) }
    );
    commitUpdate(updated, optionalPersonas);
  }

  // ── Optional updaters ──────────────────────────────────────────────────────
  function updateOptionalRole(pi: number, value: string) {
    const updated = optionalPersonas.map((p, i) => (i === pi ? { ...p, role: value } : p));
    commitUpdate(mandatoryFull, updated);
  }
  function updateOptionalJtbd(pi: number, ji: number, value: string) {
    const updated = optionalPersonas.map((p, i) => {
      if (i !== pi) return p;
      const jobs = [...(p.jobsToBeDone ?? [])];
      jobs[ji] = value;
      return { ...p, jobsToBeDone: jobs };
    });
    commitUpdate(mandatoryFull, updated);
  }
  function addOptionalJtbd(pi: number) {
    const updated = optionalPersonas.map((p, i) =>
      i !== pi ? p : { ...p, jobsToBeDone: [...(p.jobsToBeDone ?? []), ""] }
    );
    commitUpdate(mandatoryFull, updated);
    setEditingJtbd({ id: `o-${pi}`, ji: optionalPersonas[pi].jobsToBeDone?.length ?? 0 });
  }
  function removeOptionalJtbd(pi: number, ji: number) {
    const updated = optionalPersonas.map((p, i) =>
      i !== pi ? p : { ...p, jobsToBeDone: (p.jobsToBeDone ?? []).filter((_, idx) => idx !== ji) }
    );
    commitUpdate(mandatoryFull, updated);
  }
  function updateOptionalPain(pi: number, ji: number, value: string) {
    const updated = optionalPersonas.map((p, i) => {
      if (i !== pi) return p;
      const pains = [...(p.painPoints ?? [])];
      pains[ji] = value;
      return { ...p, painPoints: pains };
    });
    commitUpdate(mandatoryFull, updated);
  }
  function addOptionalPain(pi: number) {
    const updated = optionalPersonas.map((p, i) =>
      i !== pi ? p : { ...p, painPoints: [...(p.painPoints ?? []), ""] }
    );
    commitUpdate(mandatoryFull, updated);
    setEditingPain({ id: `o-${pi}`, ji: optionalPersonas[pi].painPoints?.length ?? 0 });
  }
  function removeOptionalPain(pi: number, ji: number) {
    const updated = optionalPersonas.map((p, i) =>
      i !== pi ? p : { ...p, painPoints: (p.painPoints ?? []).filter((_, idx) => idx !== ji) }
    );
    commitUpdate(mandatoryFull, updated);
  }
  function removeOptionalPersona(pi: number) {
    commitUpdate(mandatoryFull, optionalPersonas.filter((_, i) => i !== pi));
  }
  function addOptionalPersona() {
    const newPersona: Persona = { role: "New Persona", jobsToBeDone: [""], painPoints: [] };
    commitUpdate(mandatoryFull, [...optionalPersonas, newPersona]);
    setEditingRole(`o-${optionalPersonas.length}`);
  }

  // ── User stories ───────────────────────────────────────────────────────────
  function updateStory(si: number, value: string) {
    const updated = [...userStories];
    updated[si] = value;
    onChange({ ...output, userStories: updated });
  }
  function addStory() {
    onChange({ ...output, userStories: [...userStories, "As a [persona], I want to [goal] so that [benefit]."] });
    setEditingStory(userStories.length);
  }
  function removeStory(si: number) {
    onChange({ ...output, userStories: userStories.filter((_, i) => i !== si) });
  }

  // ── Shared persona card renderer ───────────────────────────────────────────
  function renderPersonaCard(
    persona: Persona,
    colorIdx: number,
    isMandatory: boolean,
    editKey: string,
    onRoleChange: ((v: string) => void) | null,
    onRemove: (() => void) | null,
    onJtbdChange: (ji: number, v: string) => void,
    onJtbdAdd: () => void,
    onJtbdRemove: (ji: number) => void,
    onPainChange: (ji: number, v: string) => void,
    onPainAdd: () => void,
    onPainRemove: (ji: number) => void,
  ) {
    return (
      <div
        key={editKey}
        className="rounded-xl p-4 space-y-3 group"
        style={{
          ...cardStyle,
          ...(isMandatory ? { border: isDark ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(59,130,246,0.2)" } : {}),
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 select-none"
            style={{ background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length] }}
          >
            {(persona.role ?? "?").charAt(0).toUpperCase()}
          </div>

          {isMandatory ? (
            <div className="flex-1 flex items-center gap-2">
              <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {persona.role}
              </span>
              <span
                className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}
              >
                <Lock className="w-2 h-2" />
                Mandatory
              </span>
            </div>
          ) : (
            <>
              {editingRole === editKey ? (
                <input
                  autoFocus
                  value={persona.role}
                  onChange={(e) => onRoleChange?.(e.target.value)}
                  onBlur={() => setEditingRole(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingRole(null)}
                  className="flex-1 text-sm font-semibold rounded-md px-2 py-0.5 outline-none"
                  style={inputStyle}
                />
              ) : (
                <button
                  onClick={() => setEditingRole(editKey)}
                  className={`flex-1 text-left text-sm font-semibold rounded-md px-2 py-0.5 transition-colors ${
                    isDark ? "text-white hover:bg-white/[0.05]" : "text-slate-900 hover:bg-black/[0.04]"
                  }`}
                >
                  {persona.role}
                </button>
              )}
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Jobs to be Done */}
        <div>
          <p className={sectionLabel}>Jobs to be Done</p>
          <ul className="space-y-1">
            {(persona.jobsToBeDone ?? []).map((jtbd, ji) => (
              <li key={ji} className="flex items-start gap-2 group/item">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                {editingJtbd?.id === editKey && editingJtbd?.ji === ji ? (
                  <input
                    autoFocus
                    value={jtbd}
                    onChange={(e) => onJtbdChange(ji, e.target.value)}
                    onBlur={() => setEditingJtbd(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingJtbd(null)}
                    className="flex-1 text-xs rounded-md px-2 py-0.5 outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <span
                    className={`flex-1 text-xs cursor-text rounded px-1 py-0.5 -mx-1 transition-colors ${
                      isDark ? "text-white/65 hover:bg-white/[0.05]" : "text-slate-700 hover:bg-black/[0.04]"
                    }`}
                    onClick={() => setEditingJtbd({ id: editKey, ji })}
                  >
                    {jtbd || <span className="italic opacity-40">Click to edit...</span>}
                  </span>
                )}
                <button
                  onClick={() => onJtbdRemove(ji)}
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded hover:bg-red-500/10 text-red-400 mt-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={onJtbdAdd}
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
                {editingPain?.id === editKey && editingPain?.ji === ji ? (
                  <input
                    autoFocus
                    value={pain}
                    onChange={(e) => onPainChange(ji, e.target.value)}
                    onBlur={() => setEditingPain(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingPain(null)}
                    className="bg-transparent outline-none text-[10px] w-40"
                    style={{ color: "#f87171" }}
                  />
                ) : (
                  <span
                    className="cursor-text"
                    onClick={() => setEditingPain({ id: editKey, ji })}
                  >
                    {pain || <em className="opacity-50">edit...</em>}
                  </span>
                )}
                <button
                  onClick={() => onPainRemove(ji)}
                  className="opacity-0 group-hover/tag:opacity-100 transition-opacity hover:text-red-300"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={onPainAdd}
              className="inline-flex items-center gap-1 rounded-full text-[10px] px-2 py-0.5 transition-all"
              style={{ background: "rgba(239,68,68,0.05)", border: "1px dashed rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              <Plus className="w-2.5 h-2.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── MANDATORY PERSONAS ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lock className={`w-3.5 h-3.5 ${isDark ? "text-blue-400/70" : "text-blue-500"}`} />
          <span className={`${labelClass}`}>Mandatory Personas</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}
          >
            {mandatoryFull.length} required
          </span>
        </div>
        <p className={`text-[11px] mb-3 ${isDark ? "text-white/35" : "text-slate-400"}`}>
          These roles are always required for a governed data product. Their jobs-to-be-done and pain points can be edited.
        </p>
        <div className="space-y-3">
          {mandatoryFull.map((persona, pi) =>
            renderPersonaCard(
              persona, pi, true, `m-${persona.role}`,
              null, null,
              (ji, v) => updateMandatoryJtbd(persona.role, ji, v),
              () => addMandatoryJtbd(persona.role),
              (ji) => removeMandatoryJtbd(persona.role, ji),
              (ji, v) => updateMandatoryPain(persona.role, ji, v),
              () => addMandatoryPain(persona.role),
              (ji) => removeMandatoryPain(persona.role, ji),
            )
          )}
        </div>
      </div>

      {/* ── OPTIONAL PERSONAS ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Unlock className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400/70" : "text-indigo-500"}`} />
            <span className={`${labelClass}`}>Optional Personas</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8" }}
            >
              {optionalPersonas.length} identified
            </span>
          </div>
          <button
            onClick={addOptionalPersona}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
          >
            <Plus className="w-3 h-3" />
            Add Persona
          </button>
        </div>
        <p className={`text-[11px] mb-3 ${isDark ? "text-white/35" : "text-slate-400"}`}>
          Additional roles identified by the agent for this use case. You can add, rename, or remove these.
        </p>
        <div className="space-y-3">
          {optionalPersonas.map((persona, pi) =>
            renderPersonaCard(
              persona, pi + mandatoryFull.length, false, `o-${pi}`,
              (v) => updateOptionalRole(pi, v),
              () => removeOptionalPersona(pi),
              (ji, v) => updateOptionalJtbd(pi, ji, v),
              () => addOptionalJtbd(pi),
              (ji) => removeOptionalJtbd(pi, ji),
              (ji, v) => updateOptionalPain(pi, ji, v),
              () => addOptionalPain(pi),
              (ji) => removeOptionalPain(pi, ji),
            )
          )}
          {optionalPersonas.length === 0 && (
            <div className="rounded-xl p-5 text-center" style={cardStyle}>
              <p className={`text-xs ${isDark ? "text-white/35" : "text-slate-400"}`}>
                No additional personas identified. Click "Add Persona" to create one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── USER STORIES ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`${labelClass}`}>User Stories ({userStories.length})</span>
          <button
            onClick={addStory}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}
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
                    isDark ? "text-white/65 hover:bg-white/[0.05]" : "text-slate-700 hover:bg-black/[0.04]"
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
