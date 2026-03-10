// JLR Global Analytics Dashboard — Contextual Data Layer
// Enriched with real-world luxury automotive market intelligence

export type Region = "Global" | "North America" | "Europe" | "UK";
export type Timeframe = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026" | "FY 2026";

// ─── Dynamic date helpers ─────────────────────────────────────────────────────

export function formatUtcDate(offsetHours = 0): string {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function formatUtcDatePlus(days: number, hour: number): string {
  const d = new Date();
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

export type Lifecycle = "Acquire" | "Renew" | "Maintain" | "Own";

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
    title: "Intelligent Lead Identification",
    shortTitle: "Intelligent Lead",
    lifecycle: "Acquire",
    metric: "High Intent Leads",
    metricValue: { Global: "14,820", "North America": "6,340", Europe: "5,910", UK: "2,570" },
    metricDelta: { Global: "+12.4%", "North America": "+18.2%", Europe: "+7.6%", UK: "+14.1%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "Identified 2,140 conquest leads from BMW 5-Series & Mercedes E-Class segments showing JLR affinity signals",
      "North America": "Tesla Model Y intenders trending toward Defender 90 with 0.78 crossover propensity score",
      Europe: "Audi Q5 owners in DACH region displaying strong Range Rover Sport consideration signals via digital touchpoints",
      UK: "2,570 UK leads identified; BMW X5 & Volvo XC90 owners in SE England showing 0.82 affinity for Range Rover PHEV — highest in portfolio",
    },
    dataSources: ["Salesforce CRM", "CDK DMS", "Google Analytics 4", "Meta Pixel", "JLR InControl"],
    lastRunOffsetHours: -2,
    modelVersion: "v4.2.1",
    accuracy: 87,
    signals: [
      { name: "Digital browsing intent", strength: 91 },
      { name: "Social media affinity", strength: 88 },
      { name: "Competitive ownership overlap", strength: 84 },
      { name: "Geo-demographic index", strength: 79 },
      { name: "Lifestyle & wealth proxy", strength: 73 },
    ],
    color: "#3b82f6",
    icon: "Users",
    regionalDistribution: {
      Global: [
        { label: "Range Rover", value: 38, color: "#3b82f6" },
        { label: "Defender", value: 28, color: "#60a5fa" },
        { label: "Discovery", value: 18, color: "#93c5fd" },
        { label: "Jaguar", value: 16, color: "#bfdbfe" },
      ],
      "North America": [
        { label: "Defender", value: 42, color: "#3b82f6" },
        { label: "Range Rover Sport", value: 31, color: "#60a5fa" },
        { label: "F-Pace", value: 15, color: "#93c5fd" },
        { label: "Discovery", value: 12, color: "#bfdbfe" },
      ],
      Europe: [
        { label: "Range Rover", value: 44, color: "#3b82f6" },
        { label: "Range Rover Sport", value: 29, color: "#60a5fa" },
        { label: "Defender", value: 18, color: "#93c5fd" },
        { label: "E-Pace", value: 9, color: "#bfdbfe" },
      ],
      UK: [
        { label: "Range Rover", value: 46, color: "#3b82f6" },
        { label: "Defender", value: 30, color: "#60a5fa" },
        { label: "Range Rover Sport", value: 16, color: "#93c5fd" },
        { label: "Discovery", value: 8, color: "#bfdbfe" },
      ],
    },
    pedigree: {
      inputFeatures: ["Digital browsing signals", "Social media intent", "Competitive ownership data", "Geo-demographic index", "Lifestyle scoring"],
      outputType: "Lead Propensity Score (0–1) + Vehicle Affinity Rank",
      trainingDataSize: "4.2M customer interactions (120 months · 10 years)",
      refreshCadence: "Daily at 06:00 UTC",
      nextRunOffsetHours: 22,
      slaCompliance: "99.8%",
      modelType: "Gradient Boosted Trees (XGBoost) + Collaborative Filtering",
    },
    recommendations: {
      Global: [
        {
          title: "Activate Conquest Lead Sequencing",
          priority: "Immediate",
          actions: [
            "Deploy 3-touch personalised email sequence to 2,140 BMW/Mercedes conquest leads within 48 hrs — focus on Defender 90 & Range Rover Sport P400e value proposition.",
            "Suppress leads with propensity score <0.55 from paid channels to reduce CPL by an estimated 22%.",
            "Brief all retailer sales managers on top 50 conquest leads per market via daily Salesforce digest.",
          ],
        },
        {
          title: "Enhance Signal Capture Across Digital Touchpoints",
          priority: "Short-term",
          actions: [
            "Integrate JLR Configurator session depth events into the model feature pipeline to improve affinity scoring for bespoke trim levels.",
            "Activate Meta Pixel conversion events on brochure download and finance calculator pages to enrich upper-funnel profiles.",
          ],
        },
        {
          title: "Expand Model to Fleet & Corporate Segment",
          priority: "Strategic",
          actions: [
            "Extend the propensity model to cover Fleet / SME segment — an untapped pool estimated at 3,800 corporate renewal prospects globally.",
            "Partner with IHS Markit fleet data to include company vehicle policy changes as a leading indicator.",
          ],
        },
      ],
      "North America": [
        {
          title: "Tesla Intender Conquest Push",
          priority: "Immediate",
          actions: [
            "Activate targeted paid media against 1,480 Tesla Model Y intenders showing Defender 90 crossover score ≥0.78 — focus on Texas, Colorado, and Pacific Northwest DMAs.",
            "Arm retailers with bespoke test-drive invite offering 'Off-Road vs EV Range' head-to-head experience with Defender PHEV.",
          ],
        },
        {
          title: "Retailer-Level Lead Prioritisation Playbook",
          priority: "Short-term",
          actions: [
            "Distribute weekly ranked lead lists to the top 15 NA retailers with recommended contact scripts segmented by propensity tier (Tier 1: ≥0.85, Tier 2: 0.70–0.84).",
            "Introduce 48-hour contact SLA tracking in Salesforce to correlate lead response speed with conversion rate.",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH Audi Q5 Conquest Activation",
          priority: "Immediate",
          actions: [
            "Launch localised Range Rover Sport digital campaign in Germany, Austria, and Switzerland targeting 890 Audi Q5 owners flagged with ≥0.72 consideration signal.",
            "Co-ordinate with DACH retailer network to offer factory-visit experience — proven +18% conversion lift for this segment.",
          ],
        },
        {
          title: "EV Transition Lead Nurturing",
          priority: "Short-term",
          actions: [
            "Build a dedicated EV lead nurture track in HubSpot for 1,200 European prospects showing Range Rover Electric pre-interest signals — include WLTP range content, BAFA grant calculator, and home-charger partnership offer.",
          ],
        },
      ],
      UK: [
        {
          title: "SE England BMW X5 / Volvo XC90 Conquest Sprint",
          priority: "Immediate",
          actions: [
            "Activate highly targeted direct mail + digital retargeting campaign against 680 BMW X5 and Volvo XC90 owners in Surrey, Berkshire, and Hertfordshire — highest affinity cluster in UK portfolio at 0.82.",
            "Include personalised PHEV cost-of-ownership comparison (BIK tax, Benefit-in-Kind savings vs combustion equivalent) as primary value lever.",
          ],
        },
        {
          title: "InControl App Activation for Lead Nurturing",
          priority: "Short-term",
          actions: [
            "Trigger personalised upgrade content within JLR InControl app for existing owners showing Range Rover PHEV affinity signals — in-app engagement shows 2.4× higher conversion vs outbound email for UK segment.",
            "Add 'Request a private viewing' CTA to the InControl notification for the top 300 high-scoring UK leads.",
          ],
        },
        {
          title: "Northern England Market Expansion",
          priority: "Strategic",
          actions: [
            "Current UK lead concentration is 78% South of England. Model data identifies 420 under-served prospects in Manchester, Leeds, and Edinburgh — invest in retailer incentive programme to develop Northern UK pipeline.",
          ],
        },
      ],
    },
  },
  {
    id: "lead-scoring",
    title: "Lead Scoring & Prioritisation",
    shortTitle: "Lead Scoring",
    lifecycle: "Acquire",
    metric: "High-Priority Score (≥0.85)",
    metricValue: { Global: "3,247", "North America": "1,412", Europe: "1,108", UK: "727" },
    metricDelta: { Global: "+8.7%", "North America": "+14.3%", Europe: "+5.1%", UK: "+11.2%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "3,247 prospects scored ≥0.85 — retailer contact within 48hrs correlates to 34% higher conversion vs. baseline",
      "North America": "Manhattan, Beverly Hills & Miami Metro clusters yielding highest conversion rates for Range Rover Autobiography",
      Europe: "London, Munich & Zürich clusters showing disproportionate RR Autobiography intent; EV variant preference at 61%",
      UK: "727 UK leads at ≥0.85; Knightsbridge, Mayfair & Cobham clusters lead — Range Rover Autobiography SV intent at 74%",
    },
    dataSources: ["SAP S/4HANA", "Salesforce Sales Cloud", "Dealerwholesale DMS", "IHS Markit"],
    lastRunOffsetHours: -1,
    modelVersion: "v3.8.4",
    accuracy: 91,
    signals: [
      { name: "Enquiry recency & frequency", strength: 94 },
      { name: "Configurator engagement depth", strength: 92 },
      { name: "Test drive history", strength: 89 },
      { name: "Finance pre-approval status", strength: 87 },
      { name: "Social wealth proxy", strength: 82 },
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
      UK: [
        { label: "Score 0.90–1.0", value: 35, color: "#6366f1" },
        { label: "Score 0.85–0.89", value: 43, color: "#818cf8" },
        { label: "Score 0.75–0.84", value: 22, color: "#a5b4fc" },
      ],
    },
    pedigree: {
      inputFeatures: ["Enquiry recency & frequency", "Configurator engagement depth", "Test drive history", "Finance pre-approval status", "Social wealth proxy"],
      outputType: "Priority Score (0–1) + Urgency Flag",
      trainingDataSize: "1.8M qualified leads (120 months · 10 years)",
      refreshCadence: "Every 6 hours",
      nextRunOffsetHours: 4,
      slaCompliance: "99.5%",
      modelType: "Random Forest Ensemble + Logistic Regression blend",
    },
    recommendations: {
      Global: [
        {
          title: "48-Hour Contact Protocol for Tier 1 Leads",
          priority: "Immediate",
          actions: [
            "Enforce a 48-hour retailer contact SLA for all 1,006 leads scored ≥0.90 globally — data shows conversion drops 34% after 72 hours with no contact.",
            "Trigger automated SMS + email from the assigned sales advisor the moment a lead enters Tier 1 (≥0.90) to maintain personal, premium feel.",
            "Flag Tier 1 leads in Salesforce with a 'priority' indicator visible on retailer dashboards — remove from general lead pool rotation.",
          ],
        },
        {
          title: "Score Decay Monitoring",
          priority: "Short-term",
          actions: [
            "Implement weekly score-decay alerts for leads that have dropped from ≥0.85 to <0.70 without a recorded contact attempt — these represent avoidable pipeline losses.",
            "Route decayed leads to a re-engagement nurture sequence rather than removal, preserving approximately 18% of the dropped pool based on historical data.",
          ],
        },
        {
          title: "Predictive Score Integration into DMS",
          priority: "Strategic",
          actions: [
            "Integrate the priority score directly into Keyloop and CDK DMS so sales advisors see the score alongside enquiry details — reducing the friction of switching between systems.",
          ],
        },
      ],
      "North America": [
        {
          title: "Metro Cluster Fast-Track Programme",
          priority: "Immediate",
          actions: [
            "Manhattan, Beverly Hills, and Miami Metro clusters account for 38% of NA Tier 1 leads — assign dedicated luxury concierge sales specialists to these geographies for white-glove outreach.",
            "Coordinate bespoke Range Rover Autobiography private preview events at all three locations within the next 30 days to convert highest-score leads.",
          ],
        },
        {
          title: "Finance Pre-Approval Fast Path",
          priority: "Short-term",
          actions: [
            "38% of NA Tier 1 leads have a finance pre-approval signal — fast-track these to a same-day finance proposal, compressing the buy cycle by an estimated 8 days.",
          ],
        },
      ],
      Europe: [
        {
          title: "Zürich & Munich Priority Engagement",
          priority: "Immediate",
          actions: [
            "727 European Tier 1 leads are concentrated in Munich, Zürich, and London (Mayfair) — brief local retailer teams on bespoke outreach with EV variant messaging given 61% EV preference rate.",
            "Deploy German and French-language personalised video message from sales director to top 50 scored leads in each market.",
          ],
        },
        {
          title: "EV Specification Lead Routing",
          priority: "Short-term",
          actions: [
            "61% of European Tier 1 leads indicate EV variant preference — route these to EV-certified sales consultants to ensure they receive accurate WLTP, BAFA grant, and charging infrastructure information.",
          ],
        },
      ],
      UK: [
        {
          title: "Knightsbridge & Mayfair VIP Outreach",
          priority: "Immediate",
          actions: [
            "254 UK Tier 1 leads are in the Knightsbridge, Mayfair, and Cobham clusters showing Range Rover Autobiography SV intent at 74% — assign to senior account managers and trigger bespoke handwritten invitation for a private viewing.",
            "Schedule a Colour & Trim bespoke appointment at the Jaguar Land Rover Mayfair flagship for the top 40 scored leads within 2 weeks.",
          ],
        },
        {
          title: "Salary Sacrifice & BIK Messaging",
          priority: "Short-term",
          actions: [
            "72% of UK Tier 1 leads are company-car eligible — include personalised Benefit-in-Kind (BIK) tax comparison table in the first outreach email, as this is the primary financial motivator for UK premium-segment buyers.",
          ],
        },
        {
          title: "Score Model Refresh with FCA Affordability Data",
          priority: "Strategic",
          actions: [
            "Partner with JLR Financial Services to incorporate FCA soft-search affordability signals into the UK scoring model — projected accuracy improvement from 91% to 93.5% based on back-testing.",
          ],
        },
      ],
    },
  },
  {
    id: "renewal",
    title: "Contract Renewal Optimisation",
    shortTitle: "Renewal",
    lifecycle: "Renew",
    metric: "High-Equity Leases Ending Q2 2026",
    metricValue: { Global: "8,912", "North America": "4,210", Europe: "3,180", UK: "1,522" },
    metricDelta: { Global: "+3.2%", "North America": "+6.8%", Europe: "-1.2%", UK: "+4.8%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "down", UK: "up" },
    insightSummary: {
      Global: "750 Range Rover leases with >$8k positive equity ending in 90 days; early renewal incentive window active",
      "North America": "4,210 leases ending Q2 2026 — 62% showing proactive renewal intent; avg. equity position $9,240",
      Europe: "3,180 EU leases; BEV transition incentive (€3,500 SEAI/BAFA) creates strong Range Rover Electric upsell window",
      UK: "1,522 UK PCP contracts ending Q2 2026; OZEV grant eligibility + Salary Sacrifice scheme driving EV conversion intent at 58%",
    },
    dataSources: ["JLR Financial Services", "SAP BRIM", "Reynolds & Reynolds", "FCA UK"],
    lastRunOffsetHours: -10,
    modelVersion: "v5.1.0",
    accuracy: 89,
    signals: [
      { name: "Lease equity position", strength: 93 },
      { name: "Contract maturity proximity", strength: 91 },
      { name: "EV transition intent", strength: 86 },
      { name: "Repeat purchase history", strength: 83 },
      { name: "Finance product alignment", strength: 76 },
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
      UK: [
        { label: "30–60 days", value: 31, color: "#10b981" },
        { label: "61–90 days", value: 39, color: "#34d399" },
        { label: "91–120 days", value: 30, color: "#6ee7b7" },
      ],
    },
    pedigree: {
      inputFeatures: ["Contract end date", "Residual value vs. market", "Mileage trajectory", "Service history score", "Repeat-buyer probability"],
      outputType: "Renewal Probability + Optimal Contact Window",
      trainingDataSize: "2.3M historical contracts (120 months · 10 years)",
      refreshCadence: "Daily at 22:00 UTC",
      nextRunOffsetHours: 14,
      slaCompliance: "99.9%",
      modelType: "Survival Analysis (Cox PH) + Neural Network",
    },
    recommendations: {
      Global: [
        {
          title: "90-Day Equity Window Activation",
          priority: "Immediate",
          actions: [
            "Contact all 750 Range Rover lessees with >$8k positive equity and lease ending within 90 days — offer a guaranteed equity settlement figure valid for 21 days to create urgency.",
            "Personalise outreach with the customer's exact equity position ('Your current Range Rover is worth £X more than your settlement figure') — this single message element has shown a 41% uplift in renewal intent in A/B tests.",
            "Assign one dedicated renewal specialist per retailer to own these 750 accounts end-to-end, preventing cross-sell distraction.",
          ],
        },
        {
          title: "Early Renewal Incentive Tiering",
          priority: "Short-term",
          actions: [
            "Introduce a three-tier renewal incentive: renew 90+ days early (£/$/€500 service credit), 60–89 days (£/$/€300 accessory voucher), 30–59 days (complimentary first service). Model predicts 28% of renewals can be pulled forward, improving order bank visibility.",
          ],
        },
        {
          title: "Repeat-Buyer Loyalty Scoring Integration",
          priority: "Strategic",
          actions: [
            "Integrate the renewal model output with the upselling engine to identify the subset of renewing customers who also qualify for a nameplate upgrade — estimated 22% overlap, worth an average +$12k incremental revenue per customer.",
          ],
        },
      ],
      "North America": [
        {
          title: "Q2 2026 Lease Maturity Blitz",
          priority: "Immediate",
          actions: [
            "4,210 NA leases ending Q2 2026 with 62% showing proactive renewal intent — segment into three groups: (A) EV switchers → Range Rover Electric pathway, (B) PHEV retainers → P440e upgrade, (C) combustion loyalists → Autobiography MY2026.",
            "Partner with Chase Auto and Ally Financial to offer 0% documentation fee for early renewal on JLR Financial Services plans.",
          ],
        },
        {
          title: "Dealer Equity Conversation Training",
          priority: "Short-term",
          actions: [
            "Brief NA retail teams on how to present the equity conversation using a one-page visual summary — many advisors are currently underselling the equity position, leaving $2.1M estimated value on the table per quarter.",
          ],
        },
      ],
      Europe: [
        {
          title: "BAFA & SEAI Grant Bundling",
          priority: "Immediate",
          actions: [
            "Bundle the €3,500 BAFA (Germany) / SEAI (Ireland) BEV grant with the early renewal offer for the 3,180 EU lease holders — this reduces the effective price gap between PHEV and full EV to <€1,200 for most customers.",
            "Create a 'Switch to Electric, Switch Now' one-page customer summary in German, French, and Italian for retailer use.",
          ],
        },
        {
          title: "Range Rover Electric Pipeline Reservation",
          priority: "Short-term",
          actions: [
            "Hold a priority allocation of 420 Range Rover Electric units from the Q3 2026 production run for EU customers currently in the renewal model — first-mover advantage as BMW iX and Audi Q8 e-tron supply remains constrained.",
          ],
        },
      ],
      UK: [
        {
          title: "PCP Equity Call Campaign",
          priority: "Immediate",
          actions: [
            "1,522 UK PCP contracts maturing Q2 2026 — initiate outbound call campaign 90 days before maturity date with a specific equity figure and a structured 'Equity Settlement + New PCP' proposal.",
            "OZEV plug-in grant eligibility ends for many customers in this cohort — include a 'Grant deadline awareness' message to create a conversion window: 58% already show EV intent.",
          ],
        },
        {
          title: "Salary Sacrifice Renewal Pathway",
          priority: "Short-term",
          actions: [
            "Partner with Tusker and Zenith to offer UK Salary Sacrifice renewal as an alternative to personal PCP — for higher-rate taxpayers in this cohort, the Salary Sacrifice route reduces monthly cost by an estimated 32%, making a Range Rover PHEV directly competitive with a BMW X5 on a company scheme.",
          ],
        },
        {
          title: "Scottish & Northern England Maturity Cluster",
          priority: "Strategic",
          actions: [
            "Model identifies a secondary cluster of 340 UK leases maturing in Scotland and Northern England — currently underserved by renewal outreach. Activate Edinburgh and Manchester JLR retailers with the same equity-first script used in the South.",
          ],
        },
      ],
    },
  },
  {
    id: "cancellation",
    title: "Cancellation Risk Prediction",
    shortTitle: "Cancellation",
    lifecycle: "Acquire",
    metric: "At-Risk Orders (≥70% churn)",
    metricValue: { Global: "412", "North America": "187", Europe: "156", UK: "69" },
    metricDelta: { Global: "-18.4%", "North America": "-22.1%", Europe: "-13.8%", UK: "-16.2%" },
    metricTrend: { Global: "down", "North America": "down", Europe: "down", UK: "down" },
    insightSummary: {
      Global: "412 high-risk cancellations flagged; proactive outreach programme reduced churn by 18.4% vs. prior quarter",
      "North America": "187 at-risk orders; 68% linked to delivery delays >12 weeks — dealer intervention rate showing 44% save rate",
      Europe: "156 flagged; EV charging anxiety & delivery lead time primary drivers; concierge home-charger programme reducing risk",
      UK: "69 UK orders at-risk; 72% linked to extended delivery wait beyond 14 weeks — Defender MHEV primary model affected",
    },
    dataSources: ["JLR Order Bank", "SAP SD", "CDK DMS", "NPS Pulse Survey"],
    lastRunOffsetHours: -4,
    modelVersion: "v2.9.2",
    accuracy: 84,
    signals: [
      { name: "Delivery delay duration", strength: 88 },
      { name: "NPS sentiment score", strength: 85 },
      { name: "Competitor conquest offer signals", strength: 78 },
      { name: "EV charging anxiety index", strength: 71 },
      { name: "Inbound contact frequency", strength: 66 },
    ],
    color: "#f59e0b",
    icon: "AlertTriangle",
    regionalDistribution: {
      Global: [
        { label: "Delivery Delay", value: 42, color: "#f59e0b" },
        { label: "Price Sensitivity", value: 28, color: "#fbbf24" },
        { label: "Competitor Offer", value: 19, color: "#fcd34d" },
        { label: "Spec Change", value: 11, color: "#fde68a" },
      ],
      "North America": [
        { label: "Delivery Delay", value: 51, color: "#f59e0b" },
        { label: "Competitor Offer", value: 24, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 16, color: "#fcd34d" },
        { label: "Spec Change", value: 9, color: "#fde68a" },
      ],
      Europe: [
        { label: "EV Anxiety", value: 38, color: "#f59e0b" },
        { label: "Delivery Delay", value: 31, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 22, color: "#fcd34d" },
        { label: "Spec Change", value: 9, color: "#fde68a" },
      ],
      UK: [
        { label: "Delivery Delay", value: 52, color: "#f59e0b" },
        { label: "Competitor Offer", value: 26, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 14, color: "#fcd34d" },
        { label: "Spec Change", value: 8, color: "#fde68a" },
      ],
    },
    pedigree: {
      inputFeatures: ["Order age", "Customer contact frequency", "Delivery ETA variance", "NPS score trajectory", "Competitor price index"],
      outputType: "Churn Probability (0–1) + Primary Risk Driver",
      trainingDataSize: "890K order histories (120 months · 10 years)",
      refreshCadence: "Every 4 hours",
      nextRunOffsetHours: 4,
      slaCompliance: "99.3%",
      modelType: "Gradient Boosted Classifier + SHAP explainability",
    },
    recommendations: {
      Global: [
        {
          title: "Proactive Save Programme for 412 At-Risk Orders",
          priority: "Immediate",
          actions: [
            "Deploy a dedicated 'Order Save' team to contact all 412 flagged customers within 24 hours — scripted around four core objection types: delivery delay, price sensitivity, competitor offer, and spec change.",
            "For delivery-delay cases (42% of at-risk pool), provide a revised delivery date commitment in writing with a £/$/€250 inconvenience payment offer — this has shown a 44% save rate in prior campaigns.",
            "Escalate any customer with churn probability >0.90 directly to the retailer principal for personal phone call within 4 hours.",
          ],
        },
        {
          title: "Delivery Delay Communication Protocol",
          priority: "Short-term",
          actions: [
            "Introduce bi-weekly proactive delivery status update via SMS and email for all customers with orders >8 weeks old — reduces inbound cancellation enquiries by an estimated 31% based on pilot data.",
            "Create a JLR order-tracking page (similar to automotive industry best practice) accessible to customers so they can self-serve delivery progress.",
          ],
        },
        {
          title: "SHAP Feature Monitoring Dashboard",
          priority: "Strategic",
          actions: [
            "Surface the top SHAP feature driving each individual customer's risk score in the retailer DMS — enabling sales advisors to address the specific root cause rather than a generic save script.",
          ],
        },
      ],
      "North America": [
        {
          title: "Delivery Delay Save Incentive",
          priority: "Immediate",
          actions: [
            "187 NA at-risk orders; 51% are delivery-delay driven. Implement a tiered 'Thank You for Waiting' incentive: delay 10–14 wks → complimentary Black Pack accessories ($1,200 value); delay >14 wks → 2-year service plan ($2,800 value).",
            "Brief NA retail network on the 44% save rate data point — many retailers are currently waiting for customers to cancel rather than proactively intervening.",
          ],
        },
        {
          title: "Competitor Counter-Offer Playbook",
          priority: "Short-term",
          actions: [
            "24% of NA cancellations are driven by a competitor offer (primarily BMW X5 and Cadillac Escalade). Issue a 'Competitive Response Toolkit' to retail managers with approved price-match flexibilities, finance rate matching, and priority allocation levers.",
          ],
        },
      ],
      Europe: [
        {
          title: "EV Anxiety De-risking Programme",
          priority: "Immediate",
          actions: [
            "38% of EU at-risk orders are EV-anxiety driven — immediately offer a free home-charger installation survey (Ohme or Wallbox partnership) to all affected customers, reducing the perceived barrier to EV ownership.",
            "Pair each at-risk EV order with a 48-hour 'real-world EV experience' loaner vehicle programme at the nearest retailer.",
          ],
        },
        {
          title: "Delivery Lead Time Transparency",
          priority: "Short-term",
          actions: [
            "31% of EU cancellations are delivery-delay driven — implement a personalised WhatsApp update channel for European customers (high adoption in DE/FR/NL markets) providing milestone notifications as their vehicle moves through production.",
          ],
        },
      ],
      UK: [
        {
          title: "Defender MHEV Delay Save Campaign",
          priority: "Immediate",
          actions: [
            "72% of UK at-risk orders are Defender MHEV customers waiting beyond 14 weeks — activate a personalised outreach programme offering a fully-specced Defender loaner vehicle during the extended wait, demonstrating confidence in the product.",
            "For customers >16 weeks into wait: offer an immediate upgrade path to a Defender 110 P400e from current stock at the same price, eliminating the wait entirely.",
          ],
        },
        {
          title: "UK Competitor Counter Strategy",
          priority: "Short-term",
          actions: [
            "26% of UK cancellations are lost to competitor offers — primarily Land Rover Defender competitor Toyota Land Cruiser and Mercedes GLE. Issue retailer-level competitive response authority to match finance rates to within 0.3% and offer a complimentary 3-year service plan as a retention tool.",
          ],
        },
      ],
    },
  },
  {
    id: "service-retention",
    title: "Service Retention Intelligence",
    shortTitle: "Service Retention",
    lifecycle: "Maintain",
    metric: "Retention Opportunity Score",
    metricValue: { Global: "71.4%", "North America": "68.2%", Europe: "74.8%", UK: "76.3%" },
    metricDelta: { Global: "+4.1%", "North America": "+2.8%", Europe: "+5.9%", UK: "+6.7%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "1,840 vehicles overdue for annual care plan renewal; personalised service reminder activation showing 31% uplift",
      "North America": "Post-warranty cliff at 36 months; 1,240 vehicles predicted to defect to independents — JLR EliteCare retention offer active",
      Europe: "Integrated OTA update notifications driving 23% increase in dealership aftersales visits in DACH & Nordics",
      UK: "UK leads Europe in retention score at 76.3%; JLR-approved dealer density across Home Counties driving same-day service convenience",
    },
    dataSources: ["JLR ETAS", "Keyloop DMS", "SAP Service Cloud", "InControl Remote"],
    lastRunOffsetHours: -8,
    modelVersion: "v3.3.7",
    accuracy: 86,
    signals: [
      { name: "Service interval proximity", strength: 92 },
      { name: "OTA telemetry health alerts", strength: 90 },
      { name: "Care plan expiry status", strength: 88 },
      { name: "Warranty cliff proximity", strength: 85 },
      { name: "Independent garage risk score", strength: 72 },
    ],
    color: "#06b6d4",
    icon: "Wrench",
    regionalDistribution: {
      Global: [
        { label: "Annual Service Due", value: 35, color: "#06b6d4" },
        { label: "Care Plan Renewal", value: 28, color: "#22d3ee" },
        { label: "Recall Campaign", value: 21, color: "#67e8f9" },
        { label: "EV Battery Check", value: 16, color: "#a5f3fc" },
      ],
      "North America": [
        { label: "Post-Warranty", value: 44, color: "#06b6d4" },
        { label: "Annual Service Due", value: 31, color: "#22d3ee" },
        { label: "Care Plan Renewal", value: 25, color: "#67e8f9" },
      ],
      Europe: [
        { label: "Annual Service Due", value: 38, color: "#06b6d4" },
        { label: "EV Battery Check", value: 29, color: "#22d3ee" },
        { label: "Care Plan Renewal", value: 33, color: "#67e8f9" },
      ],
      UK: [
        { label: "Annual Service Due", value: 41, color: "#06b6d4" },
        { label: "Care Plan Renewal", value: 30, color: "#22d3ee" },
        { label: "EV Battery Check", value: 18, color: "#67e8f9" },
        { label: "Recall Campaign", value: 11, color: "#a5f3fc" },
      ],
    },
    pedigree: {
      inputFeatures: ["Last service date", "Mileage since service", "OTA update status", "Customer lifetime value", "Nearest approved retailer distance"],
      outputType: "Defection Risk Score + Recommended Intervention",
      trainingDataSize: "3.1M service records (120 months · 10 years)",
      refreshCadence: "Daily at 04:00 UTC",
      nextRunOffsetHours: 20,
      slaCompliance: "99.7%",
      modelType: "Hazard Model + Decision Tree",
    },
    recommendations: {
      Global: [
        {
          title: "Care Plan Renewal Blitz — 1,840 Overdue Vehicles",
          priority: "Immediate",
          actions: [
            "Activate a personalised outreach sequence for all 1,840 vehicles overdue for care plan renewal — SMS, email, and in-app InControl notification in a 3-day cadence. Pilot data shows 31% uplift when all three channels fire in sequence.",
            "Offer a 'Lock-in' price guarantee: renew within 14 days at current rate before scheduled April service price adjustment — creates urgency without discounting.",
          ],
        },
        {
          title: "Post-Warranty Retention Bridge",
          priority: "Short-term",
          actions: [
            "Identify vehicles within 6 months of warranty expiry and proactively offer a JLR Approved Used inspection + extended warranty package — data shows defection to independents increases 3× in the month after warranty expiry without intervention.",
          ],
        },
        {
          title: "OTA Update as Service Trigger",
          priority: "Strategic",
          actions: [
            "Use vehicle OTA update completion as a trigger for a personalised service reminder — 'Your software is now updated. While we're monitoring your vehicle, would you like to book your next annual health check?' — shown to increase service bookings by 23% in EU pilot.",
          ],
        },
      ],
      "North America": [
        {
          title: "EliteCare Post-Warranty Retention Offer",
          priority: "Immediate",
          actions: [
            "1,240 NA vehicles predicted to defect to independent service centres post-warranty — activate JLR EliteCare retention offer 90 days before warranty expiry: multi-year service plan at 15% discount with complimentary annual health check.",
            "Position EliteCare around the JLR-trained technician and OEM parts guarantee vs. independent shops — particularly effective with Range Rover Autobiography and Defender SVR owners who are protective of vehicle value.",
          ],
        },
        {
          title: "Mobile Service Expansion",
          priority: "Short-term",
          actions: [
            "Model identifies 380 NA customers whose nearest JLR retailer is >45 mins drive — these show 2.1× higher defection rate. Expand JLR Mobile Service vans to cover Manhattan, Beverly Hills, and Silicon Valley corridors to eliminate distance as a barrier.",
          ],
        },
      ],
      Europe: [
        {
          title: "OTA-Triggered Service Appointment Push",
          priority: "Immediate",
          actions: [
            "23% uplift in aftersales visits already observed from OTA notifications in DACH & Nordics — scale this programme immediately to all 5,910 EU vehicles with active InControl connectivity.",
            "A/B test a 'Book while we've got your car's attention' CTA in the OTA completion notification across French and Italian markets where uptake has been lower.",
          ],
        },
        {
          title: "EV Battery Health Campaign",
          priority: "Short-term",
          actions: [
            "29% of EU service distribution is EV Battery Check category — proactively offer a free 45-minute EV battery health assessment to all I-Pace and Range Rover PHEV customers over 3 years old. This drives service visits and surfaces trade-in conversations for upsell.",
          ],
        },
      ],
      UK: [
        {
          title: "Home Counties Same-Day Service Campaign",
          priority: "Immediate",
          actions: [
            "UK leads Europe in retention at 76.3% — capitalise on this by promoting the same-day express service capability at Guildford, Cobham, and Stratstone Mayfair for the 41% of UK service-due vehicles in this corridor.",
            "Send a 'Your Annual Health Check is Due' personalised letter (physical direct mail for premium feel) to the top 500 UK vehicles by CLV score — response rate for physical mail in this segment is 3.8× email.",
          ],
        },
        {
          title: "Recall Campaign Accelerator",
          priority: "Short-term",
          actions: [
            "11% of UK service distribution involves an active recall campaign — these are guaranteed visits. Use the recall appointment as an opportunity to conduct a vehicle equity appraisal, converting a reactive visit into a proactive renewal conversation for 18% of attendees.",
          ],
        },
        {
          title: "Loyalty Score Integration",
          priority: "Strategic",
          actions: [
            "Merge service retention scores with the upselling engine to identify UK customers who are both high-retention AND high-upgrade propensity — estimated 620 dual-opportunity customers representing £8.4M combined revenue potential.",
          ],
        },
      ],
    },
  },
  {
    id: "upselling",
    title: "Upselling & Cross-sell Engine",
    shortTitle: "Upselling",
    lifecycle: "Maintain",
    metric: "Upsell Revenue Opportunity",
    metricValue: { Global: "$84.2M", "North America": "$41.6M", Europe: "$29.8M", UK: "£12.8M" },
    metricDelta: { Global: "+22.7%", "North America": "+31.4%", Europe: "+16.2%", UK: "+24.9%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "2,890 current owners qualify for personalised upgrade to Range Rover first editions — avg. incremental revenue $29.2k",
      "North America": "Defender 90 owners showing 0.74 propensity to upgrade to Defender 110 MHEV; SUV demand index at 6-yr high",
      Europe: "I-Pace owners with >30k mi showing strong Range Rover Electric pre-order intent (87% WLTP range satisfaction threshold)",
      UK: "£12.8M upsell opportunity; Range Rover Sport P400e owners in Cobham, Guildford & Ascot showing 0.81 propensity for SV Autobiography upgrade",
    },
    dataSources: ["SAP CRM", "JLR InControl Data Lake", "CDK Elead", "Lotame DMP"],
    lastRunOffsetHours: -9,
    modelVersion: "v4.0.3",
    accuracy: 82,
    signals: [
      { name: "Owner tenure & mileage profile", strength: 89 },
      { name: "Spec gap analysis vs. aspirational", strength: 87 },
      { name: "Life-stage event triggers", strength: 81 },
      { name: "Accessory purchase history", strength: 78 },
      { name: "Cross-model interest signals", strength: 63 },
    ],
    color: "#8b5cf6",
    icon: "ArrowUpRight",
    regionalDistribution: {
      Global: [
        { label: "Nameplate Upgrade", value: 41, color: "#8b5cf6" },
        { label: "Spec Level Upgrade", value: 33, color: "#a78bfa" },
        { label: "Accessories & Packs", value: 26, color: "#c4b5fd" },
      ],
      "North America": [
        { label: "Nameplate Upgrade", value: 48, color: "#8b5cf6" },
        { label: "Spec Level Upgrade", value: 30, color: "#a78bfa" },
        { label: "Accessories & Packs", value: 22, color: "#c4b5fd" },
      ],
      Europe: [
        { label: "EV Upgrade", value: 44, color: "#8b5cf6" },
        { label: "Nameplate Upgrade", value: 34, color: "#a78bfa" },
        { label: "Accessories & Packs", value: 22, color: "#c4b5fd" },
      ],
      UK: [
        { label: "Spec Level Upgrade", value: 42, color: "#8b5cf6" },
        { label: "Nameplate Upgrade", value: 35, color: "#a78bfa" },
        { label: "EV Upgrade", value: 23, color: "#c4b5fd" },
      ],
    },
    pedigree: {
      inputFeatures: ["Current vehicle spec", "Configurator behaviour", "Household income proxy", "Lifestyle & life-stage events", "Competitor activity exposure"],
      outputType: "Upgrade Propensity + Revenue Impact Estimate",
      trainingDataSize: "2.6M owner journeys (120 months · 10 years)",
      refreshCadence: "Daily at 23:00 UTC",
      nextRunOffsetHours: 15,
      slaCompliance: "99.1%",
      modelType: "Neural Collaborative Filtering + LightGBM",
    },
    recommendations: {
      Global: [
        {
          title: "First Edition Upgrade Campaign — 2,890 Qualified Owners",
          priority: "Immediate",
          actions: [
            "Launch a 'First Access' communication to 2,890 globally qualified upgrade candidates — personalised with their current vehicle details, the exact incremental cost, and a comparison against the upgraded specification.",
            "Use a 2-part email + personal call approach: email from the brand's head of customer experience, followed by a personal call from their assigned retailer within 72 hours.",
          ],
        },
        {
          title: "Accessories & Packs Revenue Activation",
          priority: "Short-term",
          actions: [
            "26% of upsell opportunity ($21.9M) sits in accessories and packs — activate a post-delivery accessories campaign at 30 days and 6 months after vehicle purchase, when personalisation intent is highest.",
            "Bundle popular accessories into three named packs ('Adventure', 'Urban Prestige', 'Family Expedition') to simplify the purchase decision and increase average order value by an estimated 34%.",
          ],
        },
        {
          title: "Life-Stage Event Trigger Integration",
          priority: "Strategic",
          actions: [
            "Integrate life-stage event signals (property purchase, business directorship change, new child) from Experian and Acxiom into the model — these events correlate with +44% upsell propensity and are currently not captured.",
          ],
        },
      ],
      "North America": [
        {
          title: "Defender 90 → 110 MHEV Upgrade Sprint",
          priority: "Immediate",
          actions: [
            "Defender 90 owners showing 0.74 propensity for 110 MHEV upgrade are the highest-value upsell segment in NA — brief all NA Defender retailers with a structured 'Step Up' conversation guide focusing on practicality, payload, and family use cases.",
            "Offer a zero-cost extended test drive (48-hour home-trial) of the Defender 110 MHEV to the top 280 propensity-scored NA owners — this tactile experience is the primary conversion driver in this segment.",
          ],
        },
        {
          title: "Range Rover Autobiography Scarcity Messaging",
          priority: "Short-term",
          actions: [
            "14-week order bank on Autobiography creates genuine scarcity — authorise retailers to communicate current allocation status honestly as a conversion lever: 'We have 3 units available for Q3 delivery; two are already allocated.'",
          ],
        },
      ],
      Europe: [
        {
          title: "I-Pace Owner Range Rover Electric Pre-Order Drive",
          priority: "Immediate",
          actions: [
            "I-Pace owners with >30k miles showing 87%+ WLTP range satisfaction represent the ideal Range Rover Electric early adopter — invite all 340 qualifying European I-Pace owners to an exclusive 'Next Chapter of Electric' preview event with a guaranteed pre-order slot.",
            "Position the upgrade as a like-for-like EV continuation with a significant prestige step-up, not a compromise — compare boot space, towing capacity, and range directly in the invitation.",
          ],
        },
        {
          title: "DACH Spec Upgrade Localisation",
          priority: "Short-term",
          actions: [
            "44% of EU upsell is EV upgrade driven — ensure all European digital upgrade journeys are localised with BAFA/SEAI grant amounts already deducted from the headline price to present the true cost of upgrading.",
          ],
        },
      ],
      UK: [
        {
          title: "Surrey & Berkshire SV Autobiography Private Event",
          priority: "Immediate",
          actions: [
            "Range Rover Sport P400e owners in Cobham, Guildford, and Ascot showing 0.81 propensity for SV Autobiography upgrade — host a private evening preview at the Stratstone Mayfair showroom with bespoke Colour & Trim consultation included.",
            "Include a financial illustration showing the SV Autobiography's expected residual value advantage over a standard HSE at 3 years — this segment is highly residual-value conscious.",
          ],
        },
        {
          title: "Spec Level Upgrade — JLR InControl In-App Offer",
          priority: "Short-term",
          actions: [
            "42% of UK upsell opportunity is spec-level driven — deploy an in-app notification within JLR InControl for owners of Standard and S-spec vehicles showing the incremental monthly cost of upgrading to SE or Autobiography on a new finance arrangement.",
            "Feature the 3 most popular spec upgrades in the app based on the customer's current model line to make the decision concrete rather than abstract.",
          ],
        },
        {
          title: "Corporate Fleet Upsell Pathway",
          priority: "Strategic",
          actions: [
            "Model identifies 180 UK corporate customers currently on Defender 90 commercial spec who qualify for Defender 110 HSE — engage fleet account managers with a Total Cost of Ownership comparison that demonstrates the HSE's BIK and residual value advantages.",
          ],
        },
      ],
    },
  },
  {
    id: "buyback",
    title: "Buyback & Trade-In Valuation",
    shortTitle: "Buyback",
    lifecycle: "Renew",
    metric: "Positive Equity Vehicles",
    metricValue: { Global: "5,640", "North America": "2,890", Europe: "1,920", UK: "830" },
    metricDelta: { Global: "+9.3%", "North America": "+15.7%", Europe: "+4.2%", UK: "+10.8%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "5,640 vehicles with avg. +$4.2k positive equity — trade-in campaign activation projected at 68% take-up rate",
      "North America": "2026 MY Range Rover Autobiography commands +$8.4k over book value; scarcity premium driven by 14-week order bank",
      Europe: "Defender PHEV models trading at +€5.1k over CAP HPI; UK & German markets showing highest buyback intent signals",
      UK: "830 UK vehicles with avg. +£3.8k positive equity over CAP HPI; Range Rover PHEV P440e most prevalent — Mayfair & Knightsbridge cluster leading",
    },
    dataSources: ["Black Book / CAP HPI", "JLR Financial Services", "Manheim Auctions", "SAP BRIM", "Cox Automotive"],
    lastRunOffsetHours: -3,
    modelVersion: "v6.0.1",
    accuracy: 93,
    signals: [
      { name: "CAP HPI live valuation feed", strength: 96 },
      { name: "Vehicle mileage & condition data", strength: 94 },
      { name: "Auction realisation rate", strength: 91 },
      { name: "Equity position vs. settlement", strength: 90 },
      { name: "Residual value forecast accuracy", strength: 87 },
    ],
    color: "#ef4444",
    icon: "DollarSign",
    regionalDistribution: {
      Global: [
        { label: "Range Rover", value: 44, color: "#ef4444" },
        { label: "Defender", value: 31, color: "#f87171" },
        { label: "Discovery", value: 15, color: "#fca5a5" },
        { label: "Jaguar", value: 10, color: "#fecaca" },
      ],
      "North America": [
        { label: "Range Rover Autobiography", value: 48, color: "#ef4444" },
        { label: "Defender 110", value: 33, color: "#f87171" },
        { label: "F-Pace SVR", value: 19, color: "#fca5a5" },
      ],
      Europe: [
        { label: "Defender PHEV", value: 42, color: "#ef4444" },
        { label: "Range Rover LWB", value: 38, color: "#f87171" },
        { label: "Discovery Sport", value: 20, color: "#fca5a5" },
      ],
      UK: [
        { label: "Range Rover PHEV", value: 48, color: "#ef4444" },
        { label: "Defender PHEV", value: 34, color: "#f87171" },
        { label: "Discovery Sport", value: 18, color: "#fca5a5" },
      ],
    },
    pedigree: {
      inputFeatures: ["Current market value (Black Book/CAP HPI)", "Mileage & condition grade", "Regional demand index", "Days to auction floor", "Owner equity position"],
      outputType: "Trade-in Valuation + Equity Position + Urgency Score",
      trainingDataSize: "1.9M trade-in transactions (120 months · 10 years)",
      refreshCadence: "Twice daily (06:00 & 18:00 UTC)",
      nextRunOffsetHours: 9,
      slaCompliance: "99.9%",
      modelType: "Ensemble Valuation Model (Gradient Boost + CatBoost)",
    },
    recommendations: {
      Global: [
        {
          title: "Equity Position Trade-In Campaign",
          priority: "Immediate",
          actions: [
            "Contact all 5,640 positive-equity vehicle owners with a personalised 'Your vehicle is worth more than you think' communication, including their specific equity figure — A/B testing shows this exact framing drives a 41% higher response rate vs. generic trade-in messaging.",
            "Create urgency with a 21-day equity lock guarantee — protect the valuation while the customer considers, removing the most common objection ('the value might drop before I decide').",
          ],
        },
        {
          title: "Equity + New Order Bridging Finance",
          priority: "Short-term",
          actions: [
            "Work with JLR Financial Services to create a bridging product that allows customers to lock in the equity value as a deposit on a new order even if their current vehicle is still in use — removes the practical timing barrier for 38% of positive-equity customers who cite 'don't want to be without a car' as a hesitation.",
          ],
        },
        {
          title: "CAP HPI Data Feed Acceleration",
          priority: "Strategic",
          actions: [
            "Increase CAP HPI valuation data refresh from weekly to daily to improve equity position accuracy — current weekly refresh means some equity figures displayed to customers are up to 7 days stale, occasionally generating incorrect expectations at point of appraisal.",
          ],
        },
      ],
      "North America": [
        {
          title: "Range Rover Autobiography Scarcity + Equity Bundle",
          priority: "Immediate",
          actions: [
            "The combination of +$8.4k Autobiography equity premium AND a 14-week order bank creates a unique 'buy now, profit now' window — craft a campaign message around this dual scarcity for the 1,390 NA Autobiography-spec positive-equity owners.",
            "Partner with Manheim to provide same-week vehicle collection logistics, removing the 'hassle of selling' objection that affects 29% of NA trade-in hesitant customers.",
          ],
        },
        {
          title: "Defender 110 Trade-Up Programme",
          priority: "Short-term",
          actions: [
            "33% of NA positive-equity vehicles are Defender 110 — the segment with the highest equity surplus. Create a 'Defender-to-Defender' trade-up programme specifically for this group, offering guaranteed equity + a $1,500 loyalty credit toward any new Defender order.",
          ],
        },
      ],
      Europe: [
        {
          title: "Defender PHEV High-Equity Outreach",
          priority: "Immediate",
          actions: [
            "Defender PHEV models trading at +€5,100 over CAP HPI in Germany and the UK represent the most compelling trade-in conversation in the European portfolio — brief Defender-specialist retailers in DE, UK, and NL on this equity figure with authority to present it proactively during any service visit.",
            "Launch a 'Your Defender's Value Has Grown' digital campaign targeting the 780 highest-equity EU Defender PHEV owners with an online equity estimator tool.",
          ],
        },
        {
          title: "Range Rover Electric Trade-In Pathway",
          priority: "Short-term",
          actions: [
            "Position trade-in of a high-equity petrol Range Rover LWB as the natural funding mechanism for a Range Rover Electric reservation — 38% of EU positive-equity vehicles are Range Rover LWB, and the equity covers an estimated 42% of the deposit requirement.",
          ],
        },
      ],
      UK: [
        {
          title: "Mayfair & Knightsbridge Equity Appraisal Event",
          priority: "Immediate",
          actions: [
            "830 UK positive-equity vehicles, concentrated in Mayfair and Knightsbridge — invite the top 120 by equity position to a private 'Vehicle Appraisal Morning' at the Stratstone Mayfair flagship where their vehicle is assessed on-site and an equity certificate is presented in a premium format.",
            "Offer a same-day new order incentive: any customer who places a new order on the day of their appraisal receives a complimentary 3-year service plan.",
          ],
        },
        {
          title: "Range Rover PHEV P440e Equity Communication",
          priority: "Short-term",
          actions: [
            "Range Rover PHEV P440e is the most prevalent UK positive-equity vehicle at 48% of the pool — create a personalised equity summary letter for all P440e owners showing their exact CAP HPI value, equity position, and a comparison monthly payment for a new Range Rover Electric on PCP.",
            "Include the OZEV grant amount already applied to make the new vehicle monthly cost as low as possible in the headline figure.",
          ],
        },
        {
          title: "CAP HPI Equity Score in Retailer DMS",
          priority: "Strategic",
          actions: [
            "Surface the live equity position score directly in the Keyloop DMS customer record so that any UK retailer service advisor can initiate an equity conversation at any contact point — estimated 18% additional trade-in conversations generated per month from this single integration.",
          ],
        },
      ],
    },
  },
  {
    id: "customer-experience",
    title: "Customer Experience Index (CEI)",
    shortTitle: "Experience Index",
    lifecycle: "Own",
    metric: "Loyalty Potential Score",
    metricValue: { Global: "78.6", "North America": "76.2", Europe: "81.4", UK: "82.1" },
    metricDelta: { Global: "+3.8", "North America": "+2.4", Europe: "+5.1", UK: "+4.9" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "Composite CEI score identifies 2,840 customers with high loyalty potential; 412 showing early churn indicators requiring intervention",
      "North America": "App engagement down 18% for 1,120 NA owners — correlates with 2.3× higher defection probability within 6 months",
      Europe: "Service touchpoint frequency highest in DACH; telematics data shows 94% positive vehicle health status driving loyalty uplift",
      UK: "UK leads global CEI at 82.1; InControl app monthly active users at 89% — highest retailer NPS correlation observed",
    },
    dataSources: ["JLR InControl Telematics", "Mobile App Analytics", "Keyloop DMS", "Retailer Interaction Log", "NPS Survey Platform"],
    lastRunOffsetHours: -4,
    modelVersion: "v2.1.0",
    accuracy: 89,
    signals: [
      { name: "Vehicle telemetry health index", strength: 94 },
      { name: "InControl app engagement score", strength: 91 },
      { name: "Service visit frequency & recency", strength: 88 },
      { name: "Retailer touchpoint sentiment", strength: 85 },
      { name: "NPS trajectory (6-month)", strength: 82 },
      { name: "Digital channel responsiveness", strength: 78 },
    ],
    color: "#ec4899",
    icon: "Heart",
    regionalDistribution: {
      Global: [
        { label: "High Loyalty", value: 42, color: "#ec4899" },
        { label: "Stable", value: 31, color: "#f472b6" },
        { label: "At Risk", value: 18, color: "#f9a8d4" },
        { label: "Churn Likely", value: 9, color: "#fbcfe8" },
      ],
      "North America": [
        { label: "High Loyalty", value: 38, color: "#ec4899" },
        { label: "Stable", value: 29, color: "#f472b6" },
        { label: "At Risk", value: 22, color: "#f9a8d4" },
        { label: "Churn Likely", value: 11, color: "#fbcfe8" },
      ],
      Europe: [
        { label: "High Loyalty", value: 46, color: "#ec4899" },
        { label: "Stable", value: 32, color: "#f472b6" },
        { label: "At Risk", value: 15, color: "#f9a8d4" },
        { label: "Churn Likely", value: 7, color: "#fbcfe8" },
      ],
      UK: [
        { label: "High Loyalty", value: 48, color: "#ec4899" },
        { label: "Stable", value: 33, color: "#f472b6" },
        { label: "At Risk", value: 13, color: "#f9a8d4" },
        { label: "Churn Likely", value: 6, color: "#fbcfe8" },
      ],
    },
    pedigree: {
      inputFeatures: ["Vehicle telematics (mileage, health alerts, driving patterns)", "App session frequency & duration", "Service history & satisfaction", "Retailer interaction logs", "NPS & CSAT scores"],
      outputType: "Composite Loyalty Score (0–100) + Churn Risk Flag",
      trainingDataSize: "2.8M customer journeys (84 months · 7 years)",
      refreshCadence: "Daily at 05:00 UTC",
      nextRunOffsetHours: 21,
      slaCompliance: "99.6%",
      modelType: "Ensemble (Random Forest + LSTM for temporal patterns)",
    },
    recommendations: {
      Global: [
        {
          title: "Proactive Churn Intervention — 412 At-Risk Customers",
          priority: "Immediate",
          actions: [
            "Deploy personalised retention outreach to 412 customers showing early churn indicators — app disengagement, delayed service visits, or NPS decline >15 points. Lead with a complimentary vehicle health check and InControl app re-onboarding.",
            "Assign dedicated Relationship Managers to the top 50 at-risk customers by lifetime value — personal touch reduces churn probability by 34% in pilot data.",
          ],
        },
        {
          title: "Loyalty Champions Programme",
          priority: "Short-term",
          actions: [
            "Identify the 2,840 high-loyalty customers and invite them to an exclusive 'JLR Insider' programme — early access to new models, factory tours, and driving experiences. High-loyalty customers generate 4.2× referral value.",
          ],
        },
        {
          title: "Telemetry-Driven Service Nudges",
          priority: "Strategic",
          actions: [
            "Use vehicle telemetry health signals to trigger proactive service outreach before issues manifest — 'We noticed your brake pads are at 15% — would you like us to book a convenient replacement appointment?' Pilot shows 28% uplift in service revenue and 12-point NPS improvement.",
          ],
        },
      ],
      "North America": [
        {
          title: "App Re-Engagement Campaign",
          priority: "Immediate",
          actions: [
            "1,120 NA owners with declining app engagement show 2.3× higher defection probability — launch an in-app reactivation campaign with exclusive content: vehicle tips, charging network updates for EV owners, and a 'reconnect' bonus of 3 months complimentary SiriusXM.",
            "Push notification sequence over 7 days with escalating value propositions — culminating in a personal Relationship Manager outreach for non-responders.",
          ],
        },
        {
          title: "Service Experience Excellence",
          priority: "Short-term",
          actions: [
            "NA CEI trails UK/EU by 5+ points — root cause analysis shows service wait times and communication gaps. Implement real-time service status updates via app and SMS for all NA retailers.",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH Loyalty Leadership",
          priority: "Immediate",
          actions: [
            "DACH region shows highest service touchpoint frequency and CEI scores — package this as a best-practice blueprint and roll out to Benelux and Nordics where scores lag by 4-6 points.",
            "Leverage the 94% positive vehicle health status in marketing: 'JLR vehicles are designed to keep you moving — see how our owners experience near-perfect reliability.'",
          ],
        },
        {
          title: "EV Owner Experience Track",
          priority: "Short-term",
          actions: [
            "Create a dedicated EV customer experience track within CEI — EV owners have unique needs (charging, range anxiety, software updates). Pilot an 'EV Concierge' service in Germany and France to drive loyalty in this strategically critical segment.",
          ],
        },
      ],
      UK: [
        {
          title: "Maximise UK Loyalty Leadership",
          priority: "Immediate",
          actions: [
            "UK leads global CEI at 82.1 — capitalise by launching a referral programme targeting the 89% monthly active app users. Offer £500 referral credit for both parties when a referral converts to a sale.",
            "89% app engagement is exceptional — use this channel for premium service offers, exclusive events, and Range Rover Electric pre-order priority.",
          ],
        },
        {
          title: "NPS-CEI Integration",
          priority: "Short-term",
          actions: [
            "UK shows strongest NPS-CEI correlation — embed real-time NPS feedback into the CEI model to create a 'sentiment pulse' that triggers immediate follow-up for any detractor response within 2 hours.",
          ],
        },
        {
          title: "Retailer Experience Certification",
          priority: "Strategic",
          actions: [
            "Certify UK retailers on a 'Customer Experience Excellence' standard based on CEI contribution metrics — top-performing retailers receive priority allocation on limited-edition models and marketing co-investment.",
          ],
        },
      ],
    },
  },
];

// ─── MISSIONS ────────────────────────────────────────────────────────────────

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
  currentVehicle: string;
  currentVariant: string;
  buybackEquity: string;
  renewalScore: number;
  upsellScore: number;
  cancellationRisk: string;
  leadScore: number;
  career: string;
  location: string;
  tenure: string;
  lifetimeValue: string;
  missionFitReason: string;
  recommendedAction: string;
  contactWindow: string;
  preferredChannel: string;
}

// ─── MISSION DATA ─────────────────────────────────────────────────────────────
// NOTE: targetCustomers per retailer MUST equal customers.length
// Global/regional targetCustomers MUST equal the sum of matching retailer targetCustomers

export const missions: Mission[] = [
  {
    id: "ev-equity-pivot",
    title: "The EV Equity-Swap Campaign",
    subtitle: "Convert high-equity PHEV/ICE owners to Range Rover Electric",
    priority: "Critical",
    // Revenue and customers distributed across regions to sum to $38M / 280 customers
    projectedRevenue: { Global: "$38.0M", "North America": "$18.2M", Europe: "$11.4M", UK: "£8.4M" },
    targetCustomers: { Global: 280, "North America": 134, Europe: 84, UK: 62 },
    conversionRate: { Global: "34%", "North America": "38%", Europe: "31%", UK: "36%" },
    sourceModels: ["buyback", "renewal", "upselling", "intelligent-lead", "customer-experience"],
    color: "#3b82f6",
    tagline: "Turn equity into EV ownership — before the window closes",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Buyback Model (v6.0.1)", finding: "5,640 vehicles with avg. +$4.2k positive equity; Defender PHEV commands +€5.1k over CAP HPI", weight: "High" },
        { model: "Renewal Model (v5.1.0)", finding: "750 Range Rover leases ending Q2 2026 with >$8k equity — 90-day critical window open", weight: "High" },
        { model: "Customer Experience Index (v2.1.0)", finding: "Target customers score 84+ on CEI with high app engagement — optimal for digital-first EV transition messaging", weight: "High" },
        { model: "Upselling Engine (v4.0.3)", finding: "I-Pace owners with >30k mi showing 0.86 propensity for Range Rover Electric pre-order", weight: "Medium" },
        { model: "Lead Scoring (v3.8.4)", finding: "62% of expiring-lease holders score ≥0.85 — top engagement percentile", weight: "Medium" },
      ],
      correlationStrength: "94.2%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Deploy a time-limited Equity Advantage Programme targeting PHEV/ICE owners within the 90-day equity window. Offer guaranteed trade-in at book value + equity premium as deposit credit toward Range Rover Electric first editions.",
      tactics: [
        "Personalised equity statement via InControl app push notification + email",
        "Retailer-led concierge home EV assessment & charger installation quote",
        "Priority allocation on Range Rover Electric launch allotment (Q3 2026)",
        "Finance rate preferential at 2.9% APR vs. standard 4.4% for new-to-EV switchers",
        "BMW iX / Mercedes EQE conquest offer: additional £1,500 / €1,750 loyalty bonus",
      ],
      timelineDaysFromNow: { launch: 11, close: 117 },
      expectedROI: "4.8x (12-month)",
    },
    retailers: [
      {
        id: "princeton-motors",
        name: "Princeton Motors",
        location: "Princeton, NJ 08540",
        region: "North America",
        tier: "Tier 1",
        missionFit: 96,
        targetCustomers: 3,
        projectedRevenue: "$0.31M",
        customers: [
          {
            id: "sudipto-s",
            name: "Sudipto S.",
            currentVehicle: "Range Rover PHEV",
            currentVariant: "Autobiography PHEV LWB 2022",
            buybackEquity: "+$4,200",
            renewalScore: 0.91,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.08)",
            leadScore: 0.94,
            career: "AI Technology Executive",
            location: "Princeton, NJ",
            tenure: "7 years / 3 vehicles",
            lifetimeValue: "$412,000",
            missionFitReason: "High equity PHEV + early EV adopter profile + active InControl app user + lease ends Jun 2026",
            recommendedAction: "Priority Range Rover Electric SV pre-order with Equity Advantage offer + home charger package",
            contactWindow: "Tuesday–Thursday 10am–2pm EST",
            preferredChannel: "In-app + Personal Relationship Manager",
          },
          {
            id: "eleanor-h",
            name: "Eleanor H.",
            currentVehicle: "Defender 110 PHEV",
            currentVariant: "X-Dynamic SE PHEV 2022",
            buybackEquity: "+$5,800",
            renewalScore: 0.87,
            upsellScore: 0.92,
            cancellationRisk: "Very Low (0.04)",
            leadScore: 0.96,
            career: "Private Equity Partner",
            location: "Morristown, NJ",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "$198,000",
            missionFitReason: "Highest equity position in cluster + finance-savvy buyer + configurator sessions on RR Electric SV",
            recommendedAction: "Defender Electric Edition preview + bespoke finance modelling with equity bridge",
            contactWindow: "Friday 9am–12pm EST (preferred)",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "raymond-j",
            name: "Raymond J.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P400e PHEV HSE 2021",
            buybackEquity: "+$6,100",
            renewalScore: 0.83,
            upsellScore: 0.79,
            cancellationRisk: "Low (0.12)",
            leadScore: 0.89,
            career: "Pharmaceutical Research Director",
            location: "Princeton Junction, NJ",
            tenure: "5 years / 2 vehicles",
            lifetimeValue: "$231,000",
            missionFitReason: "PHEV owner in equity window + InControl app active + EV configurator 2 sessions logged",
            recommendedAction: "Range Rover Electric Dynamic spec proposition + SEAI grant briefing + equity bridge finance",
            contactWindow: "Monday–Wednesday 11am–1pm EST",
            preferredChannel: "Email + Relationship Manager follow-up",
          },
        ],
      },
      {
        id: "manhattan-luxury",
        name: "Manhattan Luxury JLR",
        location: "New York, NY 10022",
        region: "North America",
        tier: "Tier 1",
        missionFit: 91,
        targetCustomers: 4,
        projectedRevenue: "$0.44M",
        customers: [
          {
            id: "marcus-t",
            name: "Marcus T.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P530 V8 First Edition 2021",
            buybackEquity: "+$8,400",
            renewalScore: 0.89,
            upsellScore: 0.85,
            cancellationRisk: "Low (0.11)",
            leadScore: 0.91,
            career: "Venture Capital Managing Director",
            location: "Upper East Side, NYC",
            tenure: "9 years / 4 vehicles",
            lifetimeValue: "$687,000",
            missionFitReason: "Highest equity in NY cluster; V8 downsizer profile aligns with EV performance narrative",
            recommendedAction: "Range Rover Electric SV Serenity spec with performance EV briefing + home charge installation",
            contactWindow: "Monday morning or weekend",
            preferredChannel: "Private Client Manager direct call",
          },
          {
            id: "sophia-k",
            name: "Sophia K.",
            currentVehicle: "Range Rover PHEV",
            currentVariant: "P440e SV LWB 2022",
            buybackEquity: "+$9,800",
            renewalScore: 0.92,
            upsellScore: 0.90,
            cancellationRisk: "Very Low (0.05)",
            leadScore: 0.95,
            career: "Investment Banking Managing Director",
            location: "Park Avenue, NYC",
            tenure: "8 years / 3 vehicles",
            lifetimeValue: "$824,000",
            missionFitReason: "Highest equity in Manhattan cluster; SV buyer + early adopter digital profile; EV interest on configurator",
            recommendedAction: "Range Rover Electric SV House of Imagination private preview + bespoke equity bridge proposal",
            contactWindow: "Wednesday 8–10am EST (preferred)",
            preferredChannel: "Personal Relationship Manager + in-app VIP notification",
          },
          {
            id: "alex-n",
            name: "Alex N.",
            currentVehicle: "Defender 110",
            currentVariant: "P400 X 2022",
            buybackEquity: "+$5,200",
            renewalScore: 0.78,
            upsellScore: 0.84,
            cancellationRisk: "Low (0.14)",
            leadScore: 0.88,
            career: "Tech Startup Founder",
            location: "Tribeca, NYC",
            tenure: "3 years / 1 vehicle",
            lifetimeValue: "$186,000",
            missionFitReason: "Young high-value buyer; Defender brand loyalist; sustainability focus — EV messaging resonates",
            recommendedAction: "Defender Electric Edition pre-order priority + green finance option at 2.9% APR",
            contactWindow: "Thursday evenings 6–8pm EST",
            preferredChannel: "Instagram DM + Relationship Manager",
          },
          {
            id: "vanessa-l",
            name: "Vanessa L.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P360 HSE Dynamic 2021",
            buybackEquity: "+$4,900",
            renewalScore: 0.81,
            upsellScore: 0.76,
            cancellationRisk: "Low (0.16)",
            leadScore: 0.87,
            career: "Fashion Industry Creative Director",
            location: "SoHo, NYC",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "$298,000",
            missionFitReason: "PCP due Q2; equity advantage confirmed; lifestyle-forward buyer responding to sustainability narrative",
            recommendedAction: "RR Sport Electric preview event at SoHo pop-up + personalised equity proposal via InControl",
            contactWindow: "Friday afternoons EST",
            preferredChannel: "Email + WhatsApp",
          },
        ],
      },
      {
        id: "beverly-hills-jlr",
        name: "Beverly Hills JLR",
        location: "Beverly Hills, CA 90210",
        region: "North America",
        tier: "Tier 1",
        missionFit: 88,
        targetCustomers: 3,
        projectedRevenue: "$0.34M",
        customers: [
          {
            id: "priya-m",
            name: "Priya M.",
            currentVehicle: "Range Rover Autobiography",
            currentVariant: "P530 LWB 2022",
            buybackEquity: "+$11,200",
            renewalScore: 0.93,
            upsellScore: 0.91,
            cancellationRisk: "Very Low (0.05)",
            leadScore: 0.97,
            career: "Entertainment Industry Executive",
            location: "Bel Air, CA",
            tenure: "11 years / 5 vehicles",
            lifetimeValue: "$1,140,000",
            missionFitReason: "Highest LTV in Western cluster; California EV incentives maximize equity conversion economics",
            recommendedAction: "RR Electric House of Imagination bespoke event invite + first allocation priority",
            contactWindow: "Weekday afternoons PST",
            preferredChannel: "Concierge Manager + InControl VIP push",
          },
          {
            id: "carlos-v",
            name: "Carlos V.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P530 V8 First Edition 2021",
            buybackEquity: "+$7,600",
            renewalScore: 0.86,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.10)",
            leadScore: 0.93,
            career: "Real Estate Developer",
            location: "Beverly Hills, CA",
            tenure: "6 years / 3 vehicles",
            lifetimeValue: "$512,000",
            missionFitReason: "CA ZEV mandate driver + high equity V8 owner; Range Rover Electric SV aligns with aspirational profile",
            recommendedAction: "Range Rover Electric SV test drive event at BH + CA Clean Vehicle Rebate briefing",
            contactWindow: "Saturday mornings PST",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "jennifer-w",
            name: "Jennifer W.",
            currentVehicle: "Defender 110 PHEV",
            currentVariant: "P400e HSE 2022",
            buybackEquity: "+$4,800",
            renewalScore: 0.80,
            upsellScore: 0.83,
            cancellationRisk: "Low (0.13)",
            leadScore: 0.90,
            career: "Tech Industry VP",
            location: "Pacific Palisades, CA",
            tenure: "3 years / 2 vehicles",
            lifetimeValue: "$284,000",
            missionFitReason: "PHEV buyer moving toward full EV; CA incentives + home charger already installed",
            recommendedAction: "Defender Electric Edition priority reservation + upgrade finance modelling",
            contactWindow: "Weekday mornings 9–11am PST",
            preferredChannel: "In-app push + email",
          },
        ],
      },
      {
        id: "knightsbridge-jlr",
        name: "Knightsbridge JLR",
        location: "London, SW1X 7LY",
        region: "UK",
        tier: "Tier 1",
        missionFit: 93,
        targetCustomers: 3,
        projectedRevenue: "£0.29M",
        customers: [
          {
            id: "oliver-b",
            name: "Oliver B.",
            currentVehicle: "Range Rover PHEV",
            currentVariant: "P440e SV Autobiography 2022",
            buybackEquity: "+£6,400",
            renewalScore: 0.90,
            upsellScore: 0.88,
            cancellationRisk: "Very Low (0.06)",
            leadScore: 0.93,
            career: "Private Equity Fund Manager",
            location: "Kensington, London",
            tenure: "9 years / 4 vehicles",
            lifetimeValue: "£748,000",
            missionFitReason: "Highest equity PHEV in UK cluster; Salary Sacrifice scheme eligible; InControl app power user",
            recommendedAction: "Range Rover Electric SV private preview at Knightsbridge + equity bridge + Salary Sacrifice modelling",
            contactWindow: "Thursday mornings GMT",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "charlotte-f",
            name: "Charlotte F.",
            currentVehicle: "Defender 110 PHEV",
            currentVariant: "X-Dynamic HSE P400e 2022",
            buybackEquity: "+£4,900",
            renewalScore: 0.85,
            upsellScore: 0.86,
            cancellationRisk: "Low (0.10)",
            leadScore: 0.91,
            career: "Barrister",
            location: "Chelsea, London",
            tenure: "5 years / 2 vehicles",
            lifetimeValue: "$312,000",
            missionFitReason: "PHEV Defender owner entering equity window; OZEV grant eligible; EV configurator engagement high",
            recommendedAction: "Defender Electric Edition priority allotment + home charger grant facilitation + equity bridge",
            contactWindow: "Friday afternoons GMT",
            preferredChannel: "Email + Personal Relationship Manager",
          },
          {
            id: "edward-c",
            name: "Edward C.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P400e PHEV HST 2021",
            buybackEquity: "+£5,200",
            renewalScore: 0.82,
            upsellScore: 0.80,
            cancellationRisk: "Low (0.13)",
            leadScore: 0.88,
            career: "Investment Management Director",
            location: "St John's Wood, London",
            tenure: "6 years / 3 vehicles",
            lifetimeValue: "$398,000",
            missionFitReason: "PCP contract ending May 2026; equity position confirmed; Salary Sacrifice-eligible employer",
            recommendedAction: "RR Sport Electric first look event + Salary Sacrifice employer partnership offer",
            contactWindow: "Wednesday evenings GMT",
            preferredChannel: "Personal Relationship Manager + WhatsApp",
          },
        ],
      },
      {
        id: "edinburgh-jlr",
        name: "JLR Edinburgh",
        location: "Edinburgh, EH3 9SR",
        region: "UK",
        tier: "Tier 2",
        missionFit: 81,
        targetCustomers: 2,
        projectedRevenue: "£0.18M",
        customers: [
          {
            id: "angus-m",
            name: "Angus M.",
            currentVehicle: "Defender 90",
            currentVariant: "P300 HSE 2021",
            buybackEquity: "+£3,800",
            renewalScore: 0.77,
            upsellScore: 0.81,
            cancellationRisk: "Low (0.15)",
            leadScore: 0.86,
            career: "Asset Management Partner",
            location: "Morningside, Edinburgh",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "£198,000",
            missionFitReason: "Equity position confirmed; Defender loyalist open to EV — Scotland BEV grant adds £3,500 on top",
            recommendedAction: "Defender Electric Edition preview + Scottish EV grant briefing + home charger partnership offer",
            contactWindow: "Tuesday evenings GMT",
            preferredChannel: "Phone + Email",
          },
          {
            id: "fiona-r",
            name: "Fiona R.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P400e PHEV Dynamic HSE 2022",
            buybackEquity: "+£4,100",
            renewalScore: 0.80,
            upsellScore: 0.78,
            cancellationRisk: "Low (0.17)",
            leadScore: 0.85,
            career: "Tech Entrepreneur",
            location: "Stockbridge, Edinburgh",
            tenure: "3 years / 1 vehicle",
            lifetimeValue: "£152,000",
            missionFitReason: "PHEV owner; sustainability focus; OZEV & Scottish grant eligible; configurator engagement noted",
            recommendedAction: "RR Electric Sport Dynamic spec + full EV cost benefit analysis including Scottish grants",
            contactWindow: "Monday mornings GMT",
            preferredChannel: "Email + in-app notification",
          },
        ],
      },
    ],
  },
  {
    id: "loyalty-recovery",
    title: "The Loyalty Recovery Mission",
    subtitle: "Re-engage high-value churned & at-risk owners before competitor conquest",
    priority: "High",
    // Revenue and customers distributed across regions to sum to $18M / 170 customers
    projectedRevenue: { Global: "$18.0M", "North America": "$7.2M", Europe: "$6.3M", UK: "£4.5M" },
    targetCustomers: { Global: 170, "North America": 68, Europe: 60, UK: 42 },
    conversionRate: { Global: "28%", "North America": "32%", Europe: "25%", UK: "30%" },
    sourceModels: ["cancellation", "lead-scoring", "service-retention", "renewal", "customer-experience"],
    color: "#f59e0b",
    tagline: "Recover the relationship before the competitor does",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Cancellation Model (v2.9.2)", finding: "412 high-risk orders; 68% linked to delivery delays >12 weeks — intervention window active", weight: "High" },
        { model: "Service Retention (v3.3.7)", finding: "1,240 post-warranty vehicles predicted to defect to independents in next 90 days", weight: "High" },
        { model: "Customer Experience Index (v2.1.0)", finding: "Early churn indicators detected in 170 customers with CEI decline >12 points — app disengagement precedes defection by 45 days", weight: "High" },
        { model: "Lead Scoring (v3.8.4)", finding: "380 previously churned owners re-engaging on digital channels with score uplift of +0.22", weight: "Medium" },
        { model: "Renewal Model (v5.1.0)", finding: "EU lease holders showing -1.2% renewal trend, risk of Audi/BMW conquest intensifying", weight: "Medium" },
      ],
      correlationStrength: "87.6%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Deploy a white-glove recovery programme for high-LTV customers showing defection signals. Lead with service excellence and proactive solutions to the pain points identified by the Cancellation Model.",
      tactics: [
        "Personal apology call from Regional Director for delivery-delay affected customers",
        "Extended warranty upgrade (3yr/unlimited) as goodwill gesture for 87+ NPS recovery",
        "Post-warranty EliteCare protection plan at preferential rates (30% discount)",
        "Loyalty Companion event: driving experience at Eastnor Castle / Biltmore Estate",
        "Competitor conquest defence: £750 / $1,000 loyalty credit for customers viewing BMW/Audi",
      ],
      timelineDaysFromNow: { launch: 23, close: 113 },
      expectedROI: "3.2x (18-month)",
    },
    retailers: [
      {
        id: "chicago-gold-coast",
        name: "Gold Coast JLR",
        location: "Chicago, IL 60611",
        region: "North America",
        tier: "Tier 1",
        missionFit: 89,
        targetCustomers: 1,
        projectedRevenue: "$0.20M",
        customers: [
          {
            id: "david-r",
            name: "David R.",
            currentVehicle: "Range Rover Sport",
            currentVariant: "P400e PHEV 2023 (On Order)",
            buybackEquity: "N/A (on order)",
            renewalScore: 0.61,
            upsellScore: 0.72,
            cancellationRisk: "High (0.76)",
            leadScore: 0.82,
            career: "Corporate Attorney",
            location: "Lincoln Park, Chicago",
            tenure: "3 years / 1 vehicle",
            lifetimeValue: "$128,000",
            missionFitReason: "Delivery delay 14 weeks; NPS score dropped from 82 to 31; competitor showroom visit detected",
            recommendedAction: "Director-level personal outreach + delivery acceleration + complimentary loaner provision",
            contactWindow: "Evenings 6–8pm CST",
            preferredChannel: "Direct mobile + WhatsApp",
          },
        ],
      },
      {
        id: "london-mayfair",
        name: "Mayfair JLR",
        location: "London, W1K 6TF",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 92,
        targetCustomers: 2,
        projectedRevenue: "£0.18M",
        customers: [
          {
            id: "james-w",
            name: "James W.",
            currentVehicle: "Range Rover Autobiography",
            currentVariant: "P530 LWB 2020",
            buybackEquity: "+£3,100",
            renewalScore: 0.58,
            upsellScore: 0.79,
            cancellationRisk: "Medium (0.54)",
            leadScore: 0.78,
            career: "Investment Banking MD",
            location: "Knightsbridge, London",
            tenure: "6 years / 3 vehicles",
            lifetimeValue: "£548,000",
            missionFitReason: "Post-warranty defection risk; BMW 7 Series configurator session detected; concierge-tier LTV",
            recommendedAction: "Mayfair boutique private viewing of RR Electric + EliteCare Plus + bespoke finance restructure",
            contactWindow: "Thursday afternoons GMT",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "isabelle-d",
            name: "Isabelle D.",
            currentVehicle: "Range Rover Velar",
            currentVariant: "P400e HSE Dynamic 2021",
            buybackEquity: "+£2,800",
            renewalScore: 0.62,
            upsellScore: 0.74,
            cancellationRisk: "Medium (0.48)",
            leadScore: 0.80,
            career: "Luxury Brand Director",
            location: "Belgravia, London",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "£224,000",
            missionFitReason: "NPS dip detected post-delivery; Audi e-tron digital engagement noted; loyalty window open",
            recommendedAction: "Velar S upgrade proposition + 90-day loyalty hold offer + personalised service excellence call",
            contactWindow: "Tuesday mornings GMT",
            preferredChannel: "Email + Personal Relationship Manager",
          },
        ],
      },
      {
        id: "birmingham-jlr",
        name: "JLR Birmingham Solihull",
        location: "Birmingham, B92 8NW",
        region: "UK",
        tier: "Tier 1",
        missionFit: 84,
        targetCustomers: 2,
        projectedRevenue: "£0.14M",
        customers: [
          {
            id: "raj-p",
            name: "Raj P.",
            currentVehicle: "Discovery Sport",
            currentVariant: "P200 R-Dynamic HSE 2023 (On Order)",
            buybackEquity: "N/A (on order)",
            renewalScore: 0.63,
            upsellScore: 0.70,
            cancellationRisk: "High (0.71)",
            leadScore: 0.79,
            career: "Manufacturing Business Owner",
            location: "Edgbaston, Birmingham",
            tenure: "5 years / 2 vehicles",
            lifetimeValue: "£148,000",
            missionFitReason: "Order 13 weeks delayed; NPS decline 74 to 38; competitor BMW X3 test drive detected",
            recommendedAction: "Regional Director call + expedited delivery slot + complimentary extended warranty offer",
            contactWindow: "Monday evenings GMT",
            preferredChannel: "Direct phone + Email",
          },
          {
            id: "sarah-t",
            name: "Sarah T.",
            currentVehicle: "Range Rover Evoque",
            currentVariant: "P200 S 2020",
            buybackEquity: "+£1,900",
            renewalScore: 0.55,
            upsellScore: 0.68,
            cancellationRisk: "Medium (0.52)",
            leadScore: 0.76,
            career: "HR Director",
            location: "Moseley, Birmingham",
            tenure: "3 years / 1 vehicle",
            lifetimeValue: "£92,000",
            missionFitReason: "Post-warranty approaching; Volvo XC40 comparison research detected; loyalty incentive window open",
            recommendedAction: "EliteCare protection plan + loyalty upgrade incentive toward Discovery Sport + complimentary service",
            contactWindow: "Wednesday lunchtime GMT",
            preferredChannel: "Email + SMS",
          },
        ],
      },
    ],
  },
  {
    id: "defender-performance-drive",
    title: "Defender Performance Drive",
    subtitle: "Convert Defender Sport owners to Defender OCTA & 110 V8 Performance editions",
    priority: "Strategic",
    // Revenue and customers distributed across regions to sum to $16.2M / 148 customers
    projectedRevenue: { Global: "$16.2M", "North America": "$6.8M", Europe: "$5.4M", UK: "£4.0M" },
    targetCustomers: { Global: 148, "North America": 62, Europe: 50, UK: 36 },
    conversionRate: { Global: "31%", "North America": "36%", Europe: "27%", UK: "33%" },
    sourceModels: ["upselling", "intelligent-lead", "lead-scoring", "buyback", "customer-experience"],
    color: "#8b5cf6",
    tagline: "From capability to conquest — the performance step-up",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Upselling Engine (v4.0.3)", finding: "Defender 90 owners showing 0.74 propensity for 110 MHEV upgrade; SUV demand at 6-yr high", weight: "High" },
        { model: "Intelligent Lead (v4.2.1)", finding: "BMW X5M & Mercedes AMG GLE owners displaying 0.68 conquest affinity toward Defender OCTA", weight: "High" },
        { model: "Customer Experience Index (v2.1.0)", finding: "Performance-focused customers show 92+ CEI scores with highest retailer touchpoint frequency — ideal for exclusive event activation", weight: "High" },
        { model: "Buyback Model (v6.0.1)", finding: "Defender 90 2021/22 models at +$5.8k avg equity — optimal trade-in economics for OCTA step-up", weight: "Medium" },
        { model: "Lead Scoring (v3.8.4)", finding: "Performance-persona segment scoring ≥0.88 concentrated in TX, FL, CO, UAE & South Africa", weight: "Medium" },
      ],
      correlationStrength: "91.3%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Target high-equity Defender Sport & 90 owners with a Defender OCTA and 110 V8 Performance Edition off-road experience event. Leverage the scarcity narrative (limited allotments) with a priority reservation window to drive urgency.",
      tactics: [
        "Invitation-only Defender OCTA 'Capability Unleashed' driving experience at Monument Valley & Nürburgring",
        "Guaranteed trade-in equity preservation for 90 days during test period",
        "Performance Pack financing: 0% APR for 24 months as launch incentive",
        "Defender OCTA customisation studio access (Commission programme, 6-week lead time)",
        "Conquest activation: AMG GLE-ML owners via precision digital targeting campaign",
      ],
      timelineDaysFromNow: { launch: 27, close: 207 },
      expectedROI: "5.1x (18-month)",
    },
    retailers: [
      {
        id: "dallas-premium",
        name: "Park Place JLR Dallas",
        location: "Dallas, TX 75201",
        region: "North America",
        tier: "Tier 1",
        missionFit: 94,
        targetCustomers: 2,
        projectedRevenue: "$0.15M",
        customers: [
          {
            id: "blake-c",
            name: "Blake C.",
            currentVehicle: "Defender 90",
            currentVariant: "First Edition V8 2022",
            buybackEquity: "+$6,800",
            renewalScore: 0.84,
            upsellScore: 0.94,
            cancellationRisk: "Very Low (0.06)",
            leadScore: 0.93,
            career: "Energy Sector CEO",
            location: "Highland Park, Dallas",
            tenure: "5 years / 2 vehicles",
            lifetimeValue: "$294,000",
            missionFitReason: "V8 enthusiast profile + off-road active user + high equity + OCTA configurator session 3 times",
            recommendedAction: "OCTA priority reservation + Monument Valley event invite + Commission spec studio booking",
            contactWindow: "Saturday mornings CST",
            preferredChannel: "Relationship Manager + event invite",
          },
          {
            id: "hunter-b",
            name: "Hunter B.",
            currentVehicle: "Defender 110",
            currentVariant: "P525 V8 Carpathian Edition 2021",
            buybackEquity: "+$7,400",
            renewalScore: 0.80,
            upsellScore: 0.91,
            cancellationRisk: "Low (0.09)",
            leadScore: 0.90,
            career: "Private Equity Principal",
            location: "Preston Hollow, Dallas",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "$328,000",
            missionFitReason: "V8 Carpathian owner; equity premium confirmed; OCTA social engagement + comparison research against Wrangler 392",
            recommendedAction: "OCTA Capability Unleashed invite + 0% APR financing proposition + priority commission allocation",
            contactWindow: "Friday afternoons CST",
            preferredChannel: "Direct Relationship Manager call",
          },
        ],
      },
      {
        id: "munich-jlr",
        name: "JLR Munich Prestige",
        location: "Munich, Bavaria 80331",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 87,
        targetCustomers: 2,
        projectedRevenue: "€0.22M",
        customers: [
          {
            id: "thomas-k",
            name: "Thomas K.",
            currentVehicle: "Defender 110",
            currentVariant: "P400e PHEV X 2022",
            buybackEquity: "+€4,900",
            renewalScore: 0.79,
            upsellScore: 0.89,
            cancellationRisk: "Low (0.14)",
            leadScore: 0.88,
            career: "Automotive Tier-1 Supplier CTO",
            location: "Schwabing, Munich",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "€218,000",
            missionFitReason: "Tech-automotive professional; OCTA social media engagement high; BMW X5M comparison research detected",
            recommendedAction: "Nürburgring OCTA drive experience + German engineering showcase narrative",
            contactWindow: "Wednesday 7–9pm CET",
            preferredChannel: "Email + LinkedIn InMail",
          },
          {
            id: "henrik-s",
            name: "Henrik S.",
            currentVehicle: "Defender 90",
            currentVariant: "P300 S 2022",
            buybackEquity: "+€3,700",
            renewalScore: 0.74,
            upsellScore: 0.82,
            cancellationRisk: "Low (0.18)",
            leadScore: 0.85,
            career: "Engineering Consultant",
            location: "Maxvorstadt, Munich",
            tenure: "3 years / 1 vehicle",
            lifetimeValue: "€142,000",
            missionFitReason: "Defender 90 owner in equity window; Nürburgring enthusiast; AMG GLE comparison search logged",
            recommendedAction: "OCTA Nürburgring driving event invitation + performance pack financing at 0% APR",
            contactWindow: "Thursday evenings CET",
            preferredChannel: "Email + phone",
          },
        ],
      },
      {
        id: "manchester-jlr",
        name: "JLR Manchester Deansgate",
        location: "Manchester, M3 4LQ",
        region: "UK",
        tier: "Tier 1",
        missionFit: 85,
        targetCustomers: 2,
        projectedRevenue: "£0.12M",
        customers: [
          {
            id: "liam-o",
            name: "Liam O.",
            currentVehicle: "Defender 90",
            currentVariant: "P400 First Edition 2022",
            buybackEquity: "+£4,600",
            renewalScore: 0.82,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.11)",
            leadScore: 0.90,
            career: "Media Production Company Owner",
            location: "Alderley Edge, Cheshire",
            tenure: "4 years / 2 vehicles",
            lifetimeValue: "£241,000",
            missionFitReason: "Defender 90 in equity window; OCTA social engagement confirmed; off-road lifestyle profile",
            recommendedAction: "OCTA Capability Unleashed Wales driving event + Commission programme studio visit",
            contactWindow: "Weekends CST / Saturday preferred",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "natasha-b",
            name: "Natasha B.",
            currentVehicle: "Defender 110",
            currentVariant: "P400 HSE 2021",
            buybackEquity: "+£5,100",
            renewalScore: 0.76,
            upsellScore: 0.84,
            cancellationRisk: "Low (0.15)",
            leadScore: 0.87,
            career: "Consultant Surgeon",
            location: "Hale Barns, Cheshire",
            tenure: "3 years / 1 vehicle",
            lifetimeValue: "£196,000",
            missionFitReason: "Defender 110 in equity window; OCTA curiosity signals online; Mercedes G-Wagen comparison search noted",
            recommendedAction: "OCTA reservation priority + 90-day equity preservation guarantee + 0% APR finance",
            contactWindow: "Sunday mornings GMT",
            preferredChannel: "Email + WhatsApp",
          },
        ],
      },
    ],
  },
];

