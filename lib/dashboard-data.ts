// Amcor Global Analytics Dashboard — Contextual Data Layer
// Enriched with illustrative B2B packaging commercial intelligence

export type Region = "Global" | "North America" | "Europe" | "Asia Pacific" | "Latin America";
export type Timeframe = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026" | "FY 2026";

// ─── Dynamic date helpers ─────────────────────────────────────────────────────

// `now` must be passed in explicitly (rather than read internally via Date.now())
// so callers can pin it to a single client-computed timestamp. This avoids
// SSR/client hydration mismatches, since the server and client would otherwise
// render this text at two different real-world instants.
export function formatUtcDate(offsetHours = 0, now: number = Date.now()): string {
  const d = new Date(now + offsetHours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function formatUtcDatePlus(days: number, hour: number, now: number = Date.now()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:00 UTC`;
}

export function launchDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function closeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export type Lifecycle = "Acquire" | "Expand" | "Retain" | "Fulfill";

export interface ModelSignal {
  name: string;
  strength: number; // 0–100
}

export interface ModelRecommendation {
  title: string;
  priority: "Immediate" | "Short-term" | "Strategic";
  actions: string[];
}

export interface ModelCardData {
  id: string;
  title: string;
  shortTitle: string;
  lifecycle: Lifecycle;
  metric: string;
  metricValue: Record<Region, string>;
  metricDelta: Record<Region, string>;
  metricTrend: Record<Region, "up" | "down" | "neutral">;
  insightSummary: Record<Region, string>;
  dataSources: string[];
  lastRunOffsetHours: number; // hours before now
  modelVersion: string;
  accuracy: number;
  signals: ModelSignal[];
  color: string;
  icon: string;
  regionalDistribution: Record<Region, { label: string; value: number; color: string }[]>;
  pedigree: {
    inputFeatures: string[];
    outputType: string;
    trainingDataSize: string;
    refreshCadence: string;
    nextRunOffsetHours: number; // hours from now
    slaCompliance: string;
    modelType: string;
  };
  recommendations: Record<Region, ModelRecommendation[]>;
}

export const modelCards: ModelCardData[] = [
  {
    id: "intelligent-lead",
    title: "Account Intent",
    shortTitle: "Account Intent",
    lifecycle: "Acquire",
    metric: "High-Intent Prospect Accounts",
    metricValue: { Global: "3,240", "North America": "1,300", Europe: "970", "Asia Pacific": "650", "Latin America": "320" },
    metricDelta: { Global: "+12.6%", "North America": "+16.4%", Europe: "+9.1%", "Asia Pacific": "+14.8%", "Latin America": "+7.2%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "3,240 high-intent prospect accounts detected globally; RFP-portal activity, sustainability spec-sheet downloads, and sample-request volume driving the strongest identification uplift in three years.",
      "North America": "1,300 NA prospect accounts flagged; beverage and healthcare/pharma verticals lead intent volume, with sample-request activity concentrated in the Midwest co-packer corridor.",
      Europe: "970 EU prospect accounts identified; DACH beauty & personal care converters showing the sharpest rise in sustainability spec-sheet downloads ahead of EU PPWR compliance deadlines.",
      "Asia Pacific": "650 APAC prospect accounts surfaced; Southeast Asian food & beverage co-packers driving RFP-portal engagement as regional recycled-content mandates tighten.",
      "Latin America": "320 LATAM prospect accounts detected; Brazilian and Mexican home & personal care manufacturers showing rising interest in flexible laminate conversions from rigid formats.",
    },
    dataSources: ["Salesforce", "SAP", "LinkedIn Sales Navigator", "Marketing Automation Platform", "B2B Customer Portal"],
    lastRunOffsetHours: -2,
    modelVersion: "v4.2.1",
    accuracy: 88,
    signals: [
      { name: "RFP-portal activity", strength: 91 },
      { name: "Sustainability spec-sheet downloads", strength: 88 },
      { name: "Sample-request volume", strength: 85 },
      { name: "Firmographic fit score", strength: 79 },
      { name: "LinkedIn buying-committee signals", strength: 74 },
    ],
    color: "#3b82f6",
    icon: "Users",
    regionalDistribution: {
      Global: [
        { label: "Food & Beverage", value: 36, color: "#3b82f6" },
        { label: "Healthcare/Pharma", value: 26, color: "#60a5fa" },
        { label: "Beauty & Personal Care", value: 21, color: "#93c5fd" },
        { label: "Home & Pet Care", value: 17, color: "#bfdbfe" },
      ],
      "North America": [
        { label: "Food & Beverage", value: 41, color: "#3b82f6" },
        { label: "Healthcare/Pharma", value: 29, color: "#60a5fa" },
        { label: "Beauty & Personal Care", value: 18, color: "#93c5fd" },
        { label: "Home & Pet Care", value: 12, color: "#bfdbfe" },
      ],
      Europe: [
        { label: "Beauty & Personal Care", value: 34, color: "#3b82f6" },
        { label: "Food & Beverage", value: 30, color: "#60a5fa" },
        { label: "Healthcare/Pharma", value: 24, color: "#93c5fd" },
        { label: "Home & Pet Care", value: 12, color: "#bfdbfe" },
      ],
      "Asia Pacific": [
        { label: "Food & Beverage", value: 44, color: "#3b82f6" },
        { label: "Healthcare/Pharma", value: 22, color: "#60a5fa" },
        { label: "Home & Pet Care", value: 19, color: "#93c5fd" },
        { label: "Beauty & Personal Care", value: 15, color: "#bfdbfe" },
      ],
      "Latin America": [
        { label: "Home & Pet Care", value: 38, color: "#3b82f6" },
        { label: "Food & Beverage", value: 33, color: "#60a5fa" },
        { label: "Beauty & Personal Care", value: 17, color: "#93c5fd" },
        { label: "Healthcare/Pharma", value: 12, color: "#bfdbfe" },
      ],
    },
    pedigree: {
      inputFeatures: ["RFP-portal session depth", "Sustainability spec-sheet downloads", "Sample-request frequency", "Firmographic fit index", "LinkedIn buying-committee activity"],
      outputType: "Account Intent Score (0–1) + Vertical Affinity Rank",
      trainingDataSize: "3.6M account-level interactions (120 months · 10 years)",
      refreshCadence: "Daily at 06:00 UTC",
      nextRunOffsetHours: 22,
      slaCompliance: "99.8%",
      modelType: "Gradient Boosted Trees (XGBoost) + Firmographic Collaborative Filtering",
    },
    recommendations: {
      Global: [
        {
          title: "Activate High-Intent Account Sequencing",
          priority: "Immediate",
          actions: [
            "Route the top 480 highest-scoring prospect accounts to regional account teams within 48 hours, prioritising RFP-portal and spec-sheet download activity.",
            "Suppress accounts with intent score <0.55 from paid digital spend to reduce cost-per-qualified-account by an estimated 19%.",
            "Brief account directors on the top 25 prospects per region via a daily Salesforce digest with linked activity history.",
          ],
        },
        {
          title: "Enrich Signal Capture Across Digital Touchpoints",
          priority: "Short-term",
          actions: [
            "Integrate B2B customer portal spec-configurator session depth into the model's feature pipeline to improve affinity scoring for custom barrier and format requests.",
            "Instrument sustainability spec-sheet and EcoVadis-linked content downloads as first-class conversion events to enrich upper-funnel account profiles.",
          ],
        },
        {
          title: "Expand Coverage to Mid-Market Converters",
          priority: "Strategic",
          actions: [
            "Extend the intent model to the mid-market converter and co-packer segment — an estimated 2,600 additional accounts globally with recurring volume potential.",
          ],
        },
      ],
      "North America": [
        {
          title: "Beverage & Pharma Prospect Push",
          priority: "Immediate",
          actions: [
            "Activate targeted outbound against 510 beverage and healthcare/pharma prospect accounts in the Midwest co-packer corridor showing intent score ≥0.78.",
            "Equip account teams with a side-by-side format comparison (rigid vs. flexible) leave-behind for first-contact meetings.",
          ],
        },
        {
          title: "Account-Level Prioritisation Playbook",
          priority: "Short-term",
          actions: [
            "Distribute weekly ranked account lists to the top 12 NA account teams with tiered contact scripts (Tier 1: ≥0.85, Tier 2: 0.70–0.84).",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH Sustainability-Led Conquest",
          priority: "Immediate",
          actions: [
            "Launch a localised AmPrima® / AmFiber® digital campaign in Germany, Austria, and Switzerland targeting 340 beauty & personal care converters flagged with ≥0.72 sustainability-content engagement.",
            "Coordinate with the DACH account team to offer a plant-visit and co-design session — proven to lift qualified-meeting rate for this segment.",
          ],
        },
        {
          title: "PPWR-Driven Nurture Track",
          priority: "Short-term",
          actions: [
            "Build a dedicated nurture track for 410 European prospects showing early EU PPWR compliance research signals — include recycled-content roadmap and regulatory timeline content.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Southeast Asia Co-Packer Sprint",
          priority: "Immediate",
          actions: [
            "Activate a targeted campaign against 260 Southeast Asian food & beverage co-packers with RFP-portal activity in the last 30 days, focused on recycled-content mandate readiness.",
          ],
        },
        {
          title: "Regional Distributor Enablement",
          priority: "Short-term",
          actions: [
            "Equip regional distributor partners with a qualification checklist to pre-screen inbound RFPs before escalation to the account team, reducing time-to-first-response.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Rigid-to-Flexible Conversion Campaign",
          priority: "Immediate",
          actions: [
            "Target 120 Brazilian and Mexican home & personal care manufacturers showing conversion interest from rigid to flexible formats with a cost-and-carbon comparison leave-behind.",
          ],
        },
        {
          title: "LATAM Pipeline Build-Out",
          priority: "Strategic",
          actions: [
            "Current LATAM coverage is concentrated in Brazil and Mexico — invest in account-team capacity in Colombia and Chile to develop an underserved 90-account pipeline identified by the model.",
          ],
        },
      ],
    },
  },
  {
    id: "lead-scoring",
    title: "Opportunity Qualification",
    shortTitle: "Opportunity Qual.",
    lifecycle: "Acquire",
    metric: "Qualified Opportunities Routed",
    metricValue: { Global: "860", "North America": "345", Europe: "260", "Asia Pacific": "170", "Latin America": "85" },
    metricDelta: { Global: "+9.4%", "North America": "+13.1%", Europe: "+6.2%", "Asia Pacific": "+11.5%", "Latin America": "+5.8%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "860 qualified opportunities routed to regional account teams globally; first-contact within 48 hrs correlates to 31% higher win rate vs. baseline.",
      "North America": "345 NA opportunities routed; healthcare/pharma accounts show the fastest quote-to-close cycle when contacted within the 48-hour window.",
      Europe: "260 EU opportunities routed; DACH and Nordics account for 58% of Tier 1 (≥0.90) opportunities this quarter.",
      "Asia Pacific": "170 APAC opportunities routed; Singapore and Vietnam hubs driving disproportionate share of high-priority food & beverage opportunities.",
      "Latin America": "85 LATAM opportunities routed; Brazilian personal care accounts show the highest finance pre-approval rate in the region.",
    },
    dataSources: ["SAP", "Salesforce", "LinkedIn Sales Navigator", "Contract Lifecycle Mgmt"],
    lastRunOffsetHours: -1,
    modelVersion: "v3.8.4",
    accuracy: 91,
    signals: [
      { name: "Enquiry recency & frequency", strength: 94 },
      { name: "RFP-portal engagement depth", strength: 92 },
      { name: "Sample-to-quote conversion history", strength: 89 },
      { name: "Credit pre-approval status", strength: 87 },
      { name: "Buying-committee breadth", strength: 82 },
    ],
    color: "#6366f1",
    icon: "TrendingUp",
    regionalDistribution: {
      Global: [
        { label: "Score 0.90–1.0", value: 31, color: "#6366f1" },
        { label: "Score 0.85–0.89", value: 44, color: "#818cf8" },
        { label: "Score 0.75–0.84", value: 25, color: "#a5b4fc" },
      ],
      "North America": [
        { label: "Score 0.90–1.0", value: 38, color: "#6366f1" },
        { label: "Score 0.85–0.89", value: 40, color: "#818cf8" },
        { label: "Score 0.75–0.84", value: 22, color: "#a5b4fc" },
      ],
      Europe: [
        { label: "Score 0.90–1.0", value: 28, color: "#6366f1" },
        { label: "Score 0.85–0.89", value: 46, color: "#818cf8" },
        { label: "Score 0.75–0.84", value: 26, color: "#a5b4fc" },
      ],
      "Asia Pacific": [
        { label: "Score 0.90–1.0", value: 33, color: "#6366f1" },
        { label: "Score 0.85–0.89", value: 42, color: "#818cf8" },
        { label: "Score 0.75–0.84", value: 25, color: "#a5b4fc" },
      ],
      "Latin America": [
        { label: "Score 0.90–1.0", value: 24, color: "#6366f1" },
        { label: "Score 0.85–0.89", value: 45, color: "#818cf8" },
        { label: "Score 0.75–0.84", value: 31, color: "#a5b4fc" },
      ],
    },
    pedigree: {
      inputFeatures: ["Enquiry recency & frequency", "RFP-portal engagement depth", "Sample-to-quote history", "Credit pre-approval status", "Buying-committee breadth"],
      outputType: "Priority Score (0–1) + Urgency Flag",
      trainingDataSize: "1.4M qualified opportunities (120 months · 10 years)",
      refreshCadence: "Every 6 hours",
      nextRunOffsetHours: 4,
      slaCompliance: "99.5%",
      modelType: "Random Forest Ensemble + Logistic Regression blend",
    },
    recommendations: {
      Global: [
        {
          title: "48-Hour Contact Protocol for Tier 1 Opportunities",
          priority: "Immediate",
          actions: [
            "Enforce a 48-hour account-team contact SLA for all 266 opportunities scored ≥0.90 globally — data shows win rate drops 31% after 72 hours with no contact.",
            "Trigger an automated notification to the assigned account manager the moment an opportunity enters Tier 1 (≥0.90).",
            "Flag Tier 1 opportunities in Salesforce with a priority indicator, removing them from general pipeline rotation.",
          ],
        },
        {
          title: "Score Decay Monitoring",
          priority: "Short-term",
          actions: [
            "Implement weekly score-decay alerts for opportunities that have dropped from ≥0.85 to <0.70 without a recorded contact attempt.",
          ],
        },
        {
          title: "Predictive Score Integration into SAP",
          priority: "Strategic",
          actions: [
            "Surface the priority score directly inside SAP order-entry screens so account managers see it alongside quote details.",
          ],
        },
      ],
      "North America": [
        {
          title: "Healthcare/Pharma Fast-Track Programme",
          priority: "Immediate",
          actions: [
            "Healthcare/pharma accounts account for 34% of NA Tier 1 opportunities — assign dedicated regulatory-aware account specialists for white-glove outreach.",
          ],
        },
        {
          title: "Credit Pre-Approval Fast Path",
          priority: "Short-term",
          actions: [
            "36% of NA Tier 1 opportunities carry a credit pre-approval signal — fast-track these to a same-day quote, compressing the sales cycle by an estimated 6 days.",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH & Nordics Priority Engagement",
          priority: "Immediate",
          actions: [
            "260 European Tier 1 opportunities are concentrated in DACH and the Nordics — brief local account teams on sustainability-led outreach given elevated recycled-content interest.",
          ],
        },
        {
          title: "Sustainability Spec Routing",
          priority: "Short-term",
          actions: [
            "Route opportunities with sustainability-spec engagement to EcoVadis-certified account consultants to ensure accurate recycled-content and compliance guidance.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Singapore & Vietnam Priority Cluster",
          priority: "Immediate",
          actions: [
            "Assign senior account managers to the top 40 scored opportunities in Singapore and Vietnam within two weeks, given elevated food & beverage demand.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Brazil Personal Care Fast Path",
          priority: "Immediate",
          actions: [
            "Fast-track Brazilian personal care opportunities carrying a credit pre-approval signal to a same-day quote proposal.",
          ],
        },
        {
          title: "Regional Score Model Localisation",
          priority: "Strategic",
          actions: [
            "Retrain the LATAM scoring model with local distributor sell-through data to improve accuracy from 91% toward a projected 93%.",
          ],
        },
      ],
    },
  },
  {
    id: "cancellation",
    title: "Order & Churn Risk",
    shortTitle: "Order & Churn Risk",
    lifecycle: "Retain",
    metric: "Accounts at Risk",
    metricValue: { Global: "340", "North America": "140", Europe: "100", "Asia Pacific": "65", "Latin America": "35" },
    metricDelta: { Global: "-18.4%", "North America": "-21.6%", Europe: "-15.1%", "Asia Pacific": "-12.4%", "Latin America": "-9.8%" },
    metricTrend: { Global: "down", "North America": "down", Europe: "down", "Asia Pacific": "down", "Latin America": "down" },
    insightSummary: {
      Global: "340 accounts at risk globally; proactive account-save programme (QBR outreach + order review) has reduced churn 18.4% vs. prior quarter through targeted commercial intervention.",
      "North America": "140 NA accounts at risk; 61% linked to on-time-in-full shortfalls on high-volume beverage contracts — account-save intervention showing a 42% save rate.",
      Europe: "100 EU accounts at risk; input-cost pass-through disputes and quality complaints are the primary drivers, concentrated in personal care converters.",
      "Asia Pacific": "65 APAC accounts at risk; capacity constraints at regional plants are the leading churn driver, with lead-time variance flagged in 48% of cases.",
      "Latin America": "35 LATAM accounts at risk; currency volatility and price renegotiation requests are the dominant risk signal this quarter.",
    },
    dataSources: ["SAP", "Salesforce", "B2B Customer Portal", "Qualtrics"],
    lastRunOffsetHours: -4,
    modelVersion: "v2.9.2",
    accuracy: 85,
    signals: [
      { name: "On-time-in-full delivery variance", strength: 88 },
      { name: "NPS / CSAT sentiment score", strength: 85 },
      { name: "Competitor RFP activity signals", strength: 78 },
      { name: "Quality complaint frequency", strength: 73 },
      { name: "Inbound contact frequency", strength: 66 },
    ],
    color: "#f59e0b",
    icon: "AlertTriangle",
    regionalDistribution: {
      Global: [
        { label: "Delivery Shortfall", value: 41, color: "#f59e0b" },
        { label: "Price Sensitivity", value: 27, color: "#fbbf24" },
        { label: "Competitor RFP", value: 20, color: "#fcd34d" },
        { label: "Quality Complaint", value: 12, color: "#fde68a" },
      ],
      "North America": [
        { label: "Delivery Shortfall", value: 50, color: "#f59e0b" },
        { label: "Competitor RFP", value: 24, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 17, color: "#fcd34d" },
        { label: "Quality Complaint", value: 9, color: "#fde68a" },
      ],
      Europe: [
        { label: "Price Sensitivity", value: 37, color: "#f59e0b" },
        { label: "Quality Complaint", value: 30, color: "#fbbf24" },
        { label: "Delivery Shortfall", value: 22, color: "#fcd34d" },
        { label: "Competitor RFP", value: 11, color: "#fde68a" },
      ],
      "Asia Pacific": [
        { label: "Delivery Shortfall", value: 48, color: "#f59e0b" },
        { label: "Competitor RFP", value: 26, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 16, color: "#fcd34d" },
        { label: "Quality Complaint", value: 10, color: "#fde68a" },
      ],
      "Latin America": [
        { label: "Price Sensitivity", value: 46, color: "#f59e0b" },
        { label: "Delivery Shortfall", value: 28, color: "#fbbf24" },
        { label: "Competitor RFP", value: 17, color: "#fcd34d" },
        { label: "Quality Complaint", value: 9, color: "#fde68a" },
      ],
    },
    pedigree: {
      inputFeatures: ["Account age & order frequency", "Contact frequency trend", "OTIF variance", "CSAT trajectory", "Competitor price index"],
      outputType: "Churn Probability (0–1) + Primary Risk Driver",
      trainingDataSize: "620K account order histories (120 months · 10 years)",
      refreshCadence: "Every 4 hours",
      nextRunOffsetHours: 4,
      slaCompliance: "99.3%",
      modelType: "Gradient Boosted Classifier + SHAP explainability",
    },
    recommendations: {
      Global: [
        {
          title: "Proactive Account-Save Programme for 340 At-Risk Accounts",
          priority: "Immediate",
          actions: [
            "Deploy a dedicated account-save team to contact all 340 flagged accounts within 24 hours, scripted around four core drivers: delivery shortfall, price sensitivity, competitor RFP, and quality complaint.",
            "For delivery-shortfall cases (41% of at-risk pool), provide a revised fulfillment commitment in writing with a service-credit offer — shown to lift save rate by 42% in prior campaigns.",
            "Escalate any account with churn probability >0.90 directly to the regional commercial director for a same-week QBR.",
          ],
        },
        {
          title: "Fulfillment Communication Protocol",
          priority: "Short-term",
          actions: [
            "Introduce bi-weekly proactive OTIF status updates for accounts with orders trending >2 weeks behind commitment, reducing inbound cancellation enquiries.",
          ],
        },
        {
          title: "SHAP Feature Monitoring in Salesforce",
          priority: "Strategic",
          actions: [
            "Surface the top SHAP feature driving each account's risk score directly in Salesforce, enabling account managers to address the specific root cause.",
          ],
        },
      ],
      "North America": [
        {
          title: "Delivery Shortfall Save Incentive",
          priority: "Immediate",
          actions: [
            "140 NA at-risk accounts; 50% are delivery-shortfall driven on high-volume beverage contracts. Offer a tiered service-credit programme tied to the severity of the shortfall.",
          ],
        },
        {
          title: "Competitor Counter-Offer Playbook",
          priority: "Short-term",
          actions: [
            "24% of NA risk is competitor-RFP driven — issue a competitive-response toolkit to account managers with approved pricing flexibility and priority capacity allocation levers.",
          ],
        },
      ],
      Europe: [
        {
          title: "Price Pass-Through De-escalation Programme",
          priority: "Immediate",
          actions: [
            "37% of EU at-risk accounts cite input-cost pass-through disputes — offer a transparent cost-bridge review with the account's procurement team within 5 business days.",
          ],
        },
        {
          title: "Quality Complaint Resolution SLA",
          priority: "Short-term",
          actions: [
            "Introduce a 72-hour resolution SLA for quality complaints from personal care converters, the segment showing the highest complaint-linked churn.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Regional Capacity Escalation",
          priority: "Immediate",
          actions: [
            "48% of APAC risk is lead-time variance driven by plant capacity constraints — escalate affected accounts to regional operations for priority scheduling.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Currency-Linked Pricing Review",
          priority: "Immediate",
          actions: [
            "Offer affected LATAM accounts a structured price-review conversation referencing local currency indices to de-escalate renegotiation pressure before it becomes a cancellation risk.",
          ],
        },
      ],
    },
  },
  {
    id: "renewal",
    title: "Contract Renewal Window",
    shortTitle: "Renewal Window",
    lifecycle: "Retain",
    metric: "Supply Contracts Entering Renewal",
    metricValue: { Global: "1,180", "North America": "480", Europe: "350", "Asia Pacific": "240", "Latin America": "110" },
    metricDelta: { Global: "+6.1%", "North America": "+8.4%", Europe: "+3.2%", "Asia Pacific": "+7.6%", "Latin America": "+4.0%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "1,180 supply contracts entering their renewal window globally; early renewal engagement is driving a 22% forward-commitment pull across strategic accounts.",
      "North America": "480 NA contracts entering renewal; 64% show proactive engagement signals, with average volume commitment up 9% vs. prior term.",
      Europe: "350 EU contracts entering renewal; PPWR-linked recycled-content clauses are becoming a standard renegotiation point in 46% of renewals.",
      "Asia Pacific": "240 APAC contracts entering renewal; capacity-commitment upside is the primary renewal lever given regional demand growth.",
      "Latin America": "110 LATAM contracts entering renewal; currency-indexed pricing terms are the dominant renegotiation theme this quarter.",
    },
    dataSources: ["SAP", "Contract Lifecycle Mgmt", "Salesforce", "CLM Analytics"],
    lastRunOffsetHours: -10,
    modelVersion: "v5.1.0",
    accuracy: 90,
    signals: [
      { name: "Contract maturity proximity", strength: 93 },
      { name: "Volume commitment trend", strength: 91 },
      { name: "Sustainability clause engagement", strength: 86 },
      { name: "Repeat-order history", strength: 83 },
      { name: "Account relationship trajectory", strength: 76 },
    ],
    color: "#10b981",
    icon: "RefreshCw",
    regionalDistribution: {
      Global: [
        { label: "30–60 days", value: 29, color: "#10b981" },
        { label: "61–90 days", value: 38, color: "#34d399" },
        { label: "91–120 days", value: 33, color: "#6ee7b7" },
      ],
      "North America": [
        { label: "30–60 days", value: 34, color: "#10b981" },
        { label: "61–90 days", value: 41, color: "#34d399" },
        { label: "91–120 days", value: 25, color: "#6ee7b7" },
      ],
      Europe: [
        { label: "30–60 days", value: 24, color: "#10b981" },
        { label: "61–90 days", value: 35, color: "#34d399" },
        { label: "91–120 days", value: 41, color: "#6ee7b7" },
      ],
      "Asia Pacific": [
        { label: "30–60 days", value: 31, color: "#10b981" },
        { label: "61–90 days", value: 40, color: "#34d399" },
        { label: "91–120 days", value: 29, color: "#6ee7b7" },
      ],
      "Latin America": [
        { label: "30–60 days", value: 27, color: "#10b981" },
        { label: "61–90 days", value: 36, color: "#34d399" },
        { label: "91–120 days", value: 37, color: "#6ee7b7" },
      ],
    },
    pedigree: {
      inputFeatures: ["Contract end date", "Volume commitment vs. forecast", "Order-volume trajectory", "Quality-complaint history", "Repeat-order probability"],
      outputType: "Renewal Probability + Optimal Engagement Window",
      trainingDataSize: "1.9M historical contracts (120 months · 10 years)",
      refreshCadence: "Daily at 22:00 UTC",
      nextRunOffsetHours: 14,
      slaCompliance: "99.9%",
      modelType: "Survival Analysis (Cox PH) + Neural Network",
    },
    recommendations: {
      Global: [
        {
          title: "90-Day Renewal Window Activation",
          priority: "Immediate",
          actions: [
            "Contact all strategic accounts entering renewal within 90 days with a proactive QBR and a forward-commitment proposal.",
            "Personalise outreach with the account's exact volume trajectory and cost-bridge position — this single element has shown a meaningful uplift in early-renewal intent in prior campaigns.",
            "Assign one dedicated renewal specialist per region to own the top 100 accounts end-to-end, preventing cross-sell distraction.",
          ],
        },
        {
          title: "Early Renewal Incentive Tiering",
          priority: "Short-term",
          actions: [
            "Introduce a three-tier renewal incentive: renew 90+ days early (priority capacity allocation), 60–89 days (volume rebate), 30–59 days (standard terms). Model predicts 28% of renewals can be pulled forward.",
          ],
        },
        {
          title: "Cross-Format Upsell Integration",
          priority: "Strategic",
          actions: [
            "Integrate the renewal model output with the cross-format expansion model to identify the subset of renewing accounts that also qualify for a format upgrade — estimated 22% overlap.",
          ],
        },
      ],
      "North America": [
        {
          title: "Q2 2026 Renewal Blitz",
          priority: "Immediate",
          actions: [
            "480 NA contracts entering renewal with 64% showing proactive engagement — segment into (A) sustainability upgraders, (B) volume growers, (C) status-quo renewals for tailored outreach.",
          ],
        },
        {
          title: "Account Team Renewal Conversation Training",
          priority: "Short-term",
          actions: [
            "Brief NA account teams on presenting the volume-commitment conversation with a one-page visual summary of the account's fulfillment performance.",
          ],
        },
      ],
      Europe: [
        {
          title: "PPWR Clause Bundling",
          priority: "Immediate",
          actions: [
            "Bundle recycled-content roadmap commitments with the early renewal offer for EU accounts, addressing PPWR compliance timelines proactively.",
          ],
        },
        {
          title: "AmPrima® Pipeline Reservation",
          priority: "Short-term",
          actions: [
            "Hold priority production allocation for EU customers in the renewal model who indicate AmPrima® interest, ahead of expected demand growth.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Capacity-Commitment Renewal Path",
          priority: "Immediate",
          actions: [
            "Lead APAC renewal conversations with a capacity-commitment upside offer given strong regional demand growth signals.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Currency-Indexed Term Renewal",
          priority: "Immediate",
          actions: [
            "Offer LATAM accounts a currency-indexed pricing structure as part of the renewal proposal to reduce renegotiation friction.",
          ],
        },
        {
          title: "Regional Distributor Renewal Alignment",
          priority: "Strategic",
          actions: [
            "Align renewal timing across accounts routed through regional distributors to reduce administrative overhead and improve forecast accuracy.",
          ],
        },
      ],
    },
  },
  {
    id: "service-retention",
    title: "Service & Fulfillment Reliability",
    shortTitle: "Fulfillment Reliability",
    lifecycle: "Fulfill",
    metric: "On-Time-In-Full Delivery Rate",
    metricValue: { Global: "91.4%", "North America": "93.1%", Europe: "92.0%", "Asia Pacific": "88.6%", "Latin America": "85.2%" },
    metricDelta: { Global: "+2.9%", "North America": "+3.4%", Europe: "+2.1%", "Asia Pacific": "+1.6%", "Latin America": "+2.8%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "91.4% global on-time-in-full delivery rate; 46 production lines flagged for capacity-risk review with proactive customer notification showing 27% fewer expedite requests.",
      "North America": "93.1% NA OTIF; 14 lines flagged for capacity-risk review, concentrated in the beverage packaging network.",
      Europe: "92.0% EU OTIF; proactive notification programme reducing expedite requests most sharply in the personal care segment.",
      "Asia Pacific": "88.6% APAC OTIF; regional plant capacity constraints remain the primary drag, with 16 lines flagged for review.",
      "Latin America": "85.2% LATAM OTIF; logistics variability in cross-border shipments is the leading contributor to delivery variance.",
    },
    dataSources: ["SAP", "Plant MES", "Logistics Execution System", "Salesforce"],
    lastRunOffsetHours: -6,
    modelVersion: "v3.3.7",
    accuracy: 87,
    signals: [
      { name: "Plant capacity utilisation", strength: 92 },
      { name: "Production line health telemetry", strength: 90 },
      { name: "Logistics lead-time variance", strength: 85 },
      { name: "Quality hold frequency", strength: 81 },
      { name: "Customer notification responsiveness", strength: 72 },
    ],
    color: "#8b5cf6",
    icon: "Wrench",
    regionalDistribution: {
      Global: [
        { label: "On-Time-In-Full", value: 91, color: "#8b5cf6" },
        { label: "Delayed <1 wk", value: 6, color: "#a78bfa" },
        { label: "Delayed >1 wk", value: 3, color: "#c4b5fd" },
      ],
      "North America": [
        { label: "On-Time-In-Full", value: 93, color: "#8b5cf6" },
        { label: "Delayed <1 wk", value: 5, color: "#a78bfa" },
        { label: "Delayed >1 wk", value: 2, color: "#c4b5fd" },
      ],
      Europe: [
        { label: "On-Time-In-Full", value: 92, color: "#8b5cf6" },
        { label: "Delayed <1 wk", value: 5, color: "#a78bfa" },
        { label: "Delayed >1 wk", value: 3, color: "#c4b5fd" },
      ],
      "Asia Pacific": [
        { label: "On-Time-In-Full", value: 89, color: "#8b5cf6" },
        { label: "Delayed <1 wk", value: 7, color: "#a78bfa" },
        { label: "Delayed >1 wk", value: 4, color: "#c4b5fd" },
      ],
      "Latin America": [
        { label: "On-Time-In-Full", value: 85, color: "#8b5cf6" },
        { label: "Delayed <1 wk", value: 10, color: "#a78bfa" },
        { label: "Delayed >1 wk", value: 5, color: "#c4b5fd" },
      ],
    },
    pedigree: {
      inputFeatures: ["Plant capacity utilisation", "Production line health telemetry", "Logistics lead-time variance", "Quality hold frequency", "Order complexity index"],
      outputType: "Capacity-Risk Score (0–1) + Line-Level Flag",
      trainingDataSize: "8.4M production & shipment records (120 months · 10 years)",
      refreshCadence: "Every 2 hours",
      nextRunOffsetHours: 2,
      slaCompliance: "99.6%",
      modelType: "Time-Series Anomaly Detection + Gradient Boosted Regressor",
    },
    recommendations: {
      Global: [
        {
          title: "Capacity-Risk Line Review — 46 Flagged Lines",
          priority: "Immediate",
          actions: [
            "Convene a weekly capacity-risk review for all 46 flagged production lines, prioritising lines serving Tier 1 strategic accounts.",
            "Trigger proactive customer notification at the first sign of schedule slippage — this has reduced expedite requests by 27% in pilot regions.",
          ],
        },
        {
          title: "Predictive Maintenance Integration",
          priority: "Short-term",
          actions: [
            "Feed production line telemetry into a predictive maintenance schedule to reduce unplanned downtime contributing to OTIF misses.",
          ],
        },
        {
          title: "Customer-Facing OTIF Dashboard",
          priority: "Strategic",
          actions: [
            "Publish a self-serve OTIF and order-status view in the B2B customer portal to reduce inbound status-check volume.",
          ],
        },
      ],
      "North America": [
        {
          title: "Beverage Network Capacity Plan",
          priority: "Immediate",
          actions: [
            "14 NA lines flagged are concentrated in the beverage packaging network — prioritise capacity investment review for this segment ahead of peak season.",
          ],
        },
      ],
      Europe: [
        {
          title: "Personal Care Notification Expansion",
          priority: "Short-term",
          actions: [
            "Expand the proactive notification programme to all personal care accounts given its strongest expedite-reduction results in this segment.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Regional Capacity Investment Review",
          priority: "Immediate",
          actions: [
            "16 APAC lines flagged for capacity-risk review — escalate to regional operations leadership for an investment and shift-pattern review.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Cross-Border Logistics Stabilisation",
          priority: "Immediate",
          actions: [
            "Partner with logistics providers to reduce cross-border shipment variance, the leading driver of LATAM OTIF shortfalls.",
          ],
        },
      ],
    },
  },
  {
    id: "upselling",
    title: "Sustainable Portfolio Upgrade",
    shortTitle: "Sustainable Upgrade",
    lifecycle: "Expand",
    metric: "Sustainability Upgrade Opportunity",
    metricValue: { Global: "$68.4M", "North America": "$27.6M", Europe: "$20.9M", "Asia Pacific": "$13.1M", "Latin America": "$6.8M" },
    metricDelta: { Global: "+19.1%", "North America": "+22.4%", Europe: "+16.8%", "Asia Pacific": "+18.2%", "Latin America": "+14.6%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "$68.4M sustainability upgrade opportunity identified globally; 480 current accounts qualify for recyclable or recycled-content packaging upgrades (e.g. AmPrima®, AmFiber®) aligned to their own ESG commitments, with average incremental revenue of $142k per account.",
      "North America": "$27.6M NA opportunity; 190 accounts qualify, led by food & beverage brands with public 2030 recyclability pledges.",
      Europe: "$20.9M EU opportunity; PPWR compliance deadlines are accelerating qualified-account conversion, especially in beauty & personal care.",
      "Asia Pacific": "$13.1M APAC opportunity; regional recycled-content mandates are the primary driver of qualified-account growth.",
      "Latin America": "$6.8M LATAM opportunity; early-stage but growing interest from personal care manufacturers pursuing regional ESG certification.",
    },
    dataSources: ["SAP", "Sustainability/ESG Data (EcoVadis)", "Salesforce", "Contract Lifecycle Mgmt"],
    lastRunOffsetHours: -3,
    modelVersion: "v4.0.3",
    accuracy: 84,
    signals: [
      { name: "Account ESG commitment alignment", strength: 89 },
      { name: "Spec-gap analysis vs. recyclable target", strength: 87 },
      { name: "Regulatory-deadline proximity", strength: 84 },
      { name: "Sustainability spec-sheet engagement", strength: 78 },
      { name: "Cross-brand portfolio interest signals", strength: 63 },
    ],
    color: "#f97316",
    icon: "DollarSign",
    regionalDistribution: {
      Global: [
        { label: "AmPrima® Fit", value: 42, color: "#f97316" },
        { label: "AmFiber® Fit", value: 31, color: "#fb923c" },
        { label: "Recycled-Content Blend", value: 27, color: "#fdba74" },
      ],
      "North America": [
        { label: "AmPrima® Fit", value: 45, color: "#f97316" },
        { label: "Recycled-Content Blend", value: 30, color: "#fb923c" },
        { label: "AmFiber® Fit", value: 25, color: "#fdba74" },
      ],
      Europe: [
        { label: "AmFiber® Fit", value: 40, color: "#f97316" },
        { label: "AmPrima® Fit", value: 36, color: "#fb923c" },
        { label: "Recycled-Content Blend", value: 24, color: "#fdba74" },
      ],
      "Asia Pacific": [
        { label: "AmPrima® Fit", value: 38, color: "#f97316" },
        { label: "Recycled-Content Blend", value: 34, color: "#fb923c" },
        { label: "AmFiber® Fit", value: 28, color: "#fdba74" },
      ],
      "Latin America": [
        { label: "Recycled-Content Blend", value: 44, color: "#f97316" },
        { label: "AmPrima® Fit", value: 32, color: "#fb923c" },
        { label: "AmFiber® Fit", value: 24, color: "#fdba74" },
      ],
    },
    pedigree: {
      inputFeatures: ["ESG commitment alignment score", "Spec-gap vs. recyclable target", "Regulatory-deadline proximity", "Sustainability content engagement", "Account tenure & spend tier"],
      outputType: "Upgrade Propensity Score (0–1) + Recommended Product Line",
      trainingDataSize: "1.1M account sustainability-fit records (60 months · 5 years)",
      refreshCadence: "Daily at 05:00 UTC",
      nextRunOffsetHours: 18,
      slaCompliance: "99.4%",
      modelType: "Gradient Boosted Trees + Rules-Based ESG Overlay",
    },
    recommendations: {
      Global: [
        {
          title: "480-Account Sustainability Upgrade Campaign",
          priority: "Immediate",
          actions: [
            "Route the 480 qualified accounts to account teams with a tailored AmPrima® / AmFiber® proposal referencing the account's own published ESG targets.",
            "Prioritise accounts with a public 2025/2030 recyclability pledge — these convert at the highest rate when the proposal cites their own commitment language.",
          ],
        },
        {
          title: "Sustainability ROI Calculator Rollout",
          priority: "Short-term",
          actions: [
            "Equip account teams with a cost-and-carbon calculator comparing current format to the recommended recyclable or recycled-content alternative.",
          ],
        },
        {
          title: "Cross-Sell into Renewal Motion",
          priority: "Strategic",
          actions: [
            "Pair sustainability-upgrade proposals with contracts entering their renewal window to maximise combined conversion — see Reasoning Engine synthesis.",
          ],
        },
      ],
      "North America": [
        {
          title: "2030 Pledge Account Activation",
          priority: "Immediate",
          actions: [
            "190 NA accounts qualify; prioritise food & beverage brands with public 2030 recyclability pledges for the fastest-converting outreach.",
          ],
        },
      ],
      Europe: [
        {
          title: "PPWR Compliance Acceleration",
          priority: "Immediate",
          actions: [
            "Lead EU outreach with PPWR compliance-deadline framing, especially for beauty & personal care accounts facing the nearest deadlines.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Regulatory Mandate Alignment",
          priority: "Short-term",
          actions: [
            "Align APAC proposals with region-specific recycled-content mandates to accelerate qualified-account conversion.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Early-Stage ESG Certification Support",
          priority: "Strategic",
          actions: [
            "Support LATAM personal care manufacturers pursuing regional ESG certification with technical documentation to build the qualified pipeline.",
          ],
        },
      ],
    },
  },
  {
    id: "buyback",
    title: "Cross-Format Expansion",
    shortTitle: "Cross-Format Expansion",
    lifecycle: "Expand",
    metric: "Cross-Format Expansion Accounts",
    metricValue: { Global: "640", "North America": "260", Europe: "190", "Asia Pacific": "130", "Latin America": "60" },
    metricDelta: { Global: "+8.7%", "North America": "+11.2%", Europe: "+6.4%", "Asia Pacific": "+9.8%", "Latin America": "+5.1%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "640 accounts using a single packaging format (rigid- or flexible-only) detected globally; average incremental opportunity of $71k per account with cross-format pilot programmes projected at 45% take-up.",
      "North America": "260 NA single-format accounts identified; rigid-only beverage accounts show the strongest flexible-format pilot interest.",
      Europe: "190 EU single-format accounts identified; flexible-only personal care accounts showing rising interest in rigid dispensing formats.",
      "Asia Pacific": "130 APAC single-format accounts identified; food accounts are the leading segment for cross-format pilot uptake.",
      "Latin America": "60 LATAM single-format accounts identified; home care accounts show early but promising cross-format interest.",
    },
    dataSources: ["SAP", "Salesforce", "B2B Customer Portal", "Marketing Automation Platform"],
    lastRunOffsetHours: -5,
    modelVersion: "v6.0.1",
    accuracy: 93,
    signals: [
      { name: "Format concentration index", strength: 96 },
      { name: "Order pattern & SKU diversity", strength: 94 },
      { name: "Cross-format RFP history", strength: 91 },
      { name: "Wallet-share vs. category benchmark", strength: 90 },
      { name: "Account growth trajectory", strength: 87 },
    ],
    color: "#3b82f6",
    icon: "ArrowUpRight",
    regionalDistribution: {
      Global: [
        { label: "Rigid-Only Accounts", value: 54, color: "#3b82f6" },
        { label: "Flexible-Only Accounts", value: 46, color: "#60a5fa" },
      ],
      "North America": [
        { label: "Rigid-Only Accounts", value: 61, color: "#3b82f6" },
        { label: "Flexible-Only Accounts", value: 39, color: "#60a5fa" },
      ],
      Europe: [
        { label: "Flexible-Only Accounts", value: 58, color: "#3b82f6" },
        { label: "Rigid-Only Accounts", value: 42, color: "#60a5fa" },
      ],
      "Asia Pacific": [
        { label: "Rigid-Only Accounts", value: 52, color: "#3b82f6" },
        { label: "Flexible-Only Accounts", value: 48, color: "#60a5fa" },
      ],
      "Latin America": [
        { label: "Flexible-Only Accounts", value: 55, color: "#3b82f6" },
        { label: "Rigid-Only Accounts", value: 45, color: "#60a5fa" },
      ],
    },
    pedigree: {
      inputFeatures: ["Format concentration index", "SKU diversity vs. category norm", "Cross-format RFP history", "Wallet-share benchmark gap", "Account growth trajectory"],
      outputType: "Cross-Format Propensity Score (0–1) + Recommended Pilot Format",
      trainingDataSize: "980K account order histories (120 months · 10 years)",
      refreshCadence: "Daily at 07:00 UTC",
      nextRunOffsetHours: 21,
      slaCompliance: "99.7%",
      modelType: "Gradient Boosted Trees (XGBoost) + Collaborative Filtering",
    },
    recommendations: {
      Global: [
        {
          title: "Cross-Format Pilot Programme — 640 Accounts",
          priority: "Immediate",
          actions: [
            "Launch a structured cross-format pilot offer for the 640 identified accounts, bundling a trial run at preferential terms with a dedicated format-conversion specialist.",
            "Prioritise the top 120 accounts by wallet-share gap for white-glove co-design sessions.",
          ],
        },
        {
          title: "Category Benchmark Enablement",
          priority: "Short-term",
          actions: [
            "Equip account managers with a category benchmark report showing the account's format mix vs. comparable peers to frame the conversation around competitive parity.",
          ],
        },
        {
          title: "Cross-Format Centre of Excellence",
          priority: "Strategic",
          actions: [
            "Stand up a cross-format centre of excellence pairing rigid and flexible technical teams to accelerate co-design cycles for pilot accounts.",
          ],
        },
      ],
      "North America": [
        {
          title: "Beverage Rigid-to-Flexible Pilot",
          priority: "Immediate",
          actions: [
            "Target 110 NA rigid-only beverage accounts with a flexible stand-up pouch pilot given the strongest interest signal in this segment.",
          ],
        },
      ],
      Europe: [
        {
          title: "Personal Care Rigid Dispensing Pilot",
          priority: "Immediate",
          actions: [
            "Offer flexible-only EU personal care accounts a rigid dispensing-format pilot, addressing rising interest in premium dispensing formats.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "Food Accounts Cross-Format Push",
          priority: "Short-term",
          actions: [
            "Prioritise APAC food accounts for cross-format pilots given the highest projected take-up rate in the region.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Home Care Early Adopter Programme",
          priority: "Strategic",
          actions: [
            "Nurture early cross-format interest among LATAM home care accounts with a low-commitment trial format ahead of broader rollout.",
          ],
        },
      ],
    },
  },
  {
    id: "customer-experience",
    title: "Account Relationship Health",
    shortTitle: "Relationship Health",
    lifecycle: "Retain",
    metric: "ARI Score (Account Relationship Index)",
    metricValue: { Global: "76 / 100", "North America": "78 / 100", Europe: "74 / 100", "Asia Pacific": "75 / 100", "Latin America": "71 / 100" },
    metricDelta: { Global: "+3.8", "North America": "+4.6", Europe: "+2.4", "Asia Pacific": "+3.1", "Latin America": "+1.9" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", "Asia Pacific": "up", "Latin America": "up" },
    insightSummary: {
      Global: "Global ARI Score of 76/100; composite relationship-health index identifies 210 accounts with high growth potential and 95 accounts with early churn signals requiring intervention.",
      "North America": "NA ARI Score of 78/100; 90 accounts show high growth potential, led by beverage and healthcare/pharma verticals.",
      Europe: "EU ARI Score of 74/100; account teams with the highest portal-engagement scores show the strongest relationship durability.",
      "Asia Pacific": "APAC ARI Score of 75/100; recently onboarded accounts are driving score volatility as engagement patterns stabilise.",
      "Latin America": "LATAM ARI Score of 71/100, the region's lowest, with price-sensitivity and communication-frequency gaps as the leading detractors.",
    },
    dataSources: ["SAP", "Salesforce", "Qualtrics", "B2B Customer Portal", "LinkedIn Sales Navigator"],
    lastRunOffsetHours: -4,
    modelVersion: "v2.1.0",
    accuracy: 89,
    signals: [
      { name: "OTIF & quality composite", strength: 94 },
      { name: "B2B portal engagement score", strength: 91 },
      { name: "Account-team touchpoint frequency", strength: 88 },
      { name: "CSAT / NPS trajectory (6-month)", strength: 85 },
      { name: "Contract compliance & renewal signal", strength: 82 },
      { name: "Digital channel responsiveness", strength: 78 },
    ],
    color: "#ec4899",
    icon: "Heart",
    regionalDistribution: {
      Global: [
        { label: "High Growth Potential", value: 34, color: "#ec4899" },
        { label: "Stable / Healthy", value: 51, color: "#f472b6" },
        { label: "Early Churn Signal", value: 15, color: "#f9a8d4" },
      ],
      "North America": [
        { label: "High Growth Potential", value: 38, color: "#ec4899" },
        { label: "Stable / Healthy", value: 50, color: "#f472b6" },
        { label: "Early Churn Signal", value: 12, color: "#f9a8d4" },
      ],
      Europe: [
        { label: "Stable / Healthy", value: 55, color: "#ec4899" },
        { label: "High Growth Potential", value: 30, color: "#f472b6" },
        { label: "Early Churn Signal", value: 15, color: "#f9a8d4" },
      ],
      "Asia Pacific": [
        { label: "Stable / Healthy", value: 48, color: "#ec4899" },
        { label: "High Growth Potential", value: 34, color: "#f472b6" },
        { label: "Early Churn Signal", value: 18, color: "#f9a8d4" },
      ],
      "Latin America": [
        { label: "Stable / Healthy", value: 46, color: "#ec4899" },
        { label: "Early Churn Signal", value: 28, color: "#f472b6" },
        { label: "High Growth Potential", value: 26, color: "#f9a8d4" },
      ],
    },
    pedigree: {
      inputFeatures: ["OTIF & quality composite", "Portal engagement score", "Touchpoint frequency", "CSAT/NPS trajectory", "Contract compliance signal", "Digital responsiveness"],
      outputType: "ARI Composite Score (0–100) + Growth/Risk Segment",
      trainingDataSize: "2.6M account relationship events (60 months · 5 years)",
      refreshCadence: "Daily at 04:00 UTC",
      nextRunOffsetHours: 20,
      slaCompliance: "99.5%",
      modelType: "Weighted Composite Index + Gradient Boosted Classifier",
    },
    recommendations: {
      Global: [
        {
          title: "Proactive Intervention — 95 Early Churn-Signal Accounts",
          priority: "Immediate",
          actions: [
            "Launch a structured QBR outreach programme for all 95 accounts flagged with early churn signals, led by the assigned account director.",
            "Cross-reference against the Order & Churn Risk model to sequence outreach by urgency.",
          ],
        },
        {
          title: "Growth Champions Programme",
          priority: "Short-term",
          actions: [
            "Formally recognise and prioritise executive-sponsor time for the 210 high-growth-potential accounts to compound relationship strength.",
          ],
        },
        {
          title: "ARI–CSAT Integration",
          priority: "Strategic",
          actions: [
            "Integrate the ARI composite score with the CSAT survey platform to create a single relationship-health view for account leadership.",
          ],
        },
      ],
      "North America": [
        {
          title: "Beverage & Pharma Growth Focus",
          priority: "Immediate",
          actions: [
            "Prioritise the 90 NA high-growth-potential accounts, concentrated in beverage and healthcare/pharma, for expanded executive engagement.",
          ],
        },
      ],
      Europe: [
        {
          title: "Portal Engagement Expansion",
          priority: "Short-term",
          actions: [
            "Expand B2B portal onboarding for EU accounts given the strong correlation between portal engagement and relationship durability observed in this region.",
          ],
        },
      ],
      "Asia Pacific": [
        {
          title: "New Account Stabilisation Track",
          priority: "Short-term",
          actions: [
            "Create a structured 90-day onboarding track for recently onboarded APAC accounts to reduce score volatility during the ramp-up period.",
          ],
        },
      ],
      "Latin America": [
        {
          title: "Communication Cadence Uplift",
          priority: "Immediate",
          actions: [
            "Increase account-team touchpoint frequency for LATAM accounts to close the communication-frequency gap identified as the region's leading detractor.",
          ],
        },
      ],
    },
  },
];

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  priority: "Critical" | "High" | "Strategic";
  projectedRevenue: Record<Region, string>;
  targetCustomers: Record<Region, number>;
  conversionRate: Record<Region, string>;
  sourceModels: string[];
  color: string;
  tagline: string;
  because: {
    title: string;
    dataPoints: { model: string; finding: string; weight: string }[];
    correlationStrength: string;
  };
  therefore: {
    title: string;
    strategy: string;
    tactics: string[];
    timelineDaysFromNow: { launch: number; close: number };
    expectedROI: string;
  };
  retailers: RetailerData[];
}

export interface RetailerData {
  id: string;
  name: string;
  location: string;
  region: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  missionFit: number;
  targetCustomers: number;
  projectedRevenue: string;
  customers: CustomerProfile[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  currentFormat: string;
  currentSpec: string;
  expansionValue: string;
  renewalScore: number;
  upsellScore: number;
  cancellationRisk: string;
  leadScore: number;
  role: string;
  location: string;
  tenure: string;
  lifetimeValue: string;
  missionFitReason: string;
  recommendedAction: string;
  contactWindow: string;
  preferredChannel: string;
  }

// ─── ACCOUNT PLAY DATA ─────────────────────────────────────────────────────────
// "retailers" represent regional account hubs / account teams (or, where relevant,
// regional distributor/converter roll-ups). "customers" represent named contacts
// at strategic accounts. targetCustomers / projectedRevenue at the hub level carry
// the true account population for totals; the customers array holds representative
// profile cards for the UI.

export const missions: Mission[] = [
  {
    id: "ev-equity-pivot",
    title: "The Sustainable Portfolio Pivot",
    subtitle: "Convert single-format, high cross-sell accounts to recyclable & recycled-content packaging",
    priority: "Critical",
    projectedRevenue: { Global: "$38.0M", "North America": "$18.2M", Europe: "$11.4M", "Asia Pacific": "$6.1M", "Latin America": "$2.3M" },
    targetCustomers: { Global: 280, "North America": 134, Europe: 84, "Asia Pacific": 46, "Latin America": 16 },
    conversionRate: { Global: "34%", "North America": "38%", Europe: "31%", "Asia Pacific": "33%", "Latin America": "29%" },
    sourceModels: ["buyback", "renewal", "upselling", "intelligent-lead", "customer-experience"],
    color: "#3b82f6",
    tagline: "Turn contract renewal into a sustainability upgrade — before the window closes",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Cross-Format Expansion (v6.0.1)", finding: "640 accounts on a single packaging format with avg. +$71k incremental opportunity; strategic accounts show the strongest AmPrima® fit", weight: "High" },
        { model: "Contract Renewal Window (v5.1.0)", finding: "1,180 supply contracts entering renewal globally with a 90-day critical engagement window open", weight: "High" },
        { model: "Account Relationship Health (v2.1.0)", finding: "Target accounts score 84+ on ARI with high portal engagement — optimal for a proactive sustainability-upgrade conversation", weight: "High" },
        { model: "Sustainable Portfolio Upgrade (v4.0.3)", finding: "480 accounts qualify for a recyclable or recycled-content upgrade with published ESG commitments to reference", weight: "Medium" },
        { model: "Account Intent (v4.2.1)", finding: "62% of accounts approaching renewal are also showing sustainability spec-sheet engagement", weight: "Medium" },
      ],
      correlationStrength: "94.2%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Pair the 90-day contract-renewal window with a targeted sustainability-upgrade offer for the same account — bundling AmPrima® or AmFiber® adoption into the renewal proposal at preferential volume terms.",
      tactics: [
        "Personalised account-fit brief via Salesforce + B2B portal notification referencing the account's own ESG commitments",
        "Account-team-led sustainability co-design session with technical packaging specialists",
        "Priority production allocation for AmPrima® / AmFiber® conversion pilots",
        "Preferential volume-rebate terms for accounts bundling renewal with format upgrade",
        "Competitive-displacement offer: additional rebate tier for accounts evaluating a competitor's recycled-content line",
      ],
      timelineDaysFromNow: { launch: 11, close: 117 },
      expectedROI: "4.8x (12-month)",
    },
    retailers: [
      {
        id: "northeast-beverage-accounts",
        name: "Northeast Beverage & Food Accounts",
        location: "Trenton, NJ 08540",
        region: "North America",
        tier: "Tier 1",
        missionFit: 96,
        targetCustomers: 52,
        projectedRevenue: "$7.2M",
        customers: [
          {
            id: "northstar-beverage",
            name: "NorthStar Beverage Co.",
            currentFormat: "Rigid HDPE Bottles",
            currentSpec: "1L & 2L retail lines, 2022 spec",
            expansionValue: "+$142,000 upgrade opportunity",
            renewalScore: 0.91,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.08)",
            leadScore: 0.94,
            role: "VP Procurement, Beverage Division",
            location: "Trenton, NJ",
            tenure: "7 years / $2.9M cumulative spend",
            lifetimeValue: "$4.1M",
            missionFitReason: "Contract renewal opens Jun 2026 + published 2030 recyclability pledge + active B2B portal user with high spec-sheet engagement",
            recommendedAction: "Bundle renewal proposal with AmPrima® recycled-content conversion pilot and volume rebate",
            contactWindow: "Tuesday–Thursday 10am–2pm EST",
            preferredChannel: "Account portal + dedicated Relationship Manager",
          },
          {
            id: "cascade-foods",
            name: "Cascade Foods",
            currentFormat: "Flexible Laminate Pouches",
            currentSpec: "Stand-up snack pouches, PE-based",
            expansionValue: "+$96,000 upgrade opportunity",
            renewalScore: 0.87,
            upsellScore: 0.92,
            cancellationRisk: "Very Low (0.04)",
            leadScore: 0.96,
            role: "Director of Packaging Innovation",
            location: "Morristown, NJ",
            tenure: "5 years / $1.8M cumulative spend",
            lifetimeValue: "$2.6M",
            missionFitReason: "High cross-sell fit + early sustainability adopter profile + strong ESG reporting requirements from parent brand",
            recommendedAction: "Priority AmFiber® fiber-based pouch pilot with co-design session and preferred capacity slot",
            contactWindow: "Weekday mornings 9–11am EST",
            preferredChannel: "In-portal + Personal Relationship Manager",
          },
        ],
      },
      {
        id: "dach-personal-care-accounts",
        name: "DACH Healthcare & Personal Care Accounts",
        location: "Zug, Switzerland",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 92,
        targetCustomers: 34,
        projectedRevenue: "€3.8M",
        customers: [
          {
            id: "lumen-personal-care",
            name: "Lumen Personal Care",
            currentFormat: "Rigid PET Bottles",
            currentSpec: "Skincare dispensing line, 50–250ml",
            expansionValue: "+€61,000 upgrade opportunity",
            renewalScore: 0.83,
            upsellScore: 0.89,
            cancellationRisk: "Low (0.11)",
            leadScore: 0.90,
            role: "Head of Sustainable Sourcing",
            location: "Zug, Switzerland",
            tenure: "4 years / €1.4M cumulative spend",
            lifetimeValue: "€2.1M",
            missionFitReason: "PPWR compliance deadline approaching + recycled-content spec engagement in top decile for the region",
            recommendedAction: "Lead with recycled-PET conversion roadmap tied to EU PPWR compliance timeline",
            contactWindow: "CET business hours, avoid Friday afternoons",
            preferredChannel: "Video QBR + account portal",
          },
        ],
      },
      {
        id: "apac-food-beverage-accounts",
        name: "Asia Pacific Food & Beverage Accounts",
        location: "Singapore",
        region: "Asia Pacific",
        tier: "Tier 2",
        missionFit: 87,
        targetCustomers: 28,
        projectedRevenue: "$2.4M",
        customers: [
          {
            id: "meridian-dairy",
            name: "Meridian Dairy Group",
            currentFormat: "Rigid HDPE Containers",
            currentSpec: "500ml–1L dairy tubs",
            expansionValue: "+$54,000 upgrade opportunity",
            renewalScore: 0.79,
            upsellScore: 0.81,
            cancellationRisk: "Low (0.14)",
            leadScore: 0.85,
            role: "Regional Supply Chain Director",
            location: "Singapore",
            tenure: "3 years / $780k cumulative spend",
            lifetimeValue: "$1.2M",
            missionFitReason: "Regional recycled-content mandate approaching + strong recent order-volume growth",
            recommendedAction: "Propose phased recycled-content transition aligned to mandate timeline",
            contactWindow: "SGT business hours",
            preferredChannel: "Account portal + regional distributor liaison",
          },
        ],
      },
    ],
  },
  {
    id: "loyalty-recovery",
    title: "The Account Recovery Mission",
    subtitle: "Re-engage high-value at-risk accounts before competitor conquest",
    priority: "High",
    projectedRevenue: { Global: "$18.0M", "North America": "$7.2M", Europe: "$6.3M", "Asia Pacific": "$3.1M", "Latin America": "$1.4M" },
    targetCustomers: { Global: 170, "North America": 68, Europe: 60, "Asia Pacific": 28, "Latin America": 14 },
    conversionRate: { Global: "28%", "North America": "32%", Europe: "25%", "Asia Pacific": "27%", "Latin America": "24%" },
    sourceModels: ["cancellation", "lead-scoring", "service-retention", "renewal", "customer-experience"],
    color: "#f59e0b",
    tagline: "Recover the relationship before the competitor does",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Order & Churn Risk (v2.9.2)", finding: "340 high-risk accounts; 61% linked to on-time-in-full shortfalls — intervention window active", weight: "High" },
        { model: "Service & Fulfillment Reliability (v3.3.7)", finding: "46 production lines flagged for capacity-risk review, directly correlated with the highest-risk accounts", weight: "High" },
        { model: "Account Relationship Health (v2.1.0)", finding: "Early churn indicators detected in 95 accounts with ARI decline >12 points — portal disengagement precedes defection by roughly 45 days", weight: "High" },
        { model: "Opportunity Qualification (v3.8.4)", finding: "180 previously at-risk accounts re-engaging on the B2B portal with a score uplift of +0.22", weight: "Medium" },
        { model: "Contract Renewal Window (v5.1.0)", finding: "EU accounts showing a softer renewal trend, with risk of competitor RFP activity intensifying", weight: "Medium" },
      ],
      correlationStrength: "87.6%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Deploy a white-glove recovery programme for high-LTV accounts showing defection signals. Lead with fulfillment-reliability commitments and proactive solutions to the pain points identified by the Order & Churn Risk model.",
      tactics: [
        "Personal outreach call from Regional Commercial Director for delivery-shortfall affected accounts",
        "Priority capacity allocation and OTIF service-level guarantee as a goodwill commitment",
        "Preferential quality-audit and complaint-resolution SLA (72-hour) for the recovery period",
        "Executive account review: joint roadmap session covering fulfillment, format, and sustainability priorities",
        "Competitive-conquest defence: volume-rebate credit for accounts actively evaluating a competitor RFP",
      ],
      timelineDaysFromNow: { launch: 23, close: 113 },
      expectedROI: "3.2x (18-month)",
    },
    retailers: [
      {
        id: "midwest-copacker-accounts",
        name: "Midwest Co-Packer Accounts",
        location: "Chicago, IL 60611",
        region: "North America",
        tier: "Tier 1",
        missionFit: 89,
        targetCustomers: 34,
        projectedRevenue: "$3.8M",
        customers: [
          {
            id: "aurora-snacks",
            name: "Aurora Snacks Co.",
            currentFormat: "Flexible Laminate Pouches",
            currentSpec: "Multi-serve snack pouches (On Order)",
            expansionValue: "N/A (on order)",
            renewalScore: 0.61,
            upsellScore: 0.72,
            cancellationRisk: "High (0.76)",
            leadScore: 0.82,
            role: "VP Supply Chain",
            location: "Lincoln Park, Chicago",
            tenure: "3 years / $890k cumulative spend",
            lifetimeValue: "$1.3M",
            missionFitReason: "Delivery shortfall running 3 weeks behind commitment; CSAT score dropped from 82 to 31; competitor RFP activity detected",
            recommendedAction: "Director-level personal outreach + fulfillment acceleration plan + interim priority allocation",
            contactWindow: "Afternoons 1–4pm CST",
            preferredChannel: "Direct line + account portal",
          },
        ],
      },
      {
        id: "uk-europe-personal-care-accounts",
        name: "UK & Europe Personal Care Accounts",
        location: "London, W1K 6TF",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 92,
        targetCustomers: 40,
        projectedRevenue: "£3.9M",
        customers: [
          {
            id: "vantage-home-care",
            name: "Vantage Home Care",
            currentFormat: "Rigid PET Bottles",
            currentSpec: "Household refill line, 2020 spec",
            expansionValue: "+£31,000 opportunity",
            renewalScore: 0.58,
            upsellScore: 0.79,
            cancellationRisk: "Medium (0.54)",
            leadScore: 0.78,
            role: "Head of Procurement",
            location: "Knightsbridge, London",
            tenure: "6 years / £2.2M cumulative spend",
            lifetimeValue: "£3.4M",
            missionFitReason: "Renewal trend softening; two recent quality complaints unresolved beyond SLA; competitor pricing enquiry logged",
            recommendedAction: "Executive account review with expedited complaint resolution and renewal incentive",
            contactWindow: "GMT business hours",
            preferredChannel: "Video QBR + account portal",
          },
        ],
      },
      {
        id: "latam-home-personal-care-accounts",
        name: "LATAM Home & Personal Care Accounts",
        location: "São Paulo, Brazil",
        region: "Latin America",
        tier: "Tier 2",
        missionFit: 84,
        targetCustomers: 18,
        projectedRevenue: "$1.1M",
        customers: [
          {
            id: "terra-pet-nutrition",
            name: "Terra Pet Nutrition",
            currentFormat: "Flexible Laminate Pouches",
            currentSpec: "Pet food stand-up pouches",
            expansionValue: "N/A",
            renewalScore: 0.64,
            upsellScore: 0.70,
            cancellationRisk: "Medium (0.58)",
            leadScore: 0.75,
            role: "Purchasing Manager",
            location: "São Paulo",
            tenure: "2 years / $410k cumulative spend",
            lifetimeValue: "$620k",
            missionFitReason: "Currency-linked price renegotiation request pending; recent order-volume dip flagged by churn model",
            recommendedAction: "Offer currency-indexed pricing structure and priority renewal terms to de-escalate risk",
            contactWindow: "BRT business hours",
            preferredChannel: "Regional distributor liaison + account portal",
          },
        ],
      },
    ],
  },
  {
    id: "premium-format-upsell-drive",
    title: "The Premium Format Upsell Drive",
    subtitle: "Convert high-growth accounts to high-barrier, premium-performance packaging formats",
    priority: "Strategic",
    projectedRevenue: { Global: "$16.2M", "North America": "$6.8M", Europe: "$5.4M", "Asia Pacific": "$2.9M", "Latin America": "$1.1M" },
    targetCustomers: { Global: 148, "North America": 62, Europe: 50, "Asia Pacific": 26, "Latin America": 10 },
    conversionRate: { Global: "31%", "North America": "36%", Europe: "27%", "Asia Pacific": "30%", "Latin America": "26%" },
    sourceModels: ["upselling", "intelligent-lead", "lead-scoring", "buyback", "customer-experience"],
    color: "#8b5cf6",
    tagline: "From capability to conquest — the premium-format step-up",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Cross-Format Expansion (v6.0.1)", finding: "Accounts on standard flexible formats showing 0.74 propensity for high-barrier premium upgrade; demand for extended-shelf-life formats at a multi-year high", weight: "High" },
        { model: "Account Intent (v4.2.1)", finding: "Accounts evaluating competitor high-performance lines displaying 0.68 conquest affinity toward Amcor's premium barrier portfolio", weight: "High" },
        { model: "Account Relationship Health (v2.1.0)", finding: "Growth-focused accounts show 92+ ARI scores with the highest account-team touchpoint frequency — ideal for exclusive technical showcase activation", weight: "High" },
        { model: "Sustainable Portfolio Upgrade (v4.0.3)", finding: "High-growth accounts show above-average incremental opportunity when a premium-format step-up is paired with a sustainability roadmap", weight: "Medium" },
        { model: "Opportunity Qualification (v3.8.4)", finding: "Premium-format-persona segment scoring ≥0.88 concentrated in the US, Germany, Singapore & Brazil", weight: "Medium" },
      ],
      correlationStrength: "91.3%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Target high-growth accounts currently on standard-performance formats with a premium high-barrier packaging showcase and technical trial programme. Leverage capacity scarcity narrative (limited pilot slots) with a priority reservation window to drive urgency.",
      tactics: [
        "Invitation-only technical showcase at Amcor innovation centres, featuring high-barrier and extended-shelf-life demonstrations",
        "Guaranteed pricing lock for 90 days during the technical trial period",
        "Premium-format financing: extended payment terms as a launch incentive",
        "Dedicated co-design studio access with a 6-week lead time for custom specifications",
        "Conquest activation: precision account targeting for brands evaluating competitor high-performance lines",
      ],
      timelineDaysFromNow: { launch: 27, close: 207 },
      expectedROI: "5.1x (18-month)",
    },
    retailers: [
      {
        id: "south-central-food-accounts",
        name: "South Central Food & Beverage Accounts",
        location: "Dallas, TX 75201",
        region: "North America",
        tier: "Tier 1",
        missionFit: 94,
        targetCustomers: 38,
        projectedRevenue: "$7.2M",
        customers: [
          {
            id: "bluewave-beverages",
            name: "Bluewave Beverages",
            currentFormat: "Standard Flexible Pouches",
            currentSpec: "Retort pouches, standard barrier, 2022 spec",
            expansionValue: "+$68,000 opportunity",
            renewalScore: 0.84,
            upsellScore: 0.94,
            cancellationRisk: "Very Low (0.06)",
            leadScore: 0.93,
            role: "Chief Supply Chain Officer",
            location: "Highland Park, Dallas",
            tenure: "5 years / $2.1M cumulative spend",
            lifetimeValue: "$3.4M",
            missionFitReason: "High cross-sell fit + premium-format persona + strong ARI score + active technical showcase attendee",
            recommendedAction: "Priority high-barrier retort pouch trial with dedicated co-design studio access",
            contactWindow: "Weekday mornings CST",
            preferredChannel: "Account portal + Personal Relationship Manager",
          },
        ],
      },
      {
        id: "dach-healthcare-accounts",
        name: "DACH Healthcare Accounts",
        location: "Munich, Germany",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 90,
        targetCustomers: 30,
        projectedRevenue: "€5.0M",
        customers: [
          {
            id: "solace-health-sciences",
            name: "Solace Health Sciences",
            currentFormat: "Standard Rigid Blister Packs",
            currentSpec: "Pharma unit-dose blister, standard barrier",
            expansionValue: "+€52,000 opportunity",
            renewalScore: 0.86,
            upsellScore: 0.91,
            cancellationRisk: "Very Low (0.05)",
            leadScore: 0.89,
            role: "Director of Packaging Engineering",
            location: "Munich",
            tenure: "8 years / €3.6M cumulative spend",
            lifetimeValue: "€5.8M",
            missionFitReason: "Regulatory-grade high-barrier need identified + strong technical engagement history",
            recommendedAction: "Offer high-barrier pharma-grade blister trial with regulatory documentation support",
            contactWindow: "CET business hours",
            preferredChannel: "Technical account team + video QBR",
          },
        ],
      },
      {
        id: "apac-premium-accounts",
        name: "Asia Pacific Premium Accounts",
        location: "Singapore",
        region: "Asia Pacific",
        tier: "Tier 2",
        missionFit: 85,
        targetCustomers: 20,
        projectedRevenue: "$1.9M",
        customers: [
          {
            id: "highfield-pharma",
            name: "Highfield Pharma",
            currentFormat: "Standard Flexible Sachets",
            currentSpec: "Single-dose sachets, standard barrier",
            expansionValue: "+$41,000 opportunity",
            renewalScore: 0.80,
            upsellScore: 0.86,
            cancellationRisk: "Low (0.12)",
            leadScore: 0.84,
            role: "Regional Head of Procurement",
            location: "Singapore",
            tenure: "4 years / $920k cumulative spend",
            lifetimeValue: "$1.5M",
            missionFitReason: "Growth account with rising regulatory-grade barrier requirements",
            recommendedAction: "Propose high-barrier sachet trial aligned to regional regulatory roadmap",
            contactWindow: "SGT business hours",
            preferredChannel: "Account portal + regional technical team",
          },
        ],
      },
    ],
  },
];

export const reasoningSteps = [
  { id: 1, text: "Initialising Lumina Intelligence Engine v3.4...", delay: 0, models: [] },
  { id: 2, text: "Querying Cross-Format Expansion (v6.0.1)... 640 single-format accounts identified", delay: 700, models: ["buyback"] },
  { id: 3, text: "Accessing Contract Renewal Window (v5.1.0)... 1,180 supply contracts flagged for Q2 2026", delay: 1400, models: ["buyback", "renewal"] },
  { id: 4, text: "Cross-referencing Opportunity Qualification (v3.8.4)... 860 opportunities at priority threshold", delay: 2100, models: ["buyback", "renewal", "lead-scoring"] },
  { id: 5, text: "Correlating Sustainable Portfolio Upgrade (v4.0.3)... $68.4M revenue opportunity scoped", delay: 2800, models: ["buyback", "renewal", "lead-scoring", "upselling"] },
  { id: 6, text: "Integrating Order & Churn Risk (v2.9.2)... 340 high-risk accounts flagged for intervention", delay: 3500, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation"] },
  { id: 7, text: "Factoring Service & Fulfillment Reliability signals (v3.3.7)... 46 production lines mapped for capacity risk", delay: 4200, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention"] },
  { id: 8, text: "Layering Account Intent personas (v4.2.1)... prospect affinity overlaid across NA, EU, APAC & LATAM", delay: 4900, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead"] },
  { id: 9, text: "Synthesising Account Relationship Health (v2.1.0)... 210 high-growth + 95 churn-risk accounts scored", delay: 5600, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 10, text: "Running account-play synthesis algorithm... pattern recognition active", delay: 6300, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 11, text: "Clustering accounts by play fit... 3 high-confidence account plays identified", delay: 7000, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 12, text: "Validating revenue projections against historical conversion rates...", delay: 7700, models: [] },
  { id: 13, text: "Account-play synthesis complete. 3 actionable plays generated. Combined revenue: $72.2M across 598 qualified accounts", delay: 8400, models: [] },
];

export const connectionMap: Record<string, string[]> = {
  "ev-equity-pivot": ["buyback", "renewal", "upselling", "intelligent-lead", "customer-experience"],
  "loyalty-recovery": ["cancellation", "lead-scoring", "service-retention", "renewal", "customer-experience"],
  "premium-format-upsell-drive": ["upselling", "intelligent-lead", "lead-scoring", "buyback", "customer-experience"],
};
