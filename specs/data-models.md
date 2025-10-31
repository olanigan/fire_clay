# Fire Enrich - Data Models & Schemas

## Overview

Fire Enrich uses TypeScript and Zod for type-safe data models with runtime validation. All data structures are defined with both TypeScript interfaces and Zod schemas.

---

## Core Data Models

### Email Context

Represents parsed information from an email address.

**File**: `lib/agent-architecture/core/types.ts`

```typescript
const EmailContext = z.object({
  email: z.string().email(),
  domain: z.string(),
  companyDomain: z.string().optional(),
  personalName: z.string().optional(),
  companyNameGuess: z.string().optional(),
  isPersonalEmail: z.boolean(),
});

type EmailContext = z.infer<typeof EmailContext>;
```

**Fields**:
- `email`: Original email address
- `domain`: Extracted domain (e.g., "acme.com")
- `companyDomain`: Company domain if not personal email
- `personalName`: Extracted name from email prefix
- `companyNameGuess`: Guessed company name from domain
- `isPersonalEmail`: true if Gmail, Yahoo, etc.

**Example**:
```json
{
  "email": "john.doe@acme.com",
  "domain": "acme.com",
  "companyDomain": "acme.com",
  "personalName": "John Doe",
  "companyNameGuess": "ACME",
  "isPersonalEmail": false
}
```

---

### Enrichment Field

Defines a data point to extract.

**File**: `lib/agent-architecture/core/types.ts`

```typescript
const EnrichmentFieldSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array']),
  required: z.boolean().default(false),
});

type EnrichmentField = z.infer<typeof EnrichmentFieldSchema>;
```

**Fields**:
- `name`: Internal field identifier (camelCase)
- `displayName`: Human-readable label
- `description`: Detailed field description for LLM
- `type`: Data type for validation
- `required`: Whether field must be populated

**Example**:
```json
{
  "name": "companyName",
  "displayName": "Company Name",
  "description": "Official registered company name",
  "type": "string",
  "required": true
}
```

---

### Enrichment Result

Contains extracted value with metadata.

**File**: `lib/agent-architecture/core/types.ts`

```typescript
interface EnrichmentResult {
  field: string;
  value: string | number | boolean | string[] | null;
  confidence: number;
  source?: string;
  sourceContext?: Array<{
    url: string;
    snippet: string;
  }>;
}
```

**Fields**:
- `field`: Field name
- `value`: Extracted value (typed)
- `confidence`: 0-1 confidence score
- `source`: Primary source URL
- `sourceContext`: Supporting evidence from multiple sources

**Example**:
```json
{
  "field": "companyName",
  "value": "ACME Corporation",
  "confidence": 0.95,
  "source": "https://acme.com/about",
  "sourceContext": [
    {
      "url": "https://acme.com/about",
      "snippet": "ACME Corporation is a leading provider..."
    },
    {
      "url": "https://crunchbase.com/organization/acme",
      "snippet": "Company Name: ACME Corporation"
    }
  ]
}
```

---

### Row Enrichment Result

Complete result for a single CSV row.

**File**: `lib/agent-architecture/core/types.ts`

```typescript
interface RowEnrichmentResult {
  rowIndex: number;
  originalData: Record<string, string>;
  enrichments: Record<string, EnrichmentResult>;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  error?: string;
}
```

**Fields**:
- `rowIndex`: Row position in CSV (0-indexed)
- `originalData`: Original CSV row data
- `enrichments`: Map of field name to enrichment result
- `status`: Processing state
- `error`: Error message if status is 'error'

**Example**:
```json
{
  "rowIndex": 0,
  "originalData": {
    "email": "john@acme.com",
    "name": "John Doe"
  },
  "enrichments": {
    "companyName": {
      "field": "companyName",
      "value": "ACME Corporation",
      "confidence": 0.95,
      "source": "https://acme.com/about"
    },
    "industry": {
      "field": "industry",
      "value": "Software",
      "confidence": 0.87,
      "source": "https://acme.com"
    }
  },
  "status": "completed"
}
```

---

### Enrichment Handoff

Context passed between agents.

**File**: `lib/agent-architecture/core/types.ts`

