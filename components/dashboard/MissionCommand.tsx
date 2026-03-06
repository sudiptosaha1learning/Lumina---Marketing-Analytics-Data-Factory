"use client";

import { useState, useCallback } from "react";
import {
  Brain, Store, Download, Send, X,
  TrendingUp, Users, DollarSign, ChevronRight,
  Layers, Lightbulb, ArrowRight, CheckCircle, AlertCircle,
  Sliders, Play, RefreshCw, BadgeCheck, Zap,
  Shield, Leaf, Heart, Scissors, BarChart2, Info
} from "lucide-react";
import { type Mission, type Region, modelCards, launchDate, closeDate } from "@/lib/dashboard-data";
import { useTheme } from "@/components/dashboard/ThemeProvider";

interface MissionCommandProps {
  missions: Mission[];
  region: Region;
  onViewRetailers: (mission: Mission) => void;
}

const PRIORITY_CONFIG = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  High:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  Strategic:{ color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)" },
};

// ─── Business Objectives ──────────────────────────────────────────────────────

export type BusinessObjective =
  | "Maximize Revenue"
  | "Protect Margin"
  | "Accelerate EV Adoption"
  | "Improve Retention"
  | "Reduce Incentive Burn";

interface ObjectiveDef {
  id: BusinessObjective;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  tagline: string;
  affinity: string[];
}

const OBJECTIVES: ObjectiveDef[] = [
  {
    id: "Maximize Revenue",
    icon: DollarSign,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    tagline: "Drive top-line growth",
    affinity: ["renewal", "upselling", "buyback"],
  },
  {
    id: "Protect Margin",
    icon: Shield,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    tagline: "Organic, high-margin conversions",
    affinity: ["lead-scoring", "cancellation", "service-retention"],
  },
  {
    id: "Accelerate EV Adoption",
    icon: Leaf,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    tagline: "Meet BEV transition targets",
    affinity: ["buyback", "renewal", "intelligent-lead"],
  },
  {
    id: "Improve Retention",
    icon: Heart,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    tagline: "Reduce churn, prioritise loyalty",
    affinity: ["service-retention", "cancellation", "renewal"],
  },
  {
    id: "Reduce Incentive Burn",
    icon: Scissors,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
    tagline: "Cut cost-per-acquisition",
    affinity: ["lead-scoring", "cancellation"],
  },
];

// ─── Simulation Parameters ────────────────────────────────────────────────────

export interface SimParams {
  revenueWeight: number;
  marginProtection: number;
  evFocus: number;
  carModelMix: number;
  lifecycleBias: number;
  incentiveAggression: number;
}

const DEFAULT_PARAMS: SimParams = {
  revenueWeight: 50,
  marginProtection: 50,
  evFocus: 50,
  carModelMix: 50,
  lifecycleBias: 50,
  incentiveAggression: 50,
};

const OBJECTIVE_PRESETS: Record<BusinessObjective, Partial<SimParams>> = {
  "Maximize Revenue":       { revenueWeight: 80, marginProtection: 30, incentiveAggression: 65, carModelMix: 40 },
  "Protect Margin":         { marginProtection: 80, incentiveAggression: 20, revenueWeight: 55 },
  "Accelerate EV Adoption": { evFocus: 85, lifecycleBias: 55, carModelMix: 60 },
  "Improve Retention":      { lifecycleBias: 80, marginProtection: 60, incentiveAggression: 40 },
  "Reduce Incentive Burn":  { incentiveAggression: 15, marginProtection: 75, revenueWeight: 45 },
};

// ─── Slider config ────────────────────────────────────────────────────────────

interface SliderDef {
  key: keyof SimParams;
  label: string;
  leftLabel: string;
  rightLabel: string;
  color: string;
  relevantFor: BusinessObjective[];
  icon: React.ElementType;
}

