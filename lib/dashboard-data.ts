// JLR Global Analytics Dashboard — Contextual Data Layer
// Enriched with real-world luxury automotive market intelligence

export type Region = "Global" | "North America" | "Europe";
export type Timeframe = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026" | "FY 2026";

export interface ModelCardData {
  id: string;
  title: string;
  shortTitle: string;
  metric: string;
  metricValue: Record<Region, string>;
  metricDelta: Record<Region, string>;
  metricTrend: Record<Region, "up" | "down" | "neutral">;
  insightSummary: Record<Region, string>;
  dataSources: string[];
  lastRun: string;
  modelVersion: string;
  accuracy: number;
  color: string;
  icon: string;
  regionalDistribution: Record<Region, { label: string; value: number; color: string }[]>;
  pedigree: {
    inputFeatures: string[];
    outputType: string;
    trainingDataSize: string;
    refreshCadence: string;
    nextScheduledRun: string;
    slaCompliance: string;
    modelType: string;
  };
}

export const modelCards: ModelCardData[] = [
  {
    id: "intelligent-lead",
    title: "Intelligent Lead Identification",
    shortTitle: "Intelligent Lead",
    metric: "Active Lead Pipeline",
    metricValue: { Global: "14,820", "North America": "6,340", Europe: "5,910" },
    metricDelta: { Global: "+12.4%", "North America": "+18.2%", Europe: "+7.6%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up" },
    insightSummary: {
      Global: "AI-identified 2,140 conquest leads from BMW 5-Series & Mercedes E-Class segments showing JLR affinity signals",
      "North America": "Tesla Model Y intenders trending toward Defender 90 with 0.78 crossover propensity score",
      Europe: "Audi Q5 owners in DACH region displaying strong Range Rover Sport consideration signals via digital touchpoints",
    },
    dataSources: ["Salesforce CRM", "CDK DMS", "Google Analytics 4", "Meta Pixel", "JLR InControl"],
    lastRun: "2026-03-05 06:22 UTC",
    modelVersion: "v4.2.1",
    accuracy: 87,
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
    },
    pedigree: {
      inputFeatures: ["Digital browsing signals", "Social media intent", "Competitive ownership data", "Geo-demographic index", "Lifestyle scoring"],
      outputType: "Lead Propensity Score (0–1) + Vehicle Affinity Rank",
      trainingDataSize: "4.2M customer interactions (36 months)",
      refreshCadence: "Daily at 06:00 UTC",
      nextScheduledRun: "2026-03-06 06:00 UTC",
      slaCompliance: "99.8%",
      modelType: "Gradient Boosted Trees (XGBoost) + Collaborative Filtering",
    },
  },
  {
    id: "lead-scoring",
    title: "Lead Scoring & Prioritisation",
    shortTitle: "Lead Scoring",
    metric: "High-Priority Score (≥0.85)",
    metricValue: { Global: "3,247", "North America": "1,412", Europe: "1,108" },
    metricDelta: { Global: "+8.7%", "North America": "+14.3%", Europe: "+5.1%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up" },
    insightSummary: {
      Global: "3,247 prospects scored ≥0.85 — retailer contact within 48hrs correlates to 34% higher conversion vs. baseline",
      "North America": "Manhattan, Beverly Hills & Miami Metro clusters yielding highest conversion rates for Range Rover Autobiography",
      Europe: "London, Munich & Zürich clusters showing disproportionate RR Autobiography intent; EV variant preference at 61%",
    },
    dataSources: ["SAP S/4HANA", "Salesforce Sales Cloud", "Dealerwholesale DMS", "IHS Markit"],
    lastRun: "2026-03-05 07:45 UTC",
    modelVersion: "v3.8.4",
    accuracy: 91,
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
    },
    pedigree: {
      inputFeatures: ["Enquiry recency & frequency", "Configurator engagement depth", "Test drive history", "Finance pre-approval status", "Social wealth proxy"],
      outputType: "Priority Score (0–1) + Urgency Flag",
      trainingDataSize: "1.8M qualified leads (24 months)",
      refreshCadence: "Every 6 hours",
      nextScheduledRun: "2026-03-05 12:00 UTC",
      slaCompliance: "99.5%",
      modelType: "Random Forest Ensemble + Logistic Regression blend",
    },
  },
  {
    id: "renewal",
    title: "Contract Renewal Optimisation",
    shortTitle: "Renewal",
    metric: "High-Equity Leases Ending Q2 2026",
    metricValue: { Global: "8,912", "North America": "4,210", Europe: "3,180" },
    metricDelta: { Global: "+3.2%", "North America": "+6.8%", Europe: "-1.2%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "down" },
    insightSummary: {
      Global: "750 Range Rover leases with >$8k positive equity ending in 90 days; early renewal incentive window active",
      "North America": "4,210 leases ending Q2 2026 — 62% showing proactive renewal intent; avg. equity position $9,240",
      Europe: "3,180 EU leases; BEV transition incentive (€3,500 SEAI/BAFA) creates strong Range Rover Electric upsell window",
    },
    dataSources: ["JLR Financial Services", "SAP BRIM", "Reynolds & Reynolds", "FCA UK"],
    lastRun: "2026-03-04 22:10 UTC",
    modelVersion: "v5.1.0",
    accuracy: 89,
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
    },
    pedigree: {
      inputFeatures: ["Contract end date", "Residual value vs. market", "Mileage trajectory", "Service history score", "Repeat-buyer probability"],
      outputType: "Renewal Probability + Optimal Contact Window",
      trainingDataSize: "2.3M historical contracts (48 months)",
      refreshCadence: "Daily at 22:00 UTC",
      nextScheduledRun: "2026-03-05 22:00 UTC",
      slaCompliance: "99.9%",
      modelType: "Survival Analysis (Cox PH) + Neural Network",
    },
  },
  {
    id: "cancellation",
    title: "Cancellation Risk Prediction",
    shortTitle: "Cancellation",
    metric: "At-Risk Orders (≥70% churn)",
    metricValue: { Global: "412", "North America": "187", Europe: "156" },
    metricDelta: { Global: "-18.4%", "North America": "-22.1%", Europe: "-13.8%" },
    metricTrend: { Global: "down", "North America": "down", Europe: "down" },
    insightSummary: {
      Global: "412 high-risk cancellations flagged; proactive outreach programme reduced churn by 18.4% vs. prior quarter",
      "North America": "187 at-risk orders; 68% linked to delivery delays >12 weeks — dealer intervention rate showing 44% save rate",
      Europe: "156 flagged; EV charging anxiety & delivery lead time primary drivers; concierge home-charger programme reducing risk",
    },
    dataSources: ["JLR Order Bank", "SAP SD", "CDK DMS", "NPS Pulse Survey"],
    lastRun: "2026-03-05 08:30 UTC",
    modelVersion: "v2.9.2",
    accuracy: 84,
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
    },
    pedigree: {
      inputFeatures: ["Order age", "Customer contact frequency", "Delivery ETA variance", "NPS score trajectory", "Competitor price index"],
      outputType: "Churn Probability (0–1) + Primary Risk Driver",
      trainingDataSize: "890K order histories (36 months)",
      refreshCadence: "Every 4 hours",
      nextScheduledRun: "2026-03-05 12:30 UTC",
      slaCompliance: "99.3%",
      modelType: "Gradient Boosted Classifier + SHAP explainability",
    },
  },
  {
    id: "service-retention",
    title: "Service Retention Intelligence",
    shortTitle: "Service Retention",
    metric: "Retention Opportunity Score",
    metricValue: { Global: "71.4%", "North America": "68.2%", Europe: "74.8%" },
    metricDelta: { Global: "+4.1%", "North America": "+2.8%", Europe: "+5.9%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up" },
    insightSummary: {
      Global: "1,840 vehicles overdue for annual care plan renewal; personalised service reminder activation showing 31% uplift",
      "North America": "Post-warranty cliff at 36 months; 1,240 vehicles predicted to defect to independents — JLR EliteCare retention offer active",
      Europe: "Integrated OTA update notifications driving 23% increase in dealership aftersales visits in DACH & Nordics",
    },
    dataSources: ["JLR ETAS", "Keyloop DMS", "SAP Service Cloud", "InControl Remote"],
    lastRun: "2026-03-05 04:00 UTC",
    modelVersion: "v3.3.7",
    accuracy: 86,
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
    },
    pedigree: {
      inputFeatures: ["Last service date", "Mileage since service", "OTA update status", "Customer lifetime value", "Nearest approved retailer distance"],
      outputType: "Defection Risk Score + Recommended Intervention",
      trainingDataSize: "3.1M service records (60 months)",
      refreshCadence: "Daily at 04:00 UTC",
      nextScheduledRun: "2026-03-06 04:00 UTC",
      slaCompliance: "99.7%",
      modelType: "Hazard Model + Decision Tree",
    },
  },
  {
    id: "upselling",
    title: "Upselling & Cross-sell Engine",
    shortTitle: "Upselling",
    metric: "Upsell Revenue Opportunity",
    metricValue: { Global: "$84.2M", "North America": "$41.6M", Europe: "$29.8M" },
    metricDelta: { Global: "+22.7%", "North America": "+31.4%", Europe: "+16.2%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up" },
    insightSummary: {
      Global: "2,890 current owners qualify for personalised upgrade to Range Rover first editions — avg. incremental revenue $29.2k",
      "North America": "Defender 90 owners showing 0.74 propensity to upgrade to Defender 110 MHEV; SUV demand index at 6-yr high",
      Europe: "I-Pace owners with >30k mi showing strong Range Rover Electric pre-order intent (87% WLTP range satisfaction threshold)",
    },
    dataSources: ["SAP CRM", "JLR InControl Data Lake", "CDK Elead", "Lotame DMP"],
    lastRun: "2026-03-04 23:55 UTC",
    modelVersion: "v4.0.3",
    accuracy: 82,
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
    },
    pedigree: {
      inputFeatures: ["Current vehicle spec", "Configurator behaviour", "Household income proxy", "Lifestyle & life-stage events", "Competitor activity exposure"],
      outputType: "Upgrade Propensity + Revenue Impact Estimate",
      trainingDataSize: "2.6M owner journeys (48 months)",
      refreshCadence: "Daily at 23:00 UTC",
      nextScheduledRun: "2026-03-05 23:00 UTC",
      slaCompliance: "99.1%",
      modelType: "Neural Collaborative Filtering + LightGBM",
    },
  },
  {
    id: "buyback",
    title: "Buyback & Trade-In Valuation",
    shortTitle: "Buyback",
    metric: "Positive Equity Vehicles",
    metricValue: { Global: "5,640", "North America": "2,890", Europe: "1,920" },
    metricDelta: { Global: "+9.3%", "North America": "+15.7%", Europe: "+4.2%" },
    metricTrend: { Global: "up", "North America": "up", Europe: "up" },
    insightSummary: {
      Global: "5,640 vehicles with avg. +$4.2k positive equity — trade-in campaign activation projected at 68% take-up rate",
      "North America": "2026 MY Range Rover Autobiography commands +$8.4k over book value; scarcity premium driven by 14-week order bank",
      Europe: "Defender PHEV models trading at +€5.1k over CAP HPI; UK & German markets showing highest buyback intent signals",
    },
    dataSources: ["Black Book / CAP HPI", "JLR Financial Services", "Manheim Auctions", "SAP BRIM", "Cox Automotive"],
    lastRun: "2026-03-05 09:00 UTC",
    modelVersion: "v6.0.1",
    accuracy: 93,
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
    },
    pedigree: {
      inputFeatures: ["Current market value (Black Book/CAP HPI)", "Mileage & condition grade", "Regional demand index", "Days to auction floor", "Owner equity position"],
      outputType: "Trade-in Valuation + Equity Position + Urgency Score",
      trainingDataSize: "1.9M trade-in transactions (60 months)",
      refreshCadence: "Twice daily (06:00 & 18:00 UTC)",
      nextScheduledRun: "2026-03-05 18:00 UTC",
      slaCompliance: "99.9%",
      modelType: "Ensemble Valuation Model (Gradient Boost + CatBoost)",
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
    timeline: string;
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

export const missions: Mission[] = [
  {
    id: "ev-equity-pivot",
    title: "The EV Equity-Swap Campaign",
    subtitle: "Convert high-equity PHEV/ICE owners to Range Rover Electric",
    priority: "Critical",
    projectedRevenue: { Global: "$31.4M", "North America": "$14.8M", Europe: "$11.2M" },
    targetCustomers: { Global: 1842, "North America": 820, Europe: 680 },
    conversionRate: { Global: "34%", "North America": "38%", Europe: "31%" },
    sourceModels: ["buyback", "renewal", "upselling", "intelligent-lead"],
    color: "#3b82f6",
    tagline: "Turn equity into EV ownership — before the window closes",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Buyback Model (v6.0.1)", finding: "5,640 vehicles with avg. +$4.2k positive equity; Defender PHEV commands +€5.1k over CAP HPI", weight: "High" },
        { model: "Renewal Model (v5.1.0)", finding: "750 Range Rover leases ending Q2 2026 with >$8k equity — 90-day critical window open", weight: "High" },
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
      timeline: "Launch: 16 Mar 2026 | Close: 30 June 2026",
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
        targetCustomers: 12,
        projectedRevenue: "$1.24M",
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
        ],
      },
      {
        id: "manhattan-luxury",
        name: "Manhattan Luxury JLR",
        location: "New York, NY 10022",
        region: "North America",
        tier: "Tier 1",
        missionFit: 91,
        targetCustomers: 24,
        projectedRevenue: "$2.18M",
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
        ],
      },
      {
        id: "beverly-hills-jlr",
        name: "Beverly Hills JLR",
        location: "Beverly Hills, CA 90210",
        region: "North America",
        tier: "Tier 1",
        missionFit: 88,
        targetCustomers: 18,
        projectedRevenue: "$1.86M",
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
        ],
      },
    ],
  },
  {
    id: "loyalty-recovery",
    title: "The Loyalty Recovery Mission",
    subtitle: "Re-engage high-value churned & at-risk owners before competitor conquest",
    priority: "High",
    projectedRevenue: { Global: "$18.7M", "North America": "$8.2M", Europe: "$7.4M" },
    targetCustomers: { Global: 980, "North America": 420, Europe: 380 },
    conversionRate: { Global: "28%", "North America": "32%", Europe: "25%" },
    sourceModels: ["cancellation", "lead-scoring", "service-retention", "renewal"],
    color: "#f59e0b",
    tagline: "Recover the relationship before the competitor does",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Cancellation Model (v2.9.2)", finding: "412 high-risk orders; 68% linked to delivery delays >12 weeks — intervention window active", weight: "High" },
        { model: "Service Retention (v3.3.7)", finding: "1,240 post-warranty vehicles predicted to defect to independents in next 90 days", weight: "High" },
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
      timeline: "Launch: 28 Mar 2026 | Rolling: Q2 2026",
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
        targetCustomers: 15,
        projectedRevenue: "$980K",
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
        targetCustomers: 22,
        projectedRevenue: "£1.82M",
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
        ],
      },
    ],
  },
  {
    id: "defender-performance-drive",
    title: "Defender Performance Drive",
    subtitle: "Convert Defender Sport owners to Defender OCTA & 110 V8 Performance editions",
    priority: "Strategic",
    projectedRevenue: { Global: "$22.1M", "North America": "$12.4M", Europe: "$7.8M" },
    targetCustomers: { Global: 1240, "North America": 610, Europe: 440 },
    conversionRate: { Global: "31%", "North America": "36%", Europe: "27%" },
    sourceModels: ["upselling", "intelligent-lead", "lead-scoring", "buyback"],
    color: "#8b5cf6",
    tagline: "From capability to conquest — the performance step-up",
    because: {
      title: "The Data Correlation",
      dataPoints: [
        { model: "Upselling Engine (v4.0.3)", finding: "Defender 90 owners showing 0.74 propensity for 110 MHEV upgrade; SUV demand at 6-yr high", weight: "High" },
        { model: "Intelligent Lead (v4.2.1)", finding: "BMW X5M & Mercedes AMG GLE owners displaying 0.68 conquest affinity toward Defender OCTA", weight: "High" },
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
      timeline: "Launch: 01 Apr 2026 | Q3 delivery priority",
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
        targetCustomers: 19,
        projectedRevenue: "$2.04M",
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
        ],
      },
      {
        id: "munich-jlr",
        name: "JLR Munich Prestige",
        location: "Munich, Bavaria 80331",
        region: "Europe",
        tier: "Tier 1",
        missionFit: 87,
        targetCustomers: 16,
        projectedRevenue: "€1.38M",
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
        ],
      },
    ],
  },
];

