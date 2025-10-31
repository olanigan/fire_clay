# Fire Enrich - System Architecture

## Architecture Overview

Fire Enrich follows a modern, microservices-inspired architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend Layer                         │
│  Next.js 15 App Router + React 19 + TypeScript + Tailwind    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ HTTP/SSE
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         API Layer                             │
│           Next.js API Routes (Server-Side)                    │
│  /api/enrich | /api/generate-fields | /api/check-env        │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ Service Calls
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │        Agent Orchestrator (Coordinator)             │    │
│  │  - Field categorization                             │    │
│  │  - Agent selection & sequencing                     │    │
│  │  - Context management                               │    │
│  │  - Progress tracking                                │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │                                           │
│                   │ Delegates to Specialized Agents          │
│                   ▼                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Multi-Agent System                         │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │ Discovery   │  │   Company    │  │  Metrics   │ │   │
│  │  │   Agent     │  │   Profile    │  │   Agent    │ │   │
│  │  │             │  │   Agent      │  │            │ │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘ │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │  Funding    │  │  Tech Stack  │  │  General   │ │   │
│  │  │   Agent     │  │    Agent     │  │   Agent    │ │   │
│  │  │             │  │              │  │            │ │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘ │   │
│  │                                                       │   │
│  └───────────────────────┬───────────────────────────────┘   │
│                          │                                   │
│                          │ Uses Tools & Services             │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Tools & Services Layer                  │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │
│  │  │  Email       │  │   Smart      │  │  Website  │ │   │
│  │  │  Parser      │  │   Search     │  │  Scraper  │ │   │
│  │  │  Tool        │  │   Tool       │  │   Tool    │ │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘ │   │
│  │                                                       │   │
│  └───────────────────────┬───────────────────────────────┘   │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           │ External API Calls
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    External Services Layer                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Firecrawl   │  │   OpenAI     │  │    Google    │       │
│  │   Service    │  │    GPT-4     │  │    Gemini    │       │
│  │  (Scraping)  │  │  (Extract)   │  │  (Extract)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Core Architectural Principles

### 1. **Separation of Concerns**
- **Frontend**: UI/UX, user interactions, real-time updates
- **API Layer**: Request validation, streaming, session management
- **Business Logic**: Orchestration, agent coordination, data processing
- **Tools Layer**: Reusable utilities for parsing, searching, scraping
- **External Services**: Third-party API integrations

### 2. **Agent-Based Architecture**
Each agent is a specialized module focused on a specific domain:
- **Single Responsibility**: One agent per data category
- **Sequential Execution**: Agents build context progressively
- **Type-Safe Schemas**: Zod schemas ensure data integrity
- **Shared Context**: Agents pass discovered data forward
- **Parallel Searches**: Each agent runs multiple searches concurrently

### 3. **Progressive Enhancement**
- Discovery Agent establishes foundation (company identity)
- Profile Agent enriches with industry/business model
- Metrics Agent adds quantitative data (employees, revenue)
- Funding Agent discovers financial information
- Tech Stack Agent analyzes technical infrastructure
- General Agent handles custom/miscellaneous fields

### 4. **Real-Time Communication**
- **Server-Sent Events (SSE)**: Stream enrichment progress to frontend
- **Event Types**: pending, processing, agent_progress, result, complete
- **Rolling Concurrency**: Process multiple rows simultaneously
- **Graceful Cancellation**: Support for aborting long-running jobs

### 5. **Type Safety**
- **TypeScript Throughout**: Full type coverage
- **Zod Schemas**: Runtime validation and type inference
- **Strict Contracts**: Well-defined interfaces between layers

## Component Breakdown

### Frontend Components
**Location**: `/components/`

#### Shared Components
- **Header**: Navigation, branding, GitHub links
- **UI Components**: Radix UI primitives (buttons, dialogs, forms)
- **Layout Components**: Page wrappers, containers
- **Effects**: Visual effects (flame animations, gradients)

#### Fire Enrich Specific
- **CSV Upload**: Drag-and-drop interface (react-dropzone)
- **Field Selector**: Choose enrichment fields
- **Results Table**: Real-time data display with animations
- **Progress Indicators**: Row-by-row status tracking
- **Export Controls**: CSV/JSON download

### API Routes
**Location**: `/app/api/`

