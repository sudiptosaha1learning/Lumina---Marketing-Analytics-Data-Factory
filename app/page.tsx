"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { ModelMosaic } from "@/components/dashboard/ModelMosaic";
import { ReasoningEngine } from "@/components/dashboard/ReasoningEngine";
import { MissionCommand } from "@/components/dashboard/MissionCommand";
import { RetailerDrillDown } from "@/components/dashboard/RetailerDrillDown";
import { ThemeProvider, useTheme } from "@/components/dashboard/ThemeProvider";
import { modelCards, missions, type Region, type Timeframe, type Mission } from "@/lib/dashboard-data";

function DashboardInner() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [region, setRegion] = useState<Region>("Global");
  const [timeframe, setTimeframe] = useState<Timeframe>("Q1 2026");
  const [activeView, setActiveView] = useState<"mosaic" | "missions" | "retailers">("mosaic");
  const [synthesisComplete, setSynthesisComplete] = useState(false);
  const [highlightedModels, setHighlightedModels] = useState<string[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  const handleSynthesisComplete = () => {
    setSynthesisComplete(true);
    setActiveView("missions");
  };

  const handleViewRetailers = (mission: Mission) => {
    setActiveMission(mission);
    setActiveView("retailers");
  };

  const handleBackFromRetailers = () => {
    setActiveView("missions");
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: isDark ? "#060810" : "#f0f2f8" }}
    >
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
               linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)`
            : `linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
               linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        synthesisComplete={synthesisComplete}
      />

      {/* Topbar */}
      <Topbar
        region={region}
        timeframe={timeframe}
        onRegionChange={setRegion}
        onTimeframeChange={setTimeframe}
        activeView={activeView}
      />

      {/* Main Content */}
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-6 max-w-[1600px]">

          {/* STATE 1: MODEL MOSAIC */}
          {activeView === "mosaic" && (
            <div className="space-y-6">
              {/* KPI Summary Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Lead Pipeline", value: region === "North America" ? "6,340" : region === "Europe" ? "5,910" : region === "UK" ? "2,570" : "14,820", sub: "Intelligent Lead + Lead Scoring", color: "#3b82f6" },
                  { label: "Positive Equity Vehicles", value: region === "North America" ? "2,890" : region === "Europe" ? "1,920" : region === "UK" ? "830" : "5,640", sub: "Buyback Model · Avg. +£/$/€4k equity", color: "#10b981" },
                  { label: "Revenue Opportunity", value: region === "North America" ? "$41.6M" : region === "Europe" ? "$29.8M" : region === "UK" ? "£12.8M" : "$84.2M", sub: "Upselling Engine", color: "#8b5cf6" },
                  { label: "At-Risk Orders", value: region === "North America" ? "187" : region === "Europe" ? "156" : region === "UK" ? "69" : "412", sub: "Cancellation Model · -18.4% MoM", color: "#f59e0b" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="p-4 rounded-2xl transition-all duration-300"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
                      border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
                      backdropFilter: "blur(16px)",
                      boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>{kpi.label}</div>
                    <div className={`font-heading text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{kpi.value}</div>
                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${isDark ? "text-white/35" : "text-slate-400"}`}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: kpi.color }} />
                      {kpi.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section label */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
                <span className={`text-xs uppercase tracking-widest px-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>Intelligence Model Mosaic</span>
                <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
              </div>

              {/* Model Grid */}
              <ModelMosaic
                models={modelCards}
                region={region}
                highlightedModels={highlightedModels}
              />

              {/* Section label */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
                <span className={`text-xs uppercase tracking-widest px-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>Reasoning Engine</span>
                <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }} />
              </div>

              {/* Reasoning Engine */}
              <ReasoningEngine
                onComplete={handleSynthesisComplete}
                onHighlightModels={setHighlightedModels}
              />
            </div>
          )}

          {/* STATE 2: MISSION COMMAND */}
          {activeView === "missions" && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveView("mosaic")}
                className={`flex items-center gap-2 text-sm transition-colors ${isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-700"}`}
              >
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M5 1.5L2.5 4L5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                Back to Model Mosaic
              </button>

              <MissionCommand
                missions={missions}
                region={region}
                onViewRetailers={handleViewRetailers}
              />
            </div>
          )}

          {/* STATE 3: RETAILER DRILL-DOWN */}
          {activeView === "retailers" && activeMission && (
            <RetailerDrillDown
              mission={activeMission}
              region={region}
              onBack={handleBackFromRetailers}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardInner />
    </ThemeProvider>
  );
}

