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

export type AgentStepStatus = "pending" | "running" | "awaiting_review" | "approved" | "rejected" | "skipped" | "stale";

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
  qualityThreshold: number; // default 80 — steps blocked below this
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

// ─── Catalog Source (extended for browser) ────────────────────────────────

export interface CatalogSource extends DataSource {
  domain: string;
  system: string;
  tags: string[];
  entities: CatalogEntity[];
}

export interface CatalogEntity {
  name: string;
  description: string;
  rowCount?: string;
  fields: CatalogField[];
}

export interface CatalogField {
  name: string;
  type: string;
  description: string;
  isPII?: boolean;
  isForeignKey?: boolean;
  sample?: string;
}

// ─── Mock Catalog ──────────────────────────────────────────────────────────

export const MOCK_DATA_CATALOG: DataSource[] = [
  {
    id: "crm_accounts",
    name: "CRM Accounts",
    description: "Master account records including firmographics, contact info, packaging format history and tier.",
    fields: ["account_id", "contact_first_name", "contact_last_name", "email", "phone", "postcode", "account_tier", "format_count", "last_order_date", "lifetime_value"],
    freshness: "Daily",
    owner: "CRM Platform Team",
    qualityScore: 87,
    selected: false,
  },
  {
    id: "portal_events",
    name: "B2B Portal Events",
    description: "Clickstream and behavioural events from amcor.com, the spec configurator, and distributor portal sessions.",
    fields: ["event_id", "account_id", "session_id", "event_type", "page_url", "format_viewed", "cta_clicked", "timestamp", "device_type", "source_medium"],
    freshness: "Real-time (5 min lag)",
    owner: "Digital Analytics",
    qualityScore: 91,
    selected: false,
  },
  {
    id: "email_clicks",
    name: "Email Campaign Clicks",
    description: "Email marketing engagement data including opens, clicks, unsubscribes, and format-specific engagement signals.",
    fields: ["email_id", "account_id", "campaign_id", "campaign_name", "sent_at", "opened_at", "clicked_at", "clicked_url", "format_featured", "unsubscribed"],
    freshness: "Daily",
    owner: "CRM Marketing",
    qualityScore: 79,
    selected: false,
  },
  {
    id: "campaign_responses",
    name: "Campaign Responses",
    description: "Multi-channel campaign response tracking including direct mail, phone, and digital response events.",
    fields: ["response_id", "account_id", "campaign_id", "channel", "response_type", "response_date", "offer_accepted", "format_of_interest", "distributor_code"],
    freshness: "Daily",
    owner: "Campaign Analytics",
    qualityScore: 83,
    selected: false,
  },
  {
    id: "orders",
    name: "Packaging Orders",
    description: "Confirmed packaging orders, specifications, deposits, and fulfillment status from global order management system.",
    fields: ["order_id", "account_id", "batch_id", "format_code", "spec_variant", "material", "options", "order_date", "fulfillment_date", "order_value", "distributor_code", "region"],
    freshness: "Real-time",
    owner: "Order Management",
    qualityScore: 95,
    selected: false,
  },
  {
    id: "distributor_network",
    name: "Distributor Network",
    description: "Distributor master data including location, tier, capacity, satisfaction scores, and performance metrics.",
    fields: ["distributor_code", "distributor_name", "country", "region", "tier", "capacity", "csi_score", "active", "product_lines"],
    freshness: "Weekly",
    owner: "Regional Operations",
    qualityScore: 92,
    selected: false,
  },
];

// ─── Full Ecosystem Catalog (for browser) ─────────────────────────────────