// ─── REASONING ENGINE ─────────────────────────────────────────────────────────

export const reasoningSteps = [
  { id: 1, text: "Initialising Meridian Intelligence Engine v3.4...", delay: 0, models: [] },
  { id: 2, text: "Querying Buyback Model (v6.0.1)... 5,640 positive-equity vehicles identified", delay: 800, models: ["buyback"] },
  { id: 3, text: "Accessing Renewal Model (v5.1.0)... 8,912 high-equity leases flagged for Q2 2026", delay: 1600, models: ["buyback", "renewal"] },
  { id: 4, text: "Cross-referencing Lead Scoring (v3.8.4)... 3,247 leads at ≥0.85 priority threshold", delay: 2400, models: ["buyback", "renewal", "lead-scoring"] },
  { id: 5, text: "Correlating Upselling Engine (v4.0.3)... $84.2M revenue opportunity scoped", delay: 3200, models: ["buyback", "renewal", "lead-scoring", "upselling"] },
  { id: 6, text: "Integrating Cancellation Risk (v2.9.2)... 412 high-risk orders flagged for intervention", delay: 4000, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation"] },
  { id: 7, text: "Factoring Service Retention signals (v3.3.7)... 1,840 retention opportunities mapped", delay: 4800, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention"] },
  { id: 8, text: "Layering Intelligent Lead personas (v4.2.1)... conquest affinity overlaid", delay: 5600, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead"] },
  { id: 9, text: "Running mission synthesis algorithm... pattern recognition active", delay: 6400, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead"] },
  { id: 10, text: "Clustering customer segments by mission fit... 3 high-confidence missions identified", delay: 7200, models: ["buyback", "renewal", "lead-scoring", "upselling", "cancellation", "service-retention", "intelligent-lead"] },
  { id: 11, text: "Validating revenue projections against historical conversion rates...", delay: 8000, models: [] },
  { id: 12, text: "Mission synthesis complete. 3 actionable missions generated. Combined revenue potential: $72.2M", delay: 8800, models: [] },
];

export const connectionMap: Record<string, string[]> = {
  "ev-equity-pivot": ["buyback", "renewal", "upselling", "intelligent-lead"],
  "loyalty-recovery": ["cancellation", "lead-scoring", "service-retention", "renewal"],
  "defender-performance-drive": ["upselling", "intelligent-lead", "lead-scoring", "buyback"],
};
