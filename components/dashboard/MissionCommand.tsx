"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Brain, Store, Download, Send, X,
  TrendingUp, Users, DollarSign, ChevronRight,
  Layers, Lightbulb, ArrowRight, CheckCircle, AlertCircle,
  Sliders, Play, RefreshCw, BadgeCheck, Zap,
  Shield, Leaf, Heart, Scissors, BarChart2, Info,
  EyeOff, Sparkles, Plus, Lock,
} from "lucide-react";
import { type Mission, type Region, modelCards, launchDate, closeDate } from "@/lib/dashboard-data";
import { useTheme } from "@/components/dashboard/ThemeProvider";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MissionCommandProps {
  missions: Mission[];
  region: Region;
  onViewRetailers: (
    mission: Mission,
    simMultipliers: { revenue: number; customers: number; conversion: number } | null
  ) => void;
  simState?: SimState;
  onSimStateChange?: (state: SimState) => void;
}

export interface SimState {
  businessMode: boolean;
  primaryObjective: BusinessObjective | null;
  simParams: SimParams;
  simActive: boolean;
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  High: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  Strategic: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)" },
};

// ─── Business Objectives ──────────────────────────────────────────────────────

export type BusinessObjective =
  | "Maximize Revenue"
  | "Protect Margin"
  | "Accelerate Sustainable Packaging Adoption"
  | "Improve Customer Retention"
  | "Reduce Incentive Spend";

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
    id: "Accelerate Sustainable Packaging Adoption",
    icon: Leaf,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    tagline: "Meet recyclable-format transition targets",
    affinity: ["buyback", "renewal", "intelligent-lead"],
  },
  {
    id: "Improve Customer Retention",
    icon: Heart,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    tagline: "Reduce churn, prioritise loyalty",
    affinity: ["service-retention", "cancellation", "renewal"],
  },
  {
    id: "Reduce Incentive Spend",
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
  // Improve Customer Retention specific
  ownerEngagement: number;
  customerOffer: number;
  // Accelerate Sustainable Packaging Adoption specific
  portfolio: number;
}

const DEFAULT_PARAMS: SimParams = {
  revenueWeight: 50,
  marginProtection: 50,
  evFocus: 50,
  carModelMix: 50,
  lifecycleBias: 50,
  incentiveAggression: 50,
  ownerEngagement: 50,
  customerOffer: 50,
  portfolio: 50,
};

const OBJECTIVE_PRESETS: Record<BusinessObjective, Partial<SimParams>> = {
  "Maximize Revenue": { revenueWeight: 80, marginProtection: 30, incentiveAggression: 65, carModelMix: 40 },
  "Protect Margin": { marginProtection: 80, incentiveAggression: 20, revenueWeight: 55 },
  "Accelerate Sustainable Packaging Adoption": { evFocus: 85, lifecycleBias: 55, portfolio: 70 },
  "Improve Customer Retention": { lifecycleBias: 80, marginProtection: 60, incentiveAggression: 40, ownerEngagement: 70, customerOffer: 65 },
  "Reduce Incentive Spend": { incentiveAggression: 15, marginProtection: 75, revenueWeight: 45 },
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
    leftLabel: "Volume Focus",
    rightLabel: "Revenue Focus",
    color: "#10b981",
    relevantFor: ["Maximize Revenue", "Protect Margin", "Reduce Incentive Spend"],
    icon: DollarSign,
  },
  {
    key: "marginProtection",
    label: "Margin Protection",
    leftLabel: "Flexible",
    rightLabel: "Protected",
    color: "#3b82f6",
    relevantFor: ["Protect Margin", "Reduce Incentive Spend", "Maximize Revenue"],
    icon: Shield,
  },
  {
    key: "evFocus",
    label: "Sustainable Format Focus",
    leftLabel: "Legacy Format Retention",
    rightLabel: "Mono-Material Acceleration",
    color: "#06b6d4",
    relevantFor: ["Accelerate Sustainable Packaging Adoption", "Maximize Revenue"],
    icon: Leaf,
  },
  {
    key: "carModelMix",
    label: "Product Line Mix",
    leftLabel: "Flexible / Rigid Formats",
    rightLabel: "Balanced Product Mix",
    color: "#f97316",
    relevantFor: ["Maximize Revenue", "Protect Margin"],
    icon: BarChart2,
  },
  {
    key: "portfolio",
    label: "Portfolio",
    leftLabel: "Balanced Focus",
    rightLabel: "Recyclable-Content Weighted",
    color: "#06b6d4",
    relevantFor: ["Accelerate Sustainable Packaging Adoption"],
    icon: BarChart2,
  },
  {
    key: "lifecycleBias",
    label: "Lifecycle Target",
    leftLabel: "Acquisition",
    rightLabel: "Retention",
    color: "#f59e0b",
    relevantFor: ["Improve Customer Retention", "Accelerate Sustainable Packaging Adoption", "Protect Margin"],
    icon: Heart,
  },
  {
    key: "incentiveAggression",
    label: "Incentive Strategy",
    leftLabel: "Conservative",
    rightLabel: "Aggressive",
    color: "#8b5cf6",
    relevantFor: ["Maximize Revenue", "Reduce Incentive Spend", "Protect Margin"],
    icon: Scissors,
  },
  {
    key: "ownerEngagement",
    label: "Owners",
    leftLabel: "Passive",
    rightLabel: "Engaged",
    color: "#f59e0b",
    relevantFor: ["Improve Customer Retention"],
    icon: Users,
  },
  {
    key: "customerOffer",
    label: "Customer Offer",
    leftLabel: "Upgrade Focus",
    rightLabel: "Ownership Value",
    color: "#f59e0b",
    relevantFor: ["Improve Customer Retention"],
    icon: Heart,
  },
];

