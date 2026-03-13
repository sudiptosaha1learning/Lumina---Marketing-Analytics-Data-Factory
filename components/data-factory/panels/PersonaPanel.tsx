"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { PersonaOutput, Persona } from "@/lib/data-product-types";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function PersonaPanel({ output, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<PersonaOutput>;

  const personas = (data.personas as Persona[]) ?? [];
  const userStories = (data.userStories as string[]) ?? [];

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const tagStyle = { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" };

  return (
    <div className="space-y-5">
      {/* Personas */}
      <div>
        <label className={labelClass}>Personas ({personas.length})</label>
        <div className="space-y-3">
          {personas.map((persona, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={cardStyle}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                >
                  {persona.role?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{persona.role}</span>
              </div>

              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>Jobs to be Done</p>
                <ul className="space-y-1">
                  {(persona.jobsToBeDone ?? []).map((jtbd, j) => (
                    <li key={j} className={`text-xs flex items-start gap-2 ${isDark ? "text-white/65" : "text-slate-700"}`}>
                      <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      {jtbd}
                    </li>
                  ))}
                </ul>
              </div>

              {(persona.painPoints?.length ?? 0) > 0 && (
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>Pain Points</p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.painPoints.map((pain, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                        {pain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Stories */}
      {userStories.length > 0 && (
        <div>
          <label className={labelClass}>User Stories</label>
          <div className="space-y-2">
            {userStories.map((story, i) => (
              <div key={i} className="rounded-xl px-4 py-3" style={cardStyle}>
                <p className={`text-xs leading-relaxed ${isDark ? "text-white/65" : "text-slate-700"}`}>{story}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
