"use client";

import {
  LayoutDashboard,
  Cpu,
  Target,
  Store,
  BarChart3,
  Settings,
  Bell,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: "mosaic" | "missions" | "retailers";
  onNavigate: (view: "mosaic" | "missions" | "retailers") => void;
  synthesisComplete: boolean;
}

const navItems = [
  {
    id: "mosaic" as const,
    label: "Model Mosaic",
    sublabel: "7 Intelligence Models",
    icon: LayoutDashboard,
    alwaysEnabled: true,
  },
  {
    id: "missions" as const,
    label: "Mission Command",
    sublabel: "Strategic Missions",
    icon: Target,
    alwaysEnabled: false,
  },
  {
    id: "retailers" as const,
    label: "Retailer Intel",
    sublabel: "Dealer Drill-Down",
    icon: Store,
    alwaysEnabled: false,
  },
];

export function Sidebar({ activeView, onNavigate, synthesisComplete }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30 border-r border-white/[0.06]"
      style={{ background: "rgba(6, 8, 15, 0.95)", backdropFilter: "blur(20px)" }}>
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center cobalt-glow-sm"
          style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
          <Zap className="w-4 h-4 text-white" fill="currentColor" />
        </div>
        <div>
          <div className="text-white font-heading font-semibold text-sm leading-tight tracking-wide">MERIDIAN</div>
          <div className="text-white/40 text-[10px] tracking-widest uppercase">Intelligence Platform</div>
        </div>
      </div>

      {/* Brand Badge */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/70 text-xs">JLR Global Analytics</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-3">
          <span className="text-white/30 text-[10px] tracking-widest uppercase font-medium">Workspace</span>
        </div>

        {navItems.map((item) => {
          const isEnabled = item.alwaysEnabled || synthesisComplete;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => isEnabled && onNavigate(item.id)}
              disabled={!isEnabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "text-white"
                  : isEnabled
                  ? "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                  : "text-white/20 cursor-not-allowed"
              )}
              style={isActive ? { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" } : {}}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                isActive ? "bg-blue-500/20" : "bg-white/[0.04]"
              )}>
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-blue-400" : "text-current"
                )} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className={cn(
                  "text-sm font-medium leading-tight truncate",
                  isActive ? "text-white" : ""
                )}>{item.label}</div>
                <div className="text-[10px] text-white/30 truncate">{item.sublabel}</div>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />}
              {!isEnabled && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
              )}
            </button>
          );
        })}

        <div className="px-3 mt-6 mb-3">
          <span className="text-white/30 text-[10px] tracking-widest uppercase font-medium">Analytics</span>
        </div>

        {[
          { label: "Performance Reports", icon: BarChart3 },
          { label: "Model Configuration", icon: Cpu },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-white/30 cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03]">
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/[0.06] space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all duration-200">
          <Bell className="w-4 h-4" />
          <span className="text-sm">Notifications</span>
          <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">3</span>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all duration-200">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl glass">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">AG</span>
          </div>
          <div className="min-w-0">
            <div className="text-white/80 text-xs font-medium truncate">Arjun Gupta</div>
            <div className="text-white/30 text-[10px] truncate">Global Analytics Head</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