// ─── Adaptive Mission Rules ───────────────────────────────────────────────────

interface MissionRule {
  missionId: string;
  check: (p: SimParams, obj: BusinessObjective | null) => string | null;
}

const MISSION_RULES: MissionRule[] = [
  {
    missionId: "ev-equity-pivot",
    check: (p) => {
      if (p.evFocus < 40)
        return `Sustainable Format Focus is too low (${p.evFocus}) — raise above 40 to make this mission viable`;
      if (p.incentiveAggression < 20 && p.marginProtection > 75)
        return "Incentive strategy too conservative to drive margin-swap conversion at scale";
      return null;
    },
  },
  {
    missionId: "loyalty-recovery",
    check: (p, obj) => {
      if (p.lifecycleBias < 30 && obj !== "Improve Customer Retention")
        return `Lifecycle target is acquisition-focused (${p.lifecycleBias}) — shift toward Retention to activate this mission`;
      if (p.incentiveAggression < 15)
        return "Incentive strategy too restricted to fund loyalty recovery programme";
      return null;
    },
  },
  {
    missionId: "defender-performance-drive",
    check: (p, obj) => {
      if (p.marginProtection > 80 && p.incentiveAggression < 25)
        return "Margin protection constraints prevent performance incentive deployment needed for this mission";
      if (p.revenueWeight < 25 && obj === "Reduce Incentive Spend")
        return "Revenue weight is too low to justify the high-value OCTA-grade line upsell investment";
      return null;
    },
  },
];

// ─── Suggested Missions Catalogue ────────────────────────────────────────────

export interface SuggestedMission {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
  triggerLabel: string;
  triggerColor: string;
  projectedRevenue: string;
  projectedCustomers: number;
  projectedConversion: string;
  sourceModels: string[];
  priority: "Critical" | "High" | "Strategic";
  color: string;
  condition: (p: SimParams, obj: BusinessObjective | null) => boolean;
}

