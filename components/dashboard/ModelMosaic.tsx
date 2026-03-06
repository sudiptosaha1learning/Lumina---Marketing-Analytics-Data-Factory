"use client";

import { useState } from "react";
import {
  Users, TrendingUp, RefreshCw, AlertTriangle, Wrench,
  ArrowUpRight, DollarSign, X, Database, Clock, CheckCircle,
  ChevronRight, Activity, Shield, Layers
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { type ModelCardData, type Region, formatUtcDate, formatUtcDatePlus } from "@/lib/dashboard-data";
import { useTheme } from "@/components/dashboard/ThemeProvider";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const Icon = iconMap[model.icon] || Activity;
  const trend = model.metricTrend[region];
  const delta = model.metricDelta[region];

  const cardBg = isSelected
    ? `rgba(${hexToRgb(model.color)}, 0.12)`
    : isHighlighted
    ? `rgba(${hexToRgb(model.color)}, 0.10)`
    : isDark
    ? "rgba(255,255,255,0.04)"
    : "rgba(255,255,255,0.9)";

  const cardBorder = isSelected || isHighlighted
    ? `1px solid rgba(${hexToRgb(model.color)}, 0.5)`
    : isDark
    ? "1px solid rgba(255,255,255,0.07)"
    : "1px solid rgba(0,0,0,0.08)";

  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const textMuted = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)";
  const tagBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tagBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";

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
        background: cardBg,
        border: cardBorder,
        backdropFilter: "blur(16px)",
        boxShadow: isHighlighted
          ? `0 0 24px rgba(${hexToRgb(model.color)}, 0.25)`
          : isSelected
          ? `0 0 16px rgba(${hexToRgb(model.color)}, 0.2)`
          : isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Hover gradient overlay */}
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
          <div className="text-[10px] uppercase tracking-widest font-medium mb-0.5" style={{ color: textSecondary }}>
            {model.shortTitle}
          </div>
          <div className="text-xs leading-tight line-clamp-2 font-medium" style={{ color: textPrimary }}>
            {model.metric}
          </div>
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-3">
        <div className="font-heading text-2xl font-bold tracking-tight leading-none" style={{ color: textPrimary }}>
          {model.metricValue[region]}
        </div>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs font-medium",
          trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""
        )} style={trend === "neutral" ? { color: textMuted } : {}}>
          <TrendingUp className={cn("w-3 h-3", trend === "down" && "rotate-180")} />
          <span>{delta} vs prev period</span>
        </div>
      </div>

      {/* Insight */}
      <p className="text-[11px] leading-relaxed line-clamp-2 mb-4" style={{ color: textSecondary }}>
        {model.insightSummary[region]}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {model.dataSources.slice(0, 2).map((src) => (
            <span key={src} className="px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{ background: tagBg, border: tagBorder, color: textMuted }}>
              {src.split(" ")[0]}
            </span>
          ))}
          {model.dataSources.length > 2 && (
            <span className="text-[9px]" style={{ color: textMuted }}>+{model.dataSources.length - 2}</span>
          )}
        </div>
        <ChevronRight className="w-3.5 h-3.5 transition-colors" style={{ color: textMuted }} />
      </div>

      {/* Version */}
      <div className="mt-2 flex items-center gap-1 text-[9px]" style={{ color: textMuted }}>
        <Clock className="w-2.5 h-2.5" />
                <span className="truncate">Last run: {formatUtcDate(model.lastRunOffsetHours).replace(" UTC", "")}</span>
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [drawerTab, setDrawerTab] = useState<"overview" | "pedigree" | "distribution">("overview");
  const distribution = model.regionalDistribution[region];

  const drawerBg = isDark ? "rgba(8, 11, 20, 0.98)" : "rgba(248, 250, 253, 0.99)";
  const drawerBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const textMuted = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const tagBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tagBorder = isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.09)";

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-lg h-full pointer-events-auto flex flex-col overflow-hidden"
        style={{ background: drawerBg, borderLeft: drawerBorder, backdropFilter: "blur(24px)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${hexToRgb(model.color)}, 0.2)` }}>
              <Activity className="w-5 h-5" style={{ color: model.color }} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-base leading-tight" style={{ color: textPrimary }}>{model.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: textSecondary }}>{model.modelVersion}</span>
                <span style={{ color: textMuted }}>·</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: model.color }}>
                  <CheckCircle className="w-3 h-3" />
                  {model.accuracy}% accuracy
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: textSecondary }}
            onMouseEnter={e => (e.currentTarget.style.background = surfaceBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(["overview", "pedigree", "distribution"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDrawerTab(tab)}
              className="flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all"
              style={drawerTab === tab ? {
                background: `rgba(${hexToRgb(model.color)}, 0.15)`,
                border: `1px solid rgba(${hexToRgb(model.color)}, 0.3)`,
                color: model.color,
              } : {
                background: "transparent",
                color: textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-5">

          {drawerTab === "overview" && (
            <>
              {/* Region Metrics — 2-up on small, then wrap to show all 4 */}
              <div className="grid grid-cols-2 gap-3">
                {(["Global", "North America", "Europe", "UK"] as Region[]).map((r) => (
                  <div key={r} className="p-3 rounded-xl"
                    style={{
                      background: r === region ? `rgba(${hexToRgb(model.color)}, 0.1)` : surfaceBg,
                      border: r === region ? `1px solid rgba(${hexToRgb(model.color)}, 0.35)` : surfaceBorder,
                    }}>
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: textSecondary }}>{r}</div>
                    <div className="font-bold text-lg font-heading" style={{ color: textPrimary }}>{model.metricValue[r]}</div>
                    <div className={cn("text-xs mt-0.5", model.metricTrend[r] === "up" ? "text-green-500" : "text-red-500")}>
                      {model.metricDelta[r]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div className="p-4 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: model.color }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>Current Insight</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)" }}>
                  {model.insightSummary[region]}
                </p>
              </div>

              {/* Data Sources */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>Data Sources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {model.dataSources.map((src) => (
                    <div key={src} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: tagBg, border: tagBorder }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: model.color }} />
                      <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" }}>{src}</span>
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
                  { label: "Next Scheduled Run", value: formatUtcDatePlus(model.pedigree.nextRunOffsetHours > 0 ? 1 : 0, 6), icon: Clock },
                  { label: "SLA Compliance", value: model.pedigree.slaCompliance, icon: Shield },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: surfaceBg, border: surfaceBorder }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `rgba(${hexToRgb(model.color)}, 0.15)` }}>
                      <item.icon className="w-3.5 h-3.5" style={{ color: model.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>{item.label}</div>
                      <div className="text-sm leading-snug" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.75)" }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>Input Features</span>
                </div>
                <div className="space-y-2">
                  {model.pedigree.inputFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: model.color }} />
                      <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {drawerTab === "distribution" && (
            <div className="space-y-5">
              {/* Pie Chart */}
              <div className="p-4 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                <div className="text-xs uppercase tracking-wider mb-4" style={{ color: textSecondary }}>{region} Distribution</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distribution} dataKey="value" nameKey="label"
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80} strokeWidth={0}>
                        {distribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1e2235",
                          border: "1px solid rgba(59,130,246,0.4)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          padding: "8px 12px",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                        }}
                        itemStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "4px", fontSize: "11px" }}
                        formatter={(val: number, name: string) => [`${val}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {distribution.map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>{d.label}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: textPrimary }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-4 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                <div className="text-xs uppercase tracking-wider mb-4" style={{ color: textSecondary }}>Comparative View</div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} barSize={20}>
                      <XAxis dataKey="label"
                        tick={{ fill: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontSize: 9 }}
                        axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontSize: 9 }}
                        axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#1e2235",
                          border: "1px solid rgba(59,130,246,0.4)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          padding: "8px 12px",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                        }}
                        itemStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "4px", fontSize: "11px" }}
                        formatter={(val: number, name: string) => [`${val}%`, name]}
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