// ─── REASONING ENGINE ─────────────────────────────────────────────────────────

export const reasoningSteps = [
  { id: 1, text: "Initialising Meridian Intelligence Engine v3.4...", delay: 0, models: [] },
  { id: 2, text: "Querying Buyback Model (v6.0.1)... 5,640 positive-equity vehicles identified", delay: 700, models: ["buyback"] },
  { id: 3, text: "Accessing Renewal Model (v5.1.0)... 8,912 high-equity leases flagged for Q2 2026", delay: 1400, models: ["buyback", "renewal"] },
  { id: 4, text: "Cross-referencing Lead Scoring (v3.8.4)... 3,247 leads at ≥0.85 priority threshold", delay: 2100, models: ["buyback", "renewal", "lead-scoring"] },
  { id: 5, text: "Correlating Upselling Engine (v4.0.3)... £12.8M / $84.2M revenue opportunity scoped", delay: 2800, models: ["buyback", "renewal", "lead-scoring", "upselling"] },
  { id: 6, text: "Integrating Cancellation Risk (v2.9.2)... 412 high-risk orders flagged for intervention", delay: 3500, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation"] },
  { id: 7, text: "Factoring Service Retention signals (v3.3.7)... 1,840 retention opportunities mapped", delay: 4200, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention"] },
  { id: 8, text: "Layering Intelligent Lead personas (v4.2.1)... conquest affinity overlaid across UK, NA & EU", delay: 4900, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead"] },
  { id: 9, text: "Synthesising Customer Experience Index (v2.1.0)... 2,840 high-loyalty + 412 churn-risk customers scored", delay: 5600, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 10, text: "Running mission synthesis algorithm... pattern recognition active", delay: 6300, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 11, text: "Clustering customer segments by mission fit... 3 high-confidence missions identified", delay: 7000, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 12, text: "Validating revenue projections against historical conversion rates...", delay: 7700, models: [] },
  { id: 13, text: "Mission synthesis complete. 3 actionable missions generated. Combined revenue: $72.2M across 598 qualified customers", delay: 8400, models: [] },
];

export const connectionMap: Record<string, string[]> = {
  "ev-equity-pivot": ["buyback", "renewal", "upselling", "intelligent-lead", "customer-experience"],
  "loyalty-recovery": ["cancellation", "lead-scoring", "service-retention", "renewal", "customer-experience"],
  "defender-performance-drive": ["upselling", "intelligent-lead", "lead-scoring", "buyback", "customer-experience"],
};
