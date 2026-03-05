"use client";

import { Globe, Clock, RefreshCw, Wifi, Sun, Moon } from "lucide-react";
import type { Region, Timeframe } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/dashboard/ThemeProvider";

interface TopbarProps {
  region: Region;
  timeframe: Timeframe;
  onRegionChange: (r: Region) => void;
  onTimeframeChange: (t: Timeframe) => void;
  activeView: "mosaic" | "missions" | "retailers";
}

const regions: Region[] = ["Global", "North America", "Europe"];
const timeframes: Timeframe[] = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "FY 2026"];

const viewTitles = {
  mosaic: { title: "Model Intelligence Mosaic", subtitle: "7 AI models · Live data feed" },
  missions: { title: "Mission Command Centre", subtitle: "3 strategic missions synthesised" },
  retailers: { title: "Retailer & Customer Drill-Down", subtitle: "Final mile intelligence" },
};

export function Topbar({ region, timeframe, onRegionChange, onTimeframeChange, activeView }: TopbarProps) {
  const { title, subtitle } = viewTitles[activeView];
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const surface = isDark
    ? { bg: "rgba(6, 8, 15, 0.9)", border: "rgba(255,255,255,0.06)" }
    : { bg: "rgba(255,255,255,0.9)", border: "rgba(0,0,0,0.08)" };

  const pillStyle = isDark
    ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }
    : { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" };

  const activeTabStyle = {
    background: "rgba(59,130,246,0.2)",
    border: "1px solid rgba(59,130,246,0.35)",
  };

  return (
    <header
      className="fixed top-0 left-64 right-0 h-16 z-20 flex items-center justify-between px-6 border-b transition-colors duration-300"
      style={{
        background: surface.bg,
        borderColor: surface.border,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className={`font-heading font-semibold text-base leading-tight tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-500"}`}>{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Right: Filters + Theme Toggle */}
      <div className="flex items-center gap-3">

        {/* Live indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-[11px] font-medium">Live Feed</span>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={pillStyle}>
          <Clock className={`w-3.5 h-3.5 ml-1.5 ${isDark ? "text-white/40" : "text-slate-400"}`} />
          {timeframes.map((t) => (
            <button
              key={t}
              onClick={() => onTimeframeChange(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                timeframe === t
                  ? "text-white"
                  : isDark
                  ? "text-white/40 hover:text-white/70"
                  : "text-slate-500 hover:text-slate-800"
              )}
              style={timeframe === t ? activeTabStyle : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Region selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={pillStyle}>
          <Globe className={`w-3.5 h-3.5 ml-1.5 ${isDark ? "text-white/40" : "text-slate-400"}`} />
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => onRegionChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                region === r
                  ? "text-white"
                  : isDark
                  ? "text-white/40 hover:text-white/70"
                  : "text-slate-500 hover:text-slate-800"
              )}
              style={region === r ? activeTabStyle : {}}
            >
              {r === "North America" ? "N. America" : r}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? "text-white/40 hover:text-white/70 hover:bg-white/[0.05]" : "text-slate-400 hover:text-slate-700 hover:bg-black/[0.05]"}`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
            isDark
              ? "text-white/50 hover:text-yellow-300 hover:bg-yellow-500/10"
              : "text-slate-500 hover:text-blue-600 hover:bg-blue-500/10"
          )}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
