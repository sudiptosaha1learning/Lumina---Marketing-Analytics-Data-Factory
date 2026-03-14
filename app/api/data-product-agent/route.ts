import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

export const maxDuration = 120;

// ── JLR Enterprise Data Catalog (tool knowledge base) ─────────────────────

const CATALOG_DB: Record<string, {
  id: string; name: string; domain: string; system: string;
  description: string; rowCount: string; freshness: string;
  qualityScore: number; owner: string;
  fields: Array<{ name: string; type: string; isPII: boolean; nullable: boolean; description: string; sampleValues?: string }>;
}> = {
  crm_customers: {
    id: "crm_customers", name: "CRM Customers", domain: "Customer",
    system: "Salesforce CRM", description: "Master customer records including demographics, contact info, vehicle ownership history.",
    rowCount: "4.2M", freshness: "Daily", qualityScore: 87, owner: "CRM Platform Team",
    fields: [
      { name: "customer_id", type: "varchar(36)", isPII: false, nullable: false, description: "UUID primary key" },
      { name: "first_name", type: "varchar(100)", isPII: true, nullable: false, description: "Customer first name" },
      { name: "last_name", type: "varchar(100)", isPII: true, nullable: false, description: "Customer surname" },
      { name: "email", type: "varchar(255)", isPII: true, nullable: false, description: "Primary email address" },
      { name: "phone", type: "varchar(20)", isPII: true, nullable: true, description: "Mobile phone number", sampleValues: "+44 7xxx xxxxxx" },
      { name: "postcode", type: "varchar(10)", isPII: true, nullable: true, description: "Residential postcode" },
      { name: "loyalty_tier", type: "varchar(20)", isPII: false, nullable: true, description: "Gold/Silver/Bronze/None", sampleValues: "Gold" },
      { name: "lifetime_value", type: "decimal(12,2)", isPII: false, nullable: true, description: "Total revenue attributed to customer" },
      { name: "last_purchase_date", type: "date", isPII: false, nullable: true, description: "Date of most recent confirmed order" },
      { name: "vehicle_count", type: "int", isPII: false, nullable: false, description: "Number of vehicles ever purchased" },
    ],
  },
  website_events: {
    id: "website_events", name: "Website Events", domain: "Digital",
    system: "Adobe Analytics", description: "Clickstream events from jaguarlandrover.com and dealer portal.",
    rowCount: "2.1B", freshness: "Real-time (5 min lag)", qualityScore: 91, owner: "Digital Analytics",
    fields: [
      { name: "event_id", type: "varchar(36)", isPII: false, nullable: false, description: "Unique event identifier" },
      { name: "customer_id", type: "varchar(36)", isPII: false, nullable: true, description: "FK to customer (null if anonymous)" },
      { name: "session_id", type: "varchar(36)", isPII: false, nullable: false, description: "Browser session identifier" },
      { name: "event_type", type: "varchar(50)", isPII: false, nullable: false, description: "page_view/model_configure/test_drive_book/brochure_download", sampleValues: "model_configure" },
      { name: "model_viewed", type: "varchar(10)", isPII: false, nullable: true, description: "Vehicle model code", sampleValues: "L460" },
      { name: "timestamp", type: "timestamptz", isPII: false, nullable: false, description: "UTC event timestamp" },
      { name: "device_type", type: "varchar(20)", isPII: false, nullable: false, description: "desktop/mobile/tablet" },
      { name: "source_medium", type: "varchar(100)", isPII: false, nullable: true, description: "UTM attribution" },
    ],
  },
  email_clicks: {
    id: "email_clicks", name: "Email Campaign Clicks", domain: "Marketing",
    system: "Adobe Campaign", description: "Email marketing engagement: opens, clicks, unsubscribes.",
    rowCount: "120M", freshness: "Daily", qualityScore: 79, owner: "CRM Marketing",
    fields: [
      { name: "email_id", type: "varchar(36)", isPII: false, nullable: false, description: "Unique send identifier" },
      { name: "customer_id", type: "varchar(36)", isPII: false, nullable: false, description: "FK to customer" },
      { name: "campaign_id", type: "varchar(36)", isPII: false, nullable: false, description: "FK to campaign" },
      { name: "sent_at", type: "timestamptz", isPII: false, nullable: false, description: "UTC send timestamp" },
      { name: "opened_at", type: "timestamptz", isPII: false, nullable: true, description: "First open timestamp" },
      { name: "clicked_at", type: "timestamptz", isPII: false, nullable: true, description: "First click timestamp" },
      { name: "model_featured", type: "varchar(10)", isPII: false, nullable: true, description: "Vehicle model code featured", sampleValues: "L460" },
      { name: "unsubscribed", type: "boolean", isPII: false, nullable: false, description: "Whether send triggered unsubscribe" },
    ],
  },
  campaign_responses: {
    id: "campaign_responses", name: "Campaign Responses", domain: "Marketing",
    system: "Campaign Management", description: "Multi-channel campaign response events.",
    rowCount: "8.5M", freshness: "Daily", qualityScore: 83, owner: "Campaign Analytics",
    fields: [
      { name: "response_id", type: "varchar(36)", isPII: false, nullable: false, description: "Unique response identifier" },
      { name: "customer_id", type: "varchar(36)", isPII: false, nullable: false, description: "FK to customer" },
      { name: "campaign_id", type: "varchar(36)", isPII: false, nullable: false, description: "FK to campaign" },
      { name: "channel", type: "varchar(30)", isPII: false, nullable: false, description: "email/sms/direct_mail/digital", sampleValues: "email" },
      { name: "response_type", type: "varchar(30)", isPII: false, nullable: false, description: "click/call/visit/test_drive/download" },
      { name: "response_date", type: "date", isPII: false, nullable: false, description: "Date of response" },
      { name: "offer_accepted", type: "boolean", isPII: false, nullable: false, description: "Whether an offer was accepted" },
      { name: "vehicle_of_interest", type: "varchar(10)", isPII: false, nullable: true, description: "Model code of vehicle interest" },
    ],
  },
  orders: {
    id: "orders", name: "Vehicle Orders", domain: "Sales",
    system: "Global Order Management", description: "Confirmed vehicle orders, configurations, and delivery status.",
    rowCount: "890K", freshness: "Real-time", qualityScore: 95, owner: "Order Management",
    fields: [
      { name: "order_id", type: "varchar(36)", isPII: false, nullable: false, description: "Unique order identifier" },
      { name: "customer_id", type: "varchar(36)", isPII: false, nullable: false, description: "FK to customer" },
      { name: "model_code", type: "varchar(10)", isPII: false, nullable: false, description: "Vehicle model code", sampleValues: "L460" },
      { name: "order_date", type: "date", isPII: false, nullable: false, description: "Date order was placed" },
      { name: "delivery_date", type: "date", isPII: false, nullable: true, description: "Scheduled delivery date" },
      { name: "order_value", type: "decimal(12,2)", isPII: false, nullable: false, description: "Total order value in GBP" },
      { name: "dealer_code", type: "varchar(20)", isPII: false, nullable: false, description: "FK to dealer network" },
    ],
  },
  dealer_network: {
    id: "dealer_network", name: "Dealer Network", domain: "Sales",
    system: "Retailer Operations", description: "Dealer master data including location, tier, capacity, and performance.",
    rowCount: "3.2K", freshness: "Weekly", qualityScore: 92, owner: "Retailer Operations",
    fields: [
      { name: "dealer_code", type: "varchar(20)", isPII: false, nullable: false, description: "Unique dealer identifier" },
      { name: "dealer_name", type: "varchar(200)", isPII: false, nullable: false, description: "Dealer trading name" },
      { name: "country", type: "varchar(3)", isPII: false, nullable: false, description: "ISO 3-letter country code" },
      { name: "region", type: "varchar(50)", isPII: false, nullable: false, description: "Regional grouping" },
      { name: "tier", type: "varchar(20)", isPII: false, nullable: false, description: "Premium/Standard/Entry" },
      { name: "csi_score", type: "decimal(4,1)", isPII: false, nullable: true, description: "Customer satisfaction index score" },
    ],
  },
};

