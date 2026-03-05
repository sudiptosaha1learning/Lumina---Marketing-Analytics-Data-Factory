"use client";

import { useState } from "react";
import {
  Target, Brain, Store, Download, Send, X,
  TrendingUp, Users, DollarSign, ChevronRight,
  Layers, Lightbulb, ArrowRight, CheckCircle, AlertCircle
} from "lucide-react";
import { type Mission, type Region, modelCards } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface MissionCommandProps {
  missions: Mission[];
  region: Region;
  onViewRetailers: (mission: Mission) => void;
}

const priorityConfig = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  High: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  Strategic: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)" },
};

export function MissionCommand({ missions, region, onViewRetailers }: MissionCommandProps) {
  const [explainabilityMission, setExplainabilityMission] = useState<Mission | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full bg-blue-500" />
            <h2 className="font-heading text-white font-semibold text-lg">Mission Command Centre</h2>
          </div>
          <p className="text-white/40 text-sm ml-3.5">3 strategic missions synthesised · Combined opportunity: $72.2M</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400 text-xs font-medium">Synthesis Active</span>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {missions.map((mission, idx) => {
          const pc = priorityConfig[mission.priority];
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              region={region}
              priorityConfig={pc}
              index={idx}
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
          onClose={() => setExplainabilityMission(null)}
        />
      )}
    </div>
  );
}

// ─── Mission Card ─────────────────────────────────────────────────────────────

interface MissionCardProps {
  mission: Mission;
  region: Region;
  priorityConfig: { color: string; bg: string; border: string };
  index: number;
  onExplain: () => void;
  onViewRetailers: () => void;
}

function MissionCard({ mission, region, priorityConfig: pc, index, onExplain, onViewRetailers }: MissionCardProps) {
  const [hovered, setHovered] = useState(false);
  const sourceModelNames = mission.sourceModels.map(
    (id) => modelCards.find((m) => m.id === id)?.shortTitle ?? id
  );

  return (
    <div
      className="relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: hovered
          ? `rgba(${hexToRgb(mission.color)}, 0.08)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? `rgba(${hexToRgb(mission.color)}, 0.4)` : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(16px)",
        boxShadow: hovered ? `0 0 32px rgba(${hexToRgb(mission.color)}, 0.12)` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${mission.color}, transparent)` }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Priority + Index */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white/40"
              style={{ background: "rgba(255,255,255,0.06)" }}>
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

        {/* Title */}
        <h3 className="font-heading text-white font-bold text-base leading-tight mb-1">{mission.title}</h3>
        <p className="text-white/40 text-xs leading-relaxed mb-1">{mission.subtitle}</p>
        <p className="italic text-xs mb-4" style={{ color: `rgba(${hexToRgb(mission.color)}, 0.8)` }}>
          "{mission.tagline}"
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Revenue", value: mission.projectedRevenue[region], icon: DollarSign },
            { label: "Customers", value: mission.targetCustomers[region].toLocaleString(), icon: Users },
            { label: "Conv. Rate", value: mission.conversionRate[region], icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="p-2.5 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <stat.icon className="w-3 h-3 mx-auto mb-1 text-white/40" />
              <div className="font-bold text-sm text-white font-heading leading-none">{stat.value}</div>
              <div className="text-[9px] text-white/35 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Source Models */}
        <div className="mb-4">
          <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Source Models</div>
          <div className="flex flex-wrap gap-1.5">
            {sourceModelNames.map((name) => (
              <span key={name} className="px-2 py-0.5 rounded text-[10px] text-white/50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <button
            onClick={onExplain}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: `rgba(${hexToRgb(mission.color)}, 0.14)`,
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
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all text-[10px]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all text-[10px]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <Send className="w-3.5 h-3.5" />
              Push
            </button>
            <button
              onClick={onViewRetailers}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-[10px] font-medium"
              style={{
                background: "rgba(59,130,246,0.14)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#60a5fa",
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

// ─── Explainability Panel ─────────────────────────────────────────────────────

interface ExplainabilityPanelProps {
  mission: Mission;
  region: Region;
  onClose: () => void;
}

function ExplainabilityPanel({ mission, onClose }: ExplainabilityPanelProps) {
  const weightColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: "rgba(8, 11, 20, 0.98)", border: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Panel Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)` }}>
              <Brain className="w-5 h-5" style={{ color: mission.color }} />
            </div>
            <div>
              <h2 className="font-heading text-white font-bold text-base">{mission.title}</h2>
              <p className="text-white/40 text-xs">AI Explainability Chain · Full Data Lineage</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Split Screen */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* Left: The Because */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin border-b md:border-b-0 md:border-r border-white/[0.06]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.18)" }}>
                <Layers className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm font-heading">{mission.because.title}</div>
                <div className="text-white/40 text-[10px]">The "Because" — Raw Data Correlation</div>
              </div>
            </div>

            {/* Correlation Strength */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="text-blue-300 font-bold text-xl font-heading">{mission.because.correlationStrength}</div>
              <div>
                <div className="text-white/70 text-xs font-semibold">Correlation Confidence</div>
                <div className="text-white/40 text-[10px]">Cross-model signal alignment</div>
              </div>
            </div>

            {/* Data Points */}
            <div className="space-y-3">
              {mission.because.dataPoints.map((dp, i) => (
                <div key={i} className="p-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-white/70 text-xs font-semibold">{dp.model}</span>
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
                  <p className="text-white/55 text-xs leading-relaxed">{dp.finding}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Therefore */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `rgba(${hexToRgb(mission.color)}, 0.18)` }}>
                <Lightbulb className="w-3.5 h-3.5" style={{ color: mission.color }} />
              </div>
              <div>
                <div className="text-white font-semibold text-sm font-heading">{mission.therefore.title}</div>
                <div className="text-white/40 text-[10px]">The "Therefore" — Strategic Insight</div>
              </div>
            </div>

            {/* Strategy */}
            <div className="p-4 rounded-xl mb-4"
              style={{ background: `rgba(${hexToRgb(mission.color)}, 0.07)`, border: `1px solid rgba(${hexToRgb(mission.color)}, 0.2)` }}>
              <p className="text-white/75 text-sm leading-relaxed">{mission.therefore.strategy}</p>
            </div>

            {/* Tactics */}
            <div className="mb-4">
              <div className="text-white/40 text-[10px] uppercase tracking-wider mb-3">Tactical Playbook</div>
              <div className="space-y-2.5">
                {mission.therefore.tactics.map((tactic, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold"
                      style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)`, color: mission.color }}>
                      {i + 1}
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{tactic}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline & ROI */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white/35 text-[10px] uppercase tracking-wider mb-1">Timeline</div>
                <div className="text-white/80 text-xs leading-snug">{mission.therefore.timeline}</div>
              </div>
              <div className="p-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="text-white/35 text-[10px] uppercase tracking-wider mb-1">Expected ROI</div>
                <div className="text-green-400 font-bold text-lg font-heading">{mission.therefore.expectedROI}</div>
              </div>
            </div>

            {/* Arrow connector hint */}
            <div className="hidden md:flex items-center justify-center mt-6 gap-2 text-white/25 text-xs">
              <ArrowRight className="w-4 h-4" />
              <span>Cross the "Because → Therefore" gap with AI precision</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "59, 130, 246";
}