const SLIDERS: SliderDef[] = [
  {
    key: "revenueWeight",
    label: "Revenue vs. Volume",
    leftLabel: "Volume",
    rightLabel: "Revenue",
    color: "#10b981",
    relevantFor: ["Maximize Revenue", "Protect Margin", "Reduce Incentive Burn"],
    icon: DollarSign,
  },
  {
    key: "marginProtection",
    label: "Margin Protection",
    leftLabel: "Flexible",
    rightLabel: "Protected",
    color: "#3b82f6",
    relevantFor: ["Protect Margin", "Reduce Incentive Burn", "Maximize Revenue"],
    icon: Shield,
  },
  {
    key: "evFocus",
    label: "EV Customer Focus",
    leftLabel: "ICE Priority",
    rightLabel: "EV Priority",
    color: "#06b6d4",
    relevantFor: ["Accelerate EV Adoption", "Maximize Revenue", "Improve Retention"],
    icon: Leaf,
  },
  {
    key: "carModelMix",
    label: "Vehicle Model Mix",
    leftLabel: "Range Rover Focus",
    rightLabel: "Balanced Mix",
    color: "#f97316",
    relevantFor: ["Maximize Revenue", "Accelerate EV Adoption", "Improve Retention"],
    icon: BarChart2,
  },
  {
    key: "lifecycleBias",
    label: "Lifecycle Target",
    leftLabel: "Acquisition",
    rightLabel: "Retention",
    color: "#f59e0b",
    relevantFor: ["Improve Retention", "Accelerate EV Adoption", "Protect Margin"],
    icon: Heart,
  },
  {
    key: "incentiveAggression",
    label: "Incentive Strategy",
    leftLabel: "Conservative",
    rightLabel: "Aggressive",
    color: "#8b5cf6",
    relevantFor: ["Maximize Revenue", "Reduce Incentive Burn", "Protect Margin"],
    icon: Scissors,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "59, 130, 246";
}

function parseRevenue(val: string): number {
  if (val === "N/A" || val === "$0M" || val === "£0M") return 0;
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function formatRevenueSim(original: string, multiplier: number): string {
  if (original === "N/A") return "N/A";
  const prefix = original.startsWith("£") ? "£" : "$";
  const base = parseRevenue(original);
  if (base === 0) return original;
  return `${prefix}${(base * multiplier).toFixed(2)}M`;
}

function formatConvSim(original: string, multiplier: number): string {
  if (original === "N/A") return "N/A";
  const base = parseFloat(original.replace("%", ""));
  return `${Math.min(99, base * multiplier).toFixed(0)}%`;
}

function computeSimMultipliers(
  params: SimParams,
  primaryObjective: BusinessObjective | null,
  missionSourceModels: string[]
): { revenue: number; customers: number; conversion: number } {
  if (!primaryObjective) return { revenue: 1, customers: 1, conversion: 1 };

  const p = params;
  const pDef = OBJECTIVES.find((o) => o.id === primaryObjective)!;
  const hasAffinity = missionSourceModels.some((m) => pDef.affinity.includes(m));
  const affinityBoost = hasAffinity ? 1.06 : 1.0;

  const revenueMultiplier  = 0.85 + (p.revenueWeight / 100) * 0.40;
  const customerMultiplier = 0.70 + ((100 - p.lifecycleBias) / 100) * 0.55 + (p.evFocus / 100) * 0.20;
  const conversionBase     = 0.90 + (p.marginProtection / 100) * 0.20;
  const conversionMult     = conversionBase + (p.incentiveAggression / 100) * 0.08 - ((100 - p.incentiveAggression) / 100) * 0.04;

  return {
    revenue:    revenueMultiplier * affinityBoost,
    customers:  customerMultiplier,
    conversion: Math.max(0.80, Math.min(1.35, conversionMult)),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MissionCommand({ missions, region, onViewRetailers }: MissionCommandProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [explainabilityMission, setExplainabilityMission] = useState<Mission | null>(null);
  const [businessMode, setBusinessMode] = useState(false);
  const [primaryObjective, setPrimaryObjective] = useState<BusinessObjective | null>(null);
  const [simParams, setSimParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [simActive, setSimActive] = useState(false);
  const [simRunning, setSimRunning] = useState(false);

  const textPrimary   = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)";

  const totalCustomers = missions.reduce((sum, m) => sum + (m.targetCustomers[region] ?? 0), 0);

  const handleSelectObjective = useCallback((obj: BusinessObjective) => {
    const next = primaryObjective === obj ? null : obj;
    setPrimaryObjective(next);
    setSimActive(false);
    if (next) {
      setSimParams((prev) => ({ ...prev, ...OBJECTIVE_PRESETS[next] }));
    } else {
      setSimParams(DEFAULT_PARAMS);
    }
  }, [primaryObjective]);

  const handleParamChange = useCallback((key: keyof SimParams, val: number) => {
    setSimParams((prev) => ({ ...prev, [key]: val }));
  }, []);

  const runSimulation = useCallback(() => {
    if (!primaryObjective) return;
    setSimRunning(true);
    setTimeout(() => { setSimRunning(false); setSimActive(true); }, 900);
  }, [primaryObjective]);

  const resetSim = useCallback(() => {
    setSimActive(false);
    setPrimaryObjective(null);
    setSimParams(DEFAULT_PARAMS);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full bg-blue-500" />
            <h2 className="font-heading font-semibold text-lg" style={{ color: textPrimary }}>
              Mission Command Centre
            </h2>
          </div>
          <p className="text-sm ml-3.5" style={{ color: textSecondary }}>
            3 strategic missions synthesised · Combined opportunity: $72.2M
          </p>
          <div className="flex items-center gap-1.5 ml-3.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-600">
              Opportunity Cluster Detected for {totalCustomers.toLocaleString()} Customers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600 text-xs font-medium">Synthesis Active</span>
          </div>
          <button
            onClick={() => { setBusinessMode((v) => !v); if (businessMode) resetSim(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: businessMode ? "rgba(139,92,246,0.15)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              border:     businessMode ? "1px solid rgba(139,92,246,0.45)" : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              color:      businessMode ? "#8b5cf6" : isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)",
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            Business Driven Mode
          </button>
        </div>
      </div>

      {businessMode && (
        <BusinessDrivenPanel
          isDark={isDark}
          primaryObjective={primaryObjective}
          simParams={simParams}
          simActive={simActive}
          simRunning={simRunning}
          onSelectObjective={handleSelectObjective}
          onParamChange={handleParamChange}
          onRun={runSimulation}
          onReset={resetSim}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {missions.map((mission, idx) => {
          const pc = PRIORITY_CONFIG[mission.priority] ?? PRIORITY_CONFIG.Strategic;
          const simMult = (businessMode && simActive)
            ? computeSimMultipliers(simParams, primaryObjective, mission.sourceModels)
            : null;
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              region={region}
              priorityConfig={pc}
              index={idx}
              isDark={isDark}
              simMultipliers={simMult}
              onExplain={() => setExplainabilityMission(mission)}
              onViewRetailers={() => onViewRetailers(mission)}
            />
          );
        })}
      </div>

      {explainabilityMission && (
        <ExplainabilityPanel
          mission={explainabilityMission}
          region={region}
          isDark={isDark}
          onClose={() => setExplainabilityMission(null)}
        />
      )}
    </div>
  );
}

// ─── Business Driven Panel ────────────────────────────────────────────────────

interface BusinessDrivenPanelProps {
  isDark: boolean;
  primaryObjective: BusinessObjective | null;
  simParams: SimParams;
  simActive: boolean;
  simRunning: boolean;
  onSelectObjective: (obj: BusinessObjective) => void;
  onParamChange: (key: keyof SimParams, val: number) => void;
  onRun: () => void;
  onReset: () => void;
}

function BusinessDrivenPanel({
  isDark, primaryObjective, simParams, simActive, simRunning,
  onSelectObjective, onParamChange, onRun, onReset,
}: BusinessDrivenPanelProps) {
  const panelBg     = isDark ? "rgba(139,92,246,0.05)" : "rgba(139,92,246,0.03)";
  const panelBorder = isDark ? "1px solid rgba(139,92,246,0.18)" : "1px solid rgba(139,92,246,0.13)";
  const divider     = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary   = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
  const textMuted     = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.32)";

  const activeSliders = primaryObjective
    ? SLIDERS.filter((s) => s.relevantFor.includes(primaryObjective))
    : SLIDERS;

  const canRun = !!primaryObjective && !simRunning;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: panelBg, border: panelBorder }}>

      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${divider}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.18)" }}>
            <Sliders className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <div className="font-heading font-semibold text-sm" style={{ color: textPrimary }}>
              Business Driven Simulation
            </div>
            <div className="text-[11px]" style={{ color: textSecondary }}>
              Select an objective, tune parameters, then run the simulation
            </div>
          </div>
        </div>
        {simActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}>
            <BadgeCheck className="w-3 h-3 text-violet-500" />
            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Simulation Active</span>
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]" style={{ borderBottom: `1px solid ${divider}` }}>

        {/* Left — Objective picker */}
        <div className="p-4 space-y-1.5" style={{ borderRight: `1px solid ${divider}` }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: textMuted }}>
            Business Objective
          </div>
          {OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            const isSelected = primaryObjective === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => onSelectObjective(obj.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                style={{
                  background: isSelected ? obj.bg : "transparent",
                  border: `1px solid ${isSelected ? obj.border : "transparent"}`,
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected
                      ? `rgba(${hexToRgb(obj.color)}, 0.22)`
                      : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? obj.color : textMuted }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold leading-tight truncate"
                    style={{ color: isSelected ? obj.color : textPrimary }}>
                    {obj.id}
                  </div>
                  <div className="text-[10px] truncate mt-0.5" style={{ color: textMuted }}>
                    {obj.tagline}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: obj.color }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right — Parameter sliders */}
        <div className="p-5">
          {!primaryObjective ? (
            <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <Sliders className="w-5 h-5" style={{ color: textMuted }} />
              </div>
              <p className="text-xs text-center max-w-[200px]" style={{ color: textMuted }}>
                Select a business objective to configure simulation parameters
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                  Simulation Parameters
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  {activeSliders.length} parameters active for{" "}
                  <span style={{ color: OBJECTIVES.find(o => o.id === primaryObjective)!.color }}>
                    {primaryObjective}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {activeSliders.map((sliderDef) => (
                  <SimSlider
                    key={sliderDef.key}
                    def={sliderDef}
                    value={simParams[sliderDef.key]}
                    isDark={isDark}
                    onChange={(val) => onParamChange(sliderDef.key, val)}
                    live={simActive}
                  />
                ))}
              </div>
              {SLIDERS.filter(s => !s.relevantFor.includes(primaryObjective!)).length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <Info className="w-3 h-3 flex-shrink-0" style={{ color: textMuted }} />
                  <span className="text-[10px]" style={{ color: textMuted }}>
                    Not active for this objective:{" "}
                    {SLIDERS.filter(s => !s.relevantFor.includes(primaryObjective!)).map(s => s.label).join(" · ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer action row */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {simActive && primaryObjective && (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: textSecondary }}>
              <Zap className="w-3 h-3 text-violet-500" />
              Mission cards reflect{" "}
              <strong style={{ color: OBJECTIVES.find(o => o.id === primaryObjective)!.color }}>
                {primaryObjective}
              </strong>
              {" "}· Adjust sliders to update live
            </div>
          )}
          {!simActive && !primaryObjective && (
            <span className="text-[11px]" style={{ color: textMuted }}>
              Select an objective to configure and run a what-if simulation
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {simActive && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                color: textSecondary,
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            onClick={onRun}
            disabled={!canRun}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canRun ? "#7c3aed" : "rgba(139,92,246,0.3)",
              color: "#ffffff",
              border: "1px solid rgba(139,92,246,0.5)",
              boxShadow: canRun ? "0 4px 14px rgba(139,92,246,0.4)" : "none",
            }}
          >
            {simRunning
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running...</>
              : simActive
                ? <><Play className="w-3.5 h-3.5" /> Re-run</>
                : <><Play className="w-3.5 h-3.5" /> Run Simulation</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sim Slider ───────────────────────────────────────────────────────────────

interface SimSliderProps {
  def: SliderDef;
  value: number;
  isDark: boolean;
  live: boolean;
  onChange: (val: number) => void;
}

function SimSlider({ def, value, isDark, live, onChange }: SimSliderProps) {
  const Icon = def.icon;
  const textPrimary = isDark ? "#e2e8f0" : "#0f172a";
  const textMuted   = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)";
  const trackBg     = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" style={{ color: def.color }} />
          <span className="text-[11px] font-medium" style={{ color: textPrimary }}>{def.label}</span>
          {live && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }}>
              Live
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold tabular-nums" style={{ color: def.color }}>
          {value}
        </span>
      </div>

      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: trackBg }} />
        <div
          className="absolute left-0 h-1.5 rounded-full transition-all duration-150"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, rgba(${hexToRgb(def.color)},0.5), ${def.color})` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full shadow-md pointer-events-none transition-all duration-150"
          style={{
            left: `calc(${value}% - 7px)`,
            background: "#ffffff",
            border: `2px solid ${def.color}`,
            boxShadow: `0 0 8px rgba(${hexToRgb(def.color)},0.5)`,
            zIndex: 1,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[9px]" style={{ color: textMuted }}>{def.leftLabel}</span>
        <span className="text-[9px]" style={{ color: textMuted }}>{def.rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Mission Card ─────────────────────────────────────────────────────────────

interface MissionCardProps {
  mission: Mission;
  region: Region;
  priorityConfig: { color: string; bg: string; border: string };
  index: number;
  isDark: boolean;
  simMultipliers: { revenue: number; customers: number; conversion: number } | null;
  onExplain: () => void;
  onViewRetailers: () => void;
}

function MissionCard({ mission, region, priorityConfig: pc, index, isDark, simMultipliers, onExplain, onViewRetailers }: MissionCardProps) {
  const [hovered, setHovered] = useState(false);
  const sourceModelNames = mission.sourceModels.map(
    (id) => modelCards.find((m) => m.id === id)?.shortTitle ?? id
  );

  const textPrimary   = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
  const textMuted     = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)";
  const surfaceBg     = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const tagBg         = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tagBorder     = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";
  const idxBg         = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const displayRevenue    = simMultipliers ? formatRevenueSim(mission.projectedRevenue[region], simMultipliers.revenue)                        : mission.projectedRevenue[region];
  const displayCustomers  = simMultipliers ? Math.round(mission.targetCustomers[region] * simMultipliers.customers).toLocaleString()           : mission.targetCustomers[region].toLocaleString();
  const displayConversion = simMultipliers ? formatConvSim(mission.conversionRate[region], simMultipliers.conversion)                          : mission.conversionRate[region];

  return (
    <div
      className="relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: hovered ? `rgba(${hexToRgb(mission.color)}, 0.08)` : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
        border: `1px solid ${hovered ? `rgba(${hexToRgb(mission.color)}, 0.4)` : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
        backdropFilter: "blur(16px)",
        boxShadow: hovered ? `0 0 32px rgba(${hexToRgb(mission.color)}, 0.12)` : isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${mission.color}, transparent)` }} />

      {simMultipliers && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full z-10"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)" }}>
          <Zap className="w-2.5 h-2.5 text-violet-500" />
          <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">Simulated</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{ background: idxBg, color: textMuted }}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color }}>
              {mission.priority === "Critical" && <AlertCircle className="w-2.5 h-2.5" />}
              {mission.priority}
            </div>
          </div>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1 h-1 rounded-full"
                style={{ background: i === 0 ? mission.color : `rgba(${hexToRgb(mission.color)}, ${0.4 - i * 0.1})` }} />
            ))}
          </div>
        </div>

        <h3 className="font-heading font-bold text-base leading-tight mb-1" style={{ color: textPrimary }}>
          {mission.title}
        </h3>
        <p className="text-xs leading-relaxed mb-1" style={{ color: textSecondary }}>{mission.subtitle}</p>
        <p className="italic text-xs mb-4" style={{ color: `rgba(${hexToRgb(mission.color)}, ${isDark ? 0.8 : 0.9})` }}>
          "{mission.tagline}"
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Revenue",    value: displayRevenue,    orig: mission.projectedRevenue[region],                 icon: DollarSign },
            { label: "Customers",  value: displayCustomers,  orig: mission.targetCustomers[region].toLocaleString(), icon: Users },
            { label: "Conv. Rate", value: displayConversion, orig: mission.conversionRate[region],                   icon: TrendingUp },
          ].map((stat) => {
            const changed = !!simMultipliers && stat.value !== stat.orig;
            return (
              <div key={stat.label} className="p-2.5 rounded-xl text-center transition-all duration-300"
                style={{
                  background: changed ? "rgba(139,92,246,0.08)" : surfaceBg,
                  border:     changed ? "1px solid rgba(139,92,246,0.25)" : surfaceBorder,
                }}>
                <stat.icon className="w-3 h-3 mx-auto mb-1" style={{ color: changed ? "#8b5cf6" : textMuted }} />
                <div className="font-bold text-sm font-heading leading-none transition-all duration-300"
                  style={{ color: changed ? "#8b5cf6" : textPrimary }}>
                  {stat.value}
                </div>
                {changed && (
                  <div className="text-[8px] line-through mt-0.5" style={{ color: textMuted }}>{stat.orig}</div>
                )}
                <div className="text-[9px] mt-0.5" style={{ color: textMuted }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: textMuted }}>Source Models</div>
          <div className="flex flex-wrap gap-1.5">
            {sourceModelNames.map((name) => (
              <span key={name} className="px-2 py-0.5 rounded text-[10px]"
                style={{ background: tagBg, border: tagBorder, color: textSecondary }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={onExplain}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: `rgba(${hexToRgb(mission.color)}, 0.12)`,
              border:     `1px solid rgba(${hexToRgb(mission.color)}, 0.35)`,
              color: mission.color,
            }}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" />
              EXPLAINABILITY
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-3 gap-1.5">
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px]"
              style={{ border: surfaceBorder, color: textSecondary, background: "transparent" }}>
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px]"
              style={{ border: surfaceBorder, color: textSecondary, background: "transparent" }}>
              <Send className="w-3.5 h-3.5" />
              Push
            </button>
            <button
              onClick={onViewRetailers}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.35)", color: "#3b82f6" }}>
              <Store className="w-3.5 h-3.5" />
              Retailers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Explainability Panel ─────────────────────────────────────────────────────

interface ExplainabilityPanelProps {
  mission: Mission;
  region: Region;
  isDark: boolean;
  onClose: () => void;
}

function ExplainabilityPanel({ mission, isDark, onClose }: ExplainabilityPanelProps) {
  const weightColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

  const panelBg       = isDark ? "rgba(8,11,20,0.99)"             : "rgba(248,250,253,0.99)";
  const panelBorder   = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
  const dividerColor  = isDark ? "rgba(255,255,255,0.06)"          : "rgba(0,0,0,0.07)";
  const textPrimary   = isDark ? "#e2e8f0"                         : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.50)"          : "rgba(0,0,0,0.50)";
  const textMuted     = isDark ? "rgba(255,255,255,0.35)"          : "rgba(0,0,0,0.35)";
  const surfaceBg     = isDark ? "rgba(255,255,255,0.04)"          : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)": "1px solid rgba(0,0,0,0.07)";
  const closeBg       = isDark ? "rgba(255,255,255,0.08)"          : "rgba(0,0,0,0.07)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: panelBg, border: panelBorder }}>

        <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)` }}>
              <Brain className="w-5 h-5" style={{ color: mission.color }} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base" style={{ color: textPrimary }}>{mission.title}</h2>
              <p className="text-xs" style={{ color: textSecondary }}>AI Explainability Chain · Full Data Lineage</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: textSecondary }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = closeBg; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto" style={{ borderRight: `1px solid ${dividerColor}` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.18)" }}>
                <Layers className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <div className="font-semibold text-sm font-heading" style={{ color: textPrimary }}>{mission.because.title}</div>
                <div className="text-[10px]" style={{ color: textSecondary }}>{"The \"Because\" — Raw Data Correlation"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="text-blue-500 font-bold text-xl font-heading">{mission.because.correlationStrength}</div>
              <div>
                <div className="text-xs font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                  Correlation Confidence
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>Cross-model signal alignment</div>
              </div>
            </div>

            <div className="space-y-3">
              {mission.because.dataPoints.map((dp, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-xs font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                        {dp.model}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: `rgba(${hexToRgb(weightColor[dp.weight as keyof typeof weightColor] ?? "#3b82f6")}, 0.15)`,
                        color: weightColor[dp.weight as keyof typeof weightColor] ?? "#3b82f6",
                        border: `1px solid rgba(${hexToRgb(weightColor[dp.weight as keyof typeof weightColor] ?? "#3b82f6")}, 0.3)`,
                      }}>
                      {dp.weight} Signal
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>
                    {dp.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `rgba(${hexToRgb(mission.color)}, 0.18)` }}>
                <Lightbulb className="w-3.5 h-3.5" style={{ color: mission.color }} />
              </div>
              <div>
                <div className="font-semibold text-sm font-heading" style={{ color: textPrimary }}>{mission.therefore.title}</div>
                <div className="text-[10px]" style={{ color: textSecondary }}>{"The \"Therefore\" — Strategic Insight"}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl mb-4"
              style={{ background: `rgba(${hexToRgb(mission.color)}, 0.07)`, border: `1px solid rgba(${hexToRgb(mission.color)}, 0.2)` }}>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)" }}>
                {mission.therefore.strategy}
              </p>
            </div>

            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: textSecondary }}>Tactical Playbook</div>
              <div className="space-y-2.5">
                {mission.therefore.tactics.map((tactic, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold"
                      style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)`, color: mission.color }}>
                      {i + 1}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      {tactic}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: textMuted }}>Timeline</div>
                <div className="text-xs leading-snug" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.75)" }}>
                  {`Launch: ${launchDate(mission.therefore.timelineDaysFromNow.launch)} | Close: ${closeDate(mission.therefore.timelineDaysFromNow.close)}`}
                </div>
              </div>
              <div className="p-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: textMuted }}>Expected ROI</div>
                <div className="text-green-600 font-bold text-lg font-heading">{mission.therefore.expectedROI}</div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center mt-6 gap-2 text-xs"
              style={{ color: textMuted }}>
              <ArrowRight className="w-4 h-4" />
              <span>{"Cross the \"Because \u2192 Therefore\" gap with AI precision"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