// ── GDPR Compliance Rules ─────────────────────────────────────────────────

const GDPR_RULES: Record<string, {
  article: string; requirement: string; maskingRule: string; retentionPeriod: string; approvalRequired: boolean;
}> = {
  email: { article: "Art. 5(1)(e)", requirement: "Minimal data retention, consent required for marketing use", maskingRule: "Hash SHA-256 for non-owner roles; show only to Data Product Owner", retentionPeriod: "7 years or consent withdrawal", approvalRequired: true },
  phone: { article: "Art. 5(1)(e)", requirement: "Consent required for SMS marketing", maskingRule: "Last 4 digits visible, remainder masked: +44 7xxx xxx**89", retentionPeriod: "7 years or consent withdrawal", approvalRequired: true },
  first_name: { article: "Art. 4(1)", requirement: "Personal data — minimise access", maskingRule: "First initial only for Analyst role: 'J. Smith'", retentionPeriod: "Customer lifetime + 7 years", approvalRequired: false },
  last_name: { article: "Art. 4(1)", requirement: "Personal data — minimise access", maskingRule: "First initial only for Analyst role", retentionPeriod: "Customer lifetime + 7 years", approvalRequired: false },
  postcode: { article: "Art. 4(1)", requirement: "Indirect identifier — district level sufficient for analytics", maskingRule: "Truncate to district (first 3-4 chars): 'SW1A' not 'SW1A 2AA'", retentionPeriod: "Customer lifetime + 7 years", approvalRequired: false },
  customer_id: { article: "Art. 4(1) Pseudonymisation", requirement: "Pseudonymous identifier — must be treated as personal data when linkage table exists", maskingRule: "No masking required; access controlled at row level", retentionPeriod: "Customer lifetime + 7 years", approvalRequired: false },
  lifetime_value: { article: "Art. 9 (financial)", requirement: "Financial data — internal access only", maskingRule: "Visible only to Owner and Finance roles; null for all others", retentionPeriod: "7 years (financial record)", approvalRequired: true },
};