#### `/api/enrich` (POST)
- **Purpose**: Main enrichment endpoint
- **Method**: POST with SSE response
- **Input**: CSV rows, fields, email column
- **Output**: Streaming enrichment results
- **Features**:
  - Rolling concurrency (10 rows default)
  - Skip list validation
  - Session management
  - Cancellation support (DELETE)

#### `/api/generate-fields` (POST)
- **Purpose**: AI-powered field generation
- **Input**: Natural language field description
- **Output**: Structured field definition
- **AI Model**: GPT-4 for interpretation

#### `/api/check-env` (GET)
- **Purpose**: Validate API key configuration
- **Output**: API key availability status

### Business Logic Layer
**Location**: `/lib/`

#### Agent Architecture (`/lib/agent-architecture/`)

**Core Components**:
- `orchestrator.ts`: Main coordinator for agent execution
- `core/agent-base.ts`: Base class for all agents
- `core/types.ts`: Shared type definitions

**Agents** (`/lib/agent-architecture/agents/`):
- `discovery-agent.ts`: Company identification
- `company-profile-agent.ts`: Industry, headquarters, type
- `metrics-agent.ts`: Employee count, revenue
- `funding-agent.ts`: Funding rounds, investors
- `tech-stack-agent.ts`: Technologies, frameworks
- `general-agent.ts`: Custom field handler

**Tools** (`/lib/agent-architecture/tools/`):
- `email-parser-tool.ts`: Extract company from email
- `smart-search-tool.ts`: Generate targeted search queries
- `website-scraper-tool.ts`: Fetch and parse web content

#### Services (`/lib/services/`)
- `firecrawl.ts`: Firecrawl API integration
- `openai.ts`: OpenAI GPT-4 integration
- `gemini.ts`: Google Gemini integration (in migration)
- `specialized-agents.ts`: Legacy agent implementations

#### Strategies (`/lib/strategies/`)
- `agent-enrichment-strategy.ts`: Main enrichment orchestration
- `enrichment-strategy.ts`: Base strategy interface
- `email-parser.ts`: Email domain extraction

#### Utilities (`/lib/utils/`)
- `email-detection.ts`: Detect email columns in CSV
- `field-utils.ts`: Field categorization and routing
- `skip-list.ts`: Personal email filtering
- `source-context.ts`: Source URL attribution

### Configuration
**Location**: `/lib/config/`

- `enrichment.ts`: Processing configuration
  - `CONCURRENT_ROWS`: Parallel processing limit (10)
  - `BATCH_DELAY_MS`: Rate limiting delay (1000ms)

**App Configuration**:
- `/app/fire-enrich/config.ts`: Feature flags, limits
  - Unlimited mode detection
  - CSV row/column limits
  - Max fields per enrichment

## Data Flow

### Enrichment Pipeline

```
1. CSV Upload
   └─> Parse with PapaParse
       └─> Detect email column
           └─> Preview data

2. Field Selection
   └─> Choose preset fields
       └─> Add custom fields
           └─> Validate configuration

3. Enrichment Request (SSE Stream)
   └─> POST /api/enrich
       └─> For each row:
           ├─> Check skip list
           ├─> Extract email context
           ├─> Categorize fields
           ├─> Select agents
           ├─> Sequential agent execution:
           │   ├─> Discovery Agent
           │   ├─> Company Profile Agent
           │   ├─> Metrics Agent
           │   ├─> Funding Agent
           │   ├─> Tech Stack Agent
           │   └─> General Agent
           └─> Stream results back

4. Real-time Updates
   └─> Frontend receives SSE events
       └─> Update UI with animations
           └─> Display confidence scores
               └─> Show source attributions

5. Export
   └─> Download CSV/JSON
       └─> Include all metadata
```

### Agent Execution Flow

