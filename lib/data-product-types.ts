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

// ─── Full Ecosystem Catalog (for browser) ─────────────────────────────────

export const ECOSYSTEM_CATALOG: CatalogSource[] = [
  // ── CUSTOMER domain ──────────────────────────────────────────────────────
  {
    id: "crm_customers",
    name: "CRM Customers",
    domain: "Customer",
    system: "Salesforce CRM",
    description: "Master customer records including demographics, contact info, vehicle ownership history and loyalty tier.",
    tags: ["customer", "master-data", "pii", "crm"],
    fields: ["customer_id","first_name","last_name","email","phone","postcode","loyalty_tier","vehicle_count","last_purchase_date","lifetime_value"],
    freshness: "Daily",
    owner: "CRM Platform Team",
    qualityScore: 87,
    selected: false,
    entities: [
      {
        name: "customer",
        description: "Core customer record with identity and contact details.",
        rowCount: "4.2M",
        fields: [
          { name: "customer_id", type: "varchar(36)", description: "UUID primary key", isPII: false },
          { name: "first_name", type: "varchar(100)", description: "Customer first name", isPII: true },
          { name: "last_name", type: "varchar(100)", description: "Customer surname", isPII: true },
          { name: "email", type: "varchar(255)", description: "Primary email address", isPII: true },
          { name: "phone", type: "varchar(20)", description: "Mobile phone number", isPII: true },
          { name: "postcode", type: "varchar(10)", description: "Residential postcode", isPII: true },
          { name: "loyalty_tier", type: "varchar(20)", description: "Gold / Silver / Bronze / None", isPII: false, sample: "Gold" },
          { name: "lifetime_value", type: "decimal(12,2)", description: "Total revenue attributed to customer", isPII: false },
          { name: "last_purchase_date", type: "date", description: "Date of most recent confirmed order", isPII: false },
          { name: "vehicle_count", type: "int", description: "Number of vehicles ever purchased", isPII: false },
        ],
      },
    ],
  },
  {
    id: "customer_preferences",
    name: "Customer Preferences",
    domain: "Customer",
    system: "Preference Centre",
    description: "Explicit marketing consents, communication channel preferences, and model interest signals captured via self-service portal.",
    tags: ["customer", "consent", "preferences", "marketing"],
    fields: ["preference_id","customer_id","email_opt_in","sms_opt_in","post_opt_in","preferred_channel","model_interests","consent_date","source"],
    freshness: "Real-time",
    owner: "Privacy & Compliance",
    qualityScore: 94,
    selected: false,
    entities: [
      {
        name: "preference",
        description: "One row per customer capturing all opt-in flags and stated interests.",
        rowCount: "3.8M",
        fields: [
          { name: "preference_id", type: "bigint", description: "Surrogate key", isPII: false },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isPII: false, isForeignKey: true },
          { name: "email_opt_in", type: "boolean", description: "Email marketing consent", isPII: false },
          { name: "sms_opt_in", type: "boolean", description: "SMS marketing consent", isPII: false },
          { name: "preferred_channel", type: "varchar(20)", description: "Stated preferred channel", isPII: false, sample: "email" },
          { name: "model_interests", type: "varchar[]", description: "Array of vehicle model codes of interest", isPII: false },
          { name: "consent_date", type: "timestamptz", description: "When consent was last given", isPII: false },
        ],
      },
    ],
  },
  {
    id: "customer_segments",
    name: "Customer Segments",
    domain: "Customer",
    system: "Mosaic / Experian",
    description: "Third-party lifestyle and demographic segmentation appended to customer file. Includes Mosaic category, financial propensity, and household type.",
    tags: ["customer", "segmentation", "third-party", "propensity"],
    fields: ["customer_id","mosaic_category","mosaic_group","financial_propensity","household_type","income_band","age_band","urbanicity","updated_at"],
    freshness: "Monthly",
    owner: "Insight & Analytics",
    qualityScore: 81,
    selected: false,
    entities: [
      {
        name: "segment_append",
        description: "Third-party segment data appended by match key.",
        rowCount: "3.1M",
        fields: [
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "mosaic_category", type: "varchar(4)", description: "Mosaic category code e.g. A01", sample: "D12" },
          { name: "mosaic_group", type: "varchar(50)", description: "Human-readable segment label" },
          { name: "financial_propensity", type: "varchar(20)", description: "High / Medium / Low spend propensity" },
          { name: "income_band", type: "varchar(20)", description: "Banded household income" },
          { name: "age_band", type: "varchar(20)", description: "Banded age range", isPII: false, sample: "45-54" },
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
    description: "Email marketing engagement data including opens, clicks, unsubscribes, and model-specific engagement signals.",
    tags: ["marketing", "email", "campaign", "engagement"],
    fields: ["email_id","customer_id","campaign_id","campaign_name","sent_at","opened_at","clicked_at","clicked_url","model_featured","unsubscribed"],
    freshness: "Daily",
    owner: "CRM Marketing",
    qualityScore: 79,
    selected: false,
    entities: [
      {
        name: "email_send",
        description: "One row per email send event.",
        rowCount: "120M",
        fields: [
          { name: "email_id", type: "varchar(36)", description: "Unique send identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "campaign_id", type: "varchar(36)", description: "FK to campaign", isForeignKey: true },
          { name: "sent_at", type: "timestamptz", description: "UTC send timestamp" },
          { name: "opened_at", type: "timestamptz", description: "First open timestamp, null if not opened" },
          { name: "clicked_at", type: "timestamptz", description: "First click timestamp, null if not clicked" },
          { name: "clicked_url", type: "text", description: "URL of first click" },
          { name: "model_featured", type: "varchar(10)", description: "Vehicle model code featured in email", sample: "L460" },
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
    fields: ["response_id","customer_id","campaign_id","channel","response_type","response_date","offer_accepted","vehicle_of_interest","dealer_code"],
    freshness: "Daily",
    owner: "Campaign Analytics",
    qualityScore: 83,
    selected: false,
    entities: [
      {
        name: "response",
        description: "One row per response event across all channels.",
        rowCount: "8.5M",
        fields: [
          { name: "response_id", type: "varchar(36)", description: "Unique response identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "campaign_id", type: "varchar(36)", description: "FK to campaign", isForeignKey: true },
          { name: "channel", type: "varchar(30)", description: "email / sms / direct_mail / outbound_call / digital", sample: "email" },
          { name: "response_type", type: "varchar(30)", description: "click / call / visit / test_drive / download" },
          { name: "response_date", type: "date", description: "Date of response" },
          { name: "offer_accepted", type: "boolean", description: "Whether an offer was accepted" },
          { name: "vehicle_of_interest", type: "varchar(10)", description: "Model code of vehicle interest" },
        ],
      },
    ],
  },
  {
    id: "campaign_master",
    name: "Campaign Master",
    domain: "Marketing",
    system: "Adobe Campaign",
    description: "Master campaign registry including strategy, budget, targeting criteria, model alignment and planned vs actual reach.",
    tags: ["marketing", "campaign", "planning", "master-data"],
    fields: ["campaign_id","campaign_name","campaign_type","model_code","start_date","end_date","budget","target_segment","channel","planned_reach","actual_reach"],
    freshness: "Daily",
    owner: "Marketing Planning",
    qualityScore: 89,
    selected: false,
    entities: [
      {
        name: "campaign",
        description: "One row per campaign execution.",
        rowCount: "14K",
        fields: [
          { name: "campaign_id", type: "varchar(36)", description: "Unique campaign identifier" },
          { name: "campaign_name", type: "varchar(200)", description: "Descriptive campaign name" },
          { name: "campaign_type", type: "varchar(30)", description: "retention / conquest / reactivation / launch" },
          { name: "model_code", type: "varchar(10)", description: "Primary vehicle model targeted" },
          { name: "start_date", type: "date", description: "Campaign start date" },
          { name: "end_date", type: "date", description: "Campaign end date" },
          { name: "budget", type: "decimal(12,2)", description: "Total approved campaign budget in GBP" },
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
    description: "Clickstream and behavioural events from jaguarlandrover.com, configurator, and dealer portal sessions.",
    tags: ["digital", "clickstream", "behavioural", "real-time"],
    fields: ["event_id","customer_id","session_id","event_type","page_url","model_viewed","cta_clicked","timestamp","device_type","source_medium"],
    freshness: "Real-time (5 min lag)",
    owner: "Digital Analytics",
    qualityScore: 91,
    selected: false,
    entities: [
      {
        name: "event",
        description: "One row per trackable website event.",
        rowCount: "2.1B",
        fields: [
          { name: "event_id", type: "varchar(36)", description: "Unique event identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer (null if anonymous)", isForeignKey: true },
          { name: "session_id", type: "varchar(36)", description: "Browser session identifier" },
          { name: "event_type", type: "varchar(50)", description: "page_view / model_configure / test_drive_book / brochure_download" },
          { name: "page_url", type: "text", description: "Full URL of the page" },
          { name: "model_viewed", type: "varchar(10)", description: "Model code if event is model-related" },
          { name: "timestamp", type: "timestamptz", description: "UTC event timestamp" },
          { name: "device_type", type: "varchar(20)", description: "desktop / mobile / tablet" },
          { name: "source_medium", type: "varchar(100)", description: "UTM source / medium attribution" },
        ],
      },
    ],
  },
  {
    id: "configurator_sessions",
    name: "Configurator Sessions",
    domain: "Digital",
    system: "Vehicle Configurator",
    description: "Detailed vehicle configuration sessions showing model, derivative, colour, options selected, and session outcome (saved / abandoned / ordered).",
    tags: ["digital", "configurator", "intent", "vehicle"],
    fields: ["session_id","customer_id","model_code","derivative","exterior_colour","interior_colour","options_selected","list_price","session_start","session_end","outcome"],
    freshness: "Real-time",
    owner: "Digital Products",
    qualityScore: 88,
    selected: false,
    entities: [
      {
        name: "configurator_session",
        description: "One row per configurator session.",
        rowCount: "18M",
        fields: [
          { name: "session_id", type: "varchar(36)", description: "Configurator session identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer (null if anonymous)", isForeignKey: true },
          { name: "model_code", type: "varchar(10)", description: "Vehicle model configured", sample: "L460" },
          { name: "derivative", type: "varchar(50)", description: "Specific trim / derivative selected" },
          { name: "exterior_colour", type: "varchar(50)", description: "Selected exterior colour" },
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
    name: "Vehicle Orders",
    domain: "Sales",
    system: "Global Order Management",
    description: "Confirmed vehicle orders, configurations, deposits, and delivery status from global order management system.",
    tags: ["sales", "orders", "transaction", "vehicle"],
    fields: ["order_id","customer_id","vin","model_code","derivative","colour","options","order_date","delivery_date","order_value","dealer_code","region"],
    freshness: "Real-time",
    owner: "Order Management",
    qualityScore: 95,
    selected: false,
    entities: [
      {
        name: "order",
        description: "One row per confirmed vehicle order.",
        rowCount: "620K",
        fields: [
          { name: "order_id", type: "varchar(36)", description: "Unique order identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "vin", type: "varchar(17)", description: "Vehicle Identification Number" },
          { name: "model_code", type: "varchar(10)", description: "JLR model code", sample: "L460" },
          { name: "derivative", type: "varchar(50)", description: "Trim / engine / derivative" },
          { name: "order_date", type: "date", description: "Date order was placed" },
          { name: "delivery_date", type: "date", description: "Actual or estimated delivery date" },
          { name: "order_value", type: "decimal(12,2)", description: "Total order value in GBP" },
          { name: "dealer_code", type: "varchar(10)", description: "FK to dealer", isForeignKey: true },
        ],
      },
    ],
  },
  {
    id: "test_drives",
    name: "Test Drive Bookings",
    domain: "Sales",
    system: "Dealer Management System",
    description: "Test drive appointment bookings and completions across all retail touchpoints, including model driven and conversion outcome.",
    tags: ["sales", "test-drive", "dealer", "conversion"],
    fields: ["booking_id","customer_id","dealer_code","model_code","booking_date","test_drive_date","completed","outcome","sales_exec_id"],
    freshness: "Daily",
    owner: "Retail Analytics",
    qualityScore: 85,
    selected: false,
    entities: [
      {
        name: "test_drive",
        description: "One row per test drive booking.",
        rowCount: "890K",
        fields: [
          { name: "booking_id", type: "varchar(36)", description: "Unique booking identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "dealer_code", type: "varchar(10)", description: "FK to dealer", isForeignKey: true },
          { name: "model_code", type: "varchar(10)", description: "Vehicle model test driven" },
          { name: "booking_date", type: "date", description: "Date booking was made" },
          { name: "test_drive_date", type: "date", description: "Scheduled test drive date" },
          { name: "completed", type: "boolean", description: "Whether test drive was completed" },
          { name: "outcome", type: "varchar(30)", description: "ordered / follow_up / no_action / lost" },
        ],
      },
    ],
  },
  // ── AFTER-SALES domain ────────────────────────────────────────────────────
  {
    id: "service_history",
    name: "Vehicle Service History",
    domain: "After-Sales",
    system: "Dealer Workshop Management",
    description: "Complete service and repair history per VIN including job type, mileage, cost, warranty claims, and dealer performing the work.",
    tags: ["after-sales", "service", "vehicle", "warranty"],
    fields: ["service_id","vin","customer_id","dealer_code","service_date","mileage","job_type","warranty_claim","labour_cost","parts_cost","nps_score"],
    freshness: "Daily",
    owner: "After-Sales Analytics",
    qualityScore: 88,
    selected: false,
    entities: [
      {
        name: "service_visit",
        description: "One row per dealer workshop visit.",
        rowCount: "5.4M",
        fields: [
          { name: "service_id", type: "varchar(36)", description: "Unique service record identifier" },
          { name: "vin", type: "varchar(17)", description: "Vehicle identification number" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "dealer_code", type: "varchar(10)", description: "FK to dealer", isForeignKey: true },
          { name: "service_date", type: "date", description: "Date vehicle was serviced" },
          { name: "mileage", type: "int", description: "Vehicle mileage at time of service" },
          { name: "job_type", type: "varchar(30)", description: "scheduled_service / repair / recall / mot" },
          { name: "warranty_claim", type: "boolean", description: "Whether work was warranty-covered" },
          { name: "labour_cost", type: "decimal(10,2)", description: "Labour cost in GBP" },
          { name: "nps_score", type: "int", description: "Net Promoter Score for this visit (0-10)" },
        ],
      },
    ],
  },
  {
    id: "connected_vehicle",
    name: "Connected Vehicle Telemetry",
    domain: "After-Sales",
    system: "InControl / Pivi Platform",
    description: "Aggregated connected vehicle signals including mileage, fuel/charge level, health alerts, and feature usage patterns per VIN.",
    tags: ["vehicle", "telemetry", "iot", "connected"],
    fields: ["vin","customer_id","snapshot_date","odometer_km","fuel_level_pct","charge_level_pct","health_alerts","features_used","last_connected"],
    freshness: "Daily",
    owner: "Connected Services",
    qualityScore: 76,
    selected: false,
    entities: [
      {
        name: "vehicle_snapshot",
        description: "Daily aggregated vehicle telemetry snapshot.",
        rowCount: "280M",
        fields: [
          { name: "vin", type: "varchar(17)", description: "Vehicle identification number" },
          { name: "snapshot_date", type: "date", description: "Date of snapshot" },
          { name: "odometer_km", type: "int", description: "Cumulative odometer reading in km" },
          { name: "fuel_level_pct", type: "decimal(5,2)", description: "Fuel tank percentage (ICE / HEV)" },
          { name: "charge_level_pct", type: "decimal(5,2)", description: "Battery charge percentage (EV / PHEV)" },
          { name: "health_alerts", type: "varchar[]", description: "Array of active diagnostic alert codes" },
          { name: "features_used", type: "varchar[]", description: "InControl features activated in period" },
        ],
      },
    ],
  },
  // ── FINANCE domain ────────────────────────────────────────────────────────
  {
    id: "finance_contracts",
    name: "Finance Contracts",
    domain: "Finance",
    system: "JLR Financial Services",
    description: "Finance product contracts (PCP, PCH, HP) linked to vehicle orders, including monthly payment, term, deposit, and settlement data.",
    tags: ["finance", "contract", "pcp", "payment"],
    fields: ["contract_id","customer_id","order_id","product_type","monthly_payment","deposit","term_months","annual_mileage","balloon","start_date","end_date","status"],
    freshness: "Daily",
    owner: "Financial Services Analytics",
    qualityScore: 93,
    selected: false,
    entities: [
      {
        name: "finance_contract",
        description: "One row per finance contract.",
        rowCount: "410K",
        fields: [
          { name: "contract_id", type: "varchar(36)", description: "Unique contract identifier" },
          { name: "customer_id", type: "varchar(36)", description: "FK to customer", isForeignKey: true },
          { name: "order_id", type: "varchar(36)", description: "FK to vehicle order", isForeignKey: true },
          { name: "product_type", type: "varchar(10)", description: "PCP / PCH / HP / Cash" },
          { name: "monthly_payment", type: "decimal(10,2)", description: "Monthly payment amount in GBP" },
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
