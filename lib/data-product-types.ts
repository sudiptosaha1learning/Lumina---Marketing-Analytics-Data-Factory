// ─── Agent Step Types ──────────────────────────────────────────────────────

export type AgentStepId =
  | "opportunity"
  | "persona"
  | "discovery"
  | "quality"
  | "kpi"
  | "model"
  | "pipeline"
  | "validation"
  | "documentation"
  | "governance"
  | "publishing";

export type AgentStepStatus = "pending" | "running" | "awaiting_review" | "approved" | "rejected" | "skipped";

export interface AgentStep {
  id: AgentStepId;
  label: string;
  sublabel: string;
  status: AgentStepStatus;
  confidence: number | null;
  startedAt: string | null;
  completedAt: string | null;
  output: Record<string, unknown> | null;
  editedOutput: Record<string, unknown> | null;
  interventions: Intervention[];
}

export interface Intervention {
  id: string;
  timestamp: string;
  type: "edit" | "approve" | "reject" | "override";
  field?: string;
  before?: unknown;
  after?: unknown;
  note?: string;
  userId: string;
}

// ─── Data Product Project ──────────────────────────────────────────────────

export interface DataProductProject {
  id: string;
  name: string;
  requestText: string;
  status: "draft" | "in_progress" | "review" | "published" | "failed";
  createdAt: string;
  updatedAt: string;
  currentStep: AgentStepId | null;
  steps: Record<AgentStepId, AgentStep>;
  publishedAt: string | null;
  owner: string;
}

// ─── Agent Outputs ──────────────────────────────────────────────────────────

export interface OpportunityOutput {
  purpose: string;
  scope: string;
  assumptions: string[];
  initialKPIs: string[];
  problemStatement: string;
}

export interface PersonaOutput {
  personas: Persona[];
  userStories: string[];
}

export interface Persona {
  role: string;
  jobsToBeDone: string[];
  painPoints: string[];
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: string[];
  freshness: string;
  owner: string;
  qualityScore: number;
  selected: boolean;
}

export interface DiscoveryOutput {
  candidateSources: DataSource[];
  joinHypotheses: string[];
  gaps: string[];
}

export interface QualityIssue {
  source: string;
  field: string;
  issueType: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
  overridden: boolean;
}

export interface QualityOutput {
  overallScore: number;
  issues: QualityIssue[];
  remediations: string[];
  readinessAssessment: string;
}

export interface KPIDefinition {
  name: string;
  formula: string;
  description: string;
  threshold?: string;
  lookbackWindow: string;
  glossaryEntry: string;
}

export interface KPIOutput {
  kpis: KPIDefinition[];
  scoreBands: Record<string, string>;
}

export interface FieldDefinition {
  name: string;
  type: string;
  description: string;
  sourceTable: string;
  isPII: boolean;
  nullable: boolean;
}

export interface ModelTable {
  name: string;
  grain: string;
  type: "fact" | "dimension" | "bridge";
  fields: FieldDefinition[];
}

export interface ModelOutput {
  tables: ModelTable[];
  relationships: string[];
  grain: string;
}

export interface PipelineStep {
  order: number;
  name: string;
  type: "extract" | "transform" | "load" | "test";
  sql?: string;
  description: string;
}

export interface PipelineOutput {
  steps: PipelineStep[];
  dbtModels: string[];
  orchestrationSteps: string[];
  scheduleFrequency: string;
}

export interface TestCase {
  name: string;
  type: "null_check" | "range_check" | "referential" | "uniqueness" | "freshness" | "custom";
  target: string;
  status: "pass" | "fail" | "pending";
  detail: string;
}

export interface ValidationOutput {
  testSuite: TestCase[];
  passRate: number;
  anomalies: string[];
  summary: string;
}

export interface DocumentationOutput {
  productDescription: string;
  fieldDescriptions: Record<string, string>;
  lineageSummary: string;
  usageNotes: string;
  sampleQueries: string[];
}

export interface GovernanceRule {
  field: string;
  classification: "PII" | "Sensitive" | "Internal" | "Public";
  maskingRule: string;
  approvalRequired: boolean;
  businessJustification: string | null;
  overridden: boolean;
}

export interface GovernanceOutput {
  piiFindings: GovernanceRule[];
  accessControlMatrix: Record<string, string[]>;
  approvalRequirements: string[];
  complianceNotes: string;
}

export interface PublishingOutput {
  productCard: {
    name: string;
    description: string;
    owner: string;
    domain: string;
    tags: string[];
    version: string;
    refreshFrequency: string;
    endpoints: string[];
    status: "published";
  };
  releaseNotes: string;
  publishedAt: string;
}

// ─── Mock Catalog ──────────────────────────────────────────────────────────

