# Fire Enrich - Agent System Specification

## Agent System Overview

The Fire Enrich agent system is a sophisticated multi-agent architecture where specialized agents work sequentially to enrich data. Each agent focuses on a specific domain, building context progressively for optimal accuracy.

## Agent Architecture

### Base Agent Interface

All agents extend the `AgentBase` abstract class:

```typescript
abstract class AgentBase {
  protected firecrawl: FirecrawlService;
  protected openai: OpenAIService;

  constructor(firecrawlApiKey: string, openaiApiKey: string);

  // Determines if this agent can handle specific fields
  abstract canHandle(fields: EnrichmentField[]): boolean;

  // Executes the agent with given context
  abstract execute(
    context: EmailContext,
    fields: EnrichmentField[],
    handoff: EnrichmentHandoff,
    onProgress?: ProgressCallback
  ): Promise<AgentResult>;

  // Returns agent metadata
  abstract getMetadata(): AgentMetadata;
}
```

### Agent Result Schema

```typescript
interface AgentResult {
  fields: Record<string, any>;           // Extracted field values
  confidence: Record<string, number>;    // Confidence scores (0-1)
  sources: Record<string, string[]>;     // Source URLs per field
  errors?: Record<string, string>;       // Optional error messages
}
```

### Agent Metadata

```typescript
interface AgentMetadata {
  name: string;          // Agent identifier
  displayName: string;   // Human-readable name
  description: string;   // Agent purpose
  phase: number;         // Execution order (1-6)
  fieldCategories: string[];  // Field types handled
}
```

---

## Agent Catalog

### 1. Discovery Agent

**Phase**: 1 (Foundation)
**Purpose**: Establishes company identity and digital presence
**File**: `lib/agent-architecture/agents/discovery-agent.ts`

#### Handles
- Company name
- Company website
- Company description
- Domain information
- Business type

#### Field Matching Patterns
```typescript
canHandle(fields) {
  return fields.some(f =>
    f.name.match(/(company.*name|website|description|domain)/i)
  );
}
```

#### Output Schema
```typescript
const DiscoveryResult = z.object({
  companyName: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  companyDomain: z.string().optional(),
  businessType: z.string().optional(),
});
```

#### Search Strategy
1. Generate 3 parallel search queries:
   - "{companyName} company official website"
   - "{domain} company information"
   - "What is {companyName}"

2. Execute concurrent Firecrawl searches
3. Aggregate and deduplicate results
4. Extract structured data using GPT-4/Gemini
5. Validate URLs and company name

#### Example Execution
```
Input: email = "erez@wiz.io"
  ↓
Email Context:
  - domain: "wiz.io"
  - companyNameGuess: "Wiz"
  ↓
Search Queries:
  1. "Wiz company official website"
  2. "wiz.io company information"
  3. "What is Wiz"
  ↓
Firecrawl Results: 15 URLs scraped
  ↓
GPT-4 Extraction:
  - companyName: "Wiz"
  - website: "https://www.wiz.io"
  - description: "Cloud security platform"
  - businessType: "B2B SaaS"
  ↓
Output:
  - fields: { companyName: "Wiz", ... }
  - confidence: { companyName: 0.95, ... }
  - sources: { companyName: ["https://wiz.io/about"], ... }
```

---

### 2. Company Profile Agent

**Phase**: 2 (Business Context)
**Purpose**: Enriches with industry classification and business model
**File**: `lib/agent-architecture/agents/company-profile-agent.ts`

#### Handles
- Industry
- Sub-industry
- Headquarters location
- Year founded
- Company type (public/private/nonprofit)
- Business model

#### Field Matching Patterns
```typescript
canHandle(fields) {
  return fields.some(f =>
    f.name.match(/(industry|headquarter|founded|company.*type|business.*model)/i)
  );
}
```

#### Output Schema
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

#### Search Strategy
1. Uses company name from Discovery Agent
2. Generates industry-specific queries:
   - "{companyName} industry classification"
   - "{companyName} headquarters location"
   - "{companyName} about company profile"

3. Searches business directories (Crunchbase, LinkedIn)
4. Extracts structured business data
5. Validates industry taxonomy

#### Context Dependencies
- **Requires**: Company name (from Discovery Agent)
- **Enhances**: Subsequent agents with industry context

---

### 3. Metrics Agent

**Phase**: 3 (Quantitative Data)
**Purpose**: Gathers measurable company metrics
**File**: `lib/agent-architecture/agents/metrics-agent.ts`

#### Handles
- Employee count
- Revenue
- Valuation
- Growth rate
- Customer count