// ── KPI Glossary ──────────────────────────────────────────────────────────

const KPI_GLOSSARY: Record<string, { definition: string; formula: string; owner: string; tier: string; updateFrequency: string }> = {
  "propensity_to_buy": { definition: "A 0–100 score indicating the likelihood that a given customer will purchase a new JLR vehicle within 90 days, based on recency, frequency, and digital engagement signals.", formula: "Weighted logistic regression on: recency_score(0.3) + frequency_score(0.25) + digital_engagement(0.25) + campaign_response(0.2)", owner: "Insight & Analytics", tier: "Gold", updateFrequency: "Daily" },
  "campaign_response_rate": { definition: "Percentage of customers in a campaign audience who responded via any channel within the campaign window.", formula: "COUNT(DISTINCT responses.customer_id) / COUNT(DISTINCT audience.customer_id) * 100", owner: "Campaign Analytics", tier: "Silver", updateFrequency: "Daily" },
  "email_click_through_rate": { definition: "Percentage of email recipients who clicked at least one link in a campaign email.", formula: "COUNT(DISTINCT CASE WHEN clicked_at IS NOT NULL THEN customer_id END) / COUNT(DISTINCT customer_id) * 100", owner: "CRM Marketing", tier: "Gold", updateFrequency: "Daily" },
  "customer_lifetime_value": { definition: "The total revenue attributed to a customer across all vehicle purchases and services, in GBP.", formula: "SUM(order_value) + SUM(service_revenue) WHERE customer_id = :id", owner: "CRM Platform", tier: "Gold", updateFrequency: "Monthly" },
  "test_drive_conversion_rate": { definition: "Percentage of customers who booked a test drive and subsequently placed an order within 90 days.", formula: "COUNT(orders.customer_id JOIN test_drive_bookings ON 90d window) / COUNT(test_drive_bookings.customer_id) * 100", owner: "Retail Analytics", tier: "Silver", updateFrequency: "Monthly" },
  "churn_risk_score": { definition: "Probability (0–1) that a customer will not purchase another JLR vehicle within the next 24 months.", formula: "1 - propensity_to_buy_24m; features: recency, contract_end_proximity, competitive_campaign_exposure", owner: "Insight & Analytics", tier: "Gold", updateFrequency: "Weekly" },
};

// ── SQL Templates ─────────────────────────────────────────────────────────

function buildSQLTemplate(step: string, sources: string[], targetTable: string): string {
  const srcList = sources.join(", ");
  const templates: Record<string, string> = {
    extract: `-- Extract: Pull latest records from ${srcList}\nCREATE OR REPLACE TABLE raw_${targetTable}_extract AS\nSELECT *\nFROM ${sources[0]}\nWHERE updated_at >= DATEADD(day, -1, CURRENT_DATE());`,
    deduplicate: `-- Deduplication: One record per customer_id using latest record\nCREATE OR REPLACE TABLE ${targetTable}_deduped AS\nSELECT *\nFROM (\n  SELECT *,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn\n  FROM raw_${targetTable}_extract\n)\nWHERE rn = 1;`,
    join: `-- Join: Combine ${srcList} on customer_id\nCREATE OR REPLACE TABLE ${targetTable}_enriched AS\nSELECT\n  c.customer_id,\n  c.loyalty_tier,\n  e.event_type,\n  ec.opened_at,\n  ec.clicked_at,\n  o.order_date\nFROM crm_customers c\nLEFT JOIN website_events e ON c.customer_id = e.customer_id\n  AND e.timestamp >= DATEADD(day, -90, CURRENT_DATE())\nLEFT JOIN email_clicks ec ON c.customer_id = ec.customer_id\n  AND ec.sent_at >= DATEADD(day, -90, CURRENT_DATE())\nLEFT JOIN orders o ON c.customer_id = o.customer_id\n  AND o.order_date >= DATEADD(day, -365, CURRENT_DATE());`,
    score: `-- Scoring: Compute propensity score\nCREATE OR REPLACE TABLE ${targetTable}_scored AS\nSELECT\n  customer_id,\n  loyalty_tier,\n  ROUND(\n    (recency_score * 0.30) +\n    (frequency_score * 0.25) +\n    (digital_engagement_score * 0.25) +\n    (campaign_response_score * 0.20)\n  , 2) AS propensity_score,\n  CASE\n    WHEN propensity_score >= 0.8 THEN 'Hot'\n    WHEN propensity_score >= 0.6 THEN 'Warm'\n    WHEN propensity_score >= 0.4 THEN 'Lukewarm'\n    ELSE 'Cold'\n  END AS score_band,\n  CURRENT_TIMESTAMP() AS scored_at\nFROM ${targetTable}_features;`,
    load: `-- Load: Write final output to gold layer\nINSERT OVERWRITE INTO gold.${targetTable}\nSELECT\n  customer_id,\n  propensity_score,\n  score_band,\n  scored_at,\n  '${new Date().toISOString().split("T")[0]}' AS partition_date\nFROM ${targetTable}_scored\nWHERE propensity_score IS NOT NULL;`,
  };
  return templates[step] ?? `-- Transformation step: ${step}\n-- Sources: ${srcList}\n-- Target: ${targetTable}`;
}

