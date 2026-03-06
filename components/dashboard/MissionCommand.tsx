"use client";

import { useState, useCallback } from "react";
import {
  Target, Brain, Store, Download, Send, X,
  TrendingUp, Users, DollarSign, ChevronRight,
  Layers, Lightbulb, ArrowRight, CheckCircle, AlertCircle,
  Sliders, Play, RefreshCw, BadgeCheck,
  Zap, Shield, Leaf, Heart, Scissors
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
  description: string;
  primary:   { revenue: number; customers: number; conversion: number };
  secondary: { revenue: number; customers: number; conversion: number };
  affinity: string[];
}

const OBJECTIVES: ObjectiveDef[] = [
  {
    id: "Maximize Revenue",
    icon: DollarSign,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    description: "Prioritise highest-value customer opportunities to maximise top-line revenue per interaction.",
    primary:   { revenue: 1.18, customers: 0.82, conversion: 1.12 },
    secondary: { revenue: 1.07, customers: 0.94, conversion: 1.04 },
    affinity: ["renewal", "upselling", "buyback"],
  },
  {
    id: "Protect Margin",
    icon: Shield,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    description: "Reduce incentive spend and focus on organic, high-margin conversions over volume.",
    primary:   { revenue: 1.06, customers: 0.70, conversion: 1.08 },
    secondary: { revenue: 1.02, customers: 0.88, conversion: 1.03 },
    affinity: ["lead-scoring", "cancellation", "service-retention"],
  },
  {
    id: "Accelerate EV Adoption",
    icon: Leaf,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.3)",
    description: "Shift mission targeting toward EV-ready customers and equity-swap candidates to meet BEV transition targets.",
    primary:   { revenue: 1.14, customers: 1.22, conversion: 1.16 },
    secondary: { revenue: 1.06, customers: 1.10, conversion: 1.07 },
    affinity: ["buyback", "renewal", "intelligent-lead"],
  },
  {
    id: "Improve Retention",
    icon: Heart,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    description: "Reduce churn and at-risk customers by prioritising retention-focused missions with earlier contact windows.",
    primary:   { revenue: 0.96, customers: 1.28, conversion: 1.09 },
    secondary: { revenue: 0.98, customers: 1.13, conversion: 1.04 },
    affinity: ["service-retention", "cancellation", "renewal"],
  },
  {
    id: "Reduce Incentive Burn",
    icon: Scissors,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
    description: "Trim above-threshold incentive spend while preserving conversion quality — reduce cost per acquisition.",
    primary:   { revenue: 0.91, customers: 0.75, conversion: 1.14 },
    secondary: { revenue: 0.96, customers: 0.88, conversion: 1.07 },
    affinity: ["lead-scoring", "cancellation"],
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
  primary: BusinessObjective | null,
  secondary: BusinessObjective | null,
  missionSourceModels: string[]
): { revenue: number; customers: number; conversion: number } {
  const base = { revenue: 1, customers: 1, conversion: 1 };
  if (!primary) return base;
  const pDef = OBJECTIVES.find((o) => o.id === primary)!;
  const sDef = secondary ? OBJECTIVES.find((o) => o.id === secondary) : null;
  const affinityBoost = missionSourceModels.some((m) => pDef.affinity.includes(m)) ? 1.08 : 1.0;
  let r  = pDef.primary.revenue * affinityBoost;
  let c  = pDef.primary.customers;
  let cv = pDef.primary.conversion;
  if (sDef) { r *= sDef.secondary.revenue; c *= sDef.secondary.customers; cv *= sDef.secondary.conversion; }
  return { revenue: r, customers: c, conversion: cv };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MissionCommand({ missions, region, onViewRetailers }: MissionCommandProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [explainabilityMission, setExplainabilityMission] = useState<Mission | null>(null);
  const [businessMode, setBusinessMode] = useState(false);
  const [primaryObjective, setPrimaryObjective] = useState<BusinessObjective | null>(null);
  const [secondaryObjective, setSecondaryObjective] = useState<BusinessObjective | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [simRunning, setSimRunning] = useState(false);

  const textPrimary   = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)";

  const totalCustomers = missions.reduce((sum, m) => sum + (m.targetCustomers[region] ?? 0), 0);

  const runSimulation = useCallback(() => {
    if (!primaryObjective) return;
    setSimRunning(true);
    setTimeout(() => { setSimRunning(false); setSimulated(true); }, 1400);
  }, [primaryObjective]);

  const resetSim = useCallback(() => {
    setSimulated(false);
    setPrimaryObjective(null);
    setSecondaryObjective(null);
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

      {/* Business Driven Panel */}
      {businessMode && (
        <BusinessDrivenPanel
          isDark={isDark}
          primaryObjective={primaryObjective}
          secondaryObjective={secondaryObjective}
          simulated={simulated}
          simRunning={simRunning}
          onSelectPrimary={(obj) => {
            setPrimaryObjective(obj);
            setSimulated(false);
            if (secondaryObjective === obj) setSecondaryObjective(null);
          }}
          onSelectSecondary={(obj) => {
            setSecondaryObjective(obj === secondaryObjective ? null : obj);
            setSimulated(false);
          }}
          onRun={runSimulation}
          onReset={resetSim}
        />
      )}

      {/* Mission Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {missions.map((mission, idx) => {
          const pc = PRIORITY_CONFIG[mission.priority] ?? PRIORITY_CONFIG.Strategic;
          const simMult = (businessMode && simulated)
            ? computeSimMultipliers(primaryObjective, secondaryObjective, mission.sourceModels)
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

      {/* Explainability Panel */}
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
  secondaryObjective: BusinessObjective | null;
  simulated: boolean;
  simRunning: boolean;
  onSelectPrimary: (obj: BusinessObjective) => void;
  onSelectSecondary: (obj: BusinessObjective) => void;
  onRun: () => void;
  onReset: () => void;
}

function BusinessDrivenPanel({
  isDark, primaryObjective, secondaryObjective,
  simulated, simRunning, onSelectPrimary, onSelectSecondary, onRun, onReset,
}: BusinessDrivenPanelProps) {
  const panelBg     = isDark ? "rgba(139,92,246,0.06)" : "rgba(139,92,246,0.04)";
  const panelBorder = isDark ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.15)";
  const divider     = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textPrimary   = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
  const textMuted     = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)";
  const surfaceBg     = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const canRun = !!primaryObjective && !simRunning;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: panelBg, border: panelBorder }}>
      {/* Panel header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${divider}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.18)" }}>
          <Sliders className="w-4 h-4 text-violet-500" />
        </div>
        <div>
          <div className="font-heading font-semibold text-sm" style={{ color: textPrimary }}>
            Business Driven Simulation
          </div>
          <div className="text-xs mt-0.5" style={{ color: textSecondary }}>
            Define your business objectives to run what-if scenarios and understand mission impact
          </div>
        </div>
        {simulated && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}>
            <BadgeCheck className="w-3 h-3 text-violet-500" />
            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Simulation Active</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Primary Objective */}
        <ObjectiveRow
          label="Primary"
          labelColor="#10b981"
          labelBg="rgba(16,185,129,0.15)"
          labelBorder="rgba(16,185,129,0.3)"
          description="Select your lead business objective — this carries the highest simulation weight"
          objectives={OBJECTIVES}
          selected={primaryObjective}
          disabled={false}
          isDark={isDark}
          surfaceBg={surfaceBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          onSelect={onSelectPrimary}
        />

        <div style={{ borderTop: `1px solid ${divider}` }} />

        {/* Secondary Objective */}
        <ObjectiveRow
          label="Secondary"
          labelColor="#f59e0b"
          labelBg="rgba(245,158,11,0.12)"
          labelBorder="rgba(245,158,11,0.3)"
          description="Optional — a supporting objective applied at reduced weight alongside the primary"
          objectives={OBJECTIVES.filter((o) => o.id !== primaryObjective)}
          selected={secondaryObjective}
          disabled={!primaryObjective}
          isDark={isDark}
          surfaceBg={surfaceBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          textSecondary={textSecondary}
          onSelect={onSelectSecondary}
        />

        {/* Action row */}
        <div style={{ borderTop: `1px solid ${divider}`, paddingTop: "1.25rem" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Selection summary */}
            <div className="flex items-center gap-2 flex-wrap">
              {primaryObjective ? (
                <ObjectivePill obj={OBJECTIVES.find((o) => o.id === primaryObjective)!} label="Primary" />
              ) : (
                <span className="text-xs" style={{ color: textMuted }}>Select a primary objective to enable simulation</span>
              )}
              {secondaryObjective && (
                <>
                  <ChevronRight className="w-3 h-3" style={{ color: textMuted }} />
                  <ObjectivePill obj={OBJECTIVES.find((o) => o.id === secondaryObjective)!} label="Secondary" />
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {simulated && (
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
                  background: canRun ? "rgba(139,92,246,0.85)" : "rgba(139,92,246,0.3)",
                  color: "#ffffff",
                  border: "1px solid rgba(139,92,246,0.5)",
                  boxShadow: canRun ? "0 4px 18px rgba(139,92,246,0.35)" : "none",
                }}
              >
                {simRunning
                  ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running...</>
                  : <><Play className="w-3.5 h-3.5" /> Run Simulation</>
                }
              </button>
            </div>
          </div>

          {/* Simulation note */}
          {simulated && primaryObjective && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Zap className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                Mission metrics below reflect simulated outcomes for{" "}
                <strong style={{ color: OBJECTIVES.find((o) => o.id === primaryObjective)!.color }}>{primaryObjective}</strong>
                {secondaryObjective && (
                  <> with <strong style={{ color: OBJECTIVES.find((o) => o.id === secondaryObjective)!.color }}>{secondaryObjective}</strong> as supporting objective</>
                )}.{" "}
                Affinity scoring applied per mission source model alignment. These are projections — not committed forecasts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Objective Row (shared for primary + secondary) ───────────────────────────

interface ObjectiveRowProps {
  label: string;
  labelColor: string;
  labelBg: string;
  labelBorder: string;
  description: string;
  objectives: ObjectiveDef[];
  selected: BusinessObjective | null;
  disabled: boolean;
  isDark: boolean;
  surfaceBg: string;
  textPrimary: string;
  textMuted: string;
  textSecondary?: string;
  onSelect: (obj: BusinessObjective) => void;
}

function ObjectiveRow({
  label, labelColor, labelBg, labelBorder, description,
  objectives, selected, disabled, isDark, surfaceBg, textPrimary, textMuted, onSelect,
}: ObjectiveRowProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: labelBg, color: labelColor, border: `1px solid ${labelBorder}` }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
          {description}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {objectives.map((obj) => {
          const Icon = obj.icon;
          const isSelected = selected === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => !disabled && onSelect(obj.id)}
              disabled={disabled}
              className="flex flex-col items-start gap-2 p-3 rounded-xl text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isSelected ? obj.bg : surfaceBg,
                border: `1px solid ${isSelected ? obj.border : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                boxShadow: isSelected ? `0 0 16px ${obj.bg}` : "none",
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: isSelected ? `rgba(${hexToRgb(obj.color)},0.25)` : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? obj.color : textMuted }} />
                </div>
                {isSelected && <CheckCircle className="w-3.5 h-3.5" style={{ color: obj.color }} />}
              </div>
              <span className="text-[11px] font-semibold leading-tight" style={{ color: isSelected ? obj.color : textPrimary }}>
                {obj.id}
              </span>
              <span className="text-[10px] leading-relaxed line-clamp-2" style={{ color: textMuted }}>
                {obj.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ObjectivePill({ obj, label }: { obj: ObjectiveDef; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
      style={{ background: obj.bg, border: `1px solid ${obj.border}`, color: obj.color }}>
      <span className="font-bold">{label}:</span> {obj.id}
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

  const displayRevenue    = simMultipliers ? formatRevenueSim(mission.projectedRevenue[region], simMultipliers.revenue)   : mission.projectedRevenue[region];
  const displayCustomers  = simMultipliers ? Math.round(mission.targetCustomers[region] * simMultipliers.customers).toLocaleString() : mission.targetCustomers[region].toLocaleString();
  const displayConversion = simMultipliers ? formatConvSim(mission.conversionRate[region], simMultipliers.conversion)    : mission.conversionRate[region];

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

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Revenue",    value: displayRevenue,    orig: mission.projectedRevenue[region],                      icon: DollarSign },
            { label: "Customers",  value: displayCustomers,  orig: mission.targetCustomers[region].toLocaleString(),       icon: Users },
            { label: "Conv. Rate", value: displayConversion, orig: mission.conversionRate[region],                        icon: TrendingUp },
          ].map((stat) => {
            const changed = !!simMultipliers && stat.value !== stat.orig;
            return (
              <div key={stat.label} className="p-2.5 rounded-xl text-center"
                style={{
                  background: changed ? "rgba(139,92,246,0.08)" : surfaceBg,
                  border:     changed ? "1px solid rgba(139,92,246,0.25)" : surfaceBorder,
                }}>
                <stat.icon className="w-3 h-3 mx-auto mb-1" style={{ color: changed ? "#8b5cf6" : textMuted }} />
                <div className="font-bold text-sm font-heading leading-none" style={{ color: changed ? "#8b5cf6" : textPrimary }}>
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

        {/* Source Models */}
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

        {/* Actions */}
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

  const panelBg       = isDark ? "rgba(8,11,20,0.99)"       : "rgba(248,250,253,0.99)";
  const panelBorder   = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
  const dividerColor  = isDark ? "rgba(255,255,255,0.06)"    : "rgba(0,0,0,0.07)";
  const textPrimary   = isDark ? "#e2e8f0"                   : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.50)"    : "rgba(0,0,0,0.50)";
  const textMuted     = isDark ? "rgba(255,255,255,0.35)"    : "rgba(0,0,0,0.35)";
  const surfaceBg     = isDark ? "rgba(255,255,255,0.04)"    : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const closeBg       = isDark ? "rgba(255,255,255,0.08)"    : "rgba(0,0,0,0.07)";

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
          {/* Left: The Because */}
          <div className="flex-1 p-6 overflow-y-auto" style={{ borderRight: `1px solid ${dividerColor}` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.18)" }}>
                <Layers className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <div className="font-semibold text-sm font-heading" style={{ color: textPrimary }}>{mission.because.title}</div>
                <div className="text-[10px]" style={{ color: textSecondary }}>The "Because" — Raw Data Correlation</div>
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

          {/* Right: The Therefore */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `rgba(${hexToRgb(mission.color)}, 0.18)` }}>
                <Lightbulb className="w-3.5 h-3.5" style={{ color: mission.color }} />
              </div>
              <div>
                <div className="font-semibold text-sm font-heading" style={{ color: textPrimary }}>{mission.therefore.title}</div>
                <div className="text-[10px]" style={{ color: textSecondary }}>The "Therefore" — Strategic Insight</div>
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
              <span>{"Cross the \"Because → Therefore\" gap with AI precision"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
