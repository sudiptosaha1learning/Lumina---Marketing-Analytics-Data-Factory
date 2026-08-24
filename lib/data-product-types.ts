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
    id: "crm_customers",
    name: "CRM Accounts",
    description: "Master B2B account records including firmographics, contact info, contracted SKU history and account tier.",
    fields: ["account_id", "account_name", "contact_email", "contact_phone", "hq_region", "account_tier", "sku_count", "last_order_date", "lifetime_value"],
    freshness: "Daily",
    owner: "CRM Platform Team",
    qualityScore: 87,
    selected: false,
  },
  {
    id: "website_events",
    name: "Website Events",
    description: "Clickstream and behavioural events from the Vantage Packaging customer portal, spec configurator, and account sessions.",
    fields: ["event_id", "account_id", "session_id", "event_type", "page_url", "sku_viewed", "cta_clicked", "timestamp", "device_type", "source_medium"],
    freshness: "Real-time (5 min lag)",
    owner: "Digital Analytics",
    qualityScore: 91,
    selected: false,
  },
  {
    id: "email_clicks",
    name: "Email Campaign Clicks",
    description: "Email marketing engagement data including opens, clicks, unsubscribes, and product-line-specific engagement signals.",
    fields: ["email_id", "account_id", "campaign_id", "campaign_name", "sent_at", "opened_at", "clicked_at", "clicked_url", "product_line_featured", "unsubscribed"],
    freshness: "Daily",
    owner: "CRM Marketing",
    qualityScore: 79,
    selected: false,
  },
  {
    id: "campaign_responses",
    name: "Campaign Responses",
    description: "Multi-channel campaign response tracking including direct outreach, phone, and digital response events.",
    fields: ["response_id", "account_id", "campaign_id", "channel", "response_type", "response_date", "offer_accepted", "sku_of_interest", "plant_code"],
    freshness: "Daily",
    owner: "Campaign Analytics",
    qualityScore: 83,
    selected: false,
  },
  {
    id: "orders",
    name: "Customer Orders",
    description: "Confirmed packaging orders, SKU specifications, deposits, and delivery status from the global order management system.",
    fields: ["order_id", "account_id", "batch_id", "sku_code", "material_spec", "print_finish", "options", "order_date", "delivery_date", "order_value", "plant_code", "region"],
    freshness: "Real-time",
    owner: "Order Management",
    qualityScore: 95,
    selected: false,
  },
  {
    id: "dealer_network",
    name: "Plant & Account Network",
    description: "Plant and key account master data including location, tier, capacity, satisfaction scores, and performance metrics.",
    fields: ["plant_code", "plant_name", "country", "region", "tier", "capacity", "csi_score", "active", "product_lines"],
    freshness: "Weekly",
    owner: "Manufacturing Operations",
    qualityScore: 92,
    selected: false,
  },
];

// ─── Full Ecosystem Catalog (for browser) ─────────────────────────────────

