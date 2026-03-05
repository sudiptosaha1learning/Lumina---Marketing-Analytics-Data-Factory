"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { ModelMosaic } from "@/components/dashboard/ModelMosaic";
import { ReasoningEngine } from "@/components/dashboard/ReasoningEngine";
import { MissionCommand } from "@/components/dashboard/MissionCommand";
import { RetailerDrillDown } from "@/components/dashboard/RetailerDrillDown";
import { modelCards, missions, type Region, type Timeframe, type Mission } from "@/lib/dashboard-data";

export default function DashboardPage() {
  const [region, setRegion] = useState<Region>("Global");
  const [timeframe, setTimeframe] = useState<Timeframe>("Q3 2025");
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
    <div className="min-h-screen" style={{ background: "#060810" }}>
      {/* Background grid pattern */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }} />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", filter: "blur(40px)" }} />

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

          {/* ── STATE 1: MODEL MOSAIC ───────────────────────────── */}
          {activeView === "mosaic" && (
            <div className="space-y-6">
              {/* KPI Summary Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Lead Pipeline", value: region === "North America" ? "6,340" : region === "Europe" ? "5,910" : "14,820", sub: "Intelligent Lead + Lead Scoring", color: "#3b82f6" },
                  { label: "Positive Equity Vehicles", value: region === "North America" ? "2,890" : region === "Europe" ? "1,920" : "5,640", sub: "Buyback Model · Avg. +$4.2k", color: "#10b981" },
                  { label: "Revenue Opportunity", value: region === "North America" ? "$41.6M" : region === "Europe" ? "$29.8M" : "$84.2M", sub: "Upselling Engine", color: "#8b5cf6" },
                  { label: "At-Risk Orders", value: region === "North America" ? "187" : region === "Europe" ? "156" : "412", sub: "Cancellation Model · 18.4% MoM", color: "#f59e0b" },
                ].map((kpi) => (
                  <div key={kpi.label} className="p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
                    <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{kpi.label}</div>
                    <div className="font-heading text-white text-2xl font-bold">{kpi.value}</div>
                    <div className="text-white/35 text-[10px] mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: kpi.color }} />
                      {kpi.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section label */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                <span className="text-white/30 text-xs uppercase tracking-widest px-3">Intelligence Model Mosaic</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Model Grid */}
              <ModelMosaic
                models={modelCards}
                region={region}
                highlightedModels={highlightedModels}
              />

              {/* Section label */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                <span className="text-white/30 text-xs uppercase tracking-widest px-3">Reasoning Engine</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Reasoning Engine */}
              <ReasoningEngine
                onComplete={handleSynthesisComplete}
                onHighlightModels={setHighlightedModels}
              />
            </div>
          )}

          {/* ── STATE 2: MISSION COMMAND ────────────────────────── */}
          {activeView === "missions" && (
            <div className="space-y-6">
              {/* Return to mosaic breadcrumb */}
              <button
                onClick={() => setActiveView("mosaic")}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
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

          {/* ── STATE 3: RETAILER DRILL-DOWN ────────────────────── */}
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
