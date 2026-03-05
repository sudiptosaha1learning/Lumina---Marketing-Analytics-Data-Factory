"use client";

import { useState } from "react";
import {
  Users, TrendingUp, RefreshCw, AlertTriangle, Wrench,
  ArrowUpRight, DollarSign, X, Database, Clock, CheckCircle,
  ChevronRight, Activity, Shield, Layers
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { type ModelCardData, type Region } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Users, TrendingUp, RefreshCw, AlertTriangle,
  Wrench, ArrowUpRight, DollarSign,
};

interface ModelMosaicProps {
  models: ModelCardData[];
  region: Region;
  highlightedModels?: string[];
}

export function ModelMosaic({ models, region, highlightedModels = [] }: ModelMosaicProps) {
  const [selectedModel, setSelectedModel] = useState<ModelCardData | null>(null);

  return (
    <div className="relative">
      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="model-mosaic-grid">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            region={region}
            isHighlighted={highlightedModels.includes(model.id)}
            isSelected={selectedModel?.id === model.id}
            onClick={() => setSelectedModel(selectedModel?.id === model.id ? null : model)}
          />
        ))}
      </div>

      {/* Detail Drawer */}
      {selectedModel && (
        <ModelDrawer
          model={selectedModel}
          region={region}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
}

// ─── Individual Card ──────────────────────────────────────────────────────────

interface ModelCardProps {
  model: ModelCardData;
  region: Region;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function ModelCard({ model, region, isHighlighted, isSelected, onClick }: ModelCardProps) {
  const Icon = iconMap[model.icon] || Activity;
  const trend = model.metricTrend[region];
  const delta = model.metricDelta[region];

  return (
    <button
      id={`model-card-${model.id}`}
      onClick={onClick}
      className={cn(
        "relative text-left rounded-2xl p-5 transition-all duration-300 group overflow-hidden",
        isSelected ? "ring-2" : "hover:scale-[1.01]",
        isHighlighted ? "ring-2 animate-pulse" : ""
      )}
      style={{
        background: isSelected
          ? `rgba(${hexToRgb(model.color)}, 0.12)`
          : isHighlighted
          ? `rgba(${hexToRgb(model.color)}, 0.10)`
          : "rgba(255,255,255,0.04)",
        border: isSelected || isHighlighted
          ? `1px solid rgba(${hexToRgb(model.color)}, 0.5)`
          : "1px solid rgba(255,255,255,0.07)",
        ringColor: model.color,
        backdropFilter: "blur(16px)",
        boxShadow: isHighlighted
          ? `0 0 24px rgba(${hexToRgb(model.color)}, 0.25)`
          : isSelected
          ? `0 0 16px rgba(${hexToRgb(model.color)}, 0.2)`
          : "none",
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at top left, rgba(${hexToRgb(model.color)}, 0.06) 0%, transparent 70%)` }} />

      {/* Accuracy badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ background: `rgba(${hexToRgb(model.color)}, 0.15)` }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: model.color }} />
        <span className="text-[10px] font-semibold" style={{ color: model.color }}>{model.accuracy}%</span>
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `rgba(${hexToRgb(model.color)}, 0.18)` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: model.color }} />
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <div className="text-white/50 text-[10px] uppercase tracking-widest font-medium mb-0.5">
            {model.shortTitle}
          </div>
          <div className="text-white/80 text-xs leading-tight line-clamp-2 font-medium">
            {model.metric}
          </div>
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-3">
        <div className="font-heading text-white text-2xl font-bold tracking-tight leading-none">
          {model.metricValue[region]}
        </div>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs font-medium",
          trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-white/40"
        )}>
          <TrendingUp className={cn("w-3 h-3", trend === "down" && "rotate-180")} />
          <span>{delta} vs prev period</span>
        </div>
      </div>

      {/* Insight */}
      <p className="text-white/45 text-[11px] leading-relaxed line-clamp-2 mb-4">
        {model.insightSummary[region]}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {model.dataSources.slice(0, 2).map((src) => (
            <span key={src} className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white/40"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {src.split(" ")[0]}
            </span>
          ))}
          {model.dataSources.length > 2 && (
            <span className="text-white/30 text-[9px]">+{model.dataSources.length - 2}</span>
          )}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
      </div>

      {/* Version */}
      <div className="mt-2 flex items-center gap-1 text-white/25 text-[9px]">
        <Clock className="w-2.5 h-2.5" />
        <span className="truncate">Last run: {model.lastRun.split(" ").slice(-1)[0] === "UTC" ? model.lastRun.replace(" UTC", "") : model.lastRun}</span>
      </div>
    </button>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

interface ModelDrawerProps {
  model: ModelCardData;
  region: Region;
  onClose: () => void;
}

function ModelDrawer({ model, region, onClose }: ModelDrawerProps) {
  const [drawerTab, setDrawerTab] = useState<"overview" | "pedigree" | "distribution">("overview");
  const distribution = model.regionalDistribution[region];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-lg h-full pointer-events-auto flex flex-col overflow-hidden"
        style={{
          background: "rgba(8, 11, 20, 0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${hexToRgb(model.color)}, 0.2)` }}>
              <Activity className="w-5 h-5" style={{ color: model.color }} />
            </div>
            <div>
              <h2 className="font-heading text-white font-semibold text-base leading-tight">{model.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs">{model.modelVersion}</span>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: model.color }}>
                  <CheckCircle className="w-3 h-3" />
                  {model.accuracy}% accuracy
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(["overview", "pedigree", "distribution"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDrawerTab(tab)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all",
                drawerTab === tab ? "text-white" : "text-white/40 hover:text-white/60"
              )}
              style={drawerTab === tab ? {
                background: `rgba(${hexToRgb(model.color)}, 0.15)`,
                border: `1px solid rgba(${hexToRgb(model.color)}, 0.3)`
              } : { background: "transparent" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-5">

          {drawerTab === "overview" && (
            <>
              {/* Region Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {(["Global", "North America", "Europe"] as Region[]).map((r) => (
                  <div key={r}
                    className={cn("p-3 rounded-xl", r === region ? "ring-1" : "")}
                    style={{
                      background: r === region ? `rgba(${hexToRgb(model.color)}, 0.1)` : "rgba(255,255,255,0.04)",
                      border: r === region ? `1px solid rgba(${hexToRgb(model.color)}, 0.35)` : "1px solid rgba(255,255,255,0.07)",
                    }}>
                    <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{r}</div>
                    <div className="text-white font-bold text-lg font-heading">{model.metricValue[r]}</div>
                    <div className={cn("text-xs mt-0.5", model.metricTrend[r] === "up" ? "text-green-400" : "text-red-400")}>
                      {model.metricDelta[r]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: model.color }} />
                  <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Current Insight</span>
                </div>
                <p className="text-white/75 text-sm leading-relaxed">{model.insightSummary[region]}</p>
              </div>

              {/* Data Sources */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Data Sources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {model.dataSources.map((src) => (
                    <div key={src} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: model.color }} />
                      <span className="text-white/65 text-xs">{src}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {drawerTab === "pedigree" && (
            <>
              <div className="space-y-3">
                {[
                  { label: "Model Type", value: model.pedigree.modelType, icon: Layers },
                  { label: "Output Type", value: model.pedigree.outputType, icon: Activity },
                  { label: "Training Data", value: model.pedigree.trainingDataSize, icon: Database },
                  { label: "Refresh Cadence", value: model.pedigree.refreshCadence, icon: RefreshCw },
                  { label: "Next Scheduled Run", value: model.pedigree.nextScheduledRun, icon: Clock },
                  { label: "SLA Compliance", value: model.pedigree.slaCompliance, icon: Shield },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `rgba(${hexToRgb(model.color)}, 0.15)` }}>
                      <item.icon className="w-3.5 h-3.5" style={{ color: model.color }} />
                    </div>
                    <div>
                      <div className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">{item.label}</div>
                      <div className="text-white/80 text-sm leading-snug">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Input Features</span>
                </div>
                <div className="space-y-2">
                  {model.pedigree.inputFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: model.color }} />
                      <span className="text-white/60 text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {drawerTab === "distribution" && (
            <div className="space-y-5">
              {/* Pie Chart */}
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white/50 text-xs uppercase tracking-wider mb-4">{region} Distribution</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        strokeWidth={0}
                      >
                        {distribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#0a0c10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                        formatter={(val: number) => [`${val}%`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {distribution.map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-white/60 text-xs">{d.label}</span>
                      </div>
                      <span className="text-white/80 text-xs font-semibold">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white/50 text-xs uppercase tracking-wider mb-4">Comparative View</div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} barSize={20}>
                      <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#0a0c10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                        formatter={(val: number) => [`${val}%`, ""]}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {distribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
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