```typescript
const EnrichmentHandoff = z.object({
  email: z.string().email(),
  emailContext: EmailContext,
  requestedFields: z.array(EnrichmentFieldSchema),
  discoveredData: z.record(z.string(), z.any()).optional(),
  currentAgent: z.string().optional(),
  processedFields: z.array(z.string()).optional(),
});

type EnrichmentHandoff = z.infer<typeof EnrichmentHandoff>;
```

**Fields**:
- `email`: Current email being processed
- `emailContext`: Parsed email information
- `requestedFields`: Fields to enrich
- `discoveredData`: Data from previous agents
- `currentAgent`: Currently executing agent
- `processedFields`: Fields already processed

**Example**:
```json
{
  "email": "john@acme.com",
  "emailContext": { ... },
  "requestedFields": [ ... ],
  "discoveredData": {
    "companyName": "ACME Corporation",
    "website": "https://acme.com"
  },
  "currentAgent": "company-profile-agent",
  "processedFields": ["companyName", "website"]
}
```

---

### Agent Result

Output from a single agent execution.

**File**: `lib/agent-architecture/core/types.ts`

```typescript
const AgentResult = z.object({
  fields: z.record(z.string(), z.any()),
  confidence: z.record(z.string(), z.number()),
  sources: z.record(z.string(), z.array(z.string())),
  errors: z.record(z.string(), z.string()).optional(),
});

type AgentResult = z.infer<typeof AgentResult>;
```

**Fields**:
- `fields`: Map of field name to extracted value
- `confidence`: Map of field name to confidence score
- `sources`: Map of field name to source URL array
- `errors`: Optional error messages per field

**Example**:
```json
{
  "fields": {
    "industry": "Software",
    "headquarters": "San Francisco, CA"
  },
  "confidence": {
    "industry": 0.92,
    "headquarters": 0.88
  },
  "sources": {
    "industry": [
      "https://acme.com/about",
      "https://crunchbase.com/organization/acme"
    ],
    "headquarters": [
      "https://acme.com/contact"
    ]
  }
}
```

---

## Agent-Specific Schemas

### Discovery Agent Schema

```typescript
const DiscoveryResult = z.object({
  companyName: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  companyDomain: z.string().optional(),
  businessType: z.string().optional(),
});
```

**Example Output**:
```json
{
  "companyName": "Wiz",
  "website": "https://www.wiz.io",
  "description": "Cloud security platform for enterprises",
  "companyDomain": "wiz.io",
  "businessType": "B2B SaaS"
}
```

---

### Company Profile Agent Schema

```typescript
const ProfileResult = z.object({
  industry: z.string().optional(),
  subIndustry: z.string().optional(),
  headquarters: z.string().optional(),
  yearFounded: z.number().optional(),
  companyType: z.enum(['public', 'private', 'nonprofit', 'government']).optional(),
  businessModel: z.string().optional(),
});
```

**Example Output**:
```json
{
  "industry": "Cybersecurity",
  "subIndustry": "Cloud Security",
  "headquarters": "New York, NY",
  "yearFounded": 2020,
  "companyType": "private",
  "businessModel": "B2B SaaS"
}
```

---

### Metrics Agent Schema

```typescript
const MetricsResult = z.object({
  employeeCount: z.string().optional(),
  revenue: z.string().optional(),
  valuation: z.string().optional(),
  growthRate: z.string().optional(),
  customerCount: z.string().optional(),
});
```

**Example Output**:
```json
{
  "employeeCount": "1,001-5,000",
  "revenue": "$100M-$500M ARR",
  "valuation": "$10B",
  "growthRate": "300% YoY",
  "customerCount": "10,000+"
}
```

---

### Funding Agent Schema

```typescript
const FundingResult = z.object({
  fundingStage: z.string().optional(),
  totalRaised: z.string().optional(),
  lastRoundAmount: z.string().optional(),
  lastRoundDate: z.string().optional(),
  investors: z.array(z.string()).optional(),
  valuation: z.string().optional(),
});
```

**Example Output**:
```json
{
  "fundingStage": "Series D",
  "totalRaised": "$900M",
  "lastRoundAmount": "$300M",
  "lastRoundDate": "2023-02-27",
  "investors": [
    "Sequoia Capital",
    "Index Ventures",
    "Insight Partners"
  ],
  "valuation": "$10B"
}
```