const SUGGESTED_MISSIONS: SuggestedMission[] = [
  {
    id: "suggest-ice-conquest",
    title: "Legacy Format Conquest Campaign",
    subtitle: "Target Sonoco / Berry Global incumbent accounts with margin-upside advantage offers",
    reason: "Sustainable Format Focus is low — redirecting budget toward legacy-format conquest unlocks a larger addressable pool",
    triggerLabel: "Low Sustainable Focus",
    triggerColor: "#f97316",
    projectedRevenue: "$2.1M",
    projectedCustomers: 28,
    projectedConversion: "29%",
    sourceModels: ["intelligent-lead", "lead-scoring", "buyback"],
    priority: "High",
    color: "#f97316",
    condition: (p) => p.evFocus < 40,
  },
  {
    id: "suggest-margin-harvest",
    title: "Premium Margin Harvest",
    subtitle: "Convert SV Autobiography-tier accounts to bespoke structure design programme — zero incentive required",
    reason: "High margin protection + low incentive aggression creates an ideal environment for organic premium-tier upsells",
    triggerLabel: "High Margin Mode",
    triggerColor: "#3b82f6",
    projectedRevenue: "$1.8M",
    projectedCustomers: 12,
    projectedConversion: "41%",
    sourceModels: ["upselling", "lead-scoring", "renewal"],
    priority: "Strategic",
    color: "#3b82f6",
    condition: (p) => p.marginProtection > 70 && p.incentiveAggression < 35,
  },
  {
    id: "suggest-early-retention",
    title: "Early Lifecycle Retention Blitz",
    subtitle: "Intercept 1-year renewal accounts before competitor outreach with proactive service-led offers",
    reason: "Lifecycle target skewed strongly toward Retention — early intervention maximises LTV and prevents churn",
    triggerLabel: "Retention Focus",
    triggerColor: "#f59e0b",
    projectedRevenue: "$0.9M",
    projectedCustomers: 34,
    projectedConversion: "44%",
    sourceModels: ["service-retention", "renewal", "cancellation"],
    priority: "High",
    color: "#f59e0b",
    condition: (p) => p.lifecycleBias > 70,
  },
  {
    id: "suggest-balanced-mix",
    title: "Full Portfolio Diversification Push",
    subtitle: "Activate flexible, rigid, closure & specialty carton cross-sell across multi-line accounts",
    reason: "Balanced product line mix setting signals readiness for a diversified portfolio activation",
    triggerLabel: "Balanced Mix",
    triggerColor: "#10b981",
    projectedRevenue: "$1.4M",
    projectedCustomers: 22,
    projectedConversion: "33%",
    sourceModels: ["upselling", "intelligent-lead", "renewal"],
    priority: "Strategic",
    color: "#10b981",
    condition: (p) => p.carModelMix > 65,
  },
  {
    id: "suggest-incentive-reset",
    title: "Incentive Rationalisation Programme",
    subtitle: "Replace blanket discount offers with targeted value-add packages — accessories, EliteCare & events",
    reason: "Incentive burn reduction objective detected — replace cash discounts with value-add to protect margin",
    triggerLabel: "Incentive Burn Reduction",
    triggerColor: "#8b5cf6",
    projectedRevenue: "$0.7M",
    projectedCustomers: 19,
    projectedConversion: "38%",
    sourceModels: ["lead-scoring", "cancellation", "service-retention"],
    priority: "Strategic",
    color: "#8b5cf6",
    condition: (p, obj) => p.incentiveAggression < 25 && obj === "Reduce Incentive Spend",
  },
  {
    id: "suggest-ev-fleet",
    title: "Enterprise Sustainability Accelerator",
    subtitle: "Target enterprise CPG procurement leads with mono-material laminate priority allocation and transition financing",
    reason: "Sustainable Format Focus is high — enterprise channel multiplies volume impact of recyclable-format transition targets",
    triggerLabel: "High Sustainable Focus",
    triggerColor: "#06b6d4",
    projectedRevenue: "$3.2M",
    projectedCustomers: 41,
    projectedConversion: "36%",
    sourceModels: ["buyback", "renewal", "intelligent-lead"],
    priority: "Critical",
    color: "#06b6d4",
    condition: (p, obj) => p.evFocus > 75 && obj === "Accelerate Sustainable Packaging Adoption",
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

  const revenueMultiplier = 0.85 + (p.revenueWeight / 100) * 0.40;
  // ownerEngagement and customerOffer boost retention-focused customer multiplier
  const retentionBoost =
    primaryObjective === "Improve Customer Retention"
      ? (p.ownerEngagement / 100) * 0.12 + (p.customerOffer / 100) * 0.08
      : 0;
  // portfolio param boosts EV adoption customer multiplier in place of carModelMix
  const evPortfolioBoost =
    primaryObjective === "Accelerate EV Adoption" ? (p.portfolio / 100) * 0.12 : 0;
  const customerMultiplier =
    0.70 +
    ((100 - p.lifecycleBias) / 100) * 0.55 +
    (p.evFocus / 100) * 0.20 +
    retentionBoost +
    evPortfolioBoost;
  const conversionBase = 0.90 + (p.marginProtection / 100) * 0.20;
  const conversionMult = conversionBase + (p.incentiveAggression / 100) * 0.08 - ((100 - p.incentiveAggression) / 100) * 0.04;

  return {
    revenue: revenueMultiplier * affinityBoost,
    customers: customerMultiplier,
    conversion: Math.max(0.80, Math.min(1.35, conversionMult)),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MissionCommand({
  missions,
  region,
  onViewRetailers,
  simState,
  onSimStateChange,
}: MissionCommandProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [explainabilityMission, setExplainabilityMission] = useState<Mission | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  // Internal fallback state
  const [_businessMode, set_BusinessMode] = useState(false);
  const [_primaryObjective, set_PrimaryObjective] = useState<BusinessObjective | null>(null);
  const [_simParams, set_SimParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [_simActive, set_SimActive] = useState(false);

  // Prefer lifted state when provided
  const businessMode = simState ? simState.businessMode : _businessMode;
  const primaryObjective = simState ? simState.primaryObjective : _primaryObjective;
  const simParams = simState ? simState.simParams : _simParams;
  const simActive = simState ? simState.simActive : _simActive;

  const setSimState = useCallback(
    (patch: Partial<SimState>) => {
      if (onSimStateChange && simState) {
        onSimStateChange({ ...simState, ...patch });
      } else {
        if (patch.businessMode !== undefined) set_BusinessMode(patch.businessMode);
        if (patch.primaryObjective !== undefined) set_PrimaryObjective(patch.primaryObjective);
        if (patch.simParams !== undefined) set_SimParams(patch.simParams);
        if (patch.simActive !== undefined) set_SimActive(patch.simActive);
      }
    },
    [simState, onSimStateChange]
  );

  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.55)";

  const totalCustomers = missions.reduce((sum, m) => sum + (m.targetCustomers[region] ?? 0), 0);

  // Adaptive mission logic — only active when sim has been run
  const suppressionMap = useMemo<Record<string, string>>(() => {
    if (!simActive) return {};
    const map: Record<string, string> = {};
    for (const rule of MISSION_RULES) {
      const reason = rule.check(simParams, primaryObjective);
      if (reason) map[rule.missionId] = reason;
    }
    return map;
  }, [simActive, simParams, primaryObjective]);

  const suggestedMissions = useMemo<SuggestedMission[]>(() => {
    if (!simActive) return [];
    return SUGGESTED_MISSIONS.filter((s) => s.condition(simParams, primaryObjective));
  }, [simActive, simParams, primaryObjective]);

  const handleSelectObjective = useCallback(
    (obj: BusinessObjective) => {
      const next = primaryObjective === obj ? null : obj;
      setSimState({
        primaryObjective: next,
        simActive: false,
        simParams: next ? { ...simParams, ...OBJECTIVE_PRESETS[next] } : DEFAULT_PARAMS,
      });
    },
    [primaryObjective, simParams, setSimState]
  );

  const handleParamChange = useCallback(
    (key: keyof SimParams, val: number) => {
      setSimState({ simParams: { ...simParams, [key]: val } });
    },
    [simParams, setSimState]
  );

  const runSimulation = useCallback(() => {
    if (!primaryObjective) return;
    setSimRunning(true);
    setTimeout(() => {
      setSimRunning(false);
      setSimState({ simActive: true });
    }, 900);
  }, [primaryObjective, setSimState]);

  const resetSim = useCallback(() => {
    setSimState({ simActive: false, primaryObjective: null, simParams: DEFAULT_PARAMS });
  }, [setSimState]);

  const suppressedCount = Object.keys(suppressionMap).length;
  const activeMissionCount = missions.length - suppressedCount + suggestedMissions.length;

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
            {simActive
              ? `${activeMissionCount} adapted missions · ${suppressedCount > 0 ? `${suppressedCount} suppressed` : "all active"} · ${suggestedMissions.length > 0 ? `${suggestedMissions.length} suggested` : "no new suggestions"}`
              : "3 strategic missions synthesised · Combined opportunity: $72.2M"}
          </p>
          <div className="flex items-center gap-1.5 ml-3.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-600">
              Opportunity Cluster Detected for {totalCustomers.toLocaleString()} Customers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600 text-xs font-medium">Synthesis Active</span>
          </div>
          <button
            onClick={() => {
              const next = !businessMode;
              setSimState({ businessMode: next });
              if (!next) resetSim();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: businessMode
                ? "rgba(139,92,246,0.15)"
                : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              border: businessMode
                ? "1px solid rgba(139,92,246,0.45)"
                : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              color: businessMode
                ? "#8b5cf6"
                : isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)",
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            Business Strategy Simulation
          </button>
        </div>
      </div>

      {/* Business Driven Panel */}
      {businessMode && (
        <BusinessDrivenPanel
          isDark={isDark}
          primaryObjective={primaryObjective}
          simParams={simParams}
          simActive={simActive}
          simRunning={simRunning}
          suppressedCount={suppressedCount}
          suggestedCount={suggestedMissions.length}
          onSelectObjective={handleSelectObjective}
          onParamChange={handleParamChange}
          onRun={runSimulation}
          onReset={resetSim}
        />
      )}

      {/* Mission Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {missions.map((mission, idx) => {
          const pc = PRIORITY_CONFIG[mission.priority] ?? PRIORITY_CONFIG.Strategic;
          const simMult =
            businessMode && simActive
              ? computeSimMultipliers(simParams, primaryObjective, mission.sourceModels)
              : null;
          const suppressionReason = suppressionMap[mission.id] ?? null;
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              region={region}
              priorityConfig={pc}
              index={idx}
              isDark={isDark}
              simMultipliers={simMult}
              suppressed={!!suppressionReason}
              suppressionReason={suppressionReason}
              onExplain={() => !suppressionReason && setExplainabilityMission(mission)}
              onViewRetailers={() => !suppressionReason && onViewRetailers(mission, simMult)}
            />
          );
        })}

        {/* Suggested mission cards — appear after sim run when conditions are met */}
        {suggestedMissions.map((s) => (
          <SuggestedMissionCard key={s.id} suggestion={s} isDark={isDark} />
        ))}
      </div>

      {/* Adaptive summary strip */}
      {simActive && (suppressedCount > 0 || suggestedMissions.length > 0) && (
        <AdaptiveSummaryStrip
          isDark={isDark}
          suppressedCount={suppressedCount}
          suggestedCount={suggestedMissions.length}
          primaryObjective={primaryObjective}
        />
      )}

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

// ─── Adaptive Summary Strip ───────────────────────────────────────────────────

function AdaptiveSummaryStrip({
  isDark,
  suppressedCount,
  suggestedCount,
  primaryObjective,
}: {
  isDark: boolean;
  suppressedCount: number;
  suggestedCount: number;
  primaryObjective: BusinessObjective | null;
}) {
  const textMuted = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  return (
    <div
      className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <Zap className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
      <span className="text-xs" style={{ color: textMuted }}>
        Mission list adapted to{" "}
        <strong style={{ color: "#8b5cf6" }}>{primaryObjective ?? "current parameters"}</strong>
        {suppressedCount > 0 && (
          <>
            {" "}·{" "}
            <span className="text-red-500 font-semibold">
              {suppressedCount} mission{suppressedCount > 1 ? "s" : ""} suppressed
            </span>{" "}
            due to parameter conflicts
          </>
        )}
        {suggestedCount > 0 && (
          <>
            {" "}·{" "}
            <span className="text-green-600 font-semibold">
              {suggestedCount} new mission{suggestedCount > 1 ? "s" : ""} suggested
            </span>{" "}
            based on your configuration
          </>
        )}
      </span>
      <span className="text-[10px] ml-auto" style={{ color: textMuted }}>
        Adjust sliders to update · Reset to restore all missions
      </span>
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
  suppressedCount: number;
  suggestedCount: number;
  onSelectObjective: (obj: BusinessObjective) => void;
  onParamChange: (key: keyof SimParams, val: number) => void;
  onRun: () => void;
  onReset: () => void;
}

function BusinessDrivenPanel({
  isDark,
  primaryObjective,
  simParams,
  simActive,
  simRunning,
  suppressedCount,
  suggestedCount,
  onSelectObjective,
  onParamChange,
  onRun,
  onReset,
}: BusinessDrivenPanelProps) {
  const panelBg = isDark ? "rgba(139,92,246,0.05)" : "rgba(139,92,246,0.03)";
  const panelBorder = isDark ? "1px solid rgba(139,92,246,0.18)" : "1px solid rgba(139,92,246,0.13)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)";
  const textMuted = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.40)";

  const activeSliders = primaryObjective
    ? SLIDERS.filter((s) => s.relevantFor.includes(primaryObjective))
    : SLIDERS;

  const canRun = !!primaryObjective && !simRunning;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: panelBg, border: panelBorder }}>

      {/* Panel header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.18)" }}
          >
            <Sliders className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <div className="font-heading font-semibold text-sm" style={{ color: textPrimary }}>
              Business Driven Simulation
            </div>
            <div className="text-[11px]" style={{ color: textSecondary }}>
              Select an objective, tune parameters, then run — missions adapt in real-time
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {simActive && suppressedCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <EyeOff className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-semibold text-red-500">{suppressedCount} suppressed</span>
            </div>
          )}
          {simActive && suggestedCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              <Sparkles className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-semibold text-green-600">{suggestedCount} suggested</span>
            </div>
          )}
          {simActive && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}
            >
              <BadgeCheck className="w-3 h-3 text-violet-500" />
              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-column body */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[280px_1fr]"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        {/* Left — Objective picker */}
        <div className="p-4 space-y-1.5" style={{ borderRight: `1px solid ${divider}` }}>
          <div
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: textMuted }}
          >
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
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected
                      ? `rgba(${hexToRgb(obj.color)}, 0.22)`
                      : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: isSelected ? obj.color : textMuted }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[11px] font-semibold leading-tight truncate"
                    style={{ color: isSelected ? obj.color : textPrimary }}
                  >
                    {obj.id}
                  </div>
                  <div className="text-[10px] truncate mt-0.5" style={{ color: textMuted }}>
                    {obj.tagline}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: obj.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right — Parameter sliders */}
        <div className="p-5">
          {!primaryObjective ? (
            <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              >
                <Sliders className="w-5 h-5" style={{ color: textMuted }} />
              </div>
              <p className="text-xs text-center max-w-[200px]" style={{ color: textMuted }}>
                Select a business objective to configure simulation parameters
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: textMuted }}
                >
                  Simulation Parameters
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  {activeSliders.length} parameters active ·{" "}
                  <span style={{ color: OBJECTIVES.find((o) => o.id === primaryObjective)!.color }}>
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
              {SLIDERS.filter((s) => !s.relevantFor.includes(primaryObjective!)).length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <Info className="w-3 h-3 flex-shrink-0" style={{ color: textMuted }} />
                  <span className="text-[10px]" style={{ color: textMuted }}>
                    Not active for this objective:{" "}
                    {SLIDERS.filter((s) => !s.relevantFor.includes(primaryObjective!))
                      .map((s) => s.label)
                      .join(" · ")}
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
              Missions adapt live as you adjust sliders ·{" "}
              <strong style={{ color: OBJECTIVES.find((o) => o.id === primaryObjective)!.color }}>
                {primaryObjective}
              </strong>{" "}
              objective active
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
            {simRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running...
              </>
            ) : simActive ? (
              <>
                <Play className="w-3.5 h-3.5" /> Re-run
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Run Simulation
              </>
            )}
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
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.40)";
  const trackBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" style={{ color: def.color }} />
          <span className="text-[11px] font-medium" style={{ color: textPrimary }}>
            {def.label}
          </span>
          {live && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }}
            >
              Live
            </span>
          )}
        </div>
        <span className="sr-only" style={{ color: def.color }}>
          {value}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div
          className="absolute inset-x-0 h-1.5 rounded-full"
          style={{ background: trackBg }}
        />
        <div
          className="absolute left-0 h-1.5 rounded-full transition-all duration-150"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, rgba(${hexToRgb(def.color)},0.5), ${def.color})`,
          }}
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
        <span className="text-[9px]" style={{ color: textMuted }}>
          {def.leftLabel}
        </span>
        <span className="text-[9px]" style={{ color: textMuted }}>
          {def.rightLabel}
        </span>
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
  suppressed: boolean;
  suppressionReason: string | null;
  onExplain: () => void;
  onViewRetailers: () => void;
}

function MissionCard({
  mission,
  region,
  priorityConfig: pc,
  index,
  isDark,
  simMultipliers,
  suppressed,
  suppressionReason,
  onExplain,
  onViewRetailers,
}: MissionCardProps) {
  const [hovered, setHovered] = useState(false);
  const sourceModelNames = mission.sourceModels.map(
    (id) => modelCards.find((m) => m.id === id)?.shortTitle ?? id
  );

  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)";
  const textMuted = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.40)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const tagBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tagBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";
  const idxBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const displayRevenue = simMultipliers
    ? formatRevenueSim(mission.projectedRevenue[region], simMultipliers.revenue)
    : mission.projectedRevenue[region];
  const displayCustomers = simMultipliers
    ? Math.round(mission.targetCustomers[region] * simMultipliers.customers).toLocaleString()
    : mission.targetCustomers[region].toLocaleString();
  const displayConversion = simMultipliers
    ? formatConvSim(mission.conversionRate[region], simMultipliers.conversion)
    : mission.conversionRate[region];

  return (
    <div
      className="relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: suppressed
          ? isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"
          : hovered
            ? `rgba(${hexToRgb(mission.color)}, 0.08)`
            : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
        border: `1px solid ${suppressed
          ? isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"
          : hovered
            ? `rgba(${hexToRgb(mission.color)}, 0.4)`
            : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"
          }`,
        backdropFilter: "blur(16px)",
        opacity: suppressed ? 0.45 : 1,
        boxShadow:
          !suppressed && hovered
            ? `0 0 32px rgba(${hexToRgb(mission.color)}, 0.12)`
            : isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={() => !suppressed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: suppressed
            ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
            : `linear-gradient(90deg, ${mission.color}, transparent)`,
        }}
      />

      {/* Suppressed overlay */}
      {suppressed && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-5 text-center"
          style={{
            background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <EyeOff className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}>
              Mission Suppressed
            </div>
            <div
              className="text-[10px] leading-relaxed"
              style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}
            >
              {suppressionReason}
            </div>
          </div>
          <div
            className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            Adjust parameters to reactivate
          </div>
        </div>
      )}

      {/* Simulated badge */}
      {simMultipliers && !suppressed && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full z-10"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)" }}
        >
          <Zap className="w-2.5 h-2.5 text-violet-500" />
          <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">
            Simulated
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{ background: idxBg, color: textMuted }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color }}
            >
              {mission.priority === "Critical" && <AlertCircle className="w-2.5 h-2.5" />}
              {mission.priority}
            </div>
          </div>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  background:
                    i === 0
                      ? mission.color
                      : `rgba(${hexToRgb(mission.color)}, ${0.4 - i * 0.1})`,
                }}
              />
            ))}
          </div>
        </div>

        <h3
          className="font-heading font-bold text-base leading-tight mb-1"
          style={{ color: textPrimary }}
        >
          {mission.title}
        </h3>
        <p className="text-xs leading-relaxed mb-1" style={{ color: textSecondary }}>
          {mission.subtitle}
        </p>
        <p
          className="italic text-xs mb-4"
          style={{ color: `rgba(${hexToRgb(mission.color)}, ${isDark ? 0.8 : 0.9})` }}
        >
          "{mission.tagline}"
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Revenue", value: displayRevenue, orig: mission.projectedRevenue[region], icon: DollarSign },
            { label: "Customers", value: displayCustomers, orig: mission.targetCustomers[region].toLocaleString(), icon: Users },
            { label: "Conv. Rate", value: displayConversion, orig: mission.conversionRate[region], icon: TrendingUp },
          ].map((stat) => {
            const changed = !!simMultipliers && stat.value !== stat.orig;
            return (
              <div
                key={stat.label}
                className="p-2.5 rounded-xl text-center transition-all duration-300"
                style={{
                  background: changed ? "rgba(139,92,246,0.08)" : surfaceBg,
                  border: changed ? "1px solid rgba(139,92,246,0.25)" : surfaceBorder,
                }}
              >
                <stat.icon
                  className="w-3 h-3 mx-auto mb-1"
                  style={{ color: changed ? "#8b5cf6" : textMuted }}
                />
                <div
                  className="font-bold text-sm font-heading leading-none transition-all duration-300"
                  style={{ color: changed ? "#8b5cf6" : textPrimary }}
                >
                  {stat.value}
                </div>
                {changed && (
                  <div className="text-[8px] line-through mt-0.5" style={{ color: textMuted }}>
                    {stat.orig}
                  </div>
                )}
                <div className="text-[9px] mt-0.5" style={{ color: textMuted }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Source Models */}
        <div className="mb-4">
          <div
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: textMuted }}
          >
            Source Models
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sourceModelNames.map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 rounded text-[10px]"
                style={{ background: tagBg, border: tagBorder, color: textSecondary }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <button
            onClick={onExplain}
            disabled={suppressed}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: `rgba(${hexToRgb(mission.color)}, 0.12)`,
              border: `1px solid rgba(${hexToRgb(mission.color)}, 0.35)`,
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
            <button
              disabled={suppressed}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] disabled:cursor-not-allowed"
              style={{ border: surfaceBorder, color: textSecondary, background: "transparent" }}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              disabled={suppressed}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] disabled:cursor-not-allowed"
              style={{ border: surfaceBorder, color: textSecondary, background: "transparent" }}
            >
              <Send className="w-3.5 h-3.5" />
              Push
            </button>
            <button
              onClick={onViewRetailers}
              disabled={suppressed}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium disabled:cursor-not-allowed"
              style={{
                background: suppressed ? "transparent" : "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#3b82f6",
              }}
            >
              <Store className="w-3.5 h-3.5" />
              Retailers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Suggested Mission Card ───────────────────────────────────────────────────

interface SuggestedMissionCardProps {
  suggestion: SuggestedMission;
  isDark: boolean;
}

function SuggestedMissionCard({ suggestion, isDark }: SuggestedMissionCardProps) {
  const [hovered, setHovered] = useState(false);

  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)";
  const textMuted = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.40)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const pc = PRIORITY_CONFIG[suggestion.priority] ?? PRIORITY_CONFIG.Strategic;

  return (
    <div
      className="relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: hovered
          ? `rgba(${hexToRgb(suggestion.color)}, 0.07)`
          : isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
        border: `1px dashed rgba(${hexToRgb(suggestion.color)}, ${hovered ? 0.55 : 0.35})`,
        boxShadow: hovered ? `0 0 24px rgba(${hexToRgb(suggestion.color)}, 0.1)` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Suggested strip */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          background: `rgba(${hexToRgb(suggestion.color)}, 0.1)`,
          borderBottom: `1px solid rgba(${hexToRgb(suggestion.color)}, 0.2)`,
        }}
      >
        <Sparkles className="w-3 h-3" style={{ color: suggestion.color }} />
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: suggestion.color }}
        >
          Suggested Mission
        </span>
        <div
          className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{
            background: `rgba(${hexToRgb(suggestion.triggerColor)}, 0.15)`,
            border: `1px solid rgba(${hexToRgb(suggestion.triggerColor)}, 0.3)`,
          }}
        >
          <span className="text-[9px] font-semibold" style={{ color: suggestion.triggerColor }}>
            {suggestion.triggerLabel}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Priority + plus */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color }}
          >
            {suggestion.priority}
          </div>
          <Plus className="w-4 h-4" style={{ color: suggestion.color }} />
        </div>

        <h3
          className="font-heading font-bold text-base leading-tight mb-1"
          style={{ color: textPrimary }}
        >
          {suggestion.title}
        </h3>
        <p className="text-xs leading-relaxed mb-3" style={{ color: textSecondary }}>
          {suggestion.subtitle}
        </p>

        {/* Why suggested */}
        <div
          className="p-3 rounded-xl mb-4"
          style={{
            background: `rgba(${hexToRgb(suggestion.color)}, 0.07)`,
            border: `1px solid rgba(${hexToRgb(suggestion.color)}, 0.18)`,
          }}
        >
          <div className="flex items-start gap-2">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: suggestion.color }} />
            <p
              className="text-[10px] leading-relaxed"
              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
            >
              {suggestion.reason}
            </p>
          </div>
        </div>

        {/* Projected metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Revenue", value: suggestion.projectedRevenue, icon: DollarSign },
            { label: "Customers", value: `${suggestion.projectedCustomers}`, icon: Users },
            { label: "Conv. Rate", value: suggestion.projectedConversion, icon: TrendingUp },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2.5 rounded-xl text-center"
              style={{ background: surfaceBg, border: surfaceBorder }}
            >
              <stat.icon className="w-3 h-3 mx-auto mb-1" style={{ color: textMuted }} />
              <div
                className="font-bold text-sm font-heading leading-none"
                style={{ color: textPrimary }}
              >
                {stat.value}
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: textMuted }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Source models */}
        <div className="mb-4">
          <div
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: textMuted }}
          >
            Source Models
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestion.sourceModels.map((id) => {
              const name = modelCards.find((m) => m.id === id)?.shortTitle ?? id;
              return (
                <span
                  key={id}
                  className="px-2 py-0.5 rounded text-[10px]"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    border: surfaceBorder,
                    color: textSecondary,
                  }}
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
            style={{
              background: `rgba(${hexToRgb(suggestion.color)}, 0.15)`,
              border: `1px solid rgba(${hexToRgb(suggestion.color)}, 0.4)`,
              color: suggestion.color,
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            Activate Mission (Requires Approval)
          </button>
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

  const panelBg = isDark ? "rgba(8,11,20,0.99)" : "rgba(248,250,253,0.99)";
  const panelBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.60)";
  const textMuted = isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.40)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const closeBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: panelBg, border: panelBorder }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: `1px solid ${dividerColor}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)` }}
            >
              <Brain className="w-5 h-5" style={{ color: mission.color }} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base" style={{ color: textPrimary }}>
                {mission.title}
              </h2>
              <p className="text-xs" style={{ color: textSecondary }}>
                AI Explainability Chain · Full Data Lineage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: textSecondary }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = closeBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Because */}
          <div
            className="flex-1 p-6 overflow-y-auto"
            style={{ borderRight: `1px solid ${dividerColor}` }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.18)" }}
              >
                <Layers className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <div
                  className="font-semibold text-sm font-heading"
                  style={{ color: textPrimary }}
                >
                  {mission.because.title}
                </div>
                <div className="text-[10px]" style={{ color: textSecondary }}>
                  The "Because" — Raw Data Correlation
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-3 mb-5 p-3 rounded-xl"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <div className="text-blue-500 font-bold text-xl font-heading">
                {mission.because.correlationStrength}
              </div>
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
                >
                  Correlation Confidence
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  Cross-model signal alignment
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {mission.because.dataPoints.map((dp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{ background: surfaceBg, border: surfaceBorder }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
                      >
                        {dp.model}
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: `rgba(${hexToRgb(
                          weightColor[dp.weight as keyof typeof weightColor] ?? "#3b82f6"
                        )}, 0.15)`,
                        color:
                          weightColor[dp.weight as keyof typeof weightColor] ?? "#3b82f6",
                        border: `1px solid rgba(${hexToRgb(
                          weightColor[dp.weight as keyof typeof weightColor] ?? "#3b82f6"
                        )}, 0.3)`,
                      }}
                    >
                      {dp.weight} Signal
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}
                  >
                    {dp.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Therefore */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `rgba(${hexToRgb(mission.color)}, 0.18)` }}
              >
                <Lightbulb className="w-3.5 h-3.5" style={{ color: mission.color }} />
              </div>
              <div>
                <div
                  className="font-semibold text-sm font-heading"
                  style={{ color: textPrimary }}
                >
                  {mission.therefore.title}
                </div>
                <div className="text-[10px]" style={{ color: textSecondary }}>
                  The "Therefore" — Strategic Insight
                </div>
              </div>
            </div>
            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: `rgba(${hexToRgb(mission.color)}, 0.07)`,
                border: `1px solid rgba(${hexToRgb(mission.color)}, 0.2)`,
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)" }}
              >
                {mission.therefore.strategy}
              </p>
            </div>
            <div className="mb-4">
              <div
                className="text-[10px] uppercase tracking-wider mb-3"
                style={{ color: textSecondary }}
              >
                Tactical Playbook
              </div>
              <div className="space-y-2.5">
                {mission.therefore.tactics.map((tactic, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold"
                      style={{
                        background: `rgba(${hexToRgb(mission.color)}, 0.2)`,
                        color: mission.color,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                    >
                      {tactic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 rounded-xl"
                style={{ background: surfaceBg, border: surfaceBorder }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: textMuted }}
                >
                  Timeline
                </div>
                <div
                  className="text-xs leading-snug"
                  style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.75)" }}
                >
                  {`Launch: ${launchDate(mission.therefore.timelineDaysFromNow.launch)} | Close: ${closeDate(mission.therefore.timelineDaysFromNow.close)}`}
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: textMuted }}
                >
                  Expected ROI
                </div>
                <div className="text-green-600 font-bold text-lg font-heading">
                  {mission.therefore.expectedROI}
                </div>
              </div>
            </div>
            <div
              className="hidden md:flex items-center justify-center mt-6 gap-2 text-xs"
              style={{ color: textMuted }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>{"Cross the \"Because \u2192 Therefore\" gap with AI precision"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
