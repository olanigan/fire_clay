# Fire Enrich - API Specification

## API Overview

Fire Enrich provides a RESTful API built on Next.js API Routes with Server-Sent Events (SSE) for real-time streaming.

**Base URL**: `http://localhost:3000/api` (development)

## Authentication

### API Key Methods

Fire Enrich supports two methods for providing API keys:

#### 1. Environment Variables (Recommended)
```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key
OPENAI_API_KEY=your_openai_api_key
```

#### 2. Custom HTTP Headers
```http
X-Firecrawl-API-Key: your_firecrawl_api_key
X-OpenAI-API-Key: your_openai_api_key
```

## Endpoints

### 1. Enrich Rows

Enriches CSV rows with AI-powered data extraction.

#### Request

**Endpoint**: `POST /api/enrich`

**Content-Type**: `application/json`

**Request Body**:
```typescript
interface EnrichmentRequest {
  rows: Record<string, string>[];      // Array of CSV rows as objects
  fields: EnrichmentField[];            // Fields to enrich
  emailColumn: string;                  // Name of the email column
  nameColumn?: string;                  // Optional name column
}

interface EnrichmentField {
  name: string;          // Internal field name (e.g., "companyName")
  displayName: string;   // Display name (e.g., "Company Name")
  description: string;   // Field description
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;    // Default: false
}
```

**Example Request**:
```json
{
  "rows": [
    { "email": "john@acme.com", "name": "John Doe" },
    { "email": "jane@techcorp.io", "name": "Jane Smith" }
  ],
  "fields": [
    {
      "name": "companyName",
      "displayName": "Company Name",
      "description": "Official company name",
      "type": "string"
    },
    {
      "name": "industry",
      "displayName": "Industry",
      "description": "Primary industry or sector",
      "type": "string"
    },
    {
      "name": "employeeCount",
      "displayName": "Employee Count",
      "description": "Approximate number of employees",
      "type": "string"
    }
  ],
  "emailColumn": "email",
  "nameColumn": "name"
}
```

#### Response

**Content-Type**: `text/event-stream`

**Response Format**: Server-Sent Events (SSE)

**Event Types**:

##### 1. Session Event
```typescript
{
  type: 'session',
  sessionId: string  // Unique session identifier
}
```

##### 2. Pending Event
```typescript
{
  type: 'pending',
  rowIndex: number,
  totalRows: number
}
```

##### 3. Processing Event
```typescript
{
  type: 'processing',
  rowIndex: number,
  totalRows: number
}
```

##### 4. Agent Progress Event
```typescript
{
  type: 'agent_progress',
  rowIndex: number,
  message: string,
  messageType: 'info' | 'success' | 'warning' | 'agent',
  sourceUrl?: string  // Optional URL for favicon display
}
```

##### 5. Result Event
```typescript
{
  type: 'result',
  result: RowEnrichmentResult
}

interface RowEnrichmentResult {
  rowIndex: number;
  originalData: Record<string, string>;
  enrichments: Record<string, EnrichmentResult>;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  error?: string;
}

interface EnrichmentResult {
  field: string;
  value: string | number | boolean | string[] | null;
  confidence: number;  // 0-1 confidence score
  source?: string;     // Primary source URL
  sourceContext?: Array<{
    url: string;
    snippet: string;
  }>;
}
```

##### 6. Complete Event
```typescript
{
  type: 'complete'
}
```

##### 7. Error Event
```typescript
{
  type: 'error',
  error: string
}
```

##### 8. Cancelled Event
```typescript
{
  type: 'cancelled'
}
```

**Example SSE Stream**:
```
data: {"type":"session","sessionId":"1234567890-abc123"}

data: {"type":"pending","rowIndex":0,"totalRows":2}

data: {"type":"pending","rowIndex":1,"totalRows":2}

data: {"type":"processing","rowIndex":0,"totalRows":2}

data: {"type":"agent_progress","rowIndex":0,"message":"Discovery Agent: Identifying company from acme.com","messageType":"agent"}

data: {"type":"agent_progress","rowIndex":0,"message":"Target fields: companyName, industry","messageType":"info"}

data: {"type":"agent_progress","rowIndex":0,"message":"Discovery complete: Found 2 fields","messageType":"success"}

data: {"type":"result","result":{"rowIndex":0,"originalData":{"email":"john@acme.com","name":"John Doe"},"enrichments":{"companyName":{"field":"companyName","value":"ACME Corporation","confidence":0.95,"source":"https://acme.com/about"},"industry":{"field":"industry","value":"Software","confidence":0.87,"source":"https://acme.com"}},"status":"completed"}}

data: {"type":"complete"}
```

#### Error Responses

**400 Bad Request**:
```json
{
  "error": "No rows provided"
}
```

```json
{
  "error": "Please provide 1-10 fields to enrich"
}
```

```json
{
  "error": "Email column is required"
}
```

**413 Payload Too Large**:
```json
{
  "error": "Request body too large"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Server configuration error: Missing API keys"
}
```