// ── Tool Definitions ──────────────────────────────────────────────────────

const agentTools = {
  searchDataCatalog: tool({
    description: "Search the JLR enterprise data catalog by keyword, domain, or system name. Returns matching source tables with metadata including row counts, freshness, quality scores, and owner teams.",
    inputSchema: z.object({
      query: z.string().describe("Search term — can be a domain name (Customer, Marketing, Digital, Sales), system name (Salesforce, Adobe), table name, or a semantic keyword like 'email engagement' or 'vehicle orders'"),
      domain: z.string().nullable().describe("Optional domain filter: 'Customer', 'Marketing', 'Digital', or 'Sales'"),
    }),
    execute: async ({ query, domain }) => {
      const q = query.toLowerCase();
      const results = Object.values(CATALOG_DB).filter(src => {
        const matchDomain = !domain || src.domain.toLowerCase() === domain.toLowerCase();
        const matchQuery = src.name.toLowerCase().includes(q)
          || src.description.toLowerCase().includes(q)
          || src.id.toLowerCase().includes(q)
          || src.domain.toLowerCase().includes(q)
          || src.system.toLowerCase().includes(q)
          || src.fields.some(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
        return matchDomain && matchQuery;
      });
      return {
        found: results.length,
        results: results.map(s => ({
          id: s.id, name: s.name, domain: s.domain, system: s.system,
          description: s.description, rowCount: s.rowCount,
          freshness: s.freshness, qualityScore: s.qualityScore,
          owner: s.owner, fieldCount: s.fields.length,
          piiFieldCount: s.fields.filter(f => f.isPII).length,
        })),
      };
    },
  }),

  profileDataSource: tool({
    description: "Retrieve the full schema and quality profile for a specific data source. Returns all field definitions, PII flags, nullability, sample values, and data quality metrics.",
    inputSchema: z.object({
      sourceId: z.string().describe("The ID of the data source to profile (e.g. 'crm_customers', 'website_events', 'email_clicks', 'campaign_responses', 'orders', 'dealer_network')"),
      includeQualityMetrics: z.boolean().describe("Whether to include simulated quality profiling metrics (null rates, uniqueness, freshness lag)"),
    }),
    execute: async ({ sourceId, includeQualityMetrics }) => {
      const src = CATALOG_DB[sourceId];
      if (!src) {
        return { error: `Source '${sourceId}' not found. Available sources: ${Object.keys(CATALOG_DB).join(", ")}` };
      }
      const base = {
        id: src.id, name: src.name, domain: src.domain, system: src.system,
        rowCount: src.rowCount, freshness: src.freshness,
        qualityScore: src.qualityScore, owner: src.owner,
        fields: src.fields,
        summary: {
          totalFields: src.fields.length,
          piiFields: src.fields.filter(f => f.isPII).map(f => f.name),
          nullableFields: src.fields.filter(f => f.nullable).map(f => f.name),
          foreignKeys: src.fields.filter(f => f.name.includes("_id") && f.name !== (src.id === "crm_customers" ? "customer_id" : "")).map(f => f.name),
        },
      };
      if (!includeQualityMetrics) return base;
      const qualityProfile = src.fields.map(f => ({
        field: f.name,
        nullRate: f.nullable ? `${(Math.random() * 12).toFixed(1)}%` : "0.0%",
        uniquenessRate: f.name.endsWith("_id") && !f.name.includes("campaign") ? `${(98 + Math.random() * 2).toFixed(1)}%` : `${(50 + Math.random() * 45).toFixed(1)}%`,
        dataType: f.type,
        isPII: f.isPII,
      }));
      return { ...base, qualityProfile };
    },
  }),

  computeQualityScore: tool({
    description: "Compute an aggregated data quality fitness score for a set of selected data sources against a specific use case. Analyses null rates, referential integrity, freshness, and join coverage. Returns an overall score 0-100 and a list of quality issues.",
    inputSchema: z.object({
      sourceIds: z.array(z.string()).describe("List of data source IDs to assess"),
      useCase: z.string().describe("The analytics use case being evaluated, e.g. 'customer propensity scoring' or 'campaign attribution'"),
    }),
    execute: async ({ sourceIds, useCase }) => {
      const sources = sourceIds.map(id => CATALOG_DB[id]).filter(Boolean);
      const avgQuality = sources.length > 0
        ? sources.reduce((sum, s) => sum + s.qualityScore, 0) / sources.length
        : 0;

      const issues = [];
      for (const src of sources) {
        for (const field of src.fields) {
          if (field.nullable && (field.name.includes("email") || field.name.includes("customer_id"))) {
            issues.push({
              source: src.id, field: field.name, issueType: "Null rate",
              severity: field.name === "customer_id" ? "high" : "medium",
              detail: `${field.name} has nullable constraint — ${(Math.random() * 8 + 1).toFixed(1)}% null rate detected. This may cause join failures.`,
              suggestion: `Filter out records where ${field.name} IS NULL before joining. Consider adding NOT NULL constraint upstream.`,
            });
          }
          if (field.name.endsWith("_id") && field.name !== "customer_id" && !field.name.endsWith("email_id")) {
            issues.push({
              source: src.id, field: field.name, issueType: "Referential integrity",
              severity: "low",
              detail: `Referential integrity between ${src.id}.${field.name} and its parent table is not enforced at DB level.`,
              suggestion: `Add dbt referential integrity test: relationships(to='ref(parent_table)', field='${field.name}').`,
            });
          }
        }
      }

      const overallScore = Math.round(avgQuality - (issues.filter(i => i.severity === "high").length * 5));
      return {
        overallScore: Math.max(0, Math.min(100, overallScore)),
        sourcesAssessed: sources.map(s => ({ id: s.id, name: s.name, rawScore: s.qualityScore, freshness: s.freshness })),
        issues: issues.slice(0, 8),
        readinessAssessment: overallScore >= 85
          ? `Sources are high quality and ready for ${useCase}. Proceed with minor remediation of flagged nullable fields.`
          : overallScore >= 70
            ? `Sources are fit-for-purpose for ${useCase} with targeted remediation. Address high-severity issues before proceeding.`
            : `Sources require significant remediation before use in ${useCase}. Escalate to data owners before proceeding.`,
        remediations: issues.slice(0, 3).map(i => i.suggestion),
      };
    },
  }),

  generateSQLTransform: tool({
    description: "Generate a specific SQL transformation step for the data pipeline. Produces production-ready dbt-compatible SQL with CTEs, incremental patterns, and data quality assertions.",
    inputSchema: z.object({
      stepType: z.enum(["extract", "deduplicate", "join", "score", "load"]).describe("The type of transformation step to generate"),
      sources: z.array(z.string()).describe("Source table IDs to use in the transformation"),
      targetTable: z.string().describe("The name of the output target table"),
      additionalContext: z.string().nullable().describe("Any specific business logic or constraints to incorporate into the SQL"),
    }),
    execute: async ({ stepType, sources, targetTable }) => {
      const sql = buildSQLTemplate(stepType, sources, targetTable);
      const validSources = sources.filter(s => CATALOG_DB[s]);
      return {
        stepType,
        targetTable,
        sql,
        sourcesUsed: validSources,
        estimatedRowCount: validSources.length > 0
          ? CATALOG_DB[validSources[0]]?.rowCount ?? "Unknown"
          : "Unknown",
        dbtModelName: `${targetTable}_${stepType}`,
        incrementalStrategy: stepType === "load" ? "insert_overwrite by partition_date" : "full_refresh",
        testAssertions: [
          `assert_not_null: ${targetTable}.customer_id`,
          `assert_row_count_between: ${targetTable} 100000 5000000`,
          `assert_no_duplicates: ${targetTable}.customer_id`,
        ],
      };
    },
  }),

  runValidationTest: tool({
    description: "Execute a specific data validation test against a target field or table. Simulates running dbt tests, Great Expectations, or custom SQL assertions. Returns pass/fail status with detailed diagnostic information.",
    inputSchema: z.object({
      testType: z.enum(["null_check", "range_check", "referential", "uniqueness", "freshness", "custom"]).describe("The type of validation test to run"),
      target: z.string().describe("The table.field or table name to test"),
      expectedValue: z.string().nullable().describe("Expected threshold or value (e.g. '< 1%' for null rate, '0–100' for score range, '< 6 hours' for freshness)"),
    }),
    execute: async ({ testType, target, expectedValue }) => {
      const passProb = testType === "null_check" ? 0.75 : testType === "range_check" ? 0.85 : testType === "freshness" ? 0.9 : 0.8;
      const passed = Math.random() < passProb;
      const actualValues: Record<string, string> = {
        null_check: passed ? `0.3% null rate (threshold: ${expectedValue ?? "< 1%"})` : `3.7% null rate (threshold: ${expectedValue ?? "< 1%"}) — EXCEEDS threshold`,
        range_check: passed ? `All values within ${expectedValue ?? "expected range"}` : `2 rows with values outside ${expectedValue ?? "expected range"}`,
        referential: passed ? "100% referential integrity across join keys" : `0.8% orphan records found — customer_id not found in crm_customers`,
        uniqueness: passed ? "No duplicates found on primary key" : `127 duplicate customer_id values detected — deduplication required`,
        freshness: passed ? `Last loaded ${new Date(Date.now() - 3 * 3600000).toISOString()} — within SLA` : `Last loaded ${new Date(Date.now() - 28 * 3600000).toISOString()} — SLA breach`,
        custom: passed ? "Custom assertion passed" : "Custom assertion failed — review business logic",
      };
      return {
        testType, target, passed,
        status: passed ? "pass" : "fail",
        actual: actualValues[testType] ?? "Test executed",
        expected: expectedValue ?? "Per SLA definition",
        severity: !passed && testType === "null_check" ? "high" : !passed ? "medium" : "info",
        recommendation: passed ? null : `Investigate ${target}. Run: SELECT COUNT(*) FROM ${target.split(".")[0]} WHERE ${target.split(".")[1] ?? "value"} IS NULL or out-of-range.`,
        executedAt: new Date().toISOString(),
      };
    },
  }),

  lookupKPIGlossary: tool({
    description: "Look up the official business definition, formula, calculation methodology, and data lineage for a named KPI or metric in the JLR analytics glossary. Use this to ensure all defined KPIs have approved business definitions.",
    inputSchema: z.object({
      kpiName: z.string().describe("The name of the KPI to look up (e.g. 'propensity_to_buy', 'campaign_response_rate', 'email_click_through_rate', 'customer_lifetime_value', 'test_drive_conversion_rate', 'churn_risk_score')"),
    }),
    execute: async ({ kpiName }) => {
      const normalised = kpiName.toLowerCase().replace(/\s+/g, "_");
      const entry = KPI_GLOSSARY[normalised];
      if (!entry) {
        const similar = Object.keys(KPI_GLOSSARY).filter(k => k.includes(normalised.split("_")[0]));
        return { found: false, kpiName, suggestion: `Not found in glossary. Similar entries: ${similar.join(", ") || "none"}. Proceed with a new definition.` };
      }
      return { found: true, kpiName: normalised, ...entry };
    },
  }),

  checkGDPRCompliance: tool({
    description: "Check GDPR Article 4 and Article 5 compliance requirements for a specific field containing personal data. Returns the applicable legal basis, masking rules, retention period, and whether DPO approval is required.",
    inputSchema: z.object({
      fieldName: z.string().describe("The field name to check for GDPR compliance (e.g. 'email', 'phone', 'first_name', 'postcode', 'customer_id', 'lifetime_value')"),
      intendedUse: z.string().describe("How this field will be used in the data product — affects which legal basis applies"),
    }),
    execute: async ({ fieldName }) => {
      const normalised = fieldName.toLowerCase().replace(/[^a-z_]/g, "");
      const rule = GDPR_RULES[normalised];
      if (!rule) {
        return {
          fieldName, gdprApplicable: false,
          classification: "Internal",
          note: `No specific GDPR rule found for '${fieldName}'. Treat as Internal — restrict to authenticated JLR employees only.`,
          approvalRequired: false,
        };
      }
      return { fieldName, gdprApplicable: true, classification: "PII", ...rule };
    },
  }),

  estimateCardinality: tool({
    description: "Estimate the cardinality and distribution characteristics of a field to inform data model design decisions — e.g. whether a field is suitable as a partition key, dimension key, or measure.",
    inputSchema: z.object({
      sourceId: z.string().describe("The data source ID"),
      fieldName: z.string().describe("The field to analyse"),
    }),
    execute: async ({ sourceId, fieldName }) => {
      const src = CATALOG_DB[sourceId];
      if (!src) return { error: `Source '${sourceId}' not found` };
      const field = src.fields.find(f => f.name === fieldName);
      if (!field) return { error: `Field '${fieldName}' not found in ${sourceId}` };

      const cardinalities: Record<string, { estimate: string; recommendation: string; suitable_for: string[] }> = {
        customer_id:  { estimate: `~${src.rowCount} unique values`, recommendation: "High-cardinality identifier — use as fact table grain or surrogate key", suitable_for: ["fact_grain", "join_key", "filter_predicate"] },
        loyalty_tier: { estimate: "4 distinct values: Gold, Silver, Bronze, None", recommendation: "Low-cardinality categorical — ideal as dimension attribute or filter dimension", suitable_for: ["dimension_attribute", "partition_key", "filter_dimension"] },
        model_featured:  { estimate: "~85 distinct model codes", recommendation: "Low-medium cardinality — suitable as dimension or partitioning by model family", suitable_for: ["dimension_attribute", "partition_key"] },
        event_type:   { estimate: "8 distinct event types", recommendation: "Low-cardinality categorical — ideal as dimension attribute or pivot column", suitable_for: ["dimension_attribute", "filter_dimension", "pivot_column"] },
      };
      const defaultCard = {
        estimate: `${field.type.includes("varchar") ? "Variable text" : field.type.includes("decimal") ? "Continuous numeric" : "Mixed"} — estimated 1K-100K unique values`,
        recommendation: `${field.type.includes("id") ? "Use as join key" : "Use as measure or attribute depending on model design"}`,
        suitable_for: ["measure", "attribute"],
      };
      return {
        sourceId, fieldName, fieldType: field.type, isPII: field.isPII,
        ...(cardinalities[fieldName] ?? defaultCard),
        rowCount: src.rowCount,
      };
    },
  }),
};

// ── Agent System Prompts ─────────────────────────────────────────────────

const AGENT_INSTRUCTIONS: Record<string, string> = {
  opportunity: `You are the Opportunity Discovery Agent for the JLR Agentic Data Product Factory.
Your task: translate the business request into a structured product brief.

MANDATORY TOOL USAGE: Before writing your final JSON, you MUST:
1. Call searchDataCatalog with relevant domain keywords from the request to understand what data is available
2. Call lookupKPIGlossary for at least 2 relevant KPIs mentioned or implied by the business request

After using the tools, synthesise your findings into this exact JSON (no markdown, no code fences):
{
  "purpose": string,
  "scope": string,
  "assumptions": string[],
  "initialKPIs": string[],
  "problemStatement": string
}
Reference the actual data sources and KPI definitions you discovered from the tools.`,

  persona: `You are the Persona Identification Agent for the JLR Agentic Data Product Factory.
Your task: identify the key user personas who will consume this data product.

MANDATORY TOOL USAGE: Before writing your final JSON, you MUST:
1. Call searchDataCatalog to understand what data domains are available (informs which personas need access)
2. Call checkGDPRCompliance for 'customer_id' to understand governance personas needed

Synthesise into this exact JSON (no markdown, no code fences):
{
  "personas": [{ "role": string, "jobsToBeDone": string[], "painPoints": string[] }],
  "userStories": string[]
}`,

  discovery: `You are the Data Discovery Agent for the JLR Agentic Data Product Factory.
Your task: discover and select the right source datasets from the enterprise catalog.

MANDATORY TOOL USAGE: You MUST use the tools to actually discover sources. Do NOT guess.
1. Call searchDataCatalog with the primary domain (e.g. "Customer", "Marketing")
2. Call searchDataCatalog again with specific keywords from the business request (e.g. "email", "orders", "website")
3. Call profileDataSource for each of the top 3 most relevant sources found (include includeQualityMetrics: true)
4. Call estimateCardinality for customer_id on the primary source to confirm join viability

Based ONLY on tool results, output this exact JSON (no markdown, no code fences):
{
  "selectedSourceIds": string[],
  "joinHypotheses": string[],
  "gaps": string[]
}`,

  quality: `You are the Data Quality Profiling Agent for the JLR Agentic Data Product Factory.
Your task: assess data quality of selected sources.

MANDATORY TOOL USAGE:
1. Call computeQualityScore with the selected source IDs and use case description
2. Call profileDataSource (with includeQualityMetrics: true) for the 2 lowest-scoring sources
3. Call runValidationTest with type "null_check" on the primary join key field
4. Call runValidationTest with type "referential" on the primary cross-source join

Output this exact JSON based on tool findings (no markdown, no code fences):
{
  "overallScore": number,
  "issues": [{ "source": string, "field": string, "issueType": string, "severity": "low"|"medium"|"high", "suggestion": string }],
  "remediations": string[],
  "readinessAssessment": string
}`,

  kpi: `You are the Semantic KPI Definition Agent for the JLR Agentic Data Product Factory.
Your task: define business metrics and KPI formulas.

MANDATORY TOOL USAGE:
1. Call lookupKPIGlossary for at least 3 KPIs relevant to the use case (e.g. propensity_to_buy, campaign_response_rate, email_click_through_rate)
2. Call profileDataSource on the primary fact source to confirm required fields exist for your formulas
3. Call estimateCardinality on the primary scoring field to determine if it is suitable as a metric grain

Output this exact JSON incorporating glossary definitions where found (no markdown, no code fences):
{
  "kpis": [{ "name": string, "formula": string, "description": string, "threshold": string, "lookbackWindow": string, "glossaryEntry": string }],
  "scoreBands": { "bandName": "description" }
}`,

  model: `You are the Data Model Design Agent for the JLR Agentic Data Product Factory.
Your task: design the target data schema.

MANDATORY TOOL USAGE:
1. Call profileDataSource for the 2 primary selected sources to get exact field names and types
2. Call checkGDPRCompliance for 'email', 'phone', and 'postcode' fields
3. Call estimateCardinality on customer_id and at least one dimension field (e.g. loyalty_tier, model_featured)

Output this exact JSON (no markdown, no code fences, max 3 tables, max 8 fields per table):
{
  "grain": string,
  "tables": [{ "name": string, "grain": string, "type": "fact"|"dimension"|"bridge", "fields": [{ "name": string, "type": string, "description": string, "sourceTable": string, "isPII": boolean }] }],
  "relationships": string[]
}`,

  pipeline: `You are the Pipeline Generation Agent for the JLR Agentic Data Product Factory.
Your task: generate the transformation pipeline.

MANDATORY TOOL USAGE:
1. Call generateSQLTransform with stepType "extract" for the primary source
2. Call generateSQLTransform with stepType "join" for the multi-source enrichment step
3. Call generateSQLTransform with stepType "score" for the KPI computation step
4. Call generateSQLTransform with stepType "load" for the gold-layer write

Output this exact JSON using the actual SQL from the tools (no markdown, no code fences):
{
  "scheduleFrequency": string,
  "steps": [{ "order": number, "name": string, "type": "extract"|"transform"|"load"|"test", "sql": string, "description": string }],
  "dbtModels": string[],
  "orchestrationSteps": string[]
}`,

  validation: `You are the Validation & Testing Agent for the JLR Agentic Data Product Factory.
Your task: generate and run a test suite.

MANDATORY TOOL USAGE — run ALL of these tests:
1. Call runValidationTest type "null_check" on the primary key field
2. Call runValidationTest type "uniqueness" on the primary key field
3. Call runValidationTest type "range_check" on the scoring/metric field (expectedValue: "0-100" or "0.0-1.0")
4. Call runValidationTest type "referential" on the cross-source join key
5. Call runValidationTest type "freshness" on the primary source table
6. Call runValidationTest type "custom" for a business-logic assertion specific to this product

Report actual test results from the tools. Output this exact JSON (no markdown, no code fences):
{
  "passRate": number,
  "testSuite": [{ "name": string, "type": string, "target": string, "status": "pass"|"fail"|"pending", "detail": string }],
  "anomalies": string[],
  "summary": string
}`,

  documentation: `You are the Documentation Agent for the JLR Agentic Data Product Factory.
Your task: produce clear business-friendly documentation.

MANDATORY TOOL USAGE:
1. Call profileDataSource on the primary fact source to get exact field names for documentation
2. Call lookupKPIGlossary for the primary KPI to get approved definitions

Output this exact JSON (no markdown, no code fences):
{
  "productDescription": string,
  "fieldDescriptions": { "fieldName": "description" },
  "lineageSummary": string,
  "usageNotes": string,
  "sampleQueries": string[]
}`,

  governance: `You are the Governance Agent for the JLR Agentic Data Product Factory.
Your task: identify PII, apply masking rules, and define access controls.

MANDATORY TOOL USAGE — you MUST call checkGDPRCompliance for EACH of these fields:
1. checkGDPRCompliance for 'email'
2. checkGDPRCompliance for 'phone'
3. checkGDPRCompliance for 'first_name'
4. checkGDPRCompliance for 'postcode'
5. checkGDPRCompliance for 'customer_id'
6. checkGDPRCompliance for 'lifetime_value'

Then call profileDataSource on the primary source to identify any additional PII fields.

Output this exact JSON incorporating actual GDPR rules from the tools (no markdown, no code fences):
{
  "piiFindings": [{ "field": string, "classification": "PII"|"Sensitive"|"Internal"|"Public", "maskingRule": string, "approvalRequired": boolean, "businessJustification": null, "overridden": false }],
  "accessControlMatrix": { "role": ["permission"] },
  "approvalRequirements": string[],
  "complianceNotes": string
}`,

  publishing: `You are the Publishing Agent for the JLR Agentic Data Product Factory.
Your task: create the publishable product card.

MANDATORY TOOL USAGE:
1. Call searchDataCatalog with the product domain to identify the catalog section for registration
2. Call lookupKPIGlossary for the primary KPI to confirm it is referenced in the product card

Output this exact JSON (no markdown, no code fences):
{
  "productCard": { "name": string, "description": string, "owner": string, "domain": string, "tags": string[], "version": string, "refreshFrequency": string, "endpoints": string[], "status": "published" },
  "releaseNotes": string,
  "publishedAt": string
}`,
};

// ── API Route ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentId, context } = body as { agentId: string; context: string };

  const instructions = AGENT_INSTRUCTIONS[agentId];
  if (!instructions) {
    return Response.json({ error: `Unknown agent: ${agentId}` }, { status: 400 });
  }

  const result = streamText({
    model: "openai/gpt-4o",
    system: instructions,
    messages: [
      {
        role: "user",
        content: `Context from prior workflow steps:\n${context}\n\nUse the available tools to gather real data before generating your output. Then respond with valid JSON only.`,
      },
    ],
    tools: agentTools,
    stopWhen: stepCountIs(12),
    maxOutputTokens: 4000,
  });

  return result.toUIMessageStreamResponse();
}