#### Field Matching Patterns
```typescript
canHandle(fields) {
  return fields.some(f =>
    f.name.match(/(employee|revenue|valuation|growth|customer.*count)/i)
  );
}
```

#### Output Schema
```typescript
const MetricsResult = z.object({
  employeeCount: z.string().optional(),
  revenue: z.string().optional(),
  valuation: z.string().optional(),
  growthRate: z.string().optional(),
  customerCount: z.string().optional(),
});
```

#### Search Strategy
1. Uses company name + industry context
2. Searches financial databases:
   - "{companyName} number of employees"
   - "{companyName} revenue {currentYear}"
   - "{companyName} company size"

3. Validates numerical data
4. Normalizes units (K, M, B)
5. Cross-references multiple sources

#### Context Dependencies
- **Requires**: Company name, industry
- **Benefits**: Industry context helps identify relevant metrics

---

### 4. Funding Agent

**Phase**: 4 (Financial Intelligence)
**Purpose**: Discovers funding history and investors
**File**: `lib/agent-architecture/agents/funding-agent.ts`

#### Handles
- Funding stage (Seed, Series A/B/C/D, etc.)
- Total raised
- Last round amount
- Last round date
- Investors
- Valuation

#### Field Matching Patterns
```typescript
canHandle(fields) {
  return fields.some(f =>
    f.name.match(/(fund|invest|series|raised|valuation)/i)
  );
}
```

#### Output Schema
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

#### Search Strategy
1. Uses full context (company, industry, metrics)
2. Searches venture databases:
   - "{companyName} funding rounds"
   - "{companyName} investors crunchbase"
   - "{companyName} series {A/B/C} techcrunch"

3. Targets financial news sites (TechCrunch, VentureBeat)
4. Extracts funding timeline
5. Identifies key investors

#### Context Dependencies
- **Requires**: Company name
- **Benefits**: Industry helps identify relevant investor databases

---

### 5. Tech Stack Agent

**Phase**: 5 (Technical Analysis)
**Purpose**: Analyzes technical infrastructure and tools
**File**: `lib/agent-architecture/agents/tech-stack-agent.ts`

#### Handles
- Programming languages
- Frameworks
- Infrastructure
- Tools and services
- Tech stack

#### Field Matching Patterns
```typescript
canHandle(fields) {
  return fields.some(f =>
    f.name.match(/(tech.*stack|technolog|framework|infrastructure|programming)/i)
  );
}
```

#### Output Schema
```typescript
const TechStackResult = z.object({
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  infrastructure: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  techStack: z.string().optional(),
});
```

#### Search Strategy
1. Multiple specialized searches:
   - GitHub repository analysis: "github.com/{company}"
   - Tech job postings: "{companyName} software engineer jobs"
   - Direct HTML meta tag analysis
   - Developer documentation

2. Parses:
   - GitHub repo metadata
   - HTML `<meta>` tags
   - Job posting requirements
   - Engineering blog posts

3. Identifies tech patterns and stacks

#### Advanced Techniques
- **HTML Analysis**: Direct inspection of company website source
- **GitHub Mining**: Repository language statistics
- **Job Listings**: Required skills in engineering roles
- **BuiltWith Integration**: (Future) Technology profiler

---

### 6. General Purpose Agent

**Phase**: 6 (Custom Fields)
**Purpose**: Handles any field not covered by specialized agents
**File**: `lib/agent-architecture/agents/general-agent.ts`

#### Handles
- CEO/Leadership
- Competitors
- Awards
- News mentions
- Any custom user-defined field

#### Field Matching Patterns
```typescript
canHandle(fields) {
  return true; // Fallback for all unmatched fields
}
```

#### Output Schema
```typescript
// Uses flexible EnrichmentResult schema
const GeneralResult = z.record(z.any());
```

#### Search Strategy
1. Uses full context from all previous agents
2. Generates dynamic queries based on field description:
   - For "CEO": "{companyName} CEO founder"
   - For "competitors": "{companyName} competitors alternative"
   - For custom fields: Uses field description as query

3. Leverages accumulated context for targeted searches
4. Flexible extraction based on field type

#### Context Dependencies
- **Requires**: All previous agent data
- **Benefits**: Maximum context for accurate extraction

---

## Agent Orchestration

### Sequential Execution Model

