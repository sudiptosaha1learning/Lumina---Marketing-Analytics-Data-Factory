"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ArrowRight, Search, ChevronDown, ChevronUp,
  Database, Tag, Clock, CheckCircle2, FileText, BarChart3,
  Layers, Eye, Zap, Code2, Globe, RefreshCw, Star,
} from "lucide-react";

// ── Catalog types & data ──────────────────────────────────────────────────

export interface CatalogProduct {
  id: string;
  name: string;
  domain: string;
  description: string;
  status: "Published" | "Draft" | "Deprecated";
  tier: "Gold" | "Silver" | "Bronze";
  owner: string;
  updatedAt: string;
  tags: string[];
  consumers: number;
  quality: number;
  freshness: string;
  updateSchedule: string;
  apiEndpoint: string;
  apiFormat: string;
  apiAuth: string;
  sampleQuery: string;
}

export const BASE_CATALOG: CatalogProduct[] = [
  {
    id: "cp1",
    name: "Customer Propensity Score v2",
    domain: "Marketing",
    description: "ML model scoring customers 0–100 on likelihood to purchase a new vehicle within 90 days. Trained on CRM, web, and email signals.",
    status: "Published",
    tier: "Gold",
    owner: "Analytics",
    updatedAt: "2026-03-10",
    tags: ["propensity", "ml", "crm", "email"],
    consumers: 14,
    quality: 94,
    freshness: "Updated 6 hours ago",
    updateSchedule: "Daily at 02:00 UTC",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/customer-propensity",
    apiFormat: "REST / JSON",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/customer-propensity?customer_id=C12345&fields=score,decile",
  },
  {
    id: "cp2",
    name: "Defender Model Interest Index",
    domain: "Marketing",
    description: "Engagement scoring model for Defender-specific customer interest using configurator, brochure, and campaign response data.",
    status: "Published",
    tier: "Silver",
    owner: "CRM Team",
    updatedAt: "2026-02-28",
    tags: ["defender", "engagement", "scoring"],
    consumers: 8,
    quality: 71,
    freshness: "Updated 2 days ago",
    updateSchedule: "Weekly on Monday",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/defender-interest",
    apiFormat: "REST / JSON",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/defender-interest?customer_id=C12345",
  },
  {
    id: "cp3",
    name: "Marketing Attribution Dataset",
    domain: "Marketing",
    description: "Multi-touch attribution model across email, paid, and CRM channels linking marketing touchpoints to confirmed orders.",
    status: "Draft",
    tier: "Bronze",
    owner: "Data Platform",
    updatedAt: "2026-03-05",
    tags: ["attribution", "email", "paid", "orders"],
    consumers: 3,
    quality: 58,
    freshness: "Updated 8 days ago",
    updateSchedule: "Manual / On-demand",
    apiEndpoint: "https://data.jlr.internal/api/v1/products/mkt-attribution (draft)",
    apiFormat: "REST / JSON",
    apiAuth: "API Key",
    sampleQuery: "GET /api/v1/products/mkt-attribution?order_id=ORD-98765",
  },
  {
    id: "cp4",
    name: "Vehicle Contract Lifecycle",
    domain: "Sales",
    description: "Full lifecycle view of PCP and PCH contracts — start date, end date, equity position, and renewal eligibility flag per customer.",
    status: "Published",
    tier: "Gold",
    owner: "Sales Analytics",
    updatedAt: "2026-03-12",
    tags: ["contracts", "pcp", "renewal", "equity"],
    consumers: 21,
    quality: 97,
    freshness: "Updated 1 hour ago",
    updateSchedule: "Daily at 01:00 UTC",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/contract-lifecycle",
    apiFormat: "REST / JSON + GraphQL",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/contract-lifecycle?customer_id=C12345&status=active",
  },
  {
    id: "cp5",
    name: "Dealer Network Performance",
    domain: "Sales",
    description: "Dealer-level KPIs including test drive conversion, order close rate, and customer satisfaction scores aggregated monthly.",
    status: "Published",
    tier: "Gold",
    owner: "Retail Analytics",
    updatedAt: "2026-03-08",
    tags: ["dealer", "conversion", "kpi", "satisfaction"],
    consumers: 17,
    quality: 91,
    freshness: "Updated 5 days ago",
    updateSchedule: "Monthly on the 1st",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/dealer-performance",
    apiFormat: "REST / JSON",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/dealer-performance?dealer_id=D456&period=2026-02",
  },
  {
    id: "cp6",
    name: "Customer 360 Profile",
    domain: "CRM",
    description: "Unified customer view combining demographics, vehicle ownership history, service records, and digital engagement signals.",
    status: "Published",
    tier: "Gold",
    owner: "Data Platform",
    updatedAt: "2026-03-11",
    tags: ["customer", "360", "unified", "demographics"],
    consumers: 38,
    quality: 88,
    freshness: "Updated 2 hours ago",
    updateSchedule: "Daily at 03:00 UTC",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/customer-360",
    apiFormat: "REST / JSON + GraphQL",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/customer-360?customer_id=C12345&include=vehicles,services",
  },
  {
    id: "cp7",
    name: "Website Behavioural Events",
    domain: "Digital",
    description: "Clickstream events from the retail website including model page views, configurator sessions, and brochure downloads.",
    status: "Published",
    tier: "Silver",
    owner: "Digital Analytics",
    updatedAt: "2026-03-09",
    tags: ["clickstream", "web", "events", "configurator"],
    consumers: 11,
    quality: 83,
    freshness: "Real-time (5 min lag)",
    updateSchedule: "Continuous streaming",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/web-events",
    apiFormat: "REST / JSON + Event Stream",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/web-events?customer_id=C12345&event_type=configurator_session&limit=100",
  },
  {
    id: "cp8",
    name: "Email Campaign Engagement",
    domain: "Marketing",
    description: "Per-customer engagement metrics (open rate, click rate, unsubscribe flag) for all CRM email campaigns, updated daily.",
    status: "Published",
    tier: "Silver",
    owner: "CRM Team",
    updatedAt: "2026-03-10",
    tags: ["email", "engagement", "crm", "campaigns"],
    consumers: 9,
    quality: 85,
    freshness: "Updated 8 hours ago",
    updateSchedule: "Daily at 04:00 UTC",
    apiEndpoint: "https://data.jlr.internal/api/v2/products/email-engagement",
    apiFormat: "REST / JSON",
    apiAuth: "OAuth 2.0 (Bearer token)",
    sampleQuery: "GET /api/v2/products/email-engagement?customer_id=C12345&campaign_id=CMP-7890",
  },
];

