"use client";

import { useState } from "react";
import {
  ArrowLeft, MapPin, Users, DollarSign, ChevronRight,
  Car, TrendingUp, AlertTriangle, Briefcase, Clock,
  RefreshCw, Target, Sparkles, X, CheckCircle, Phone,
  Mail, MessageSquare, Crown, Activity
} from "lucide-react";
import { type Mission, type RetailerData, type CustomerProfile, type Region, launchDate, closeDate } from "@/lib/dashboard-data";
import { useTheme } from "@/components/dashboard/ThemeProvider";
import { cn } from "@/lib/utils";

interface RetailerDrillDownProps {
  mission: Mission;
  region: Region;
  simMultipliers: { revenue: number; customers: number; conversion: number } | null;
  onBack: () => void;
}

const tierColors = {
  "Tier 1": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  "Tier 2": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  "Tier 3": { color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" },
};

export function RetailerDrillDown({ mission, region, simMultipliers, onBack }: RetailerDrillDownProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [scriptGenerated, setScriptGenerated] = useState<string | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);

  const filteredRetailers = mission.retailers.filter(
    (r) => region === "Global" || r.region === region
  );

  // Canonical revenue: use the mission-level value (same source as Mission Command Center).
  // Apply sim multiplier when a simulation is active so values stay in sync.
  const canonicalRevenue = (() => {
    const raw = mission.projectedRevenue[region];
    if (!simMultipliers || raw === "N/A") return raw;
    const prefix = raw.startsWith("£") ? "£" : "$";
    const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return raw;
    return `${prefix}${(num * simMultipliers.revenue).toFixed(2)}M`;
  })();

  // Canonical conversion rate: apply sim multiplier when active.
  const canonicalConversion = (() => {
    const raw = mission.conversionRate[region];
    if (!simMultipliers || raw === "N/A") return raw;
    const num = parseFloat(raw.replace("%", ""));
    if (isNaN(num)) return raw;
    return `${Math.min(99, num * simMultipliers.conversion).toFixed(0)}%`;
  })();

  // Per-retailer revenue helper: scale each retailer's revenue proportionally
  // so individual rows are consistent with the mission-level total.
  const retailerRevenue = (r: RetailerData): string => {
    const raw = r.projectedRevenue;
    if (!simMultipliers || raw === "N/A") return raw;
    const prefix = raw.startsWith("£") ? "£" : "$";
    const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return raw;
    return `${prefix}${(num * simMultipliers.revenue).toFixed(2)}M`;
  };

  // Retailer customer count: use the canonical targetCustomers field (which holds the
  // true population, not the representative profile-card count). Scale with sim multiplier.
  const retailerCustomerCount = (r: RetailerData): string => {
    const base = r.targetCustomers;
    if (!simMultipliers) return base.toString();
    return Math.round(base * simMultipliers.customers).toLocaleString();
  };

  // Total customers across all filtered retailers — use mission-level canonical value
  // so it matches the Mission Command Center exactly. Apply sim multiplier when active.
  const totalFilteredCustomers = (() => {
    const raw = mission.targetCustomers[region] ?? 0;
    return simMultipliers ? Math.round(raw * simMultipliers.customers) : raw;
  })();

  const textPrimary = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.50)";
  const textMuted = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const backBtnBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)";

  const handleGenerateScript = (customer: CustomerProfile) => {
    setGeneratingScript(true);
    setTimeout(() => {
      setScriptGenerated(
        `BESPOKE CONCIERGE SCRIPT — ${customer.name} — ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}\n\n` +
        `OPENING:\n"Good [morning/afternoon], ${customer.name}. This is [RM Name] from ${selectedRetailer?.name}, calling on behalf of your dedicated JLR Private Client team. I'm reaching out because we've identified a very specific opportunity that I believe is exceptionally well-timed for you."\n\n` +
        `PERSONALISATION HOOK:\nReference: ${customer.currentVehicle} (${customer.currentVariant}) — equity position: ${customer.buybackEquity}\n\n` +
        `VALUE PROPOSITION:\n"Your current ${customer.currentVehicle} is performing exceptionally in today's market — our specialists have identified a ${customer.buybackEquity} equity advantage that, combined with our current Range Rover Electric priority allocation programme, creates a genuinely compelling financial case that may not be available beyond next quarter."\n\n` +
        `MISSION CONTEXT:\n${mission.title}\n"${mission.tagline}"\n\n` +
        `RECOMMENDED NEXT STEP:\n${customer.recommendedAction}\n\n` +
        `CONTACT PREFERENCE:\nBest window: ${customer.contactWindow}\nPreferred channel: ${customer.preferredChannel}\n\n` +
        `OBJECTION HANDLING:\n• If 'not the right time': "I completely understand. The equity position I mentioned is time-limited — our programme closes ${closeDate(mission.therefore.timelineDaysFromNow.close)}. Would it help if I arranged a no-obligation private viewing at a time that suits?"\n• If 'happy with current vehicle': "That speaks to your excellent choice. This programme is specifically designed for our most valued clients who are already satisfied — it's about maximising the financial advantage your current vehicle has built."\n\nCLOSING:\n"Given your tenure of ${customer.tenure} with JLR, you'll have first access. I'll follow this up with a personalised proposal document — what email address should I use?"\n\n— Generated by Meridian Intelligence Engine v3.4`
      );
      setGeneratingScript(false);
    }, 1800);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{ color: textSecondary, border: backBtnBorder }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Mission Command
        </button>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: textMuted }} />
        <span className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>{mission.title}</span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: textMuted }} />
        <span className="text-sm" style={{ color: textMuted }}>Retailer Intelligence</span>
      </div>

      {/* Mission Summary Strip */}
      <div className="flex items-center gap-4 p-4 rounded-2xl flex-wrap"
        style={{ background: `rgba(${hexToRgb(mission.color)}, 0.07)`, border: `1px solid rgba(${hexToRgb(mission.color)}, 0.22)` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)` }}>
          <Target className="w-4 h-4" style={{ color: mission.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm font-heading truncate" style={{ color: textPrimary }}>{mission.title}</div>
          <div className="text-xs italic" style={{ color: textSecondary }}>"{mission.tagline}"</div>
        </div>
        <div className="flex gap-4 flex-shrink-0 flex-wrap">
          {[
            { label: "Revenue", value: canonicalRevenue },
            { label: "Customers", value: totalFilteredCustomers.toLocaleString() },
            { label: "Conv.", value: filteredRetailers.length > 0 ? canonicalConversion : "—" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-bold text-sm font-heading" style={{ color: textPrimary }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Retailers Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <h3 className="font-semibold text-sm font-heading" style={{ color: textPrimary }}>
              {filteredRetailers.length} Retailers Mapped · {region}
            </h3>
          </div>
          <span className="text-xs" style={{ color: textMuted }}>Ranked by mission fit score</span>
        </div>

        <div className="space-y-3">
          {filteredRetailers.map((retailer) => {
            const tc = tierColors[retailer.tier];
            const isExpanded = selectedRetailer?.id === retailer.id;

            return (
              <div key={retailer.id} className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: isExpanded
                    ? isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)"
                    : surfaceBg,
                  border: isExpanded
                    ? "1px solid rgba(59,130,246,0.3)"
                    : surfaceBorder,
                  boxShadow: isExpanded ? "none" : isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
                }}>

                {/* Retailer Row */}
                <button
                  className="w-full flex items-center gap-4 p-4 transition-all text-left"
                  onClick={() => setSelectedRetailer(isExpanded ? null : retailer)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                    <span className="text-sm font-bold" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
                      {retailer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: textPrimary }}>{retailer.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                        {retailer.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" style={{ color: textMuted }} />
                      <span className="text-xs" style={{ color: textSecondary }}>{retailer.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 flex-shrink-0 flex-wrap justify-end">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] mb-0.5" style={{ color: textSecondary }}>Mission Fit</div>
                      <div className="flex items-center gap-1">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden"
                          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                          <div className="h-full rounded-full" style={{ width: `${retailer.missionFit}%`, background: "#3b82f6" }} />
                        </div>
                        <span className="text-blue-500 text-xs font-bold">{retailer.missionFit}%</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] mb-0.5" style={{ color: textSecondary }}>Target Customers</div>
                      <div className="font-bold text-sm" style={{ color: textPrimary }}>{retailerCustomerCount(retailer)}</div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="text-[10px] mb-0.5" style={{ color: textSecondary }}>Proj. Revenue</div>
                      <div className="text-green-600 font-bold text-sm">{retailerRevenue(retailer)}</div>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )} style={{ color: textMuted }} />
                  </div>
                </button>

                {/* Expanded Customers */}
                {isExpanded && (
                  <ExpandedCustomerList
                    retailer={retailer}
                    mission={mission}
                    isDark={isDark}
                    simMultipliers={simMultipliers}
                    dividerColor={dividerColor}
                    textSecondary={textSecondary}
                    textMuted={textMuted}
                    onSelectCustomer={(customer) => {
                      setSelectedRetailer(retailer);
                      setSelectedCustomer(customer);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && selectedRetailer && (
        <CustomerModal
          customer={selectedCustomer}
          retailer={selectedRetailer}
          mission={mission}
          isDark={isDark}
          scriptGenerated={scriptGenerated}
          generatingScript={generatingScript}
          onGenerateScript={() => handleGenerateScript(selectedCustomer)}
          onClose={() => { setSelectedCustomer(null); setScriptGenerated(null); }}
        />
      )}
    </div>
  );
}

// ─── Expanded Customer List with View All ────────────────────────────────────

function ExpandedCustomerList({
  retailer,
  mission,
  isDark,
  simMultipliers,
  dividerColor,
  textSecondary,
  textMuted,
  onSelectCustomer,
}: {
  retailer: RetailerData;
  mission: Mission;
  isDark: boolean;
  simMultipliers: { revenue: number; customers: number; conversion: number } | null;
  dividerColor: string;
  textSecondary: string;
  textMuted: string;
  onSelectCustomer: (customer: CustomerProfile) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  
  // Use r.targetCustomers (canonical population) rather than customers.length
  // (which only holds representative profile cards). Apply sim multiplier when active.
  const totalCustomerCount = simMultipliers 
    ? Math.round(retailer.targetCustomers * simMultipliers.customers)
    : retailer.targetCustomers;
  
  // Show max 5 profile cards initially; the canonical count drives the "View All" label
  const displayLimit = 5;
  const customersToShow = showAll ? retailer.customers : retailer.customers.slice(0, displayLimit);
  const hasMore = totalCustomerCount > displayLimit;
  const remainingCount = totalCustomerCount - customersToShow.length;

  return (
    <div className="p-4" style={{ borderTop: `1px solid ${dividerColor}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" style={{ color: textSecondary }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: textSecondary }}>
            {totalCustomerCount.toLocaleString()} Perfect-Fit Customers
          </span>
        </div>
        {hasMore && !showAll && (
          <span className="text-[10px]" style={{ color: textMuted }}>
            Showing {customersToShow.length} of {totalCustomerCount.toLocaleString()}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {customersToShow.map((customer) => (
          <CustomerRow
            key={customer.id}
            customer={customer}
            missionColor={mission.color}
            isDark={isDark}
            onClick={() => onSelectCustomer(customer)}
          />
        ))}
      </div>
      
      {/* View All CTA */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)",
            border: isDark ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(59,130,246,0.2)",
            color: "#3b82f6",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)";
          }}
        >
          <Users className="w-3.5 h-3.5" />
          View All {remainingCount > 0 ? `(${remainingCount.toLocaleString()} more)` : "Customers"}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
      
      {/* Show less button when expanded */}
      {showAll && retailer.customers.length > displayLimit && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-3 py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          style={{
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            color: textSecondary,
          }}
        >
          Show Less
        </button>
      )}
    </div>
  );
}