```
Discovery Agent (Phase 1)
    ↓ (provides company name, website)
Profile Agent (Phase 2)
    ↓ (provides industry, business model)
Metrics Agent (Phase 3)
    ↓ (provides size, revenue)
Funding Agent (Phase 4)
    ↓ (provides funding stage, investors)
Tech Stack Agent (Phase 5)
    ↓ (provides technologies)
General Agent (Phase 6)
    ↓ (handles custom fields)
Final Synthesis
```

### Orchestrator Logic

**File**: `lib/agent-architecture/orchestrator.ts`

```typescript
class AgentOrchestrator {
  async enrichRow(
    row: Record<string, string>,
    fields: EnrichmentField[],
    emailColumn: string,
    onProgress?: ProgressCallback
  ): Promise<RowEnrichmentResult> {

    // 1. Extract email context
    const emailContext = this.extractEmailContext(email);

    // 2. Categorize fields by agent
    const categories = this.categorizeFields(fields);

    // 3. Initialize context
    const context = {
      email,
      emailContext,
      discoveredData: {},
    };

    // 4. Execute agents sequentially
    const enrichments = {};

    if (categories.discovery.length > 0) {
      const results = await this.runDiscoveryAgent(context, categories.discovery);
      Object.assign(enrichments, results);
      Object.assign(context.discoveredData, results);
    }

    if (categories.profile.length > 0) {
      const results = await this.runProfileAgent(context, categories.profile);
      Object.assign(enrichments, results);
      Object.assign(context.discoveredData, results);
    }

    // ... repeat for all agents

    // 5. Return consolidated results
    return {
      rowIndex: 0,
      originalData: row,
      enrichments,
      status: 'completed',
    };
  }
}
```

### Field Categorization

```typescript
categorizeFields(fields: EnrichmentField[]) {
  return {
    discovery: fields.filter(f => isDiscoveryField(f)),
    profile: fields.filter(f => isProfileField(f)),
    metrics: fields.filter(f => isMetricsField(f)),
    funding: fields.filter(f => isFundingField(f)),
    techStack: fields.filter(f => isTechStackField(f)),
    other: fields.filter(f => !matchedByAnyAgent(f)),
  };
}
```

### Context Handoff

Each agent receives:
```typescript
interface EnrichmentHandoff {
  email: string;
  emailContext: EmailContext;
  requestedFields: EnrichmentField[];
  discoveredData?: Record<string, any>;  // Data from previous agents
  currentAgent?: string;
  processedFields?: string[];
}
```

---

## Agent Tools

### Email Parser Tool

**File**: `lib/agent-architecture/tools/email-parser-tool.ts`

**Purpose**: Extracts company information from email addresses

```typescript
function parseEmail(email: string): EmailContext {
  const domain = email.split('@')[1];
  const isPersonal = PERSONAL_DOMAINS.includes(domain);

  return {
    email,
    domain,
    companyDomain: isPersonal ? undefined : domain,
    personalName: extractName(email),
    companyNameGuess: guessCompanyName(domain),
    isPersonalEmail: isPersonal,
  };
}
```

**Features**:
- Extracts domain
- Identifies personal email providers (Gmail, Yahoo, etc.)
- Guesses company name from domain
- Handles edge cases (subdomains, country codes)

---

### Smart Search Tool

**File**: `lib/agent-architecture/tools/smart-search-tool.ts`

**Purpose**: Generates optimized search queries

```typescript
class SmartSearchTool {
  generateQueries(
    companyName: string,
    fieldType: string,
    context?: Record<string, any>
  ): string[] {
    // Generate 3-5 targeted queries based on field type
    // Example for "funding":
    return [
      `${companyName} funding rounds`,
      `${companyName} investors crunchbase`,
      `${companyName} series A B C techcrunch`,
    ];
  }

  async executeSearches(
    queries: string[],
    maxResults: number = 5
  ): Promise<SearchResult[]> {
    // Execute parallel Firecrawl searches
    // Deduplicate URLs
    // Return aggregated results
  }
}
```

**Features**:
- Field-aware query generation
- Context-enhanced queries
- Parallel execution
- Result deduplication
- Source diversity

---

### Website Scraper Tool

**File**: `lib/agent-architecture/tools/website-scraper-tool.ts`

**Purpose**: Fetches and parses website content

```typescript
class WebsiteScraperTool {
  async scrapeUrl(url: string): Promise<ScrapedContent> {
    // Uses Firecrawl to fetch content
    // Returns structured markdown + metadata
  }

  async scrapeMultiple(urls: string[]): Promise<ScrapedContent[]> {
    // Parallel scraping with rate limiting
  }

  async analyzeHtml(url: string): Promise<HtmlMetadata> {
    // Extract meta tags, tech stack hints
  }
}
```