```json
{
  "error": "Failed to start enrichment",
  "details": "Error message details",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

---

### 2. Cancel Enrichment

Cancels an active enrichment session.

#### Request

**Endpoint**: `DELETE /api/enrich?sessionId={sessionId}`

**Method**: DELETE

**Query Parameters**:
- `sessionId` (required): Session identifier from the session event

**Example**:
```
DELETE /api/enrich?sessionId=1234567890-abc123
```

#### Response

**Success (200)**:
```json
{
  "success": true
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "error": "Session ID required"
}
```

**404 Not Found**:
```json
{
  "error": "Session not found"
}
```

---

### 3. Generate Fields

Generates structured field definitions from natural language descriptions.

#### Request

**Endpoint**: `POST /api/generate-fields`

**Content-Type**: `application/json`

**Request Body**:
```typescript
interface GenerateFieldsRequest {
  descriptions: string[];  // Array of natural language field descriptions
}
```

**Example Request**:
```json
{
  "descriptions": [
    "Find the CEO's name and LinkedIn profile",
    "Get the company's main product",
    "What is their latest funding round?"
  ]
}
```

#### Response

**Success (200)**:
```typescript
interface GenerateFieldsResponse {
  fields: EnrichmentField[];
}
```

**Example Response**:
```json
{
  "fields": [
    {
      "name": "ceoName",
      "displayName": "CEO Name",
      "description": "Name of the company's Chief Executive Officer",
      "type": "string"
    },
    {
      "name": "ceoLinkedIn",
      "displayName": "CEO LinkedIn",
      "description": "LinkedIn profile URL of the CEO",
      "type": "string"
    },
    {
      "name": "mainProduct",
      "displayName": "Main Product",
      "description": "Primary product or service offering",
      "type": "string"
    },
    {
      "name": "latestFundingRound",
      "displayName": "Latest Funding Round",
      "description": "Most recent funding round details",
      "type": "string"
    }
  ]
}
```

**Error Response (500)**:
```json
{
  "error": "Failed to generate fields"
}
```

---

### 4. Check Environment

Checks if API keys are configured.

#### Request

**Endpoint**: `GET /api/check-env`

**Method**: GET

#### Response

**Success (200)**:
```typescript
interface CheckEnvResponse {
  firecrawl: boolean;  // true if Firecrawl API key is configured
  openai: boolean;     // true if OpenAI API key is configured
}
```

**Example Response**:
```json
{
  "firecrawl": true,
  "openai": true
}
```

---

## Rate Limits

### Request Limits
- **Max Request Body Size**: 5MB (public), 50MB (self-hosted)
- **Max Fields per Enrichment**: 10 (public), 50 (self-hosted)
- **Max CSV Rows**: 15 (public), unlimited (self-hosted)
- **Max CSV Columns**: 5 (public), unlimited (self-hosted)

### Processing Limits
- **Concurrent Rows**: 10 (configurable)
- **Batch Delay**: 1000ms between batches
- **Retry Attempts**: 3 per row

### External Service Limits
- **Firecrawl**: Depends on your plan
- **OpenAI**: Based on API key tier
- **Gemini**: Based on API quota

---

## Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Missing or invalid API keys |
| 404 | Not Found | Session not found |
| 413 | Payload Too Large | Request body exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server configuration, API errors |
| 503 | Service Unavailable | External service down |

---

## Best Practices

### 1. Handle SSE Connections
```typescript
const eventSource = new EventSource('/api/enrich', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'session':
      console.log('Session ID:', data.sessionId);
      break;
    case 'result':
      handleResult(data.result);
      break;
    case 'complete':
      eventSource.close();
      break;
    case 'error':
      console.error('Error:', data.error);
      eventSource.close();
      break;
  }
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();
};
```

### 2. Cancel Long-Running Jobs
```typescript
const sessionId = '...'; // From session event

fetch(`/api/enrich?sessionId=${sessionId}`, {
  method: 'DELETE',
})
  .then(response => response.json())
  .then(data => console.log('Cancelled:', data.success));
```

### 3. Batch Field Requests
Group related fields together to optimize agent execution:
```typescript
// Good: Related fields processed together
fields: [
  { name: 'companyName', ... },
  { name: 'industry', ... },
  { name: 'headquarters', ... },
]

// Avoid: Single field per request
// This triggers multiple API calls
```

### 4. Handle Confidence Scores
```typescript
result.enrichments.forEach(enrichment => {
  if (enrichment.confidence >= 0.8) {
    // High confidence - use directly
  } else if (enrichment.confidence >= 0.5) {
    // Medium confidence - flag for review
  } else {
    // Low confidence - manual verification needed
  }
});
```

### 5. Leverage Source Context
```typescript
enrichment.sourceContext?.forEach(context => {
  console.log(`Found in: ${context.url}`);
  console.log(`Snippet: ${context.snippet}`);
});
```

---

## Webhooks (Future)

Planned for future releases:

```typescript
// POST /api/enrich with webhook
{
  "rows": [...],
  "fields": [...],
  "emailColumn": "email",
  "webhook": {
    "url": "https://your-domain.com/webhook",
    "events": ["complete", "error"]
  }
}
```

---

## GraphQL API (Future)

Planned GraphQL API for more flexible queries:

```graphql
mutation EnrichRow($email: String!, $fields: [String!]!) {
  enrichRow(email: $email, fields: $fields) {
    companyName
    industry
    fundingStage
    confidence
    sources
  }
}
```

---

## SDK Support (Future)

Planned official SDKs:
- **JavaScript/TypeScript**: `@fire-enrich/sdk`
- **Python**: `fire-enrich-py`
- **Go**: `fire-enrich-go`
- **Ruby**: `fire-enrich-ruby`