// ─── Customer Row ─────────────────────────────────────────────────────────────

function CustomerRow({ customer, missionColor, isDark, onClick }: {
  customer: CustomerProfile;
  missionColor: string;
  isDark: boolean;
  onClick: () => void;
}) {
  const textPrimary = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)";
  const textMuted = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)";
  const rowBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const rowBorder = isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
      style={{ background: rowBg, border: rowBorder }}
      onMouseEnter={e => { e.currentTarget.style.background = rowHoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
        style={{ background: `rgba(${hexToRgb(missionColor)}, 0.2)`, color: missionColor }}>
        {customer.name.split(" ").map((n) => n[0]).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: textPrimary }}>{customer.name}</div>
        <div className="text-[10px]" style={{ color: textSecondary }}>{customer.currentVehicle} · {customer.location}</div>
      </div>
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0 flex-wrap justify-end">
        <div className="text-right">
          <div className="text-[9px]" style={{ color: textMuted }}>Equity</div>
          <div className="text-green-600 text-xs font-bold">{customer.buybackEquity}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px]" style={{ color: textMuted }}>Renewal</div>
          <div className="text-xs font-bold" style={{ color: textPrimary }}>{customer.renewalScore}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px]" style={{ color: textMuted }}>Lead</div>
          <div className="text-blue-500 text-xs font-bold">{customer.leadScore}</div>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 transition-colors" style={{ color: textMuted }} />
    </button>
  );
}