const DOMAINS = ["All", "Marketing", "Sales", "CRM", "Digital"];
const STATUSES = ["All", "Published", "Draft"];
const TIERS = ["All", "Gold", "Silver", "Bronze"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Published:  { bg: "rgba(34,197,94,0.1)",  text: "#4ade80" },
  Draft:      { bg: "rgba(245,158,11,0.1)", text: "#fbbf24" },
  Deprecated: { bg: "rgba(239,68,68,0.1)",  text: "#f87171" },
};
const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Gold:   { bg: "rgba(234,179,8,0.1)",   text: "#eab308", border: "rgba(234,179,8,0.3)" },
  Silver: { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  Bronze: { bg: "rgba(180,83,9,0.12)",   text: "#b45309", border: "rgba(180,83,9,0.3)" },
};

// ── Quality bar ───────────────────────────────────────────────────────────

function QualityBar({ score, isDark }: { score: number; isDark: boolean }) {
  const color = score >= 85 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-black/10"}`}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

// ── Catalog card ──────────────────────────────────────────────────────────

function CatalogCard({
  product,
  isDark,
  highlighted,
  cardRef,
}: {
  product: CatalogProduct;
  isDark: boolean;
  highlighted?: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
}) {
  const [expanded, setExpanded] = useState(highlighted ?? false);
  const status = STATUS_COLORS[product.status];
  const tier = TIER_COLORS[product.tier];

  useEffect(() => {
    if (highlighted) setExpanded(true);
  }, [highlighted]);

  return (
    <div
      ref={cardRef}
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: highlighted
          ? isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)"
          : isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
        border: highlighted
          ? "1px solid rgba(59,130,246,0.4)"
          : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
        boxShadow: highlighted ? "0 0 0 2px rgba(59,130,246,0.15)" : undefined,
      }}
    >
      {/* New badge */}
      {highlighted && (
        <div
          className="px-3 py-1.5 flex items-center gap-1.5 border-b"
          style={{ background: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.2)" }}
        >
          <Star className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-semibold text-blue-400">Just published — new data product</span>
        </div>
      )}

      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {product.name}
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: status.bg, color: status.text }}
              >
                {product.status}
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: tier.bg, color: tier.text, border: `1px solid ${tier.border}` }}
              >
                {product.tier}
              </span>
            </div>
            <p className={`text-[10px] mt-0.5 line-clamp-1 ${isDark ? "text-white/45" : "text-slate-500"}`}>
              {product.description}
            </p>
            <div className="mt-1.5">
              <QualityBar score={product.quality} isDark={isDark} />
            </div>
          </div>
          <div className="flex-shrink-0 mt-0.5">
            {expanded
              ? <ChevronUp className={`w-3.5 h-3.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              : <ChevronDown className={`w-3.5 h-3.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
            }
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-3 border-t"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
        >
          <p className={`text-[11px] leading-relaxed pt-3 ${isDark ? "text-white/55" : "text-slate-600"}`}>
            {product.description}
          </p>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5">
              <Tag className={`w-3 h-3 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              <span className={isDark ? "text-white/40" : "text-slate-500"}>Domain:</span>
              <span className={`font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{product.domain}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className={`w-3 h-3 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              <span className={isDark ? "text-white/40" : "text-slate-500"}>Consumers:</span>
              <span className={`font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{product.consumers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className={`w-3 h-3 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              <span className={isDark ? "text-white/40" : "text-slate-500"}>Owner:</span>
              <span className={`font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{product.owner}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className={`w-3 h-3 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              <span className={isDark ? "text-white/40" : "text-slate-500"}>Updated:</span>
              <span className={`font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>{product.updatedAt}</span>
            </div>
          </div>

          {/* Freshness */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              background: isDark ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.05)",
              border: "1px solid rgba(34,197,94,0.18)",
            }}
          >
            <RefreshCw className="w-3 h-3 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-green-400">{product.freshness}</span>
              <span className={`text-[9px] ml-2 ${isDark ? "text-white/35" : "text-slate-400"}`}>
                Schedule: {product.updateSchedule}
              </span>
            </div>
          </div>

          {/* API Details */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 border-b"
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              }}
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span className={`text-[10px] font-semibold ${isDark ? "text-white/70" : "text-slate-700"}`}>
                API Access
              </span>
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium"
                style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}
              >
                {product.apiFormat}
              </span>
            </div>
            <div className="px-3 py-2.5 space-y-2">
              <div className="flex items-start gap-2">
                <Zap className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                <div className="min-w-0">
                  <p className={`text-[9px] mb-0.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>Endpoint</p>
                  <p
                    className="text-[10px] font-mono break-all"
                    style={{ color: isDark ? "rgba(147,197,253,0.85)" : "#1d4ed8" }}
                  >
                    {product.apiEndpoint}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Code2 className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                <div className="min-w-0">
                  <p className={`text-[9px] mb-0.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>Auth</p>
                  <p className={`text-[10px] font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}>
                    {product.apiAuth}
                  </p>
                </div>
              </div>
              <div
                className="rounded-lg p-2 font-mono text-[9px] leading-relaxed break-all"
                style={{
                  background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
                  color: isDark ? "rgba(134,239,172,0.8)" : "#166534",
                }}
              >
                {product.sampleQuery}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

const SAMPLE_REQUESTS = [
  "Build a customer marketing propensity data product that combines CRM, website behaviour, and email engagement data to score each customer's likelihood to purchase a new Defender in the next 90 days.",
  "I need a data product that identifies Range Rover owners at their natural upgrade point — combining vehicle age, mileage, campaign response history, and positive equity signals.",
  "Create a campaign attribution data product linking email clicks, website events, and order data so the CRM team can measure which campaigns are driving vehicle purchases.",
];

interface Props {
  onStart: (requestText: string) => void;
  publishedProduct?: CatalogProduct;
  highlightId?: string;
}

export function FactoryRequestCapture({ onStart, publishedProduct, highlightId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge published product at the top
  const CATALOG = publishedProduct
    ? [publishedProduct, ...BASE_CATALOG.filter((p) => p.id !== publishedProduct.id)]
    : BASE_CATALOG;

  const [catalogSearch, setCatalogSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");

  const highlightRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 200);
    }
  }, [highlightId]);

  const handleSubmit = () => {
    if (!requestText.trim()) return;
    setIsSubmitting(true);
    onStart(requestText.trim());
  };

  const filteredCatalog = CATALOG.filter((p) => {
    const matchSearch = !catalogSearch ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.tags.some((t) => t.includes(catalogSearch.toLowerCase()));
    const matchDomain = domainFilter === "All" || p.domain === domainFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchTier = tierFilter === "All" || p.tier === tierFilter;
    return matchSearch && matchDomain && matchStatus && matchTier;
  });

  const filterBtnClass = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
      active
        ? isDark
          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          : "bg-blue-500/15 text-blue-700 border border-blue-500/30"
        : isDark
          ? "text-white/40 hover:text-white/70 border border-transparent hover:border-white/10"
          : "text-slate-500 hover:text-slate-700 border border-transparent hover:border-black/10"
    }`;

  return (
    <div className="grid grid-cols-[1fr_380px] gap-6 items-start">

      {/* ── LEFT: Request panel ─────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Input card */}
        <div
          className="rounded-2xl p-6"
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
                onClick={() => setRequestText(sample)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs leading-relaxed transition-all duration-200 ${
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

      {/* ── RIGHT: Catalog browser ──────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.8)",
          border: highlightId
            ? "1px solid rgba(59,130,246,0.35)"
            : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
          maxHeight: "calc(100vh - 220px)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className={`w-4 h-4 ${isDark ? "text-white/50" : "text-slate-500"}`} />
            <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Data Product Catalog
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold ml-auto"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}
            >
              {filteredCatalog.length} of {CATALOG.length}
            </span>
          </div>
          <p className={`text-[10px] mb-3 leading-relaxed ${isDark ? "text-white/35" : "text-slate-500"}`}>
            Browse existing data products. Click any card to view freshness and API details.
          </p>

          {/* Search */}
          <div className="relative mb-2.5">
            <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? "text-white/30" : "text-slate-400"}`} />
            <input
              type="text"
              placeholder="Search catalog..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className={`w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg outline-none transition-colors ${
                isDark
                  ? "bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500/40"
                  : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400/60"
              }`}
            />
          </div>

          {/* Filters */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`text-[9px] uppercase tracking-wider mr-1 ${isDark ? "text-white/25" : "text-slate-400"}`}>Domain</span>
              {DOMAINS.map((d) => (
                <button key={d} onClick={() => setDomainFilter(d)} className={filterBtnClass(domainFilter === d)}>{d}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`text-[9px] uppercase tracking-wider mr-1 ${isDark ? "text-white/25" : "text-slate-400"}`}>Status</span>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={filterBtnClass(statusFilter === s)}>{s}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`text-[9px] uppercase tracking-wider mr-1 ${isDark ? "text-white/25" : "text-slate-400"}`}>Tier</span>
              {TIERS.map((t) => (
                <button key={t} onClick={() => setTierFilter(t)} className={filterBtnClass(tierFilter === t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div
          className="grid grid-cols-3 flex-shrink-0 border-b"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}
        >
          {[
            { icon: CheckCircle2, color: "#4ade80", value: CATALOG.filter(p => p.status === "Published").length, label: "Published" },
            { icon: BarChart3,    color: "#60a5fa", value: Math.round(CATALOG.reduce((a, p) => a + p.quality, 0) / CATALOG.length), label: "Avg Quality" },
            { icon: Eye,          color: "#818cf8", value: CATALOG.reduce((a, p) => a + p.consumers, 0), label: "Consumers" },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="px-3 py-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Icon className="w-3 h-3" style={{ color }} />
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
              </div>
              <div className={`text-[9px] ${isDark ? "text-white/30" : "text-slate-400"}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Catalog list — scrollable */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Database className={`w-8 h-8 ${isDark ? "text-white/15" : "text-slate-300"}`} />
              <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>No products match your filters</p>
            </div>
          ) : (
            filteredCatalog.map((product) => (
              <CatalogCard
                key={product.id}
                product={product}
                isDark={isDark}
                highlighted={product.id === highlightId}
                cardRef={product.id === highlightId ? highlightRef : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
