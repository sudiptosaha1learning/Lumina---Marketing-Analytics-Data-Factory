"use client";

import { useTheme } from "@/components/dashboard/ThemeProvider";
import type { PublishingOutput } from "@/lib/data-product-types";
import { Tag, RefreshCw, Globe, User, Calendar, Rocket } from "lucide-react";

interface Props {
  output: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function PublishingPanel({ output }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = output as Partial<PublishingOutput>;
  const card = data.productCard;

  const labelClass = `text-[10px] uppercase tracking-wider font-semibold mb-2 block ${isDark ? "text-white/40" : "text-slate-400"}`;
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  };
  const metaRowClass = `flex items-center gap-2 ${isDark ? "text-white/60" : "text-slate-700"}`;

  if (!card) {
    return (
      <div className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
        Publishing data not available.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Product Card preview */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)",
          border: "1px solid rgba(59,130,246,0.25)",
        }}
      >
        {/* Card header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
          >
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`font-heading font-semibold text-base ${isDark ? "text-white" : "text-slate-900"}`}>{card.name}</div>
            <div className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>{card.description}</div>
          </div>
          <div
            className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            {card.status}
          </div>
        </div>

        {/* Meta rows */}
        <div className="px-5 py-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <div className={metaRowClass}>
              <User className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs"><span className="font-medium">Owner:</span> {card.owner}</span>
            </div>
            <div className={metaRowClass}>
              <Globe className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs"><span className="font-medium">Domain:</span> {card.domain}</span>
            </div>
            <div className={metaRowClass}>
              <Tag className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs"><span className="font-medium">Version:</span> {card.version}</span>
            </div>
            <div className={metaRowClass}>
              <RefreshCw className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs"><span className="font-medium">Refresh:</span> {card.refreshFrequency}</span>
            </div>
          </div>

          {/* Tags */}
          {(card.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {card.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Endpoints */}
      {(card.endpoints?.length ?? 0) > 0 && (
        <div>
          <label className={labelClass}>Published Endpoints</label>
          <div className="space-y-1.5">
            {card.endpoints.map((endpoint, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs"
                style={{ ...cardStyle, color: isDark ? "#60a5fa" : "#2563eb" }}
              >
                <Globe className="w-3 h-3 flex-shrink-0 opacity-60" />
                {endpoint}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Release Notes */}
      {data.releaseNotes && (
        <div>
          <label className={labelClass}>Release Notes</label>
          <div className="rounded-xl px-4 py-3" style={cardStyle}>
            <p className={`text-xs leading-relaxed ${isDark ? "text-white/65" : "text-slate-700"}`}>{data.releaseNotes}</p>
          </div>
        </div>
      )}

      {/* Published At */}
      {data.publishedAt && (
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-green-400" />
          <span className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
            Published at{" "}
            <span className={`font-medium ${isDark ? "text-white/75" : "text-slate-700"}`}>
              {new Date(data.publishedAt).toLocaleString()}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