export const ECOSYSTEM_CATALOG: CatalogSource[] = [
  // ── CUSTOMER domain ──────────────────────────────────────────────────────
  {
    id: "crm_customers",
    name: "CRM Accounts",
    domain: "Customer",
    system: "Salesforce CRM",
    description: "Master B2B account records including firmographics, contact info, contracted SKU history and account tier.",
    tags: ["customer", "master-data", "pii", "crm"],
    fields: ["account_id","contact_first_name","contact_last_name","contact_email","contact_phone","hq_postcode","account_tier","sku_count","last_order_date","lifetime_value"],
    freshness: "Daily",
    owner: "CRM Platform Team",
    qualityScore: 87,
    selected: false,
    entities: [
      {
        name: "account",
        description: "Core B2B account record with identity and contact details.",
        rowCount: "38K",
        fields: [
          { name: "account_id", type: "varchar(36)", description: "UUID primary key", isPII: false },
          { name: "contact_first_name", type: "varchar(100)", description: "Primary contact first name", isPII: true },
          { name: "contact_last_name", type: "varchar(100)", description: "Primary contact surname", isPII: true },
          { name: "contact_email", type: "varchar(255)", description: "Primary contact email address", isPII: true },
          { name: "contact_phone", type: "varchar(20)", description: "Primary contact phone number", isPII: true },
          { name: "hq_postcode", type: "varchar(10)", description: "Account headquarters postcode", isPII: true },
          { name: "account_tier", type: "varchar(20)", description: "Tier 1 / Tier 2 / Tier 3 / None", isPII: false, sample: "Tier 1" },
          { name: "lifetime_value", type: "decimal(12,2)", description: "Total revenue attributed to account", isPII: false },
          { name: "last_order_date", type: "date", description: "Date of most recent confirmed order", isPII: false },
          { name: "sku_count", type: "int", description: "Number of distinct SKUs ever purchased", isPII: false },
        ],
      },
    ],
  },
  {
    id: "customer_preferences",
    name: "Customer Preferences",
    domain: "Customer",
    system: "Preference Centre",
    description: "Explicit marketing consents, communication channel preferences, and product-line interest signals captured via self-service portal.",
    tags: ["customer", "consent", "preferences", "marketing"],
    fields: ["preference_id","account_id","email_opt_in","sms_opt_in","post_opt_in","preferred_channel","product_line_interests","consent_date","source"],
    freshness: "Real-time",
    owner: "Privacy & Compliance",
    qualityScore: 94,
    selected: false,
    entities: [
      {
        name: "preference",
        description: "One row per account capturing all opt-in flags and stated interests.",
        rowCount: "31K",
        fields: [
          { name: "preference_id", type: "bigint", description: "Surrogate key", isPII: false },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isPII: false, isForeignKey: true },
          { name: "email_opt_in", type: "boolean", description: "Email marketing consent", isPII: false },
          { name: "sms_opt_in", type: "boolean", description: "SMS marketing consent", isPII: false },
          { name: "preferred_channel", type: "varchar(20)", description: "Stated preferred channel", isPII: false, sample: "email" },
          { name: "product_line_interests", type: "varchar[]", description: "Array of packaging product line codes of interest", isPII: false },
          { name: "consent_date", type: "timestamptz", description: "When consent was last given", isPII: false },
        ],
      },
    ],
  },
  {
    id: "customer_segments",
    name: "Account Segments",
    domain: "Customer",
    system: "Segment Analytics Platform",
    description: "Third-party industry and firmographic segmentation appended to account file. Includes vertical category, spend propensity, and company size band.",
    tags: ["customer", "segmentation", "third-party", "propensity"],
    fields: ["account_id","industry_category","industry_group","spend_propensity","company_size_band","revenue_band","employee_band","region_density","updated_at"],
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
          { name: "industry_category", type: "varchar(4)", description: "Industry vertical code e.g. A01", sample: "D12" },
          { name: "industry_group", type: "varchar(50)", description: "Human-readable vertical label", sample: "Beverage & Dairy" },
          { name: "spend_propensity", type: "varchar(20)", description: "High / Medium / Low spend propensity" },
          { name: "revenue_band", type: "varchar(20)", description: "Banded annual account revenue" },
          { name: "employee_band", type: "varchar(20)", description: "Banded employee headcount", isPII: false, sample: "500-1000" },
        ],
      },
    ],
  },
  // ── MARKETING domain ─────────────────────────────────────────────────────
  {
    id: "email_clicks",
    name: "Email Campaign Clicks",
    domain: "Marketing",
    system: "Adobe Campaign",
    description: "Email marketing engagement data including opens, clicks, unsubscribes, and product-line-specific engagement signals.",
    tags: ["marketing", "email", "campaign", "engagement"],
    fields: ["email_id","account_id","campaign_id","campaign_name","sent_at","opened_at","clicked_at","clicked_url","product_line_featured","unsubscribed"],
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
          { name: "product_line_featured", type: "varchar(10)", description: "Packaging product line code featured in email", sample: "FLX-460" },
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
    description: "Multi-channel campaign response tracking including direct outreach, phone, and digital response events.",
    tags: ["marketing", "campaign", "response", "multi-channel"],
    fields: ["response_id","account_id","campaign_id","channel","response_type","response_date","offer_accepted","sku_of_interest","plant_code"],
    freshness: "Daily",
    owner: "Campaign Analytics",
    qualityScore: 83,
    selected: false,
    entities: [
      {
        name: "response",
        description: "One row per response event across all channels.",
        rowCount: "1.2M",
        fields: [
          { name: "response_id", type: "varchar(36)", description: "Unique response identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "campaign_id", type: "varchar(36)", description: "FK to campaign", isForeignKey: true },
          { name: "channel", type: "varchar(30)", description: "email / sms / direct_outreach / outbound_call / digital", sample: "email" },
          { name: "response_type", type: "varchar(30)", description: "click / call / visit / sample_request / download" },
          { name: "response_date", type: "date", description: "Date of response" },
          { name: "offer_accepted", type: "boolean", description: "Whether an offer was accepted" },
          { name: "sku_of_interest", type: "varchar(10)", description: "SKU code of packaging interest" },
        ],
      },
    ],
  },
  {
    id: "campaign_master",
    name: "Campaign Master",
    domain: "Marketing",
    system: "Adobe Campaign",
    description: "Master campaign registry including strategy, budget, targeting criteria, product-line alignment and planned vs actual reach.",
    tags: ["marketing", "campaign", "planning", "master-data"],
    fields: ["campaign_id","campaign_name","campaign_type","product_line_code","start_date","end_date","budget","target_segment","channel","planned_reach","actual_reach"],
    freshness: "Daily",
    owner: "Marketing Planning",
    qualityScore: 89,
    selected: false,
    entities: [
      {
        name: "campaign",
        description: "One row per campaign execution.",
        rowCount: "2.1K",
        fields: [
          { name: "campaign_id", type: "varchar(36)", description: "Unique campaign identifier" },
          { name: "campaign_name", type: "varchar(200)", description: "Descriptive campaign name" },
          { name: "campaign_type", type: "varchar(30)", description: "retention / conquest / reactivation / launch" },
          { name: "product_line_code", type: "varchar(10)", description: "Primary packaging product line targeted" },
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
    id: "website_events",
    name: "Website Events",
    domain: "Digital",
    system: "Adobe Analytics",
    description: "Clickstream and behavioural events from the Vantage Packaging customer portal, spec configurator, and account sessions.",
    tags: ["digital", "clickstream", "behavioural", "real-time"],
    fields: ["event_id","account_id","session_id","event_type","page_url","sku_viewed","cta_clicked","timestamp","device_type","source_medium"],
    freshness: "Real-time (5 min lag)",
    owner: "Digital Analytics",
    qualityScore: 91,
    selected: false,
    entities: [
      {
        name: "event",
        description: "One row per trackable website event.",
        rowCount: "340M",
        fields: [
          { name: "event_id", type: "varchar(36)", description: "Unique event identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account (null if anonymous)", isForeignKey: true },
          { name: "session_id", type: "varchar(36)", description: "Browser session identifier" },
          { name: "event_type", type: "varchar(50)", description: "page_view / spec_configure / sample_request / spec_sheet_download" },
          { name: "page_url", type: "text", description: "Full URL of the page" },
          { name: "sku_viewed", type: "varchar(10)", description: "SKU code if event is SKU-related" },
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
    description: "Detailed packaging spec configuration sessions showing SKU, material, print finish, options selected, and session outcome (saved / abandoned / ordered).",
    tags: ["digital", "configurator", "intent", "packaging"],
    fields: ["session_id","account_id","sku_code","material_spec","print_finish","substrate_color","options_selected","list_price","session_start","session_end","outcome"],
    freshness: "Real-time",
    owner: "Digital Products",
    qualityScore: 88,
    selected: false,
    entities: [
      {
        name: "configurator_session",
        description: "One row per spec configurator session.",
        rowCount: "2.4M",
        fields: [
          { name: "session_id", type: "varchar(36)", description: "Configurator session identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account (null if anonymous)", isForeignKey: true },
          { name: "sku_code", type: "varchar(10)", description: "Packaging SKU configured", sample: "FLX-460" },
          { name: "material_spec", type: "varchar(50)", description: "Specific material / substrate selected" },
          { name: "print_finish", type: "varchar(50)", description: "Selected print finish" },
          { name: "options_selected", type: "varchar[]", description: "Array of option codes selected" },
          { name: "list_price", type: "decimal(10,2)", description: "Configured list price" },
          { name: "outcome", type: "varchar(20)", description: "saved / abandoned / ordered" },
        ],
      },
    ],
  },
  // ── SALES & ORDERS domain ─────────────────────────────────────────────────
  {
    id: "orders",
    name: "Customer Orders",
    domain: "Sales",
    system: "Global Order Management",
    description: "Confirmed packaging orders, SKU specifications, deposits, and delivery status from the global order management system.",
    tags: ["sales", "orders", "transaction", "packaging"],
    fields: ["order_id","account_id","batch_id","sku_code","material_spec","print_finish","options","order_date","delivery_date","order_value","plant_code","region"],
    freshness: "Real-time",
    owner: "Order Management",
    qualityScore: 95,
    selected: false,
    entities: [
      {
        name: "order",
        description: "One row per confirmed customer order.",
        rowCount: "1.1M",
        fields: [
          { name: "order_id", type: "varchar(36)", description: "Unique order identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "batch_id", type: "varchar(17)", description: "Production batch identifier" },
          { name: "sku_code", type: "varchar(10)", description: "Vantage Packaging SKU code", sample: "FLX-460" },
          { name: "material_spec", type: "varchar(50)", description: "Substrate / material / print finish" },
          { name: "order_date", type: "date", description: "Date order was placed" },
          { name: "delivery_date", type: "date", description: "Actual or estimated delivery date" },
          { name: "order_value", type: "decimal(12,2)", description: "Total order value in USD" },
          { name: "plant_code", type: "varchar(10)", description: "FK to plant", isForeignKey: true },
        ],
      },
    ],
  },
  {
    id: "test_drives",
    name: "Sample Requests",
    domain: "Sales",
    system: "Sample Request Portal",
    description: "Product sample and trial run requests and completions across all account touchpoints, including SKU requested and conversion outcome.",
    tags: ["sales", "sample-request", "plant", "conversion"],
    fields: ["booking_id","account_id","plant_code","sku_code","booking_date","trial_run_date","completed","outcome","account_manager_id"],
    freshness: "Daily",
    owner: "Commercial Analytics",
    qualityScore: 85,
    selected: false,
    entities: [
      {
        name: "sample_request",
        description: "One row per sample / trial run request.",
        rowCount: "94K",
        fields: [
          { name: "booking_id", type: "varchar(36)", description: "Unique booking identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "plant_code", type: "varchar(10)", description: "FK to plant", isForeignKey: true },
          { name: "sku_code", type: "varchar(10)", description: "Packaging SKU sampled" },
          { name: "booking_date", type: "date", description: "Date booking was made" },
          { name: "trial_run_date", type: "date", description: "Scheduled trial run date" },
          { name: "completed", type: "boolean", description: "Whether trial run was completed" },
          { name: "outcome", type: "varchar(30)", description: "ordered / follow_up / no_action / lost" },
        ],
      },
    ],
  },
  // ── MANUFACTURING domain ──────────────────────────────────────────────────
  {
    id: "service_history",
    name: "Plant Maintenance History",
    domain: "Manufacturing",
    system: "Plant Maintenance Management",
    description: "Complete maintenance and repair history per production line including job type, throughput, cost, warranty claims, and technician performing the work.",
    tags: ["manufacturing", "maintenance", "plant", "warranty"],
    fields: ["service_id","line_id","plant_code","service_date","throughput_units","job_type","warranty_claim","labour_cost","parts_cost","nps_score"],
    freshness: "Daily",
    owner: "Manufacturing Analytics",
    qualityScore: 88,
    selected: false,
    entities: [
      {
        name: "maintenance_visit",
        description: "One row per production line maintenance visit.",
        rowCount: "620K",
        fields: [
          { name: "service_id", type: "varchar(36)", description: "Unique maintenance record identifier" },
          { name: "line_id", type: "varchar(17)", description: "Production line identifier" },
          { name: "plant_code", type: "varchar(10)", description: "FK to plant", isForeignKey: true },
          { name: "service_date", type: "date", description: "Date line was serviced" },
          { name: "throughput_units", type: "int", description: "Units produced at time of service" },
          { name: "job_type", type: "varchar(30)", description: "scheduled_maintenance / repair / recall / compliance_check" },
          { name: "warranty_claim", type: "boolean", description: "Whether work was warranty-covered" },
          { name: "labour_cost", type: "decimal(10,2)", description: "Labour cost in USD" },
          { name: "nps_score", type: "int", description: "Net Promoter Score for this visit (0-10)" },
        ],
      },
    ],
  },
  {
    id: "connected_vehicle",
    name: "Connected Line Telemetry",
    domain: "Manufacturing",
    system: "MES / IoT Platform",
    description: "Aggregated connected production line signals including throughput, material/energy level, health alerts, and feature usage patterns per line.",
    tags: ["manufacturing", "telemetry", "iot", "connected"],
    fields: ["line_id","plant_code","snapshot_date","throughput_units","material_level_pct","energy_level_pct","health_alerts","features_used","last_connected"],
    freshness: "Daily",
    owner: "Connected Plant Services",
    qualityScore: 76,
    selected: false,
    entities: [
      {
        name: "line_snapshot",
        description: "Daily aggregated production line telemetry snapshot.",
        rowCount: "42M",
        fields: [
          { name: "line_id", type: "varchar(17)", description: "Production line identifier" },
          { name: "snapshot_date", type: "date", description: "Date of snapshot" },
          { name: "throughput_units", type: "int", description: "Cumulative units produced" },
          { name: "material_level_pct", type: "decimal(5,2)", description: "Raw material reservoir percentage" },
          { name: "energy_level_pct", type: "decimal(5,2)", description: "Line energy efficiency percentage" },
          { name: "health_alerts", type: "varchar[]", description: "Array of active diagnostic alert codes" },
          { name: "features_used", type: "varchar[]", description: "MES features activated in period" },
        ],
      },
    ],
  },
  // ── FINANCE domain ────────────────────────────────────────────────────────
  {
    id: "finance_contracts",
    name: "Customer Contracts",
    domain: "Finance",
    system: "Vantage Packaging Commercial Finance",
    description: "Commercial contract products (fixed-term, volume-based, spot) linked to customer orders, including monthly payment, term, deposit, and settlement data.",
    tags: ["finance", "contract", "commercial", "payment"],
    fields: ["contract_id","account_id","order_id","product_type","monthly_payment","deposit","term_months","annual_volume","balloon","start_date","end_date","status"],
    freshness: "Daily",
    owner: "Financial Services Analytics",
    qualityScore: 93,
    selected: false,
    entities: [
      {
        name: "finance_contract",
        description: "One row per finance contract.",
        rowCount: "62K",
        fields: [
          { name: "contract_id", type: "varchar(36)", description: "Unique contract identifier" },
          { name: "account_id", type: "varchar(36)", description: "FK to account", isForeignKey: true },
          { name: "order_id", type: "varchar(36)", description: "FK to customer order", isForeignKey: true },
          { name: "product_type", type: "varchar(10)", description: "Fixed-Term / Volume-Based / Spot / Cash" },
          { name: "monthly_payment", type: "decimal(10,2)", description: "Monthly payment amount in USD" },
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
