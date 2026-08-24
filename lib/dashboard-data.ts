// Vantage Packaging Global Analytics Dashboard — Contextual Data Layer
// Enriched with real-world packaging & CPG manufacturing market intelligence

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
    title: "Intelligent Account Identification",
    shortTitle: "Intelligent Account ID",
    lifecycle: "Acquire",
    metric: "High Intent Accounts",
    metricValue: { Global: "14,820", "North America": "6,340", Europe: "5,910", UK: "2,570" },
    metricDelta: { Global: "+12.4%", "North America": "+18.2%", Europe: "+7.6%", UK: "+14.1%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "Identified 2,140 conquest accounts from Sonoco & Berry Global incumbent contracts showing Vantage sustainability-affinity signals",
      "North America": "Regional co-packers currently on rigid HDPE trending toward Vantage recyclable mono-material pouches with 0.78 conversion propensity",
      Europe: "Mondi-supplied FMCG brands in the DACH region displaying strong consideration signals for Vantage barrier-film laminates via procurement portal activity",
      UK: "2,570 UK accounts identified; Smurfit WestRock & Crown Holdings incumbent brand owners in SE England showing 0.82 affinity for Vantage fibre-based closures — highest in portfolio",
    },
    dataSources: ["Salesforce CRM", "Customer Portal Analytics", "Google Analytics 4", "LinkedIn Sales Navigator", "Vantage Connect Portal"],
    lastRunOffsetHours: -2,
    modelVersion: "v4.2.1",
    accuracy: 87,
    signals: [
      { name: "Digital RFP & spec-sheet intent", strength: 91 },
      { name: "Trade show & industry-event engagement", strength: 88 },
      { name: "Incumbent supplier contract-expiry overlap", strength: 84 },
      { name: "Geo-industry cluster index", strength: 79 },
      { name: "Sustainability commitment proxy", strength: 73 },
    ],
    color: "#3b82f6",
    icon: "Users",
    regionalDistribution: {
      Global: [
        { label: "Flexible Packaging", value: 38, color: "#3b82f6" },
        { label: "Rigid Containers", value: 28, color: "#60a5fa" },
        { label: "Closures & Dispensing", value: 18, color: "#93c5fd" },
        { label: "Specialty Cartons", value: 16, color: "#bfdbfe" },
      ],
      "North America": [
        { label: "Rigid Containers", value: 42, color: "#3b82f6" },
        { label: "Flexible Packaging", value: 31, color: "#60a5fa" },
        { label: "Closures & Dispensing", value: 15, color: "#93c5fd" },
        { label: "Specialty Cartons", value: 12, color: "#bfdbfe" },
      ],
      Europe: [
        { label: "Flexible Packaging", value: 44, color: "#3b82f6" },
        { label: "Barrier Films", value: 29, color: "#60a5fa" },
        { label: "Rigid Containers", value: 18, color: "#93c5fd" },
        { label: "Specialty Cartons", value: 9, color: "#bfdbfe" },
      ],
      UK: [
        { label: "Flexible Packaging", value: 46, color: "#3b82f6" },
        { label: "Closures & Dispensing", value: 30, color: "#60a5fa" },
        { label: "Rigid Containers", value: 16, color: "#93c5fd" },
        { label: "Specialty Cartons", value: 8, color: "#bfdbfe" },
      ],
    },
    pedigree: {
      inputFeatures: ["Digital spec-sheet & RFP signals", "Trade show engagement", "Incumbent contract data", "Geo-industry cluster index", "Sustainability scoring"],
      outputType: "Account Propensity Score (0–1) + Product Line Affinity Rank",
      trainingDataSize: "4.2M account interactions (120 months · 10 years)",
      refreshCadence: "Daily at 06:00 UTC",
      nextRunOffsetHours: 22,
      slaCompliance: "99.8%",
      modelType: "Gradient Boosted Trees (XGBoost) + Collaborative Filtering",
    },
    recommendations: {
      Global: [
        {
          title: "Activate Conquest Account Sequencing",
          priority: "Immediate",
          actions: [
            "Deploy a 3-touch personalised outreach sequence to 2,140 Sonoco/Berry Global conquest accounts within 48 hrs — lead with the recyclable mono-material pouch and lightweight closure value proposition.",
            "Suppress accounts with propensity score <0.55 from paid demand-gen to reduce cost-per-qualified-account by an estimated 22%.",
            "Brief all regional account teams on the top 50 conquest accounts per market via daily Salesforce digest.",
          ],
        },
        {
          title: "Enhance Signal Capture Across Digital Touchpoints",
          priority: "Short-term",
          actions: [
            "Integrate Vantage Design Studio session-depth events into the model feature pipeline to improve affinity scoring for bespoke structure requests.",
            "Activate LinkedIn Campaign Manager conversion events on spec-sheet download and sustainability calculator pages to enrich upper-funnel account profiles.",
          ],
        },
        {
          title: "Expand Model to Private Label & Co-Packer Segment",
          priority: "Strategic",
          actions: [
            "Extend the propensity model to cover the private-label / co-packer segment — an untapped pool estimated at 3,800 contract-renewal prospects globally.",
            "Partner with Nielsen/IRI category spend data to include shelf-share shifts as a leading indicator of packaging spec change.",
          ],
        },
      ],
      "North America": [
        {
          title: "Rigid-to-Flexible Conquest Push",
          priority: "Immediate",
          actions: [
            "Activate targeted demand-gen against 1,480 regional co-packers currently on rigid HDPE showing conversion score ≥0.78 — focus on Texas, Colorado, and Pacific Northwest food & beverage clusters.",
            "Arm account teams with a bespoke trial-run offer showing 'Weight & Carbon Reduction' head-to-head data versus incumbent rigid format.",
          ],
        },
        {
          title: "Plant-Level Account Prioritisation Playbook",
          priority: "Short-term",
          actions: [
            "Distribute weekly ranked account lists to the top 15 NA plants with recommended outreach scripts segmented by propensity tier (Tier 1: ≥0.85, Tier 2: 0.70–0.84).",
            "Introduce 48-hour contact SLA tracking in Salesforce to correlate response speed with conversion rate.",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH Mondi-Supplied Account Activation",
          priority: "Immediate",
          actions: [
            "Launch a localised barrier-film laminate campaign in Germany, Austria, and Switzerland targeting 890 FMCG accounts flagged with ≥0.72 consideration signal.",
            "Co-ordinate with the DACH account network to offer a plant-visit sustainability audit — proven +18% conversion lift for this segment.",
          ],
        },
        {
          title: "Recyclable Format Transition Nurturing",
          priority: "Short-term",
          actions: [
            "Build a dedicated recyclable-format nurture track in HubSpot for 1,200 European prospects showing pre-interest signals — include EPR compliance content, recyclate cost calculator, and material-testing partnership offer.",
          ],
        },
      ],
      UK: [
        {
          title: "SE England Fibre Closure Conquest Sprint",
          priority: "Immediate",
          actions: [
            "Activate targeted account-based marketing against 680 brand owners in Surrey, Berkshire, and Hertfordshire currently on plastic closures — highest affinity cluster in UK portfolio at 0.82.",
            "Include a personalised Plastic Packaging Tax cost comparison (fibre closure vs. incumbent) as the primary value lever.",
          ],
        },
        {
          title: "Vantage Connect Portal Activation for Account Nurturing",
          priority: "Short-term",
          actions: [
            "Trigger personalised spec-migration content within the Vantage Connect customer portal for existing accounts showing fibre-closure affinity signals — portal engagement shows 2.4× higher conversion vs. outbound email for UK segment.",
            "Add a 'Request a plant trial run' CTA to the portal notification for the top 300 high-scoring UK accounts.",
          ],
        },
        {
          title: "Northern England Market Expansion",
          priority: "Strategic",
          actions: [
            "Current UK account concentration is 78% South of England. Model data identifies 420 under-served prospects in Manchester, Leeds, and Edinburgh — invest in an account-team incentive programme to develop the Northern UK pipeline.",
          ],
        },
      ],
    },
  },
  {
    id: "lead-scoring",
    title: "Account Scoring & Prioritisation",
    shortTitle: "Account Scoring",
    lifecycle: "Acquire",
    metric: "High-Priority Score (≥0.85)",
    metricValue: { Global: "3,247", "North America": "1,412", Europe: "1,108", UK: "727" },
    metricDelta: { Global: "+8.7%", "North America": "+14.3%", Europe: "+5.1%", UK: "+11.2%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "3,247 prospects scored ≥0.85 — account team contact within 48hrs correlates to 34% higher win rate vs. baseline",
      "North America": "Beverage, dairy, and personal-care clusters yielding highest conversion rates for high-barrier flexible laminates",
      Europe: "Germany, Benelux & DACH clusters showing disproportionate interest in recyclable rigid formats; EPR-compliant spec preference at 61%",
      UK: "727 UK accounts at ≥0.85; South East food & beverage clusters lead — fibre-based closure intent at 74%",
    },
    dataSources: ["SAP S/4HANA", "Salesforce Sales Cloud", "MES Production Data", "Nielsen/IRI Category Data"],
    lastRunOffsetHours: -1,
    modelVersion: "v3.8.4",
    accuracy: 91,
    signals: [
      { name: "Enquiry recency & frequency", strength: 94 },
      { name: "Design studio engagement depth", strength: 92 },
      { name: "Sample & trial-run history", strength: 89 },
      { name: "Credit pre-approval status", strength: 87 },
      { name: "Category growth proxy", strength: 82 },
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
      inputFeatures: ["Enquiry recency & frequency", "Design studio engagement depth", "Sample & trial-run history", "Credit pre-approval status", "Category growth proxy"],
      outputType: "Priority Score (0–1) + Urgency Flag",
      trainingDataSize: "1.8M qualified accounts (120 months · 10 years)",
      refreshCadence: "Every 6 hours",
      nextRunOffsetHours: 4,
      slaCompliance: "99.5%",
      modelType: "Random Forest Ensemble + Logistic Regression blend",
    },
    recommendations: {
      Global: [
        {
          title: "48-Hour Contact Protocol for Tier 1 Accounts",
          priority: "Immediate",
          actions: [
            "Enforce a 48-hour account-team contact SLA for all 1,006 accounts scored ≥0.90 globally — data shows win probability drops 34% after 72 hours with no contact.",
            "Trigger automated email + task from the assigned account manager the moment an account enters Tier 1 (≥0.90) to maintain a premium, responsive feel.",
            "Flag Tier 1 accounts in Salesforce with a 'priority' indicator visible on plant dashboards — remove from general pipeline rotation.",
          ],
        },
        {
          title: "Score Decay Monitoring",
          priority: "Short-term",
          actions: [
            "Implement weekly score-decay alerts for accounts that have dropped from ≥0.85 to <0.70 without a recorded contact attempt — these represent avoidable pipeline losses.",
            "Route decayed accounts to a re-engagement nurture sequence rather than removal, preserving approximately 18% of the dropped pool based on historical data.",
          ],
        },
        {
          title: "Predictive Score Integration into MES/ERP",
          priority: "Strategic",
          actions: [
            "Integrate the priority score directly into SAP S/4HANA so account managers see the score alongside enquiry details — reducing friction from switching between systems.",
          ],
        },
      ],
      "North America": [
        {
          title: "Category Cluster Fast-Track Programme",
          priority: "Immediate",
          actions: [
            "Beverage, dairy, and personal-care clusters account for 38% of NA Tier 1 accounts — assign dedicated key-account specialists to these categories for white-glove outreach.",
            "Coordinate bespoke plant-tour and sustainability briefing sessions within the next 30 days to convert highest-score accounts.",
          ],
        },
        {
          title: "Credit Pre-Approval Fast Path",
          priority: "Short-term",
          actions: [
            "38% of NA Tier 1 accounts have a credit pre-approval signal — fast-track these to a same-day commercial proposal, compressing the sales cycle by an estimated 8 days.",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH & Benelux Priority Engagement",
          priority: "Immediate",
          actions: [
            "727 European Tier 1 accounts are concentrated in Germany, the Netherlands, and Belgium — brief local account teams on bespoke outreach with EPR-compliance messaging given 61% preference rate for recyclable rigid formats.",
            "Deploy German and French-language personalised briefing decks from the regional commercial director to the top 50 scored accounts in each market.",
          ],
        },
        {
          title: "EPR-Compliant Spec Routing",
          priority: "Short-term",
          actions: [
            "61% of European Tier 1 accounts indicate a preference for EPR-compliant specs — route these to sustainability-certified account consultants to ensure they receive accurate recyclate content, EPR fee, and design-for-recycling guidance.",
          ],
        },
      ],
      UK: [
        {
          title: "South East Priority Account Outreach",
          priority: "Immediate",
          actions: [
            "254 UK Tier 1 accounts are concentrated in the South East showing fibre-closure intent at 74% — assign to senior account managers and trigger a bespoke plant-visit invitation.",
            "Schedule a materials & structure design consultation at the Vantage Innovation Centre for the top 40 scored accounts within 2 weeks.",
          ],
        },
        {
          title: "Plastic Packaging Tax Messaging",
          priority: "Short-term",
          actions: [
            "72% of UK Tier 1 accounts are exposed to Plastic Packaging Tax thresholds — include a personalised PPT cost comparison table in the first outreach email, as this is the primary financial motivator for UK brand owners.",
          ],
        },
        {
          title: "Score Model Refresh with HMRC PPT Data",
          priority: "Strategic",
          actions: [
            "Partner with Vantage Financial Services to incorporate HMRC Plastic Packaging Tax filing signals into the UK scoring model — projected accuracy improvement from 91% to 93.5% based on back-testing.",
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
    metric: "High-Value Contracts Ending Q2 2026",
    metricValue: { Global: "8,912", "North America": "4,210", Europe: "3,180", UK: "1,522" },
    metricDelta: { Global: "+3.2%", "North America": "+6.8%", Europe: "-1.2%", UK: "+4.8%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "down", UK: "up" },
    insightSummary: {
      Global: "750 flexible-packaging supply contracts with >$8k monthly margin upside ending in 90 days; early-renewal incentive window active",
      "North America": "4,210 contracts ending Q2 2026 — 62% showing proactive renewal intent; avg. margin upside $9,240",
      Europe: "3,180 EU contracts; recyclate-content incentive creates strong upsell window toward mono-material laminate migration",
      UK: "1,522 UK supply agreements ending Q2 2026; EPR fee relief + recycled-content tax credit driving spec-upgrade intent at 58%",
    },
    dataSources: ["Vantage Financial Services", "SAP BRIM", "Contract Lifecycle Management", "HMRC Filings"],
    lastRunOffsetHours: -10,
    modelVersion: "v5.1.0",
    accuracy: 89,
    signals: [
      { name: "Contract margin position", strength: 93 },
      { name: "Contract maturity proximity", strength: 91 },
      { name: "Recyclable-format transition intent", strength: 86 },
      { name: "Repeat-order history", strength: 83 },
      { name: "Commercial terms alignment", strength: 76 },
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
      inputFeatures: ["Contract end date", "Margin position vs. market", "Volume trajectory", "Service/quality history score", "Repeat-order probability"],
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
          title: "90-Day Margin Window Activation",
          priority: "Immediate",
          actions: [
            "Contact all 750 flexible-packaging accounts with >$8k monthly margin upside and contract ending within 90 days — offer a guaranteed rate-lock figure valid for 21 days to create urgency.",
            "Personalise outreach with the account's exact margin position ('Your current program has $X in identified savings versus your existing rate') — this single message element has shown a 41% uplift in renewal intent in A/B tests.",
            "Assign one dedicated renewal specialist per plant to own these 750 accounts end-to-end, preventing cross-sell distraction.",
          ],
        },
        {
          title: "Early Renewal Incentive Tiering",
          priority: "Short-term",
          actions: [
            "Introduce a three-tier renewal incentive: renew 90+ days early (freight credit), 60–89 days (tooling-change waiver), 30–59 days (complimentary trial-run). Model predicts 28% of renewals can be pulled forward, improving order-book visibility.",
          ],
        },
        {
          title: "Repeat-Account Loyalty Scoring Integration",
          priority: "Strategic",
          actions: [
            "Integrate the renewal model output with the upselling engine to identify the subset of renewing accounts who also qualify for a spec upgrade — estimated 22% overlap, worth an average +$12k incremental annual revenue per account.",
          ],
        },
      ],
      "North America": [
        {
          title: "Q2 2026 Contract Maturity Blitz",
          priority: "Immediate",
          actions: [
            "4,210 NA contracts ending Q2 2026 with 62% showing proactive renewal intent — segment into three groups: (A) recyclable-format switchers → mono-material pathway, (B) hybrid retainers → partial recyclate upgrade, (C) format loyalists → current-spec renewal.",
            "Partner with regional freight and tooling partners to offer 0% documentation fee for early renewal on Vantage Financial Services plans.",
          ],
        },
        {
          title: "Account Margin Conversation Training",
          priority: "Short-term",
          actions: [
            "Brief NA account teams on how to present the margin conversation using a one-page visual summary — many account managers are currently underselling the savings position, leaving $2.1M estimated value on the table per quarter.",
          ],
        },
      ],
      Europe: [
        {
          title: "EPR Credit & Recyclate Incentive Bundling",
          priority: "Immediate",
          actions: [
            "Bundle recyclate-content tax incentives with the early renewal offer for the 3,180 EU contract holders — this reduces the effective cost gap between hybrid and full mono-material recyclable formats to a minimal margin for most accounts.",
            "Create a 'Switch to Mono-Material, Switch Now' one-page account summary in German, French, and Italian for account-team use.",
          ],
        },
        {
          title: "Recyclable Laminate Capacity Reservation",
          priority: "Short-term",
          actions: [
            "Hold a priority capacity allocation from the Q3 2026 production run for EU accounts currently in the renewal model — first-mover advantage as Mondi and Smurfit WestRock recyclable-laminate capacity remains constrained.",
          ],
        },
      ],
      UK: [
        {
          title: "Contract Margin Call Campaign",
          priority: "Immediate",
          actions: [
            "1,522 UK supply agreements maturing Q2 2026 — initiate outbound outreach 90 days before maturity date with a specific savings figure and a structured 'Rate Lock + Renewed Agreement' proposal.",
            "EPR fee-relief eligibility narrows for many accounts in this cohort — include a 'Compliance deadline awareness' message to create a conversion window: 58% already show spec-upgrade intent.",
          ],
        },
        {
          title: "Recycled-Content Tax Credit Pathway",
          priority: "Short-term",
          actions: [
            "Partner with recycling reprocessors to offer a certified recycled-content supply pathway as an alternative to virgin-resin agreements — for higher-volume accounts in this cohort, the recycled-content route reduces effective PPT exposure by an estimated 32%, making Vantage directly competitive on total landed cost.",
          ],
        },
        {
          title: "Scottish & Northern England Maturity Cluster",
          priority: "Strategic",
          actions: [
            "Model identifies a secondary cluster of 340 UK contracts maturing in Scotland and Northern England — currently underserved by renewal outreach. Activate Edinburgh and Manchester account teams with the same margin-first script used in the South.",
          ],
        },
      ],
    },
  },
  {
    id: "cancellation",
    title: "Order Cancellation Risk Prediction",
    shortTitle: "Order Cancellation",
    lifecycle: "Acquire",
    metric: "At-Risk Orders (≥70% churn)",
    metricValue: { Global: "412", "North America": "187", Europe: "156", UK: "69" },
    metricDelta: { Global: "-18.4%", "North America": "-22.1%", Europe: "-13.8%", UK: "-16.2%" },
    metricTrend: { Global: "down", "North America": "down", Europe: "down", UK: "down" },
    insightSummary: {
      Global: "412 high-risk order cancellations flagged; proactive account outreach programme reduced churn by 18.4% vs. prior quarter",
      "North America": "187 at-risk orders; 68% linked to lead-time delays >12 weeks — account-manager intervention rate showing 44% save rate",
      Europe: "156 flagged; resin-supply constraints & extended lead times primary drivers; dedicated capacity allocation programme reducing risk",
      UK: "69 UK orders at-risk; 72% linked to extended lead time beyond 14 weeks — barrier-film laminate SKUs primarily affected",
    },
    dataSources: ["Order Management System", "SAP SD", "MES Production Data", "NPS Pulse Survey"],
    lastRunOffsetHours: -4,
    modelVersion: "v2.9.2",
    accuracy: 84,
    signals: [
      { name: "Lead-time delay duration", strength: 88 },
      { name: "NPS sentiment score", strength: 85 },
      { name: "Competitor conquest offer signals", strength: 78 },
      { name: "Resin & raw-material supply index", strength: 71 },
      { name: "Inbound contact frequency", strength: 66 },
    ],
    color: "#f59e0b",
    icon: "AlertTriangle",
    regionalDistribution: {
      Global: [
        { label: "Lead-Time Delay", value: 42, color: "#f59e0b" },
        { label: "Price Sensitivity", value: 28, color: "#fbbf24" },
        { label: "Competitor Offer", value: 19, color: "#fcd34d" },
        { label: "Spec Change", value: 11, color: "#fde68a" },
      ],
      "North America": [
        { label: "Lead-Time Delay", value: 51, color: "#f59e0b" },
        { label: "Competitor Offer", value: 24, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 16, color: "#fcd34d" },
        { label: "Spec Change", value: 9, color: "#fde68a" },
      ],
      Europe: [
        { label: "Resin Supply Constraint", value: 38, color: "#f59e0b" },
        { label: "Lead-Time Delay", value: 31, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 22, color: "#fcd34d" },
        { label: "Spec Change", value: 9, color: "#fde68a" },
      ],
      UK: [
        { label: "Lead-Time Delay", value: 52, color: "#f59e0b" },
        { label: "Competitor Offer", value: 26, color: "#fbbf24" },
        { label: "Price Sensitivity", value: 14, color: "#fcd34d" },
        { label: "Spec Change", value: 8, color: "#fde68a" },
      ],
    },
    pedigree: {
      inputFeatures: ["Order age", "Customer contact frequency", "Lead-time ETA variance", "NPS score trajectory", "Competitor price index"],
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
            "Deploy a dedicated 'Order Save' team to contact all 412 flagged accounts within 24 hours — scripted around four core objection types: lead-time delay, price sensitivity, competitor offer, and spec change.",
            "For lead-time-delay cases (42% of at-risk pool), provide a revised delivery date commitment in writing with an expedited freight offer — this has shown a 44% save rate in prior campaigns.",
            "Escalate any account with churn probability >0.90 directly to the plant general manager for a personal call within 4 hours.",
          ],
        },
        {
          title: "Lead-Time Communication Protocol",
          priority: "Short-term",
          actions: [
            "Introduce bi-weekly proactive production status updates via email for all orders >8 weeks old — reduces inbound cancellation enquiries by an estimated 31% based on pilot data.",
            "Create a Vantage order-tracking portal accessible to accounts so they can self-serve production progress.",
          ],
        },
        {
          title: "SHAP Feature Monitoring Dashboard",
          priority: "Strategic",
          actions: [
            "Surface the top SHAP feature driving each individual account's risk score in the plant order system — enabling account managers to address the specific root cause rather than a generic save script.",
          ],
        },
      ],
      "North America": [
        {
          title: "Lead-Time Delay Save Incentive",
          priority: "Immediate",
          actions: [
            "187 NA at-risk orders; 51% are lead-time-delay driven. Implement a tiered 'Thank You for Waiting' incentive: delay 10–14 wks → freight credit; delay >14 wks → tooling-change waiver on next order.",
            "Brief the NA account network on the 44% save rate data point — many account managers are currently waiting for a cancellation rather than proactively intervening.",
          ],
        },
        {
          title: "Competitor Counter-Offer Playbook",
          priority: "Short-term",
          actions: [
            "24% of NA cancellations are driven by a competitor offer (primarily Sonoco and Berry Global). Issue a 'Competitive Response Toolkit' to account managers with approved price-match flexibilities, payment-term matching, and priority capacity levers.",
          ],
        },
      ],
      Europe: [
        {
          title: "Resin Supply De-risking Programme",
          priority: "Immediate",
          actions: [
            "38% of EU at-risk orders are resin-supply driven — immediately offer an alternate-resin qualification fast-track to all affected accounts, reducing the perceived barrier of a single-source dependency.",
            "Pair each at-risk order with a dedicated capacity-allocation guarantee at the nearest plant.",
          ],
        },
        {
          title: "Lead Time Transparency",
          priority: "Short-term",
          actions: [
            "31% of EU cancellations are lead-time-delay driven — implement a personalised production-milestone update channel for European accounts (high adoption in DE/FR/NL markets) providing notifications as their order moves through the plant.",
          ],
        },
      ],
      UK: [
        {
          title: "Barrier-Film Delay Save Campaign",
          priority: "Immediate",
          actions: [
            "72% of UK at-risk orders are barrier-film laminate accounts waiting beyond 14 weeks — activate a personalised outreach programme offering an interim stock-format bridge during the extended wait, demonstrating supply reliability.",
            "For accounts >16 weeks into wait: offer an immediate substitution path to an equivalent in-stock structure at the same price, eliminating the wait entirely.",
          ],
        },
        {
          title: "UK Competitor Counter Strategy",
          priority: "Short-term",
          actions: [
            "26% of UK cancellations are lost to competitor offers — primarily Smurfit WestRock and Crown Holdings. Issue plant-level competitive response authority to match payment terms within agreed limits and offer a complimentary quality-audit visit as a retention tool.",
          ],
        },
      ],
    },
  },
  {
    id: "service-retention",
    title: "Manufacturing Reliability & Supply Continuity",
    shortTitle: "Manufacturing Reliability",
    lifecycle: "Maintain",
    metric: "Retention Opportunity Score",
    metricValue: { Global: "71.4%", "North America": "68.2%", Europe: "74.8%", UK: "76.3%" },
    metricDelta: { Global: "+4.1%", "North America": "+2.8%", Europe: "+5.9%", UK: "+6.7%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "1,840 production lines overdue for preventive maintenance review; personalised maintenance scheduling showing 31% OEE uplift",
      "North America": "Warranty cliff at 36 months on capital equipment; 1,240 lines predicted to see reliability decline — Vantage EliteCare maintenance offer active",
      Europe: "Integrated OTA sensor firmware updates driving 23% increase in scheduled maintenance visits in DACH & Nordics plants",
      UK: "UK leads Europe in retention score at 76.3%; approved maintenance-partner density across the Home Counties driving same-day service convenience",
    },
    dataSources: ["Plant IoT Telemetry", "MES Production Data", "SAP Service Cloud", "Preventive Maintenance Log"],
    lastRunOffsetHours: -8,
    modelVersion: "v3.3.7",
    accuracy: 86,
    signals: [
      { name: "Maintenance interval proximity", strength: 92 },
      { name: "IoT sensor health alerts", strength: 90 },
      { name: "Service contract expiry status", strength: 88 },
      { name: "Warranty cliff proximity", strength: 85 },
      { name: "Third-party maintenance risk score", strength: 72 },
    ],
    color: "#06b6d4",
    icon: "Wrench",
    regionalDistribution: {
      Global: [
        { label: "Scheduled PM Due", value: 35, color: "#06b6d4" },
        { label: "Service Contract Renewal", value: 28, color: "#22d3ee" },
        { label: "Safety Compliance Check", value: 21, color: "#67e8f9" },
        { label: "Line Health Diagnostic", value: 16, color: "#a5f3fc" },
      ],
      "North America": [
        { label: "Post-Warranty", value: 44, color: "#06b6d4" },
        { label: "Scheduled PM Due", value: 31, color: "#22d3ee" },
        { label: "Service Contract Renewal", value: 25, color: "#67e8f9" },
      ],
      Europe: [
        { label: "Scheduled PM Due", value: 38, color: "#06b6d4" },
        { label: "Line Health Diagnostic", value: 29, color: "#22d3ee" },
        { label: "Service Contract Renewal", value: 33, color: "#67e8f9" },
      ],
      UK: [
        { label: "Scheduled PM Due", value: 41, color: "#06b6d4" },
        { label: "Service Contract Renewal", value: 30, color: "#22d3ee" },
        { label: "Line Health Diagnostic", value: 18, color: "#67e8f9" },
        { label: "Safety Compliance Check", value: 11, color: "#a5f3fc" },
      ],
    },
    pedigree: {
      inputFeatures: ["Last maintenance date", "Runtime hours since service", "IoT firmware update status", "Line lifetime value", "Nearest maintenance-partner distance"],
      outputType: "Reliability Risk Score + Recommended Intervention",
      trainingDataSize: "3.1M maintenance records (120 months · 10 years)",
      refreshCadence: "Daily at 04:00 UTC",
      nextRunOffsetHours: 20,
      slaCompliance: "99.7%",
      modelType: "Hazard Model + Decision Tree",
    },
    recommendations: {
      Global: [
        {
          title: "Preventive Maintenance Blitz — 1,840 Overdue Lines",
          priority: "Immediate",
          actions: [
            "Activate a personalised scheduling sequence for all 1,840 lines overdue for preventive maintenance — email, portal, and IoT dashboard alert in a 3-day cadence. Pilot data shows 31% OEE uplift when all three channels fire in sequence.",
            "Offer a 'Lock-in' service-rate guarantee: schedule within 14 days at current rate before the scheduled April parts price adjustment — creates urgency without discounting.",
          ],
        },
        {
          title: "Post-Warranty Reliability Bridge",
          priority: "Short-term",
          actions: [
            "Identify lines within 6 months of warranty expiry and proactively offer a Vantage Approved inspection + extended service package — data shows reliability incidents increase 3× in the month after warranty expiry without intervention.",
          ],
        },
        {
          title: "IoT Firmware Update as Service Trigger",
          priority: "Strategic",
          actions: [
            "Use IoT firmware-update completion as a trigger for a personalised maintenance reminder — 'Your line controller software is now updated. While we're monitoring your equipment, would you like to book your next scheduled health check?' — shown to increase service bookings by 23% in EU pilot.",
          ],
        },
      ],
      "North America": [
        {
          title: "EliteCare Post-Warranty Retention Offer",
          priority: "Immediate",
          actions: [
            "1,240 NA lines predicted to see reliability decline post-warranty — activate the Vantage EliteCare retention offer 90 days before warranty expiry: multi-year service plan at 15% discount with a complimentary annual health check.",
            "Position EliteCare around OEM-trained technicians and genuine parts guarantee vs. third-party maintenance providers — particularly effective with high-throughput beverage and dairy lines protective of uptime.",
          ],
        },
        {
          title: "Mobile Service Expansion",
          priority: "Short-term",
          actions: [
            "Model identifies 380 NA plants whose nearest Vantage service hub is >45 mins drive — these show 2.1× higher unplanned downtime rate. Expand Vantage Mobile Service units to cover key manufacturing corridors to eliminate distance as a barrier.",
          ],
        },
      ],
      Europe: [
        {
          title: "IoT-Triggered Service Appointment Push",
          priority: "Immediate",
          actions: [
            "23% uplift in scheduled maintenance visits already observed from IoT notifications in DACH & Nordics — scale this programme immediately to all 5,910 EU lines with active telemetry connectivity.",
            "A/B test a 'Book while we've got your line's attention' CTA in the firmware-update completion notification across French and Italian markets where uptake has been lower.",
          ],
        },
        {
          title: "Line Health Diagnostic Campaign",
          priority: "Short-term",
          actions: [
            "29% of EU service distribution is line-health-diagnostic category — proactively offer a free 45-minute diagnostic assessment to all extrusion and lamination lines over 3 years old. This drives service visits and surfaces upgrade conversations for upsell.",
          ],
        },
      ],
      UK: [
        {
          title: "Home Counties Same-Day Service Campaign",
          priority: "Immediate",
          actions: [
            "UK leads Europe in retention at 76.3% — capitalise on this by promoting the same-day express service capability at Guildford, Reading, and Basingstoke service hubs for the 41% of UK service-due lines in this corridor.",
            "Send a 'Your Scheduled Health Check Is Due' personalised notice to the top 500 UK lines by lifetime value score — response rate for direct notice in this segment is 3.8× email.",
          ],
        },
        {
          title: "Safety Compliance Accelerator",
          priority: "Short-term",
          actions: [
            "11% of UK service distribution involves an active safety compliance check — these are guaranteed visits. Use the compliance appointment as an opportunity to conduct a line-capacity appraisal, converting a reactive visit into a proactive upgrade conversation for 18% of attendees.",
          ],
        },
        {
          title: "Loyalty Score Integration",
          priority: "Strategic",
          actions: [
            "Merge manufacturing reliability scores with the upselling engine to identify UK accounts who are both high-retention AND high-upgrade propensity — estimated 620 dual-opportunity accounts representing £8.4M combined revenue potential.",
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
      Global: "2,890 current accounts qualify for a personalised upgrade to premium barrier laminates — avg. incremental revenue $29.2k",
      "North America": "Standard-barrier accounts showing 0.74 propensity to upgrade to high-barrier recyclable structures; category demand index at 6-yr high",
      Europe: "Legacy multi-material laminate accounts with >30 months tenure showing strong mono-material pre-order intent (87% recyclability threshold satisfaction)",
      UK: "£12.8M upsell opportunity; standard closure accounts in the South East showing 0.81 propensity for premium dispensing-closure upgrade",
    },
    dataSources: ["SAP CRM", "Vantage Connect Data Lake", "Customer Portal Analytics", "Category Spend Data"],
    lastRunOffsetHours: -9,
    modelVersion: "v4.0.3",
    accuracy: 82,
    signals: [
      { name: "Account tenure & volume profile", strength: 89 },
      { name: "Spec gap analysis vs. aspirational tier", strength: 87 },
      { name: "Category-growth event triggers", strength: 81 },
      { name: "Ancillary component purchase history", strength: 78 },
      { name: "Cross-line interest signals", strength: 63 },
    ],
    color: "#8b5cf6",
    icon: "ArrowUpRight",
    regionalDistribution: {
      Global: [
        { label: "Format Upgrade", value: 41, color: "#8b5cf6" },
        { label: "Spec Level Upgrade", value: 33, color: "#a78bfa" },
        { label: "Ancillary Components", value: 26, color: "#c4b5fd" },
      ],
      "North America": [
        { label: "Format Upgrade", value: 48, color: "#8b5cf6" },
        { label: "Spec Level Upgrade", value: 30, color: "#a78bfa" },
        { label: "Ancillary Components", value: 22, color: "#c4b5fd" },
      ],
      Europe: [
        { label: "Recyclable Upgrade", value: 44, color: "#8b5cf6" },
        { label: "Format Upgrade", value: 34, color: "#a78bfa" },
        { label: "Ancillary Components", value: 22, color: "#c4b5fd" },
      ],
      UK: [
        { label: "Spec Level Upgrade", value: 42, color: "#8b5cf6" },
        { label: "Format Upgrade", value: 35, color: "#a78bfa" },
        { label: "Recyclable Upgrade", value: 23, color: "#c4b5fd" },
      ],
    },
    pedigree: {
      inputFeatures: ["Current program spec", "Design studio behaviour", "Account revenue proxy", "Category growth & seasonality events", "Competitor activity exposure"],
      outputType: "Upgrade Propensity + Revenue Impact Estimate",
      trainingDataSize: "2.6M account journeys (120 months · 10 years)",
      refreshCadence: "Daily at 23:00 UTC",
      nextRunOffsetHours: 15,
      slaCompliance: "99.1%",
      modelType: "Neural Collaborative Filtering + LightGBM",
    },
    recommendations: {
      Global: [
        {
          title: "Premium Laminate Upgrade Campaign — 2,890 Qualified Accounts",
          priority: "Immediate",
          actions: [
            "Launch a 'First Access' communication to 2,890 globally qualified upgrade candidates — personalised with their current program details, the exact incremental cost, and a comparison against the upgraded specification.",
            "Use a 2-part email + personal call approach: email from the head of customer experience, followed by a personal call from the assigned account manager within 72 hours.",
          ],
        },
        {
          title: "Ancillary Components Revenue Activation",
          priority: "Short-term",
          actions: [
            "26% of upsell opportunity ($21.9M) sits in ancillary components — activate a post-onboarding accessories campaign at 30 days and 6 months after program launch, when spec-refinement intent is highest.",
            "Bundle popular ancillary components into three named packages ('Shelf-Ready', 'Premium Dispensing', 'Multi-Pack Efficiency') to simplify the purchase decision and increase average order value by an estimated 34%.",
          ],
        },
        {
          title: "Category-Growth Event Trigger Integration",
          priority: "Strategic",
          actions: [
            "Integrate category-growth event signals (new SKU launch, private-label expansion, category share shift) from Nielsen/IRI into the model — these events correlate with +44% upsell propensity and are currently not captured.",
          ],
        },
      ],
      "North America": [
        {
          title: "Standard-to-High-Barrier Upgrade Sprint",
          priority: "Immediate",
          actions: [
            "Standard-barrier accounts showing 0.74 propensity for high-barrier recyclable structure upgrade are the highest-value upsell segment in NA — brief all NA account teams with a structured 'Step Up' conversation guide focusing on shelf-life extension and sustainability claims.",
            "Offer a zero-cost extended pilot run (48-hour production trial) of the high-barrier structure to the top 280 propensity-scored NA accounts — this tactile trial is the primary conversion driver in this segment.",
          ],
        },
        {
          title: "Premium Laminate Scarcity Messaging",
          priority: "Short-term",
          actions: [
            "14-week order bank on premium recyclable laminate creates genuine scarcity — authorise account teams to communicate current capacity status honestly as a conversion lever: 'We have capacity for 3 production slots in Q3; two are already allocated.'",
          ],
        },
      ],
      Europe: [
        {
          title: "Legacy Laminate Account Mono-Material Pre-Order Drive",
          priority: "Immediate",
          actions: [
            "Legacy multi-material laminate accounts with 87%+ recyclability satisfaction represent the ideal mono-material early adopter — invite all 340 qualifying European accounts to an exclusive 'Next Chapter of Recyclability' preview event with a guaranteed pre-order slot.",
            "Position the upgrade as a like-for-like performance continuation with a significant sustainability step-up, not a compromise — compare shelf life, barrier performance, and recyclability directly in the invitation.",
          ],
        },
        {
          title: "DACH Spec Upgrade Localisation",
          priority: "Short-term",
          actions: [
            "44% of EU upsell is recyclable-upgrade driven — ensure all European digital upgrade journeys are localised with EPR fee savings already deducted from the headline price to present the true cost of upgrading.",
          ],
        },
      ],
      UK: [
        {
          title: "South East Premium Dispensing Closure Private Event",
          priority: "Immediate",
          actions: [
            "Standard closure accounts in Surrey, Reading, and Guildford showing 0.81 propensity for premium dispensing-closure upgrade — host a private preview at the Vantage Innovation Centre with bespoke structure-design consultation included.",
            "Include a technical illustration showing the premium closure's expected shelf-appeal and dispensing-performance advantage over a standard cap at retail — this segment is highly brand-differentiation conscious.",
          ],
        },
        {
          title: "Spec Level Upgrade — Vantage Connect In-Portal Offer",
          priority: "Short-term",
          actions: [
            "42% of UK upsell opportunity is spec-level driven — deploy an in-portal notification within Vantage Connect for accounts on standard-spec programs showing the incremental unit cost of upgrading to premium or recyclable tiers on a new supply agreement.",
            "Feature the 3 most popular spec upgrades in the portal based on the account's current product line to make the decision concrete rather than abstract.",
          ],
        },
        {
          title: "Private Label & Retailer Upsell Pathway",
          priority: "Strategic",
          actions: [
            "Model identifies 180 UK private-label accounts currently on commercial-grade spec who qualify for premium retail-ready spec — engage key-account managers with a Total Cost of Ownership comparison that demonstrates the premium tier's shelf-life and margin advantages.",
          ],
        },
      ],
    },
  },
  {
    id: "buyback",
    title: "Contract Value & Volume Re-Commitment",
    shortTitle: "Value Re-Commitment",
    lifecycle: "Renew",
    metric: "Positive Margin Accounts",
    metricValue: { Global: "5,640", "North America": "2,890", Europe: "1,920", UK: "830" },
    metricDelta: { Global: "+9.3%", "North America": "+15.7%", Europe: "+4.2%", UK: "+10.8%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "5,640 accounts with avg. +$4.2k monthly margin upside — volume re-commitment campaign activation projected at 68% take-up rate",
      "North America": "2026 premium recyclable laminate programs command +$8.4k over benchmark cost; capacity premium driven by 14-week order bank",
      Europe: "Recyclable rigid-container programs trading at +€5.1k over benchmark; UK & German markets showing highest re-commitment intent signals",
      UK: "830 UK accounts with avg. +£3.8k monthly margin upside over benchmark cost; fibre-based closure programs most prevalent — South East cluster leading",
    },
    dataSources: ["Market Benchmark Index", "Vantage Financial Services", "Contract Lifecycle Management", "SAP BRIM", "Category Cost Index"],
    lastRunOffsetHours: -3,
    modelVersion: "v6.0.1",
    accuracy: 93,
    signals: [
      { name: "Market benchmark live cost feed", strength: 96 },
      { name: "Volume & program condition data", strength: 94 },
      { name: "Capacity realisation rate", strength: 91 },
      { name: "Margin position vs. benchmark", strength: 90 },
      { name: "Cost forecast accuracy", strength: 87 },
    ],
    color: "#ef4444",
    icon: "DollarSign",
    regionalDistribution: {
      Global: [
        { label: "Flexible Packaging", value: 44, color: "#ef4444" },
        { label: "Rigid Containers", value: 31, color: "#f87171" },
        { label: "Closures & Dispensing", value: 15, color: "#fca5a5" },
        { label: "Specialty Cartons", value: 10, color: "#fecaca" },
      ],
      "North America": [
        { label: "Premium Recyclable Laminate", value: 48, color: "#ef4444" },
        { label: "Rigid PET Containers", value: 33, color: "#f87171" },
        { label: "High-Barrier Pouches", value: 19, color: "#fca5a5" },
      ],
      Europe: [
        { label: "Recyclable Rigid Containers", value: 42, color: "#ef4444" },
        { label: "Flexible Packaging LWB", value: 38, color: "#f87171" },
        { label: "Specialty Cartons", value: 20, color: "#fca5a5" },
      ],
      UK: [
        { label: "Fibre-Based Closures", value: 48, color: "#ef4444" },
        { label: "Recyclable Rigid Containers", value: 34, color: "#f87171" },
        { label: "Specialty Cartons", value: 18, color: "#fca5a5" },
      ],
    },
    pedigree: {
      inputFeatures: ["Current market cost benchmark", "Volume & program condition grade", "Regional demand index", "Days to capacity slot", "Account margin position"],
      outputType: "Contract Value Assessment + Margin Position + Urgency Score",
      trainingDataSize: "1.9M contract-renewal transactions (120 months · 10 years)",
      refreshCadence: "Twice daily (06:00 & 18:00 UTC)",
      nextRunOffsetHours: 9,
      slaCompliance: "99.9%",
      modelType: "Ensemble Valuation Model (Gradient Boost + CatBoost)",
    },
    recommendations: {
      Global: [
        {
          title: "Margin Position Re-Commitment Campaign",
          priority: "Immediate",
          actions: [
            "Contact all 5,640 positive-margin accounts with a personalised 'Your program is worth more than you think' communication, including their specific margin figure — A/B testing shows this exact framing drives a 41% higher response rate vs. generic renewal messaging.",
            "Create urgency with a 21-day rate lock guarantee — protect the valuation while the account considers, removing the most common objection ('the rate might change before we decide').",
          ],
        },
        {
          title: "Margin + New Program Bridging Terms",
          priority: "Short-term",
          actions: [
            "Work with Vantage Financial Services to create a bridging term structure that allows accounts to lock in the margin value as a deposit on a new program even if their current agreement is still active — removes the practical timing barrier for 38% of positive-margin accounts who cite 'can't disrupt current supply' as a hesitation.",
          ],
        },
        {
          title: "Market Benchmark Data Feed Acceleration",
          priority: "Strategic",
          actions: [
            "Increase market benchmark cost-feed refresh from weekly to daily to improve margin position accuracy — current weekly refresh means some margin figures shown to accounts are up to 7 days stale, occasionally generating incorrect expectations at point of proposal.",
          ],
        },
      ],
      "North America": [
        {
          title: "Premium Laminate Scarcity + Margin Bundle",
          priority: "Immediate",
          actions: [
            "The combination of +$8.4k premium recyclable laminate margin premium AND a 14-week order bank creates a unique 'commit now, benefit now' window — craft a campaign message around this dual scarcity for the 1,390 NA premium-spec positive-margin accounts.",
            "Partner with logistics providers to provide priority collection scheduling, removing the 'hassle of transition' objection that affects 29% of NA re-commitment-hesitant accounts.",
          ],
        },
        {
          title: "Rigid PET Trade-Up Programme",
          priority: "Short-term",
          actions: [
            "33% of NA positive-margin accounts are on rigid PET containers — the segment with the highest margin surplus. Create a 'PET-to-PET Recycled' trade-up programme specifically for this group, offering guaranteed margin + a loyalty credit toward any new PCR-content order.",
          ],
        },
      ],
      Europe: [
        {
          title: "Recyclable Rigid Container High-Margin Outreach",
          priority: "Immediate",
          actions: [
            "Recyclable rigid-container programs trading at +€5,100 over benchmark in Germany and the UK represent the most compelling re-commitment conversation in the European portfolio — brief rigid-container specialist account teams in DE, UK, and NL on this margin figure with authority to present it proactively during any account review.",
            "Launch a 'Your Program's Value Has Grown' digital campaign targeting the 780 highest-margin EU rigid-container accounts with an online margin estimator tool.",
          ],
        },
        {
          title: "Mono-Material Migration Pathway",
          priority: "Short-term",
          actions: [
            "Position volume re-commitment on a high-margin legacy laminate program as the natural funding mechanism for a mono-material migration reservation — 38% of EU positive-margin accounts are on legacy flexible LWB, and the margin covers an estimated 42% of the transition tooling cost.",
          ],
        },
      ],
      UK: [
        {
          title: "South East Margin Appraisal Event",
          priority: "Immediate",
          actions: [
            "830 UK positive-margin accounts, concentrated in the South East — invite the top 120 by margin position to a private 'Program Appraisal Morning' at the Vantage Innovation Centre where their program is assessed on-site and a margin certificate is presented in a premium format.",
            "Offer a same-day new order incentive: any account that places a new order on the day of their appraisal receives a complimentary quality-audit visit.",
          ],
        },
        {
          title: "Fibre-Based Closure Margin Communication",
          priority: "Short-term",
          actions: [
            "Fibre-based closures are the most prevalent UK positive-margin program at 48% of the pool — create a personalised margin summary for all fibre-closure accounts showing their exact benchmark value, margin position, and a comparison monthly cost for a recyclable rigid-container upgrade.",
            "Include the EPR fee relief already applied to make the new program monthly cost as low as possible in the headline figure.",
          ],
        },
        {
          title: "Margin Score in Account Order System",
          priority: "Strategic",
          actions: [
            "Surface the live margin position score directly in the SAP order-management record so that any UK account manager can initiate a value conversation at any contact point — estimated 18% additional re-commitment conversations generated per month from this single integration.",
          ],
        },
      ],
    },
  },
  {
    id: "customer-experience",
    title: "Customer Experience Index (CEI)",
    shortTitle: "Customer Experience Index",
    lifecycle: "Own",
    metric: "Account Engagement Score",
    metricValue: { Global: "68.3", "North America": "44.2", Europe: "78.8", UK: "82.1" },
    metricDelta: { Global: "+3.8", "North America": "+2.4", Europe: "+5.1", UK: "+4.9" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up", UK: "up" },
    insightSummary: {
      Global: "Composite CEI score identifies 2,840 accounts with high loyalty potential",
      "North America": "Portal engagement down 18% for 1,120 NA accounts — correlates with 2.3× higher defection probability within 6 months",
      Europe: "Service touchpoint frequency highest in DACH; IoT telemetry data shows 94% positive line-health status driving loyalty uplift",
      UK: "UK leads global CEI at 82.1; Vantage Connect portal monthly active users at 89% — highest account-team NPS correlation observed",
    },
    dataSources: ["Plant IoT Telemetry", "Customer Portal Analytics", "SAP Service Cloud", "Account Interaction Log", "NPS Survey Platform"],
    lastRunOffsetHours: -4,
    modelVersion: "v2.1.0",
    accuracy: 89,
    signals: [
      { name: "Line telemetry health index", strength: 94 },
      { name: "Customer portal engagement score", strength: 91 },
      { name: "Service visit frequency & recency", strength: 88 },
      { name: "Account touchpoint sentiment", strength: 85 },
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
      inputFeatures: ["Plant IoT telemetry (throughput, health alerts, run patterns)", "Portal session frequency & duration", "Service history & satisfaction", "Account interaction logs", "NPS & CSAT scores"],
      outputType: "Composite Loyalty Score (0–100) + Churn Risk Flag",
      trainingDataSize: "2.8M account journeys (84 months · 7 years)",
      refreshCadence: "Daily at 05:00 UTC",
      nextRunOffsetHours: 21,
      slaCompliance: "99.6%",
      modelType: "Ensemble (Random Forest + LSTM for temporal patterns)",
    },
    recommendations: {
      Global: [
        {
          title: "Proactive Churn Intervention — 412 At-Risk Accounts",
          priority: "Immediate",
          actions: [
            "Deploy personalised retention outreach to 412 accounts showing early churn indicators — portal disengagement, delayed service visits, or NPS decline >15 points. Lead with a complimentary line-health check and Vantage Connect re-onboarding.",
            "Assign dedicated Relationship Managers to the top 50 at-risk accounts by lifetime value — personal touch reduces churn probability by 34% in pilot data.",
          ],
        },
        {
          title: "Loyalty Champions Programme",
          priority: "Short-term",
          actions: [
            "Identify the 2,840 high-loyalty accounts and invite them to an exclusive 'Vantage Innovation Partner' programme — early access to new materials, plant tours, and co-development sessions. High-loyalty accounts generate 4.2× referral value.",
          ],
        },
        {
          title: "Telemetry-Driven Service Nudges",
          priority: "Strategic",
          actions: [
            "Use plant IoT telemetry health signals to trigger proactive service outreach before issues manifest — 'We noticed your sealing-jaw wear is at 15% — would you like us to book a convenient replacement visit?' Pilot shows 28% uplift in service revenue and 12-point NPS improvement.",
          ],
        },
      ],
      "North America": [
        {
          title: "Portal Re-Engagement Campaign",
          priority: "Immediate",
          actions: [
            "1,120 NA accounts with declining portal engagement show 2.3× higher defection probability — launch an in-portal reactivation campaign with exclusive content: material innovation updates, capacity-planning tools, and a 'reconnect' bonus of complimentary quality audit.",
            "Notification sequence over 7 days with escalating value propositions — culminating in a personal Relationship Manager outreach for non-responders.",
          ],
        },
        {
          title: "Service Experience Excellence",
          priority: "Short-term",
          actions: [
            "NA CEI trails UK/EU by 5+ points — root cause analysis shows service wait times and communication gaps. Implement real-time service status updates via portal and email for all NA plants.",
          ],
        },
      ],
      Europe: [
        {
          title: "DACH Loyalty Leadership",
          priority: "Immediate",
          actions: [
            "DACH region shows highest service touchpoint frequency and CEI scores — package this as a best-practice blueprint and roll out to Benelux and Nordics where scores lag by 4-6 points.",
            "Leverage the 94% positive line-health status in commercial conversations: 'Vantage lines are designed to keep you running — see how our accounts experience near-perfect reliability.'",
          ],
        },
        {
          title: "Sustainability Program Experience Track",
          priority: "Short-term",
          actions: [
            "Create a dedicated sustainability-transition customer experience track within CEI — accounts migrating formats have unique needs (recyclate sourcing, EPR reporting, material testing). Pilot a 'Sustainability Concierge' service in Germany and France to drive loyalty in this strategically critical segment.",
          ],
        },
      ],
      UK: [
        {
          title: "Maximise UK Loyalty Leadership",
          priority: "Immediate",
          actions: [
            "UK leads global CEI at 82.1 — capitalise by launching a referral programme targeting the 89% monthly active portal users. Offer a referral credit for both parties when a referral converts to a signed program.",
            "89% portal engagement is exceptional — use this channel for premium service offers, exclusive events, and priority allocation on new sustainable material launches.",
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
          title: "Account Experience Certification",
          priority: "Strategic",
          actions: [
            "Certify UK account teams on a 'Customer Experience Excellence' standard based on CEI contribution metrics — top-performing teams receive priority capacity allocation on limited-run material innovations and joint marketing co-investment.",
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
// Plant targetCustomers and projectedRevenue are intentionally larger than
// customers.length — the array holds representative account-contact cards for the UI;
// the numeric fields carry the true population for totals and the "View All" count.
// Mission 1 plants distribute: 280 accounts / $38.0M
//   Princeton 52/$7.2M  Manhattan 64/$8.8M  Beverly Hills 46/$6.4M
//   Knightsbridge 68/£6.2M  Edinburgh 50/£4.4M
//   Amsterdam 34/€4.6M  Hamburg 28/€3.8M  Paris 22/€3.0M
// Mission 2 plants distribute: 170 accounts / $18.0M
//   Gold Coast 52/$3.8M  Mayfair 88/£3.9M  Birmingham 30/£2.2M
// Mission 3 plants distribute: 148 accounts / $16.2M
//   Dallas 58/$7.2M  Munich 50/€5.6M  Manchester 40/£3.9M

export const missions: Mission[] = [
  {
    id: "ev-equity-pivot",
    title: "The Sustainable Packaging Transition Campaign",
    subtitle: "Convert high-margin hybrid/legacy accounts to mono-material recyclable formats",
    priority: "Critical",
    // Revenue and customers distributed across regions to sum to $38M / 280 accounts
    projectedRevenue: { Global: "$38.0M", "North America": "$18.2M", Europe: "$11.4M", UK: "£8.4M" },
    targetCustomers: { Global: 280, "North America": 134, Europe: 84, UK: 62 },
    conversionRate: { Global: "34%", "North America": "38%", Europe: "31%", UK: "36%" },
    sourceModels: ["buyback", "renewal", "upselling", "intelligent-lead", "customer-experience"],
    color: "#3b82f6",
    tagline: "Turn margin upside into a mono-material future — before the window closes",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Value Re-Commitment Model (v6.0.1)", finding: "5,640 accounts with avg. +$4.2k monthly margin upside; recyclable rigid containers command +€5.1k over benchmark", weight: "High" },
        { model: "Renewal Model (v5.1.0)", finding: "750 flexible-packaging contracts ending Q2 2026 with >$8k margin upside — 90-day critical window open", weight: "High" },
        { model: "Customer Experience Index (v2.1.0)", finding: "Target accounts score 84+ on CEI with high portal engagement — optimal for digital-first sustainability transition messaging", weight: "High" },
        { model: "Upselling Engine (v4.0.3)", finding: "Legacy laminate accounts with >30 months tenure showing 0.86 propensity for mono-material pre-order", weight: "Medium" },
        { model: "Account Scoring (v3.8.4)", finding: "62% of expiring-contract holders score ≥0.85 — top engagement percentile", weight: "Medium" },
      ],
      correlationStrength: "94.2%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Deploy a time-limited Margin Advantage Programme targeting hybrid/legacy-format accounts within the 90-day contract window. Offer a guaranteed rate at benchmark + margin premium as credit toward mono-material recyclable format pre-orders.",
      tactics: [
        "Personalised margin statement via Vantage Connect portal notification + email",
        "Account-led concierge sustainability audit & recyclate-sourcing assessment",
        "Priority capacity allocation on mono-material laminate launch run (Q3 2026)",
        "Commercial terms preferential at reduced financing cost vs. standard for new-to-mono-material accounts",
        "Sonoco / Berry Global conquest offer: additional loyalty credit for accounts switching supplier",
      ],
      timelineDaysFromNow: { launch: 11, close: 117 },
      expectedROI: "4.8x (12-month)",
    },
    retailers: [
      {
        id: "princeton-motors",
        name: "Vantage Flexibles — Princeton Plant",
        location: "Princeton, NJ 08540",
        region: "North America",
        tier: "Tier 1",
        missionFit: 96,
        targetCustomers: 52,
        projectedRevenue: "$7.2M",
        customers: [
          {
            id: "sudipto-s",
            name: "Sudipto S.",
            currentVehicle: "Legacy Multi-Material Laminate Program",
            currentVariant: "Retort Pouch — 250ml Standard Barrier 2022",
            buybackEquity: "+$4,200",
            renewalScore: 0.91,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.08)",
            leadScore: 0.94,
            career: "VP Packaging Procurement — Meridian Beverages",
            location: "Princeton, NJ",
            tenure: "7 years / 3 active programs",
            lifetimeValue: "$412,000",
            missionFitReason: "High-margin legacy laminate + early sustainability-adopter profile + active portal user + contract ends Jun 2026",
            recommendedAction: "Priority mono-material laminate pre-order with Margin Advantage offer + recyclate-sourcing assessment",
            contactWindow: "Tuesday–Thursday 10am–2pm EST",
            preferredChannel: "Portal + Personal Relationship Manager",
          },
          {
            id: "eleanor-h",
            name: "Eleanor H.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Stand-Up Pouch — Hybrid Barrier 2022",
            buybackEquity: "+$5,800",
            renewalScore: 0.87,
            upsellScore: 0.92,
            cancellationRisk: "Very Low (0.04)",
            leadScore: 0.96,
            career: "Director of Sourcing — Northgate Dairy",
            location: "Morristown, NJ",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "$198,000",
            missionFitReason: "Highest margin position in cluster + finance-savvy buyer + design-studio sessions on mono-material structure",
            recommendedAction: "Mono-material pouch preview + bespoke commercial-terms modelling with margin bridge",
            contactWindow: "Friday 9am–12pm EST (preferred)",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "raymond-j",
            name: "Raymond J.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "HDPE Bottle — Hybrid Recyclate Blend 2021",
            buybackEquity: "+$6,100",
            renewalScore: 0.83,
            upsellScore: 0.79,
            cancellationRisk: "Low (0.12)",
            leadScore: 0.89,
            career: "Head of Packaging R&D — Solstice Pharma",
            location: "Princeton Junction, NJ",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "$231,000",
            missionFitReason: "Hybrid-recyclate account in margin window + portal active + mono-material design studio 2 sessions logged",
            recommendedAction: "Full-recyclate structure proposition + EPR credit briefing + margin bridge financing",
            contactWindow: "Monday–Wednesday 11am–1pm EST",
            preferredChannel: "Email + Relationship Manager follow-up",
          },
        ],
      },
      {
        id: "manhattan-luxury",
        name: "Vantage Rigid Containers — Manhattan Plant",
        location: "New York, NY 10022",
        region: "North America",
        tier: "Tier 1",
        missionFit: 91,
        targetCustomers: 64,
        projectedRevenue: "$8.8M",
        customers: [
          {
            id: "marcus-t",
            name: "Marcus T.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "PET Bottle — First Edition Recycled Blend 2021",
            buybackEquity: "+$8,400",
            renewalScore: 0.89,
            upsellScore: 0.85,
            cancellationRisk: "Low (0.11)",
            leadScore: 0.91,
            career: "VP Supply Chain — Cascade Beverage Group",
            location: "Upper East Side, NYC",
            tenure: "9 years / 4 active programs",
            lifetimeValue: "$687,000",
            missionFitReason: "Highest margin in NY cluster; volume-downsizer profile aligns with lightweighting narrative",
            recommendedAction: "Premium rPET structure with lightweighting briefing + on-site sourcing assessment",
            contactWindow: "Monday morning or weekend",
            preferredChannel: "Key Account Manager direct call",
          },
          {
            id: "sophia-k",
            name: "Sophia K.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Retort Pouch — SV Premium Barrier 2022",
            buybackEquity: "+$9,800",
            renewalScore: 0.92,
            upsellScore: 0.90,
            cancellationRisk: "Very Low (0.05)",
            leadScore: 0.95,
            career: "Chief Procurement Officer — Everwell Personal Care",
            location: "Park Avenue, NYC",
            tenure: "8 years / 3 active programs",
            lifetimeValue: "$824,000",
            missionFitReason: "Highest margin in Manhattan cluster; premium-tier buyer + early-adopter digital profile; recyclability interest on design portal",
            recommendedAction: "Mono-material premium laminate private preview + bespoke margin bridge proposal",
            contactWindow: "Wednesday 8–10am EST (preferred)",
            preferredChannel: "Personal Relationship Manager + portal VIP notification",
          },
          {
            id: "alex-n",
            name: "Alex N.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "HDPE Bottle — X Structural 2022",
            buybackEquity: "+$5,200",
            renewalScore: 0.78,
            upsellScore: 0.84,
            cancellationRisk: "Low (0.14)",
            leadScore: 0.88,
            career: "Founder — DTC Wellness Brand",
            location: "Tribeca, NYC",
            tenure: "3 years / 1 active program",
            lifetimeValue: "$186,000",
            missionFitReason: "Young high-value brand; format loyalist; sustainability focus — recyclability messaging resonates",
            recommendedAction: "Recycled-content rigid container priority allocation + green financing option",
            contactWindow: "Thursday evenings 6–8pm EST",
            preferredChannel: "LinkedIn DM + Relationship Manager",
          },
          {
            id: "vanessa-l",
            name: "Vanessa L.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "PET Bottle — HSE Dynamic 2021",
            buybackEquity: "+$4,900",
            renewalScore: 0.81,
            upsellScore: 0.76,
            cancellationRisk: "Low (0.16)",
            leadScore: 0.87,
            career: "Creative Director — Boutique Cosmetics Brand",
            location: "SoHo, NYC",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "$298,000",
            missionFitReason: "Contract renewal due Q2; margin advantage confirmed; brand-forward buyer responding to sustainability narrative",
            recommendedAction: "Recyclable rigid container preview at SoHo showroom + personalised margin proposal via portal",
            contactWindow: "Friday afternoons EST",
            preferredChannel: "Email + WhatsApp",
          },
        ],
      },
      {
        id: "beverly-hills-jlr",
        name: "Vantage Flexibles — Beverly Hills Plant",
        location: "Beverly Hills, CA 90210",
        region: "North America",
        tier: "Tier 1",
        missionFit: 88,
        targetCustomers: 46,
        projectedRevenue: "$6.4M",
        customers: [
          {
            id: "priya-m",
            name: "Priya M.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Autobiography Pouch — LWB Premium 2022",
            buybackEquity: "+$11,200",
            renewalScore: 0.93,
            upsellScore: 0.91,
            cancellationRisk: "Very Low (0.05)",
            leadScore: 0.97,
            career: "SVP Operations — Entertainment Merchandise Group",
            location: "Bel Air, CA",
            tenure: "11 years / 5 active programs",
            lifetimeValue: "$1,140,000",
            missionFitReason: "Highest LTV in Western cluster; California EPR incentives maximize margin conversion economics",
            recommendedAction: "Innovation Centre bespoke event invite + first-allocation priority on mono-material structure",
            contactWindow: "Weekday afternoons PST",
            preferredChannel: "Concierge Manager + portal VIP push",
          },
          {
            id: "carlos-v",
            name: "Carlos V.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "PET Bottle — First Edition Structural 2021",
            buybackEquity: "+$7,600",
            renewalScore: 0.86,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.10)",
            leadScore: 0.93,
            career: "Head of Sustainability — Real Estate & Hospitality Group",
            location: "Beverly Hills, CA",
            tenure: "6 years / 3 active programs",
            lifetimeValue: "$512,000",
            missionFitReason: "CA EPR mandate driver + high-margin structural account; mono-material aligns with aspirational sustainability profile",
            recommendedAction: "Mono-material structure trial-run event at Beverly Hills + CA Clean Packaging rebate briefing",
            contactWindow: "Saturday mornings PST",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "jennifer-w",
            name: "Jennifer W.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Retort Pouch — HSE Hybrid 2022",
            buybackEquity: "+$4,800",
            renewalScore: 0.80,
            upsellScore: 0.83,
            cancellationRisk: "Low (0.13)",
            leadScore: 0.90,
            career: "VP Product — Tech-Enabled CPG Brand",
            location: "Pacific Palisades, CA",
            tenure: "3 years / 2 active programs",
            lifetimeValue: "$284,000",
            missionFitReason: "Hybrid buyer moving toward full mono-material; CA incentives + recyclate sourcing already secured",
            recommendedAction: "Mono-material laminate priority reservation + upgrade financing modelling",
            contactWindow: "Weekday mornings 9–11am PST",
            preferredChannel: "Portal push + email",
          },
        ],
      },
      {
        id: "knightsbridge-jlr",
        name: "Vantage Rigid Containers — South East UK Plant",
        location: "London, SW1X 7LY",
        region: "UK",
        tier: "Tier 1",
        missionFit: 93,
        targetCustomers: 68,
        projectedRevenue: "£6.2M",
        customers: [
          {
            id: "oliver-b",
            name: "Oliver B.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "SV Autobiography Pouch — Premium Barrier 2022",
            buybackEquity: "+£6,400",
            renewalScore: 0.90,
            upsellScore: 0.88,
            cancellationRisk: "Very Low (0.06)",
            leadScore: 0.93,
            career: "Group Procurement Director — Premium Beverage Group",
            location: "Kensington, London",
            tenure: "9 years / 4 active programs",
            lifetimeValue: "£748,000",
            missionFitReason: "Highest margin hybrid account in UK cluster; recycled-content tax credit eligible; portal power user",
            recommendedAction: "Mono-material structure private preview + margin bridge + tax-credit modelling",
            contactWindow: "Thursday mornings GMT",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "charlotte-f",
            name: "Charlotte F.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "X-Dynamic HSE Bottle — Hybrid Recyclate 2022",
            buybackEquity: "+£4,900",
            renewalScore: 0.85,
            upsellScore: 0.86,
            cancellationRisk: "Low (0.10)",
            leadScore: 0.91,
            career: "Head of Packaging Compliance — Legal & Regulatory Firm Client",
            location: "Chelsea, London",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "$312,000",
            missionFitReason: "Hybrid rigid-container account entering margin window; EPR fee relief eligible; mono-material design engagement high",
            recommendedAction: "Full-recyclate structure priority allotment + fee-relief facilitation + margin bridge",
            contactWindow: "Friday afternoons GMT",
            preferredChannel: "Email + Personal Relationship Manager",
          },
          {
            id: "edward-c",
            name: "Edward C.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "HST Pouch — Hybrid Barrier 2021",
            buybackEquity: "+£5,200",
            renewalScore: 0.82,
            upsellScore: 0.80,
            cancellationRisk: "Low (0.13)",
            leadScore: 0.88,
            career: "Investment & Portfolio Director — Consumer Goods Fund",
            location: "St John's Wood, London",
            tenure: "6 years / 3 active programs",
            lifetimeValue: "$398,000",
            missionFitReason: "Contract ending May 2026; margin position confirmed; tax-credit-eligible category",
            recommendedAction: "Mono-material structure first look event + tax-credit partnership offer",
            contactWindow: "Wednesday evenings GMT",
            preferredChannel: "Personal Relationship Manager + WhatsApp",
          },
        ],
      },
      {
        id: "edinburgh-jlr",
        name: "Vantage Flexibles — Edinburgh Plant",
        location: "Edinburgh, EH3 9SR",
        region: "UK",
        tier: "Tier 2",
        missionFit: 81,
        targetCustomers: 50,
        projectedRevenue: "£4.4M",
        customers: [
          {
            id: "angus-m",
            name: "Angus M.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "HSE Bottle — Standard Recyclate 2021",
            buybackEquity: "+£3,800",
            renewalScore: 0.77,
            upsellScore: 0.81,
            cancellationRisk: "Low (0.15)",
            leadScore: 0.86,
            career: "Operations Partner — Asset & Facilities Management Group",
            location: "Morningside, Edinburgh",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "£198,000",
            missionFitReason: "Margin position confirmed; rigid-format loyalist open to mono-material — Scotland packaging grant adds further incentive",
            recommendedAction: "Mono-material structure preview + Scottish sustainability grant briefing + sourcing partnership offer",
            contactWindow: "Tuesday evenings GMT",
            preferredChannel: "Phone + Email",
          },
          {
            id: "fiona-r",
            name: "Fiona R.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Hybrid PHEV-Equivalent Pouch — Dynamic HSE 2022",
            buybackEquity: "+£4,100",
            renewalScore: 0.80,
            upsellScore: 0.78,
            cancellationRisk: "Low (0.17)",
            leadScore: 0.85,
            career: "Founder — Direct-to-Consumer Food Brand",
            location: "Stockbridge, Edinburgh",
            tenure: "3 years / 1 active program",
            lifetimeValue: "£152,000",
            missionFitReason: "Hybrid pouch account; sustainability focus; EPR & Scottish grant eligible; design engagement noted",
            recommendedAction: "Mono-material structure Dynamic spec + full cost-benefit analysis including Scottish grants",
            contactWindow: "Monday mornings GMT",
            preferredChannel: "Email + portal notification",
          },
        ],
      },
      {
        id: "amsterdam-jlr",
        name: "Vantage Barrier Films — Amsterdam Plant",
        location: "Amsterdam, 1017 Netherlands",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 92,
        targetCustomers: 34,
        projectedRevenue: "€4.6M",
        customers: [
          {
            id: "lars-v",
            name: "Lars V.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Autobiography Pouch — Premium Barrier LWB 2022",
            buybackEquity: "+€5,800",
            renewalScore: 0.91,
            upsellScore: 0.89,
            cancellationRisk: "Very Low (0.05)",
            leadScore: 0.94,
            career: "Head of Sustainability — ASML Consumer Division",
            location: "Amsterdam-Zuid, Netherlands",
            tenure: "6 years / 3 active programs",
            lifetimeValue: "€412,000",
            missionFitReason: "Highest margin hybrid account in Amsterdam cluster; strong recyclability intent signalled via design portal; Dutch MIA subsidy eligible",
            recommendedAction: "Mono-material structure private preview + MIA subsidy briefing + margin bridge financing",
            contactWindow: "Tuesday–Thursday 11am–2pm CET",
            preferredChannel: "Personal Relationship Manager + portal",
          },
          {
            id: "anna-d",
            name: "Anna D.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "X-Dynamic HSE Bottle — Hybrid Recyclate 2021",
            buybackEquity: "+€4,200",
            renewalScore: 0.86,
            upsellScore: 0.84,
            cancellationRisk: "Low (0.09)",
            leadScore: 0.90,
            career: "Senior Partner — European Consulting Group",
            location: "Oud-Zuid, Amsterdam",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "€298,000",
            missionFitReason: "Hybrid rigid-container account in margin window; Benelux EPR incentive eligible; portal engagement high",
            recommendedAction: "Full-recyclate structure priority allocation + Benelux incentive modelling + sourcing partnership",
            contactWindow: "Friday afternoons CET",
            preferredChannel: "Email + Relationship Manager",
          },
          {
            id: "pieter-n",
            name: "Pieter N.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Hybrid Barrier Pouch — HSE Dynamic 2022",
            buybackEquity: "+€3,900",
            renewalScore: 0.82,
            upsellScore: 0.80,
            cancellationRisk: "Low (0.12)",
            leadScore: 0.87,
            career: "Private Equity Portfolio Director",
            location: "Apollolaan, Amsterdam",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "€244,000",
            missionFitReason: "Contract ending Q2 2026; margin confirmed; Dutch recycling infrastructure among best in Europe",
            recommendedAction: "Mono-material structure Dynamic spec event + full margin bridge + MIA subsidy walkthrough",
            contactWindow: "Wednesday mornings CET",
            preferredChannel: "Personal Relationship Manager + WhatsApp",
          },
        ],
      },
      {
        id: "hamburg-jlr",
        name: "Vantage Barrier Films — Hamburg Plant",
        location: "Hamburg, 20354 Germany",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 89,
        targetCustomers: 28,
        projectedRevenue: "€3.8M",
        customers: [
          {
            id: "thomas-k",
            name: "Thomas K.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Vogue SE Pouch — Hybrid Barrier 2021",
            buybackEquity: "+€5,100",
            renewalScore: 0.88,
            upsellScore: 0.86,
            cancellationRisk: "Low (0.08)",
            leadScore: 0.92,
            career: "Managing Director — Hapag Consumer Logistics",
            location: "Harvestehude, Hamburg",
            tenure: "7 years / 3 active programs",
            lifetimeValue: "€388,000",
            missionFitReason: "High-margin hybrid pouch account; German recycling incentive (Umweltbonus-equivalent) eligible; portal power user; strong recyclability consideration score",
            recommendedAction: "Mono-material structure private preview in Hamburg + incentive briefing + margin bridge",
            contactWindow: "Thursday 10am–1pm CET",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "sabine-h",
            name: "Sabine H.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "X-Dynamic HSE Bottle — Hybrid Recyclate 2022",
            buybackEquity: "+€4,600",
            renewalScore: 0.84,
            upsellScore: 0.87,
            cancellationRisk: "Low (0.10)",
            leadScore: 0.91,
            career: "Principal Architect — Sustainable Design Practice",
            location: "Blankenese, Hamburg",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "€276,000",
            missionFitReason: "Hybrid rigid-container loyalist in margin window; high mono-material design engagement; sustainability-conscious buyer profile",
            recommendedAction: "Mono-material bespoke structure consultation + recyclate-sourcing package",
            contactWindow: "Monday afternoons CET",
            preferredChannel: "Email + portal",
          },
          {
            id: "henrik-b",
            name: "Henrik B.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "HSE Pouch — Hybrid Barrier 2022",
            buybackEquity: "+€3,400",
            renewalScore: 0.79,
            upsellScore: 0.82,
            cancellationRisk: "Low (0.14)",
            leadScore: 0.86,
            career: "Head of Digital — Beiersdorf-Style Personal Care Brand",
            location: "Eppendorf, Hamburg",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "€219,000",
            missionFitReason: "Contract ending May 2026; margin positive; tech-forward profile aligned with mono-material digital tracking features",
            recommendedAction: "Mono-material structure premiere invite + digital tracking feature walkthrough + margin bridge modelling",
            contactWindow: "Tuesday 9am–11am CET",
            preferredChannel: "Portal + Email",
          },
        ],
      },
      {
        id: "paris-jlr",
        name: "Vantage Specialty Cartons — Paris Plant",
        location: "Paris, 75008 France",
        region: "Europe",
        tier: "Tier 2",
        missionFit: 85,
        targetCustomers: 22,
        projectedRevenue: "€3.0M",
        customers: [
          {
            id: "claire-m",
            name: "Claire M.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "SV Autobiography Pouch — Premium Barrier 2022",
            buybackEquity: "+€5,400",
            renewalScore: 0.87,
            upsellScore: 0.85,
            cancellationRisk: "Very Low (0.07)",
            leadScore: 0.91,
            career: "Managing Partner — Consumer Goods Investment Group",
            location: "16th arrondissement, Paris",
            tenure: "8 years / 4 active programs",
            lifetimeValue: "€524,000",
            missionFitReason: "Highest-LTV account in France cluster; hybrid pouch account in margin window; bonus écologique eligible; mono-material design sessions logged",
            recommendedAction: "Mono-material structure Atelier Paris private event + bonus écologique briefing + bespoke margin bridge",
            contactWindow: "Wednesday afternoons CET",
            preferredChannel: "Personal Relationship Manager + WhatsApp",
          },
          {
            id: "jean-pierre-l",
            name: "Jean-Pierre L.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "X-Dynamic HSE Bottle — Standard Recyclate 2021",
            buybackEquity: "+€3,700",
            renewalScore: 0.80,
            upsellScore: 0.83,
            cancellationRisk: "Low (0.13)",
            leadScore: 0.88,
            career: "Investment Director — Financial Services Group",
            location: "7th arrondissement, Paris",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "€231,000",
            missionFitReason: "Rigid-container loyalist; margin confirmed; Paris low-emission-zone-style regulations driving conversion urgency",
            recommendedAction: "Mono-material structure preview + compliance briefing + bonus écologique + margin bridge",
            contactWindow: "Thursday 10am–12pm CET",
            preferredChannel: "Email + Relationship Manager",
          },
          {
            id: "marie-t",
            name: "Marie T.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "HSE Dynamic Pouch — Hybrid Barrier 2022",
            buybackEquity: "+€4,000",
            renewalScore: 0.83,
            upsellScore: 0.81,
            cancellationRisk: "Low (0.11)",
            leadScore: 0.89,
            career: "CEO — Luxury Retail Group",
            location: "8th arrondissement, Paris",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "€284,000",
            missionFitReason: "Contract ending Q2 2026; compliance pressure accelerating format decision; high design engagement on mono-material structure",
            recommendedAction: "Mono-material private presentation at Paris plant + compliance grant briefing + margin bridge",
            contactWindow: "Friday 11am–1pm CET",
            preferredChannel: "Personal Relationship Manager",
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
    // Revenue and customers distributed across regions to sum to $18M / 170 accounts
    projectedRevenue: { Global: "$18.0M", "North America": "$7.2M", Europe: "$6.3M", UK: "£4.5M" },
    targetCustomers: { Global: 170, "North America": 68, Europe: 60, UK: 42 },
    conversionRate: { Global: "28%", "North America": "32%", Europe: "25%", UK: "30%" },
    sourceModels: ["cancellation", "lead-scoring", "service-retention", "renewal", "customer-experience"],
    color: "#f59e0b",
    tagline: "Recover the relationship before the competitor does",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Order Cancellation Model (v2.9.2)", finding: "412 high-risk orders; 68% linked to lead-time delays >12 weeks — intervention window active", weight: "High" },
        { model: "Manufacturing Reliability (v3.3.7)", finding: "1,240 post-warranty lines predicted to see reliability decline in next 90 days", weight: "High" },
        { model: "Customer Experience Index (v2.1.0)", finding: "Early churn indicators detected in 170 accounts with CEI decline >12 points — portal disengagement precedes defection by 45 days", weight: "High" },
        { model: "Account Scoring (v3.8.4)", finding: "380 previously churned accounts re-engaging on digital channels with score uplift of +0.22", weight: "Medium" },
        { model: "Renewal Model (v5.1.0)", finding: "EU contract holders showing -1.2% renewal trend, risk of Sonoco/Mondi conquest intensifying", weight: "Medium" },
      ],
      correlationStrength: "87.6%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Deploy a white-glove recovery programme for high-LTV accounts showing defection signals. Lead with service excellence and proactive solutions to the pain points identified by the Order Cancellation Model.",
      tactics: [
        "Personal apology call from Regional Director for lead-time-delay affected accounts",
        "Extended service upgrade (3yr/unlimited) as goodwill gesture for NPS recovery",
        "Post-warranty EliteCare protection plan at preferential rates (30% discount)",
        "Loyalty partner event: co-development day at the Vantage Innovation Centre",
        "Competitor conquest defence: loyalty credit for accounts evaluating Sonoco/Mondi",
      ],
      timelineDaysFromNow: { launch: 23, close: 113 },
      expectedROI: "3.2x (18-month)",
    },
    retailers: [
      {
        id: "chicago-gold-coast",
        name: "Vantage Rigid Containers — Chicago Plant",
        location: "Chicago, IL 60611",
        region: "North America",
        tier: "Tier 1",
        missionFit: 89,
        targetCustomers: 52,
        projectedRevenue: "$3.8M",
        customers: [
          {
            id: "david-r",
            name: "David R.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "PET Bottle — 2023 Hybrid Recyclate (On Order)",
            buybackEquity: "N/A (on order)",
            renewalScore: 0.61,
            upsellScore: 0.72,
            cancellationRisk: "High (0.76)",
            leadScore: 0.82,
            career: "Corporate Counsel — Regional Beverage Co-Packer",
            location: "Lincoln Park, Chicago",
            tenure: "3 years / 1 active program",
            lifetimeValue: "$128,000",
            missionFitReason: "Lead-time delay 14 weeks; NPS score dropped from 82 to 31; competitor plant visit detected",
            recommendedAction: "Director-level personal outreach + lead-time acceleration + complimentary bridge-stock provision",
            contactWindow: "Evenings 6–8pm CST",
            preferredChannel: "Direct mobile + WhatsApp",
          },
        ],
      },
      {
        id: "london-mayfair",
        name: "Vantage Flexibles — Mayfair Plant",
        location: "London, W1K 6TF",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 92,
        targetCustomers: 88,
        projectedRevenue: "£3.9M",
        customers: [
          {
            id: "james-w",
            name: "James W.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "Autobiography LWB Pouch — Premium Barrier 2020",
            buybackEquity: "+£3,100",
            renewalScore: 0.58,
            upsellScore: 0.79,
            cancellationRisk: "Medium (0.54)",
            leadScore: 0.78,
            career: "Investment Banking MD — Premium Beverage Fund",
            location: "Knightsbridge, London",
            tenure: "6 years / 3 active programs",
            lifetimeValue: "£548,000",
            missionFitReason: "Post-warranty defection risk; Sonoco competitive design-studio session detected; concierge-tier LTV",
            recommendedAction: "Mayfair plant private viewing of mono-material structure + EliteCare Plus + bespoke commercial-terms restructure",
            contactWindow: "Thursday afternoons GMT",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "isabelle-d",
            name: "Isabelle D.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "HSE Dynamic Bottle — Hybrid Recyclate 2021",
            buybackEquity: "+£2,800",
            renewalScore: 0.62,
            upsellScore: 0.74,
            cancellationRisk: "Medium (0.48)",
            leadScore: 0.80,
            career: "Luxury Brand Packaging Director",
            location: "Belgravia, London",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "£224,000",
            missionFitReason: "NPS dip detected post-delivery; Mondi digital engagement noted; loyalty window open",
            recommendedAction: "Premium structure upgrade proposition + 90-day loyalty hold offer + personalised service excellence call",
            contactWindow: "Tuesday mornings GMT",
            preferredChannel: "Email + Personal Relationship Manager",
          },
        ],
      },
      {
        id: "birmingham-jlr",
        name: "Vantage Rigid Containers — Birmingham Plant",
        location: "Birmingham, B92 8NW",
        region: "UK",
        tier: "Tier 1",
        missionFit: 84,
        targetCustomers: 30,
        projectedRevenue: "£2.2M",
        customers: [
          {
            id: "raj-p",
            name: "Raj P.",
            currentVehicle: "Rigid Container Program",
            currentVariant: "R-Dynamic HSE Bottle — 2023 (On Order)",
            buybackEquity: "N/A (on order)",
            renewalScore: 0.63,
            upsellScore: 0.70,
            cancellationRisk: "High (0.71)",
            leadScore: 0.79,
            career: "Manufacturing Business Owner",
            location: "Edgbaston, Birmingham",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "£148,000",
            missionFitReason: "Order 13 weeks delayed; NPS decline 74 to 38; competitor Smurfit WestRock trial-run detected",
            recommendedAction: "Regional Director call + expedited production slot + complimentary extended service offer",
            contactWindow: "Monday evenings GMT",
            preferredChannel: "Direct phone + Email",
          },
          {
            id: "sarah-t",
            name: "Sarah T.",
            currentVehicle: "High-Barrier Flexible Pouch Program",
            currentVariant: "S Pouch — Standard Barrier 2020",
            buybackEquity: "+£1,900",
            renewalScore: 0.55,
            upsellScore: 0.68,
            cancellationRisk: "Medium (0.52)",
            leadScore: 0.76,
            career: "HR & Operations Director",
            location: "Moseley, Birmingham",
            tenure: "3 years / 1 active program",
            lifetimeValue: "£92,000",
            missionFitReason: "Post-warranty approaching; competitor comparison research detected; loyalty incentive window open",
            recommendedAction: "EliteCare protection plan + loyalty upgrade incentive toward rigid container program + complimentary service",
            contactWindow: "Wednesday lunchtime GMT",
            preferredChannel: "Email + SMS",
          },
        ],
      },
    ],
  },
  {
    id: "defender-performance-drive",
    title: "Manufacturing Performance & Capacity Drive",
    subtitle: "Convert standard-line accounts to high-throughput APEX-grade production programs",
    priority: "Strategic",
    // Revenue and customers distributed across regions to sum to $16.2M / 148 accounts
    projectedRevenue: { Global: "$16.2M", "North America": "$6.8M", Europe: "$5.4M", UK: "£4.0M" },
    targetCustomers: { Global: 148, "North America": 62, Europe: 50, UK: 36 },
    conversionRate: { Global: "31%", "North America": "36%", Europe: "27%", UK: "33%" },
    sourceModels: ["upselling", "intelligent-lead", "lead-scoring", "buyback", "customer-experience"],
    color: "#8b5cf6",
    tagline: "From capability to conquest — the performance step-up",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Upselling Engine (v4.0.3)", finding: "Standard-line accounts showing 0.74 propensity for high-throughput APEX-grade upgrade; category demand at 6-yr high", weight: "High" },
        { model: "Intelligent Account ID (v4.2.1)", finding: "Sealed Air & Mondi incumbent accounts displaying 0.68 conquest affinity toward Vantage APEX-grade lines", weight: "High" },
        { model: "Customer Experience Index (v2.1.0)", finding: "Performance-focused accounts show 92+ CEI scores with highest account touchpoint frequency — ideal for exclusive event activation", weight: "High" },
        { model: "Value Re-Commitment Model (v6.0.1)", finding: "Standard-line 2021/22 programs at +$5.8k avg margin — optimal upgrade economics for APEX step-up", weight: "Medium" },
        { model: "Account Scoring (v3.8.4)", finding: "Performance-persona segment scoring ≥0.88 concentrated in TX, FL, CO, UAE & South Africa", weight: "Medium" },
      ],
      correlationStrength: "91.3%",
    },
    therefore: {
      title: "The Strategic Insight",
      strategy: "Target high-margin standard-line accounts with an APEX-grade high-throughput production line experience event. Leverage the scarcity narrative (limited capacity slots) with a priority reservation window to drive urgency.",
      tactics: [
        "Invitation-only APEX 'Capability Unleashed' plant experience at flagship innovation centres",
        "Guaranteed margin preservation for 90 days during pilot-run period",
        "Performance-line financing: preferential rate for 24 months as launch incentive",
        "APEX customisation studio access (bespoke structure programme, 6-week lead time)",
        "Conquest activation: Sealed Air / Mondi incumbent accounts via precision account-based marketing campaign",
      ],
      timelineDaysFromNow: { launch: 27, close: 207 },
      expectedROI: "5.1x (18-month)",
    },
    retailers: [
      {
        id: "dallas-premium",
        name: "Vantage Rigid Containers — Dallas Plant",
        location: "Dallas, TX 75201",
        region: "North America",
        tier: "Tier 1",
        missionFit: 94,
        targetCustomers: 58,
        projectedRevenue: "$7.2M",
        customers: [
          {
            id: "blake-c",
            name: "Blake C.",
            currentVehicle: "Standard-Line Production Program",
            currentVariant: "First Edition High-Volume Line 2022",
            buybackEquity: "+$6,800",
            renewalScore: 0.84,
            upsellScore: 0.94,
            cancellationRisk: "Very Low (0.06)",
            leadScore: 0.93,
            career: "Energy Sector Packaging CEO",
            location: "Highland Park, Dallas",
            tenure: "5 years / 2 active programs",
            lifetimeValue: "$294,000",
            missionFitReason: "High-throughput enthusiast profile + active plant-efficiency user + high margin + APEX design-studio session 3 times",
            recommendedAction: "APEX-grade priority reservation + Innovation Centre event invite + bespoke structure studio booking",
            contactWindow: "Saturday mornings CST",
            preferredChannel: "Relationship Manager + event invite",
          },
          {
            id: "hunter-b",
            name: "Hunter B.",
            currentVehicle: "High-Throughput Line Program",
            currentVariant: "P525 Carpathian High-Speed Line 2021",
            buybackEquity: "+$7,400",
            renewalScore: 0.80,
            upsellScore: 0.91,
            cancellationRisk: "Low (0.09)",
            leadScore: 0.90,
            career: "Private Equity Principal — Packaging Portfolio",
            location: "Preston Hollow, Dallas",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "$328,000",
            missionFitReason: "High-speed line owner; margin premium confirmed; APEX social engagement + comparison research against competitor high-speed lines",
            recommendedAction: "APEX Capability Unleashed invite + preferential financing proposition + priority bespoke allocation",
            contactWindow: "Friday afternoons CST",
            preferredChannel: "Direct Relationship Manager call",
          },
        ],
      },
      {
        id: "munich-jlr",
        name: "Vantage Barrier Films — Munich Plant",
        location: "Munich, Bavaria 80331",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 87,
        targetCustomers: 50,
        projectedRevenue: "€5.6M",
        customers: [
          {
            id: "thomas-k",
            name: "Thomas K.",
            currentVehicle: "High-Throughput Line Program",
            currentVariant: "Hybrid PHEV-Equivalent Line — X Configuration 2022",
            buybackEquity: "+€4,900",
            renewalScore: 0.79,
            upsellScore: 0.89,
            cancellationRisk: "Low (0.14)",
            leadScore: 0.88,
            career: "Tier-1 Supplier CTO — Automotive Component Packaging",
            location: "Schwabing, Munich",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "€218,000",
            missionFitReason: "Tech-manufacturing professional; APEX social media engagement high; competitor high-speed line comparison research detected",
            recommendedAction: "Innovation Centre APEX line experience + German engineering showcase narrative",
            contactWindow: "Wednesday 7–9pm CET",
            preferredChannel: "Email + LinkedIn InMail",
          },
          {
            id: "henrik-s",
            name: "Henrik S.",
            currentVehicle: "Standard-Line Production Program",
            currentVariant: "P300 S Configuration 2022",
            buybackEquity: "+€3,700",
            renewalScore: 0.74,
            upsellScore: 0.82,
            cancellationRisk: "Low (0.18)",
            leadScore: 0.85,
            career: "Engineering Consultant — Manufacturing Efficiency",
            location: "Maxvorstadt, Munich",
            tenure: "3 years / 1 active program",
            lifetimeValue: "€142,000",
            missionFitReason: "Standard-line account in margin window; innovation-centre enthusiast; competitor high-speed line comparison search logged",
            recommendedAction: "APEX innovation-centre line experience invitation + performance-line financing at preferential rate",
            contactWindow: "Thursday evenings CET",
            preferredChannel: "Email + phone",
          },
        ],
      },
      {
        id: "manchester-jlr",
        name: "Vantage Specialty Cartons — Manchester Plant",
        location: "Manchester, M3 4LQ",
        region: "UK",
        tier: "Tier 1",
        missionFit: 85,
        targetCustomers: 40,
        projectedRevenue: "£3.9M",
        customers: [
          {
            id: "liam-o",
            name: "Liam O.",
            currentVehicle: "Standard-Line Production Program",
            currentVariant: "P400 First Edition Configuration 2022",
            buybackEquity: "+£4,600",
            renewalScore: 0.82,
            upsellScore: 0.88,
            cancellationRisk: "Low (0.11)",
            leadScore: 0.90,
            career: "Media Production Packaging Owner",
            location: "Alderley Edge, Cheshire",
            tenure: "4 years / 2 active programs",
            lifetimeValue: "£241,000",
            missionFitReason: "Standard-line account in margin window; APEX social engagement confirmed; high-throughput lifestyle profile",
            recommendedAction: "APEX Capability Unleashed regional plant event + bespoke structure studio visit",
            contactWindow: "Weekends CST / Saturday preferred",
            preferredChannel: "Personal Relationship Manager",
          },
          {
            id: "natasha-b",
            name: "Natasha B.",
            currentVehicle: "High-Throughput Line Program",
            currentVariant: "P400 HSE Configuration 2021",
            buybackEquity: "+£5,100",
            renewalScore: 0.76,
            upsellScore: 0.84,
            cancellationRisk: "Low (0.15)",
            leadScore: 0.87,
            career: "Consultant — Healthcare Packaging Advisory",
            location: "Hale Barns, Cheshire",
            tenure: "3 years / 1 active program",
            lifetimeValue: "£196,000",
            missionFitReason: "High-throughput account in margin window; APEX curiosity signals online; competitor comparison search noted",
            recommendedAction: "APEX reservation priority + 90-day margin preservation guarantee + preferential financing",
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
  { id: 1, text: "Initialising Lumina Intelligence Engine v3.4...", delay: 0, models: [] },
  { id: 2, text: "Querying Value Re-Commitment Model (v6.0.1)... 5,640 positive-margin accounts identified", delay: 700, models: ["buyback"] },
  { id: 3, text: "Accessing Renewal Model (v5.1.0)... 8,912 high-margin contracts flagged for Q2 2026", delay: 1400, models: ["buyback", "renewal"] },
  { id: 4, text: "Cross-referencing Account Scoring (v3.8.4)... 3,247 accounts at ≥0.85 priority threshold", delay: 2100, models: ["buyback", "renewal", "lead-scoring"] },
  { id: 5, text: "Correlating Upselling Engine (v4.0.3)... £12.8M / $84.2M revenue opportunity scoped", delay: 2800, models: ["buyback", "renewal", "lead-scoring", "upselling"] },
  { id: 6, text: "Integrating Order Cancellation Risk (v2.9.2)... 412 high-risk orders flagged for intervention", delay: 3500, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation"] },
  { id: 7, text: "Factoring Manufacturing Reliability signals (v3.3.7)... 1,840 retention opportunities mapped", delay: 4200, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention"] },
  { id: 8, text: "Layering Intelligent Account ID personas (v4.2.1)... conquest affinity overlaid across UK, NA & EU", delay: 4900, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead"] },
  { id: 9, text: "Synthesising Customer Experience Index (v2.1.0)... 2,840 high-loyalty + 412 churn-risk accounts scored", delay: 5600, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 10, text: "Running mission synthesis algorithm... pattern recognition active", delay: 6300, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 11, text: "Clustering account segments by mission fit... 3 high-confidence missions identified", delay: 7000, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead", "customer-experience"] },
  { id: 12, text: "Validating revenue projections against historical conversion rates...", delay: 7700, models: [] },
  { id: 13, text: "Mission synthesis complete. 3 actionable missions generated. Combined revenue: $72.2M across 598 qualified accounts", delay: 8400, models: [] },
];

export const connectionMap: Record<string, string[]> = {
  "ev-equity-pivot": ["buyback", "renewal", "upselling", "intelligent-lead", "customer-experience"],
  "loyalty-recovery": ["cancellation", "lead-scoring", "service-retention", "renewal", "customer-experience"],
  "defender-performance-drive": ["upselling", "intelligent-lead", "lead-scoring", "buyback", "customer-experience"],
};
