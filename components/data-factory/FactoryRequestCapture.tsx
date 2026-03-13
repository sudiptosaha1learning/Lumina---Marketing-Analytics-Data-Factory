"use client";

import { useState } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const SAMPLE_REQUESTS = [
  "Build a customer marketing propensity data product that combines CRM, website behaviour, and email engagement data to score each customer's likelihood to purchase a new Defender in the next 90 days.",
  "I need a data product that identifies Range Rover owners at their natural upgrade point — combining vehicle age, mileage, campaign response history, and positive equity signals.",
  "Create a campaign attribution data product linking email clicks, website events, and order data so the CRM team can measure which campaigns are driving vehicle purchases.",
];

interface Props {
  onStart: (requestText: string) => void;
}

export function FactoryRequestCapture({ onStart }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!requestText.trim()) return;
    setIsSubmitting(true);
    onStart(requestText.trim());
  };

  const handleSample = (text: string) => {
    setRequestText(text);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hero Card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          backdropFilter: "blur(16px)",
        }}
      >
        <h2 className={`font-heading text-base font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          Describe your data need
        </h2>
        <p className={`text-xs mb-5 leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
          Describe the business problem or analytics use case in plain language. The factory will orchestrate specialised AI agents to discover, design, build, validate, and publish a governed data product.
        </p>

        <Textarea
          placeholder="e.g. Build a propensity-to-buy data product for Defender customers combining CRM, website and email data..."
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          rows={5}
          className={`text-sm resize-none mb-4 ${isDark ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30 focus-visible:ring-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400/50"}`}
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
            {requestText.length} characters
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!requestText.trim() || isSubmitting}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Launch Factory
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sample requests */}
      <div>
        <p className={`text-[10px] uppercase tracking-widest mb-3 ${isDark ? "text-white/35" : "text-slate-400"}`}>
          Sample requests
        </p>
        <div className="space-y-2">
          {SAMPLE_REQUESTS.map((sample, i) => (
            <button
              key={i}
              onClick={() => handleSample(sample)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs leading-relaxed transition-all duration-200 group ${
                isDark
                  ? "text-white/55 hover:text-white/85 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12]"
                  : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className="inline-block mr-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider"
                style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
              >
                EXAMPLE {i + 1}
              </span>
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Capabilities grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "11 Specialised Agents", sub: "Each agent owns one workflow stage" },
          { label: "Human-in-the-Loop", sub: "Edit, override or approve every output" },
          { label: "Governed by Design", sub: "PII detection, masking & access controls" },
          { label: "Publish-Ready", sub: "Lineage, tests, docs & endpoints included" },
        ].map((cap) => (
          <div
            key={cap.label}
            className="rounded-xl px-4 py-3"
            style={{
              background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.05)",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <div className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-slate-800"}`}>{cap.label}</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}>{cap.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