// ─── Customer Modal ───────────────────────────────────────────────────────────

interface CustomerModalProps {
  customer: CustomerProfile;
  retailer: RetailerData;
  mission: Mission;
  isDark: boolean;
  scriptGenerated: string | null;
  generatingScript: boolean;
  onGenerateScript: () => void;
  onClose: () => void;
}

function CustomerModal({ customer, retailer, mission, isDark, scriptGenerated, generatingScript, onGenerateScript, onClose }: CustomerModalProps) {
  const [scriptView, setScriptView] = useState(false);

  const panelBg = isDark ? "rgba(8, 11, 20, 0.99)" : "rgba(248, 250, 253, 0.99)";
  const panelBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.50)";
  const textMuted = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)";
  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const surfaceBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";

  const scores = [
    { label: "Lead Score", value: customer.leadScore, max: 1, color: "#3b82f6" },
    { label: "Renewal Score", value: customer.renewalScore, max: 1, color: "#10b981" },
    { label: "Upsell Score", value: customer.upsellScore, max: 1, color: "#8b5cf6" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: panelBg, border: panelBorder }}>

        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base"
              style={{ background: `rgba(${hexToRgb(mission.color)}, 0.2)`, color: mission.color }}>
              {customer.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base" style={{ color: textPrimary }}>{customer.name}</h2>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <Crown className="w-2.5 h-2.5 text-yellow-500" />
                  <span className="text-yellow-600 text-[9px] font-bold">PERFECT FIT</span>
                </div>
              </div>
              <div className="text-xs mt-0.5" style={{ color: textSecondary }}>{customer.career} · {customer.location}</div>
              <div className="text-[10px]" style={{ color: textMuted }}>{retailer.name}</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            style={{ color: textSecondary }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-5">
          {!scriptView ? (
            <>
              {/* Vehicle + Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl space-y-2" style={{ background: surfaceBg, border: surfaceBorder }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: textSecondary }}>Current Vehicle</span>
                  </div>
                  <div className="font-semibold text-sm" style={{ color: textPrimary }}>{customer.currentVehicle}</div>
                  <div className="text-xs" style={{ color: textSecondary }}>{customer.currentVariant}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 text-xs font-bold">{customer.buybackEquity} equity</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: surfaceBg, border: surfaceBorder }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: textSecondary }}>AI Scores</span>
                  </div>
                  <div className="space-y-2.5">
                    {scores.map((score) => (
                      <div key={score.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px]" style={{ color: textSecondary }}>{score.label}</span>
                          <span className="text-xs font-bold" style={{ color: score.color }}>{score.value}</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${score.value * 100}%`, background: score.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Tenure", value: customer.tenure, icon: Clock },
                  { label: "Lifetime Value", value: customer.lifetimeValue, icon: DollarSign },
                  { label: "Churn Risk", value: customer.cancellationRisk, icon: AlertTriangle },
                  { label: "Career", value: customer.career.split(" ").slice(0, 2).join(" "), icon: Briefcase },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: surfaceBg, border: surfaceBorder }}>
                    <item.icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color: textMuted }} />
                    <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>{item.label}</div>
                    <div className="text-xs font-semibold leading-tight" style={{ color: textPrimary }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Mission Fit Reason */}
              <div className="p-4 rounded-xl"
                style={{ background: `rgba(${hexToRgb(mission.color)}, 0.07)`, border: `1px solid rgba(${hexToRgb(mission.color)}, 0.22)` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5" style={{ color: mission.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: mission.color }}>Why Perfect Fit</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
                  {customer.missionFitReason}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.22)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Recommended Action</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>
                  {customer.recommendedAction}
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: textSecondary }}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{customer.contactWindow}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{customer.preferredChannel}</span>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Phone, label: "Call", color: "#10b981" },
                  { icon: Mail, label: "Email", color: "#3b82f6" },
                  { icon: MessageSquare, label: "Message", color: "#8b5cf6" },
                ].map((action) => (
                  <button key={action.label}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{ background: `rgba(${hexToRgb(action.color)}, 0.12)`, border: `1px solid rgba(${hexToRgb(action.color)}, 0.3)`, color: action.color }}>
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Script View */
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600 text-sm font-semibold">Bespoke Concierge Script Generated</span>
              </div>
              <div className="p-4 rounded-xl overflow-y-auto max-h-80 scrollbar-thin"
                style={{ background: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.04)", border: surfaceBorder }}>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono"
                  style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                  {scriptGenerated}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 flex gap-3" style={{ borderTop: `1px solid ${dividerColor}` }}>
          {!scriptView ? (
            <>
              <button
                onClick={onGenerateScript}
                disabled={generatingScript}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.01]"
                style={{
                  background: generatingScript ? "rgba(59,130,246,0.2)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  boxShadow: generatingScript ? "none" : "0 0 20px rgba(59,130,246,0.3)",
                }}
              >
                {generatingScript ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" />Generating Script...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Generate Bespoke Concierge Script</>
                )}
              </button>
              {scriptGenerated && !generatingScript && (
                <button
                  onClick={() => setScriptView(true)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-green-600 transition-all"
                  style={{ border: "1px solid rgba(16,185,129,0.35)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  View Script
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => setScriptView(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ border: surfaceBorder, color: textSecondary }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Back to Profile
            </button>
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