---

### Tech Stack Agent Schema

```typescript
const TechStackResult = z.object({
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  infrastructure: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  techStack: z.string().optional(),
});
```

**Example Output**:
```json
{
  "languages": ["Python", "Go", "TypeScript"],
  "frameworks": ["React", "FastAPI", "Kubernetes"],
  "infrastructure": ["AWS", "Redis", "PostgreSQL"],
  "tools": ["Docker", "GitHub Actions", "Terraform"],
  "techStack": "Python, Go, React, Kubernetes, AWS"
}
```

---

## API Request/Response Models

### Enrichment Request

```typescript
interface EnrichmentRequest {
  rows: Record<string, string>[];
  fields: EnrichmentField[];
  emailColumn: string;
  nameColumn?: string;
}
```

**Example**:
```json
{
  "rows": [
    { "email": "john@acme.com", "name": "John Doe" }
  ],
  "fields": [
    {
      "name": "companyName",
      "displayName": "Company Name",
      "description": "Official company name",
      "type": "string"
    }
  ],
  "emailColumn": "email",
  "nameColumn": "name"
}
```

---

### SSE Event Models

#### Session Event
```typescript
interface SessionEvent {
  type: 'session';
  sessionId: string;
}
```

#### Pending Event
```typescript
interface PendingEvent {
  type: 'pending';
  rowIndex: number;
  totalRows: number;
}
```

#### Processing Event
```typescript
interface ProcessingEvent {
  type: 'processing';
  rowIndex: number;
  totalRows: number;
}
```

#### Agent Progress Event
```typescript
interface AgentProgressEvent {
  type: 'agent_progress';
  rowIndex: number;
  message: string;
  messageType: 'info' | 'success' | 'warning' | 'agent';
  sourceUrl?: string;
}
```

#### Result Event
```typescript
interface ResultEvent {
  type: 'result';
  result: RowEnrichmentResult;
}
```

#### Complete Event
```typescript
interface CompleteEvent {
  type: 'complete';
}
```

#### Error Event
```typescript
interface ErrorEvent {
  type: 'error';
  error: string;
}
```

#### Cancelled Event
```typescript
interface CancelledEvent {
  type: 'cancelled';
}
```

---

## Firecrawl Integration Models

### Search Result

```typescript
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
}
```

### Scrape Result

```typescript
interface ScrapeResult {
  markdown: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    keywords?: string[];
    author?: string;
    publishedTime?: string;
  };
  links?: string[];
}
```

---

## OpenAI Integration Models

### Structured Extraction Request

```typescript
interface ExtractionRequest {
  content: string;
  schema: z.ZodType;
  systemPrompt: string;
  model?: string;
}
```

### Structured Extraction Response

```typescript
interface ExtractionResponse<T> {
  data: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

---

## Validation Rules

### Email Validation
- Must match email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Domain must be valid
- Cannot be empty

### Confidence Score Validation
- Must be between 0 and 1
- 0 = no confidence
- 1 = absolute certainty
- Typical ranges:
  - 0.8-1.0: High confidence (use directly)
  - 0.5-0.8: Medium confidence (flag for review)
  - 0.0-0.5: Low confidence (manual verification)

### URL Validation
- Must be valid HTTP/HTTPS URL
- Should resolve to 200 status (best effort)
- Normalized to lowercase

### Field Type Validation
- **string**: Any text value
- **number**: Numeric value or numeric string (e.g., "42", "3.14")
- **boolean**: true/false
- **array**: JSON array of strings

---

## Database Schema (Future)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  api_key_hash VARCHAR(255)
);
```

### Enrichment Jobs Table
```sql
CREATE TABLE enrichment_jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  row_count INTEGER,
  field_count INTEGER
);
```

### Enrichment Results Table
```sql
CREATE TABLE enrichment_results (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES enrichment_jobs(id),
  row_index INTEGER,
  field_name VARCHAR(255),
  field_value TEXT,
  confidence DECIMAL(3,2),
  sources JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Type Utilities

### Type Guards

```typescript
// Check if email context is valid
export function isValidEmailContext(ctx: unknown): ctx is EmailContext {
  return EmailContext.safeParse(ctx).success;
}