export const ECOSYSTEM_CATALOG: CatalogSource[] = [
  // ── ACCOUNT domain ──────────────────────────────────────────────────────
  {
    id: "crm_accounts",
    name: "CRM Accounts",
    domain: "Account",
    system: "Salesforce CRM",
    description: "Master account records including firmographics, contact info, packaging format history and account tier.",
    tags: ["account", "master-data", "pii", "crm"],
    fields: ["account_id","contact_first_name","contact_last_name","email","phone","postcode","account_tier","format_count","last_order_date","lifetime_value"],
    freshness: "Daily",
    owner: "CRM Platform Team",
    qualityScore: 87,
    selected: false,
    entities: [
      {
        name: "account",
        description: "Core account record with identity and contact details.",
        rowCount: "38K",
        fields: [
          { name: "account_id", type: "varchar(36)", description: "UUID primary key", isPII: false },
          { name: "contact_first_name", type: "varchar(100)", description: "Primary buyer contact first name", isPII: true },
          { name: "contact_last_name", type: "varchar(100)", description: "Primary buyer contact surname", isPII: true },
          { name: "email", type: "varchar(255)", description: "Primary contact email address", isPII: true },
          { name: "phone", type: "varchar(20)", description: "Primary contact phone number", isPII: true },
          { name: "postcode", type: "varchar(10)", description: "Plant / HQ postcode", isPII: true },
          { name: "account_tier", type: "varchar(20)", description: "Strategic / Key / Growth / Long-tail", isPII: false, sample: "Strategic" },
          { name: "lifetime_value", type: "decimal(12,2)", description: "Total revenue attributed to account", isPII: false },
          { name: "last_order_date", type: "date", description: "Date of most recent confirmed order", isPII: false },
          { name: "format_count", type: "int", description: "Number of distinct formats ever ordered", isPII: false },
        ],
      },
    ],
  },
  {
    id: "account_preferences",
    name: "Account Preferences",
    domain: "Account",
    system: "Preference Centre",
    description: "Explicit marketing consents, communication channel preferences, and format interest signals captured via self-service B2B portal.",
    tags: ["account", "consent", "preferences", "marketing"],
    fields: ["preference_id","account_id","email_opt_in","sms_opt_in","post_opt_in","preferred_channel","format_interests","consent_date","source"],
    freshness: "Real-time",
    owner: "Privacy & Compliance",
    qualityScore: 94,
    selected: false,
    entities: [
      {
        name: "preference",
        description: "One row per account capturing all opt-in flags and stated interests.",
        rowCount: "32K",
        fields: [
          { name: "preference_id", type: "bigint", description: "Surrogate key", isPII: false },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isPII: false, isForeignKey: true },
          { name: "email_opt_in", type: "boolean", description: "Email marketing consent", isPII: false },
          { name: "sms_opt_in", type: "boolean", description: "SMS marketing consent", isPII: false },
          { name: "preferred_channel", type: "varchar(20)", description: "Stated preferred channel", isPII: false, sample: "email" },
          { name: "format_interests", type: "varchar[]", description: "Array of packaging format codes of interest", isPII: false },
          { name: "consent_date", type: "timestamptz", description: "When consent was last given", isPII: false },
        ],
      },
    ],
  },
  {
    id: "account_segments",
    name: "Account Segments",
    domain: "Account",
    system: "D&B / Third-Party Firmographics",
    description: "Third-party firmographic and industry-vertical segmentation appended to account file. Includes vertical category, spend propensity, and plant footprint type.",
    tags: ["account", "segmentation", "third-party", "propensity"],
    fields: ["account_id","vertical_category","vertical_group","spend_propensity","plant_footprint_type","revenue_band","employee_band","region_density","updated_at"],
    freshness: "Monthly",
    owner: "Insight & Analytics",
    qualityScore: 81,
    selected: false,
    entities: [
      {
        name: "segment_append",
        description: "Third-party segment data appended by match key.",
        rowCount: "29K",
        fields: [
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "vertical_category", type: "varchar(4)", description: "Industry vertical code e.g. B01", sample: "F12" },
          { name: "vertical_group", type: "varchar(50)", description: "Human-readable vertical label", sample: "Beverage & Dairy" },
          { name: "spend_propensity", type: "varchar(20)", description: "High / Medium / Low packaging spend propensity" },
          { name: "revenue_band", type: "varchar(20)", description: "Banded annual company revenue" },
          { name: "employee_band", type: "varchar(20)", description: "Banded employee headcount", isPII: false, sample: "1000-4999" },
        ],
      },
    ],
  },
  // ── MARKETING domain ─────────────────────────────────────────────────────
  {
    id: "email_clicks",
    name: "Email Campaign Clicks",
    domain: "Marketing",
    system: "Salesforce Marketing Cloud",
    description: "Email marketing engagement data including opens, clicks, unsubscribes, and format-specific engagement signals.",
    tags: ["marketing", "email", "campaign", "engagement"],
    fields: ["email_id","account_id","campaign_id","campaign_name","sent_at","opened_at","clicked_at","clicked_url","format_featured","unsubscribed"],
    freshness: "Daily",
    owner: "CRM Marketing",
    qualityScore: 79,
    selected: false,
    entities: [
      {
        name: "email_send",
        description: "One row per email send event.",
        rowCount: "8.6M",
        fields: [
          { name: "email_id", type: "varchar(36)", description: "Unique send identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "campaign_id", type: "varchar(36)", description: "FK to campaign", isForeignKey: true },
          { name: "sent_at", type: "timestamptz", description: "UTC send timestamp" },
          { name: "opened_at", type: "timestamptz", description: "First open timestamp, null if not opened" },
          { name: "clicked_at", type: "timestamptz", description: "First click timestamp, null if not clicked" },
          { name: "clicked_url", type: "text", description: "URL of first click" },
          { name: "format_featured", type: "varchar(10)", description: "Packaging format code featured in email", sample: "AP-240" },
          { name: "unsubscribed", type: "boolean", description: "Whether this send triggered an unsubscribe" },
        ],
      },
    ],
  },
  {
    id: "campaign_responses",
    name: "Campaign Responses",
    domain: "Marketing",
    system: "Campaign Management",
    description: "Multi-channel campaign response tracking including direct mail, phone, and digital response events.",
    tags: ["marketing", "campaign", "response", "multi-channel"],
    fields: ["response_id","account_id","campaign_id","channel","response_type","response_date","offer_accepted","format_of_interest","distributor_code"],
    freshness: "Daily",
    owner: "Campaign Analytics",
    qualityScore: 83,
    selected: false,
    entities: [
      {
        name: "response",
        description: "One row per response event across all channels.",
        rowCount: "620K",
        fields: [
          { name: "response_id", type: "varchar(36)", description: "Unique response identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "campaign_id", type: "varchar(36)", description: "FK to campaign", isForeignKey: true },
          { name: "channel", type: "varchar(30)", description: "email / sms / direct_mail / outbound_call / digital", sample: "email" },
          { name: "response_type", type: "varchar(30)", description: "click / call / sample_request / technical_review / download" },
          { name: "response_date", type: "date", description: "Date of response" },
          { name: "offer_accepted", type: "boolean", description: "Whether an offer was accepted" },
          { name: "format_of_interest", type: "varchar(10)", description: "Format code of account interest" },
        ],
      },
    ],
  },
  {
    id: "campaign_master",
    name: "Campaign Master",
    domain: "Marketing",
    system: "Salesforce Marketing Cloud",
    description: "Master campaign registry including strategy, budget, targeting criteria, format alignment and planned vs actual reach.",
    tags: ["marketing", "campaign", "planning", "master-data"],
    fields: ["campaign_id","campaign_name","campaign_type","format_code","start_date","end_date","budget","target_segment","channel","planned_reach","actual_reach"],
    freshness: "Daily",
    owner: "Marketing Planning",
    qualityScore: 89,
    selected: false,
    entities: [
      {
        name: "campaign",
        description: "One row per campaign execution.",
        rowCount: "1.9K",
        fields: [
          { name: "campaign_id", type: "varchar(36)", description: "Unique campaign identifier" },
          { name: "campaign_name", type: "varchar(200)", description: "Descriptive campaign name" },
          { name: "campaign_type", type: "varchar(30)", description: "retention / conquest / reactivation / launch" },
          { name: "format_code", type: "varchar(10)", description: "Primary packaging format targeted" },
          { name: "start_date", type: "date", description: "Campaign start date" },
          { name: "end_date", type: "date", description: "Campaign end date" },
          { name: "budget", type: "decimal(12,2)", description: "Total approved campaign budget in USD" },
          { name: "target_segment", type: "varchar(100)", description: "Audience segment definition" },
          { name: "planned_reach", type: "int", description: "Planned audience size" },
          { name: "actual_reach", type: "int", description: "Actual contacted audience" },
        ],
      },
    ],
  },
  // ── DIGITAL domain ────────────────────────────────────────────────────────
  {
    id: "portal_events",
    name: "B2B Portal Events",
    domain: "Digital",
    system: "Adobe Analytics",
    description: "Clickstream and behavioural events from amcor.com, the spec configurator, and distributor portal sessions.",
    tags: ["digital", "clickstream", "behavioural", "real-time"],
    fields: ["event_id","account_id","session_id","event_type","page_url","format_viewed","cta_clicked","timestamp","device_type","source_medium"],
    freshness: "Real-time (5 min lag)",
    owner: "Digital Analytics",
    qualityScore: 91,
    selected: false,
    entities: [
      {
        name: "event",
        description: "One row per trackable portal event.",
        rowCount: "94M",
        fields: [
          { name: "event_id", type: "varchar(36)", description: "Unique event identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account (null if anonymous)", isForeignKey: true },
          { name: "session_id", type: "varchar(36)", description: "Browser session identifier" },
          { name: "event_type", type: "varchar(50)", description: "page_view / spec_configure / sample_request / datasheet_download" },
          { name: "page_url", type: "text", description: "Full URL of the page" },
          { name: "format_viewed", type: "varchar(10)", description: "Format code if event is format-related" },
          { name: "timestamp", type: "timestamptz", description: "UTC event timestamp" },
          { name: "device_type", type: "varchar(20)", description: "desktop / mobile / tablet" },
          { name: "source_medium", type: "varchar(100)", description: "UTM source / medium attribution" },
        ],
      },
    ],
  },
  {
    id: "configurator_sessions",
    name: "Spec Configurator Sessions",
    domain: "Digital",
    system: "Packaging Spec Configurator",
    description: "Detailed packaging specification sessions showing format, material, barrier layer, options selected, and session outcome (saved / abandoned / ordered).",
    tags: ["digital", "configurator", "intent", "format"],
    fields: ["session_id","account_id","format_code","spec_variant","material","barrier_layer","options_selected","list_price","session_start","session_end","outcome"],
    freshness: "Real-time",
    owner: "Digital Products",
    qualityScore: 88,
    selected: false,
    entities: [
      {
        name: "configurator_session",
        description: "One row per configurator session.",
        rowCount: "2.4M",
        fields: [
          { name: "session_id", type: "varchar(36)", description: "Configurator session identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account (null if anonymous)", isForeignKey: true },
          { name: "format_code", type: "varchar(10)", description: "Packaging format configured", sample: "AP-240" },
          { name: "spec_variant", type: "varchar(50)", description: "Specific spec / barrier variant selected" },
          { name: "material", type: "varchar(50)", description: "Selected primary material" },
          { name: "options_selected", type: "varchar[]", description: "Array of option codes selected" },
          { name: "list_price", type: "decimal(10,2)", description: "Configured list price per unit" },
          { name: "outcome", type: "varchar(20)", description: "saved / abandoned / ordered" },
        ],
      },
    ],
  },
  // ── SALES & ORDERS domain ─────────────────────────────────────────────────
  {
    id: "orders",
    name: "Packaging Orders",
    domain: "Sales",
    system: "Global Order Management",
    description: "Confirmed packaging orders, specifications, deposits, and fulfillment status from global order management system.",
    tags: ["sales", "orders", "transaction", "format"],
    fields: ["order_id","account_id","batch_id","format_code","spec_variant","material","options","order_date","fulfillment_date","order_value","distributor_code","region"],
    freshness: "Real-time",
    owner: "Order Management",
    qualityScore: 95,
    selected: false,
    entities: [
      {
        name: "order",
        description: "One row per confirmed packaging order.",
        rowCount: "410K",
        fields: [
          { name: "order_id", type: "varchar(36)", description: "Unique order identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "batch_id", type: "varchar(17)", description: "Production batch identifier" },
          { name: "format_code", type: "varchar(10)", description: "Amcor format code", sample: "AP-240" },
          { name: "spec_variant", type: "varchar(50)", description: "Barrier / gauge / spec variant" },
          { name: "order_date", type: "date", description: "Date order was placed" },
          { name: "fulfillment_date", type: "date", description: "Actual or estimated fulfillment date" },
          { name: "order_value", type: "decimal(12,2)", description: "Total order value in USD" },
          { name: "distributor_code", type: "varchar(10)", description: "FK to distributor", isForeignKey: true },
        ],
      },
    ],
  },
  {
    id: "sample_requests",
    name: "Sample Request Bookings",
    domain: "Sales",
    system: "Distributor Management System",
    description: "Sample request and trial bookings and completions across all commercial touchpoints, including format requested and conversion outcome.",
    tags: ["sales", "sample-request", "distributor", "conversion"],
    fields: ["booking_id","account_id","distributor_code","format_code","booking_date","sample_ship_date","completed","outcome","sales_exec_id"],
    freshness: "Daily",
    owner: "Regional Analytics",
    qualityScore: 85,
    selected: false,
    entities: [
      {
        name: "sample_request",
        description: "One row per sample request booking.",
        rowCount: "62K",
        fields: [
          { name: "booking_id", type: "varchar(36)", description: "Unique booking identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "distributor_code", type: "varchar(10)", description: "FK to distributor", isForeignKey: true },
          { name: "format_code", type: "varchar(10)", description: "Packaging format sampled" },
          { name: "booking_date", type: "date", description: "Date booking was made" },
          { name: "sample_ship_date", type: "date", description: "Scheduled sample shipment date" },
          { name: "completed", type: "boolean", description: "Whether the sample trial was completed" },
          { name: "outcome", type: "varchar(30)", description: "ordered / follow_up / no_action / lost" },
        ],
      },
    ],
  },
  // ── FULFILLMENT & SERVICE domain ─────────────────────────────────────────
  {
    id: "service_history",
    name: "Account Service History",
    domain: "Fulfillment & Service",
    system: "Distributor Service Management",
    description: "Complete service and fulfillment-support history per account including issue type, resolution time, cost, warranty claims, and distributor performing the work.",
    tags: ["fulfillment", "service", "account", "warranty"],
    fields: ["service_id","batch_id","account_id","distributor_code","service_date","order_volume","job_type","warranty_claim","labour_cost","materials_cost","nps_score"],
    freshness: "Daily",
    owner: "Fulfillment Analytics",
    qualityScore: 88,
    selected: false,
    entities: [
      {
        name: "service_visit",
        description: "One row per distributor service touchpoint.",
        rowCount: "310K",
        fields: [
          { name: "service_id", type: "varchar(36)", description: "Unique service record identifier" },
          { name: "batch_id", type: "varchar(17)", description: "Production batch identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "distributor_code", type: "varchar(10)", description: "FK to distributor", isForeignKey: true },
          { name: "service_date", type: "date", description: "Date service was performed" },
          { name: "order_volume", type: "int", description: "Order volume at time of service (units)" },
          { name: "job_type", type: "varchar(30)", description: "quality_review / claim_resolution / spec_change / audit" },
          { name: "warranty_claim", type: "boolean", description: "Whether work was warranty-covered" },
          { name: "labour_cost", type: "decimal(10,2)", description: "Labour cost in USD" },
          { name: "nps_score", type: "int", description: "Net Promoter Score for this visit (0-10)" },
        ],
      },
    ],
  },
  {
    id: "supply_chain_telemetry",
    name: "Supply Chain Telemetry",
    domain: "Fulfillment & Service",
    system: "Plant IoT / MES Platform",
    description: "Aggregated plant and shipment telemetry signals including throughput, inventory level, health alerts, and feature usage patterns per production line.",
    tags: ["supply-chain", "telemetry", "iot", "connected"],
    fields: ["line_id","account_id","snapshot_date","throughput_units","inventory_level_pct","recycled_content_pct","health_alerts","features_used","last_connected"],
    freshness: "Daily",
    owner: "Connected Services",
    qualityScore: 76,
    selected: false,
    entities: [
      {
        name: "line_snapshot",
        description: "Daily aggregated production-line telemetry snapshot.",
        rowCount: "18M",
        fields: [
          { name: "line_id", type: "varchar(17)", description: "Production line identifier" },
          { name: "snapshot_date", type: "date", description: "Date of snapshot" },
          { name: "throughput_units", type: "int", description: "Cumulative units produced" },
          { name: "inventory_level_pct", type: "decimal(5,2)", description: "Finished-goods inventory level percentage" },
          { name: "recycled_content_pct", type: "decimal(5,2)", description: "Recycled-content percentage of current run" },
          { name: "health_alerts", type: "varchar[]", description: "Array of active diagnostic alert codes" },
          { name: "features_used", type: "varchar[]", description: "Connected-plant features activated in period" },
        ],
      },
    ],
  },
  // ── FINANCE domain ────────────────────────────────────────────────────────
  {
    id: "finance_contracts",
    name: "Supply Contracts",
    domain: "Finance",
    system: "Amcor Financial Services",
    description: "Supply agreement contracts (Annual, Multi-Year, Spot) linked to packaging orders, including volume commitment, term, rebate, and settlement data.",
    tags: ["finance", "contract", "supply-agreement", "payment"],
    fields: ["contract_id","account_id","order_id","product_type","volume_commitment","rebate_pct","term_months","annual_volume","escalator","start_date","end_date","status"],
    freshness: "Daily",
    owner: "Financial Services Analytics",
    qualityScore: 93,
    selected: false,
    entities: [
      {
        name: "finance_contract",
        description: "One row per supply contract.",
        rowCount: "6.8K",
        fields: [
          { name: "contract_id", type: "varchar(36)", description: "Unique contract identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "order_id", type: "varchar(36)", description: "FK to packaging order", isForeignKey: true },
          { name: "product_type", type: "varchar(10)", description: "Annual / Multi-Year / Spot / Cash" },
          { name: "volume_commitment", type: "decimal(12,2)", description: "Committed annual order volume (units)" },
          { name: "term_months", type: "int", description: "Contract term in months" },
          { name: "end_date", type: "date", description: "Contract expiry date" },
          { name: "status", type: "varchar(20)", description: "active / settled / matured / defaulted" },
        ],
      },
    ],
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
    qualityThreshold: 80,
  };
}