**Features**:
- JavaScript rendering
- Meta tag extraction
- Content cleaning
- Rate limit handling
- Error recovery

---

## LLM Integration

### Structured Output with Zod

All agents use Zod schemas for type-safe LLM outputs:

```typescript
const schema = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const result = await this.openai.extractStructuredData(
  searchResults,
  schema,
  systemPrompt
);
```

### Provider Abstraction

Supports multiple LLM providers:

```typescript
interface LLMProvider {
  generateSchema(zodSchema: z.ZodType): any;
  extractStructuredData(
    content: string,
    schema: any,
    systemPrompt: string
  ): Promise<any>;
}

// Implementations:
class OpenAIService implements LLMProvider { ... }
class GeminiService implements LLMProvider { ... }
```

### Model Selection

**Current**:
- **OpenAI GPT-4**: Primary extraction model
- **Google Gemini**: In migration (Phase 1 complete)

**Future**:
- Anthropic Claude
- Llama models (via Ollama)
- Custom fine-tuned models

---

## Agent Extension Guide

### Creating a New Agent

1. **Create Agent File**:
```typescript
// lib/agent-architecture/agents/social-media-agent.ts
import { AgentBase } from '../core/agent-base';
import { z } from 'zod';

const SocialMediaResult = z.object({
  twitterHandle: z.string().optional(),
  linkedInUrl: z.string().url().optional(),
  facebookPage: z.string().optional(),
});

export class SocialMediaAgent extends AgentBase {
  canHandle(fields: EnrichmentField[]): boolean {
    return fields.some(f =>
      f.name.match(/(twitter|linkedin|facebook|social)/i)
    );
  }

  async execute(
    context: EmailContext,
    fields: EnrichmentField[],
    handoff: EnrichmentHandoff
  ): Promise<AgentResult> {
    // Implementation
  }

  getMetadata(): AgentMetadata {
    return {
      name: 'social-media-agent',
      displayName: 'Social Media Agent',
      description: 'Finds company social media profiles',
      phase: 7,
      fieldCategories: ['social', 'twitter', 'linkedin'],
    };
  }
}
```

2. **Add to Orchestrator**:
```typescript
// lib/agent-architecture/orchestrator.ts
import { SocialMediaAgent } from './agents/social-media-agent';

// In categorizeFields():
socialMedia: fields.filter(f => /social|twitter|linkedin/i.test(f.name))

// In enrichRow():
if (categories.socialMedia.length > 0) {
  const agent = new SocialMediaAgent(firecrawlKey, openaiKey);
  const results = await agent.execute(context, categories.socialMedia, handoff);
  Object.assign(enrichments, results.fields);
}
```

3. **Add Field Categorization**:
```typescript
// lib/utils/field-utils.ts
export function isSocialMediaField(field: EnrichmentField): boolean {
  return /social|twitter|linkedin|facebook/i.test(field.name);
}
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Future: Redis caching for search results
const cacheKey = `search:${hash(query)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### Parallel Searches
Each agent runs 3-5 searches in parallel:
```typescript
const queries = generateQueries(companyName, fieldType);
const results = await Promise.all(
  queries.map(q => firecrawl.search(q))
);
```

### Result Deduplication
```typescript
function deduplicateUrls(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}
```

---

## Testing Agents

### Unit Tests
```typescript
describe('DiscoveryAgent', () => {
  it('should identify company from email', async () => {
    const agent = new DiscoveryAgent(firecrawlKey, openaiKey);
    const context = parseEmail('john@acme.com');

    const result = await agent.execute(context, fields, handoff);

    expect(result.fields.companyName).toBe('ACME Corporation');
    expect(result.confidence.companyName).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests
```typescript
describe('AgentOrchestrator', () => {
  it('should execute agents sequentially', async () => {
    const orchestrator = new AgentOrchestrator(firecrawlKey, openaiKey);

    const result = await orchestrator.enrichRow(
      { email: 'test@company.com' },
      allFields,
      'email'
    );

    expect(result.status).toBe('completed');
    expect(Object.keys(result.enrichments).length).toBeGreaterThan(0);
  });
});
```

---

## Future Enhancements

1. **Agent Marketplace**: Community-contributed agents
2. **Custom Agent Builder**: No-code agent creation
3. **Agent Analytics**: Track agent performance and accuracy
4. **Multi-Agent Collaboration**: Agents that work in parallel
5. **Adaptive Routing**: ML-based agent selection
6. **Confidence Calibration**: Improve score accuracy
7. **Explainable AI**: Show agent reasoning process