// Check if field is discovery field
export function isDiscoveryField(field: EnrichmentField): boolean {
  return /company.*name|website|description/i.test(field.name);
}

// Check if value is high confidence
export function isHighConfidence(result: EnrichmentResult): boolean {
  return result.confidence >= 0.8;
}
```

### Type Converters

```typescript
// Convert Zod schema to JSON schema for LLMs
export function zodToJsonSchema(schema: z.ZodType): object {
  return zodToJsonSchema(schema);
}

// Convert CSV row to typed object
export function parseCSVRow(
  row: string[],
  headers: string[]
): Record<string, string> {
  return headers.reduce((acc, header, i) => {
    acc[header] = row[i] || '';
    return acc;
  }, {} as Record<string, string>);
}
```

---

## Error Models

### Enrichment Error

```typescript
interface EnrichmentError {
  code: string;
  message: string;
  field?: string;
  rowIndex?: number;
  details?: unknown;
}
```

**Error Codes**:
- `MISSING_API_KEY`: API key not configured
- `INVALID_EMAIL`: Email format invalid
- `PERSONAL_EMAIL`: Email from personal provider (skipped)
- `NO_RESULTS_FOUND`: No data found for field
- `API_RATE_LIMIT`: External API rate limit exceeded
- `EXTRACTION_FAILED`: LLM extraction failed
- `NETWORK_ERROR`: Network request failed
- `TIMEOUT`: Request timeout

**Example**:
```json
{
  "code": "NO_RESULTS_FOUND",
  "message": "Could not find industry information",
  "field": "industry",
  "rowIndex": 5,
  "details": {
    "queriesAttempted": 3,
    "sourcesSearched": ["crunchbase.com", "linkedin.com"]
  }
}
```

---

## Configuration Models

### Fire Enrich Config

```typescript
interface FireEnrichConfig {
  CSV_LIMITS: {
    MAX_ROWS: number;
    MAX_COLUMNS: number;
  };
  PROCESSING: {
    DELAY_BETWEEN_ROWS_MS: number;
    MAX_RETRIES: number;
  };
  REQUEST_LIMITS: {
    MAX_BODY_SIZE_MB: number;
    MAX_FIELDS_PER_ENRICHMENT: number;
  };
  FEATURES: {
    IS_UNLIMITED: boolean;
  };
}
```

### Enrichment Config

```typescript
interface EnrichmentConfig {
  CONCURRENT_ROWS: number;
  BATCH_DELAY_MS: number;
}
```

---

## Data Flow Examples

### Complete Enrichment Flow

```
1. Input CSV Row
{
  "email": "erez@wiz.io",
  "name": "Erez Yalon"
}

2. Email Context Extraction
{
  "email": "erez@wiz.io",
  "domain": "wiz.io",
  "companyDomain": "wiz.io",
  "companyNameGuess": "Wiz",
  "isPersonalEmail": false
}

3. Field Categorization
{
  "discovery": ["companyName", "website"],
  "profile": ["industry", "headquarters"],
  "funding": ["fundingStage", "totalRaised"]
}

4. Discovery Agent Result
{
  "fields": {
    "companyName": "Wiz",
    "website": "https://www.wiz.io"
  },
  "confidence": {
    "companyName": 0.98,
    "website": 0.99
  },
  "sources": {
    "companyName": ["https://wiz.io/about"],
    "website": ["https://wiz.io"]
  }
}

5. Final Row Enrichment Result
{
  "rowIndex": 0,
  "originalData": {
    "email": "erez@wiz.io",
    "name": "Erez Yalon"
  },
  "enrichments": {
    "companyName": {
      "field": "companyName",
      "value": "Wiz",
      "confidence": 0.98,
      "source": "https://wiz.io/about"
    },
    "industry": {
      "field": "industry",
      "value": "Cybersecurity",
      "confidence": 0.95,
      "source": "https://wiz.io"
    },
    "fundingStage": {
      "field": "fundingStage",
      "value": "Series D",
      "confidence": 0.92,
      "source": "https://techcrunch.com/wiz-funding"
    }
  },
  "status": "completed"
}
```