export const MOCK_DATA_CATALOG: DataSource[] = [
  {
    id: "crm_customers",
    name: "CRM Customers",
    description: "Master customer records including demographics, contact info, vehicle ownership history and loyalty tier.",
    fields: ["customer_id", "first_name", "last_name", "email", "phone", "postcode", "loyalty_tier", "vehicle_count", "last_purchase_date", "lifetime_value"],
    freshness: "Daily",
    owner: "CRM Platform Team",
    qualityScore: 87,
    selected: false,
  },
  {
    id: "website_events",
    name: "Website Events",
    description: "Clickstream and behavioural events from jaguarlandrover.com, configurator, and dealer portal sessions.",
    fields: ["event_id", "customer_id", "session_id", "event_type", "page_url", "model_viewed", "cta_clicked", "timestamp", "device_type", "source_medium"],
    freshness: "Real-time (5 min lag)",
    owner: "Digital Analytics",
    qualityScore: 91,
    selected: false,
  },
  {
    id: "email_clicks",
    name: "Email Campaign Clicks",
    description: "Email marketing engagement data including opens, clicks, unsubscribes, and model-specific engagement signals.",
    fields: ["email_id", "customer_id", "campaign_id", "campaign_name", "sent_at", "opened_at", "clicked_at", "clicked_url", "model_featured", "unsubscribed"],
    freshness: "Daily",
    owner: "CRM Marketing",
    qualityScore: 79,
    selected: false,
  },
  {
    id: "campaign_responses",
    name: "Campaign Responses",
    description: "Multi-channel campaign response tracking including direct mail, phone, and digital response events.",
    fields: ["response_id", "customer_id", "campaign_id", "channel", "response_type", "response_date", "offer_accepted", "vehicle_of_interest", "dealer_code"],
    freshness: "Daily",
    owner: "Campaign Analytics",
    qualityScore: 83,
    selected: false,
  },
  {
    id: "orders",
    name: "Vehicle Orders",
    description: "Confirmed vehicle orders, configurations, deposits, and delivery status from global order management system.",
    fields: ["order_id", "customer_id", "vin", "model_code", "derivative", "colour", "options", "order_date", "delivery_date", "order_value", "dealer_code", "region"],
    freshness: "Real-time",
    owner: "Order Management",
    qualityScore: 95,
    selected: false,
  },
  {
    id: "dealer_network",
    name: "Dealer Network",
    description: "Dealer master data including location, tier, capacity, satisfaction scores, and performance metrics.",
    fields: ["dealer_code", "dealer_name", "country", "region", "tier", "capacity", "csi_score", "active", "franchise_brands"],
    freshness: "Weekly",
    owner: "Retailer Operations",
    qualityScore: 92,
    selected: false,
  },
];

// ─── Step Definitions ──────────────────────────────────────────────────────

export const AGENT_STEP_DEFINITIONS: Record<AgentStepId, { label: string; sublabel: string; agentName: string; icon: string }> = {
  opportunity: {
    label: "Opportunity Discovery",
    sublabel: "Problem statement & product brief",
    agentName: "Opportunity Discovery Agent",
    icon: "Lightbulb",
  },
  persona: {
    label: "Persona Identification",
    sublabel: "Users, use cases & stories",
    agentName: "Persona Identification Agent",
    icon: "Users",
  },
  discovery: {
    label: "Data Discovery",
    sublabel: "Source identification & join hypotheses",
    agentName: "Data Discovery Agent",
    icon: "Search",
  },
  quality: {
    label: "Quality Profiling",
    sublabel: "Data readiness assessment",
    agentName: "Data Quality Profiling Agent",
    icon: "ShieldCheck",
  },
  kpi: {
    label: "KPI Definition",
    sublabel: "Business metrics & glossary",
    agentName: "Semantic KPI Definition Agent",
    icon: "TrendingUp",
  },
  model: {
    label: "Data Model Design",
    sublabel: "Schema, grain & field dictionary",
    agentName: "Data Model Design Agent",
    icon: "Database",
  },
  pipeline: {
    label: "Pipeline Generation",
    sublabel: "SQL / dbt transformations",
    agentName: "Pipeline Generation Agent",
    icon: "GitBranch",
  },
  validation: {
    label: "Validation & Testing",
    sublabel: "Test suite & quality gates",
    agentName: "Validation & Testing Agent",
    icon: "CheckCircle2",
  },
  documentation: {
    label: "Documentation",
    sublabel: "Product & technical docs",
    agentName: "Documentation Agent",
    icon: "FileText",
  },
  governance: {
    label: "Governance",
    sublabel: "PII, access controls & policy",
    agentName: "Governance Agent",
    icon: "Lock",
  },
  publishing: {
    label: "Publishing",
    sublabel: "Product card & endpoints",
    agentName: "Publishing Agent",
    icon: "Rocket",
  },
};

export const STEP_ORDER: AgentStepId[] = [
  "opportunity",
  "persona",
  "discovery",
  "quality",
  "kpi",
  "model",
  "pipeline",
  "validation",
  "documentation",
  "governance",
  "publishing",
];

export function createInitialProject(id: string, requestText: string): DataProductProject {
  const now = new Date().toISOString();
  const steps = {} as Record<AgentStepId, AgentStep>;

  for (const stepId of STEP_ORDER) {
    const def = AGENT_STEP_DEFINITIONS[stepId];
    steps[stepId] = {
      id: stepId,
      label: def.label,
      sublabel: def.sublabel,
      status: "pending",
      confidence: null,
      startedAt: null,
      completedAt: null,
      output: null,
      editedOutput: null,
      interventions: [],
    };
  }

  return {
    id,
    name: "New Data Product",
    requestText,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    currentStep: null,
    steps,
    publishedAt: null,
    owner: "John Doe",
  };
}
