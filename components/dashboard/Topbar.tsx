"use client";

import { Globe, ChevronDown, Clock, RefreshCw, Wifi } from "lucide-react";
import type { Region, Timeframe } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface TopbarProps {
  region: Region;
  timeframe: Timeframe;
  onRegionChange: (r: Region) => void;
  onTimeframeChange: (t: Timeframe) => void;
  activeView: "mosaic" | "missions" | "retailers";
}

const regions: Region[] = ["Global", "North America", "Europe"];
const timeframes: Timeframe[] = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "FY 2025"];

const viewTitles = {
  mosaic: { title: "Model Intelligence Mosaic", subtitle: "7 AI models · Live data feed" },
  missions: { title: "Mission Command Centre", subtitle: "3 strategic missions synthesised" },
  retailers: { title: "Retailer & Customer Drill-Down", subtitle: "Final mile intelligence" },
};

export function Topbar({ region, timeframe, onRegionChange, onTimeframeChange, activeView }: TopbarProps) {
  const { title, subtitle } = viewTitles[activeView];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 z-20 flex items-center justify-between px-6 border-b border-white/[0.06]"
      style={{ background: "rgba(6, 8, 15, 0.9)", backdropFilter: "blur(20px)" }}>
      
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-heading text-white font-semibold text-base leading-tight tracking-tight">{title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs">{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Right: Filters + Status */}
      <div className="flex items-center gap-3">

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-[11px] font-medium">Live Feed</span>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Clock className="w-3.5 h-3.5 text-white/40 ml-1.5" />
          {timeframes.map((t) => (
            <button
              key={t}
              onClick={() => onTimeframeChange(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                timeframe === t
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
              style={timeframe === t ? {
                background: "rgba(59,130,246,0.2)",
                border: "1px solid rgba(59,130,246,0.35)"
              } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Region selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Globe className="w-3.5 h-3.5 text-white/40 ml-1.5" />
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => onRegionChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                region === r
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
              style={region === r ? {
                background: "rgba(59,130,246,0.2)",
                border: "1px solid rgba(59,130,246,0.35)"
              } : {}}
            >
              {r === "North America" ? "N. America" : r}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