```
EmailContext (email, domain, company guess)
    ↓
Field Categorization
    ├─> Discovery fields
    ├─> Profile fields
    ├─> Metrics fields
    ├─> Funding fields
    ├─> Tech Stack fields
    └─> Other fields
    ↓
Sequential Agent Execution
    ↓
Discovery Agent (Phase 1)
    ├─> Generate search queries
    ├─> Parallel Firecrawl searches
    ├─> Extract company name, website, description
    └─> Update context with discovered data
    ↓
Company Profile Agent (Phase 2)
    ├─> Use company name from Discovery
    ├─> Search for industry, headquarters
    ├─> Extract business model, year founded
    └─> Update context
    ↓
Metrics Agent (Phase 3)
    ├─> Use company + industry context
    ├─> Search for employee count, revenue
    └─> Update context
    ↓
Funding Agent (Phase 4)
    ├─> Use all previous context
    ├─> Search venture databases
    ├─> Extract funding stage, investors
    └─> Update context
    ↓
Tech Stack Agent (Phase 5)
    ├─> Analyze GitHub repos
    ├─> Parse HTML meta tags
    ├─> Extract technologies
    └─> Update context
    ↓
General Agent (Phase 6)
    ├─> Handle custom fields
    ├─> Use full context
    └─> Extract remaining data
    ↓
Final Synthesis (GPT-4/Gemini)
    ├─> Combine all agent results
    ├─> Resolve conflicts
    ├─> Calculate confidence scores
    └─> Return structured data with sources
```

## Scalability Considerations

### Current Implementation
- **Concurrency**: 10 rows processed in parallel
- **Rate Limiting**: 1 second delay between batches
- **Memory**: In-memory session management
- **Streaming**: SSE for real-time updates

### Production Enhancements
- **Caching**: Redis for search result caching
- **Queue System**: Bull/BullMQ for job processing
- **Session Storage**: Redis for distributed sessions
- **Rate Limiting**: Upstash Rate Limit integration
- **Monitoring**: Logging and performance metrics

## Security Architecture

### API Key Management
- **Environment Variables**: Primary method (production)
- **Browser Storage**: Secondary method (localStorage)
- **Header Injection**: Custom headers for API requests
- **Validation**: Check API key presence before processing

### Data Privacy
- **No Server Storage**: Processed data not persisted
- **Client-Side CSV**: Files processed in browser
- **HTTPS**: Secure transmission
- **Session Cleanup**: Automatic session deletion

### Rate Limiting
- **Firecrawl**: Respects API rate limits
- **OpenAI**: Token-based throttling
- **Concurrent Rows**: Configurable concurrency
- **Skip List**: Avoid processing personal emails

## Deployment Architecture

### Development
```
npm run dev
└─> Next.js Dev Server (Turbopack)
    ├─> Hot Module Replacement
    ├─> TypeScript Compilation
    └─> API Routes on same server
```

### Production (Vercel)
```
Vercel Platform
├─> Edge Network (CDN)
├─> Serverless Functions (API Routes)
├─> Static Assets
└─> Environment Variables
```

### Self-Hosted
```
Docker Container (optional)
├─> Node.js Server
├─> Next.js Production Build
├─> Environment Configuration
└─> Reverse Proxy (Nginx/Caddy)
```

## Extension Points

### Adding New Agents
1. Create agent class extending `AgentBase`
2. Define Zod schema for output
3. Implement `canHandle()` and `execute()` methods
4. Add field categorization logic
5. Register in orchestrator

### Adding New Data Sources
1. Create service class (e.g., `LinkedInService`)
2. Implement search and scrape methods
3. Integrate into relevant agents
4. Update result synthesis logic

### Adding New LLM Providers
1. Create service class (e.g., `AnthropicService`)
2. Implement schema generation and extraction methods
3. Add provider selection logic
4. Update configuration

## Technology Decisions

### Why Next.js 15?
- **App Router**: Modern routing with RSC support
- **API Routes**: Integrated backend
- **Streaming**: Native SSE support
- **TypeScript**: First-class support
- **Deployment**: Vercel optimization

### Why Multi-Agent Architecture?
- **Specialization**: Better accuracy per domain
- **Context Building**: Progressive enhancement
- **Extensibility**: Easy to add agents
- **Maintainability**: Clear separation of concerns

### Why Zod?
- **Runtime Validation**: Catch errors early
- **Type Inference**: TypeScript integration
- **Schema Definition**: LLM structured outputs
- **Documentation**: Self-documenting types

### Why Firecrawl?
- **Reliability**: Handles dynamic content
- **Search Integration**: Built-in search capability
- **Clean Output**: Structured markdown/JSON
- **Rate Limit Handling**: Built-in throttling
