# Fire Enrich - Multi-Agent Architecture (ASCII Visualizations)

## 1. SYSTEM OVERVIEW - High Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FIRE ENRICH SYSTEM                                  │
│                     AI-Powered CSV Data Enrichment                          │
└─────────────────────────────────────────────────────────────────────────────┘

                                   USER
                                    │
                                    │ uploads CSV
                                    ↓
                    ┌──────────────────────────────┐
                    │     Next.js Frontend         │
                    │   (React Components)         │
                    └──────────────┬───────────────┘
                                   │
                                   │ HTTP + SSE
                                   ↓
                    ┌──────────────────────────────┐
                    │    API Route Handler         │
                    │  /app/api/enrich/route.ts    │
                    └──────────────┬───────────────┘
                                   │
                                   │ strategy selection
                                   ↓
                    ┌──────────────────────────────┐
                    │  AgentEnrichmentStrategy     │
                    │  (Main Orchestration Layer)  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼──────┐              ┌──────▼───────┐
            │  LLM Service │              │  Firecrawl   │
            │  (GPT/Gemini)│              │   Service    │
            └───────┬──────┘              └──────┬───────┘
                    │                            │
                    │                            │
                    └────────────┬───────────────┘
                                 │
                                 ↓
                  ┌──────────────────────────────┐
                  │    AGENT ORCHESTRATOR        │
                  │  (Multi-Agent Coordinator)   │
                  └──────────────┬───────────────┘
                                 │
        ┌────────────┬───────────┼───────────┬──────────┬──────────┐
        │            │           │           │          │          │
        ↓            ↓           ↓           ↓          ↓          ↓
   ┌────────┐  ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │Discovery│  │ Profile │ │Metrics │ │Funding │ │  Tech  │ │General │
   │ Agent   │  │  Agent  │ │ Agent  │ │ Agent  │ │ Stack  │ │ Agent  │
   │         │  │         │ │        │ │        │ │ Agent  │ │        │
   └────────┘  └─────────┘ └────────┘ └────────┘ └────────┘ └────────┘
        │            │           │           │          │          │
        └────────────┴───────────┴───────────┴──────────┴──────────┘
                                 │
                                 ↓
                    ┌──────────────────────────┐
                    │   ENRICHED DATA OUTPUT   │
                    │  (with confidence scores)│
                    └──────────────────────────┘
```

## 2. AGENT ORCHESTRATOR - The Brain

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        AGENT ORCHESTRATOR                                ║
║               Sequential Multi-Agent Coordination Engine                 ║
╚══════════════════════════════════════════════════════════════════════════╝

INPUT: CSV Row + Fields to Enrich + Email Column
   │
   ├──> john@acme.com
   ├──> Fields: [companyName, industry, employeeCount, fundingStage]
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Email Context Extraction                                       │
│                                                                          │
│   john@acme.com  ──>  parseEmail()  ──>  EmailContext                   │
│                                           │                              │
│                                           ├─> domain: "acme.com"         │
│                                           ├─> localPart: "john"          │
│                                           ├─> companyGuess: "Acme"       │
│                                           └─> isPersonal: false          │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Field Categorization (Smart Agent Assignment)                  │
│                                                                          │
│   Fields to Enrich:                    Assigned Agent:                  │
│   ┌─────────────────┐                 ┌──────────────────┐             │
│   │ companyName     │ ──────────────> │ Discovery Agent  │             │
│   │ website         │ ──────────────> │ Discovery Agent  │             │
│   └─────────────────┘                 └──────────────────┘             │
│                                                                          │
│   ┌─────────────────┐                 ┌──────────────────┐             │
│   │ industry        │ ──────────────> │ Profile Agent    │             │
│   │ headquarters    │ ──────────────> │ Profile Agent    │             │
│   │ yearFounded     │ ──────────────> │ Profile Agent    │             │
│   └─────────────────┘                 └──────────────────┘             │
│                                                                          │
│   ┌─────────────────┐                 ┌──────────────────┐             │
│   │ employeeCount   │ ──────────────> │ Metrics Agent    │             │
│   │ revenue         │ ──────────────> │ Metrics Agent    │             │
│   └─────────────────┘                 └──────────────────┘             │
│                                                                          │
│   ┌─────────────────┐                 ┌──────────────────┐             │
│   │ fundingStage    │ ──────────────> │ Funding Agent    │             │
│   │ totalFunding    │ ──────────────> │ Funding Agent    │             │
│   └─────────────────┘                 └──────────────────┘             │
│                                                                          │
│   ┌─────────────────┐                 ┌──────────────────┐             │
│   │ techStack       │ ──────────────> │ Tech Stack Agent │             │
│   └─────────────────┘                 └──────────────────┘             │
│                                                                          │
│   ┌─────────────────┐                 ┌──────────────────┐             │
│   │ customField     │ ──────────────> │ General Agent    │             │
│   └─────────────────┘                 └──────────────────┘             │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Sequential Agent Execution (Context Building Pipeline)         │
│                                                                          │
│   Execution Order: Discovery → Profile → Metrics → Funding → Tech → Gen │
│                                                                          │
│   Context Object (Shared State):                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ {                                                              │   │
│   │   email: "john@acme.com",                                      │   │
│   │   emailContext: { domain: "acme.com", ... },                   │   │
│   │   companyName: undefined,  // ← Discovery fills this           │   │
│   │   discoveredData: {}       // ← Agents append discoveries      │   │
│   │ }                                                              │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   Agent Pipeline:                                                        │
│                                                                          │
│   [1] Discovery Agent    ──>  Enrichments: { companyName, website }     │
│          │                     Context Updated: companyName="Acme Corp" │
│          │                                                               │
│          ↓                                                               │
│   [2] Profile Agent      ──>  Uses companyName from context            │
│          │                     Enrichments: { industry, headquarters }  │
│          │                     Context: companyName still available     │
│          ↓                                                               │
│   [3] Metrics Agent      ──>  Uses companyName + domain                │
│          │                     Enrichments: { employeeCount, revenue }  │
│          │                                                               │
│          ↓                                                               │
│   [4] Funding Agent      ──>  Uses all previous context                │
│          │                     Enrichments: { fundingStage }            │
│          │                                                               │
│          ↓                                                               │
│   [5] Tech Stack Agent   ──>  Uses companyName + domain + website      │
│          │                     Enrichments: { techStack }               │
│          │                                                               │
│          ↓                                                               │
│   [6] General Agent      ──>  Uses full context for custom fields      │
│                               Enrichments: { customField }              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Result Aggregation                                             │
│                                                                          │
│   All Enrichments Merged:                                               │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ {                                                              │   │
│   │   companyName: { value: "Acme Corp", confidence: 0.95, ... },  │   │
│   │   industry: { value: "SaaS", confidence: 0.87, ... },          │   │
│   │   employeeCount: { value: "501-1000", confidence: 0.75, ... }, │   │
│   │   fundingStage: { value: "Series B", confidence: 0.80, ... }   │   │
│   │ }                                                              │   │
│   └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
OUTPUT: RowEnrichmentResult
   │
   ├──> originalData: { email: "john@acme.com", ... }
   ├──> enrichments: { all enriched fields with metadata }
   ├──> status: "completed"
   └──> error: null
```

## 3. AGENT SPECIALIZATIONS - The Team

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         6 SPECIALIZED AGENTS                             ║
║                    Each with Unique Expertise                            ║
╚══════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ 🔍 DISCOVERY AGENT                                                       │
│    "The Company Identifier"                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ Role: Establishes foundational company identity                         │
│                                                                          │
│ Workflow:                                                                │
│   Email: john@acme.com                                                   │
│      │                                                                   │
│      ├──> Extract domain: acme.com                                      │
│      │                                                                   │
│      ├──> Try direct scrape: https://acme.com                           │
│      │    │                                                              │
│      │    ├──> Success? Extract company info                            │
│      │    └──> Failed? ──> FALLBACK STRATEGY                            │
│      │                     │                                             │
│      │                     ├──> Search: "acme.com company website"      │
│      │                     ├──> Search: "site:acme.com about"           │
│      │                     ├──> Search: "Acme corporation"              │
│      │                     └──> Search: "acme.com company info"         │
│      │                                                                   │
│      └──> LLM Extraction: companyName, website, description             │
│                                                                          │
│ Output Fields: companyName, website, description                        │
│ Tools: Website Scraper, Smart Search                                    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 🏢 PROFILE AGENT                                                         │
│    "The Company Historian"                                               │
├──────────────────────────────────────────────────────────────────────────┤
│ Role: Enriches company background and identity                          │
│                                                                          │
│ Requires: companyName from Discovery Agent (context dependency)         │
│                                                                          │
│ Search Strategy:                                                         │
│   Query: "site:acme.com OR 'Acme Corp' headquarters industry            │
│           founded in year founded location based in about"               │
│      │                                                                   │
│      ├──> Scrapes: About pages, company info pages                      │
│      ├──> Searches: LinkedIn, Crunchbase mentions                       │
│      └──> Extracts: Structured data with LLM                            │
│                                                                          │
│ Output Fields: industry, headquarters, yearFounded, companySize         │
│ Tools: Smart Search, LLM Extraction                                     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 📊 METRICS AGENT                                                         │
│    "The Numbers Expert"                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ Role: Quantifies company scale and performance                          │
│                                                                          │
│ Requires: companyName (from context)                                    │
│                                                                          │
│ Search Strategy:                                                         │
│   Query: "'Acme Corp' employees team size revenue annual revenue        │
│           ARR MRR 2025 2024"                                             │
│      │                                                                   │
│      ├──> Prioritizes: Recent data (2024-2025)                          │
│      ├──> Searches: Press releases, news articles, reports              │
│      └──> Validates: Number consistency across sources                  │
│                                                                          │
│ Output Fields: employeeCount, revenue, ARR, growth metrics              │
│ Tools: Smart Search, LLM Extraction with numeric validation             │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 💰 FUNDING AGENT                                                         │
│    "The Investment Tracker"                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ Role: Discovers funding history and financial backing                   │
│                                                                          │
│ Requires: companyName (from context)                                    │
│                                                                          │
│ Search Strategy:                                                         │
│   Query: "'Acme Corp' funding raised series investment                  │
│           total funding valuation investors"                             │
│      │                                                                   │
│      ├──> Targets: Crunchbase, TechCrunch, press releases               │
│      ├──> Extracts: Round sizes, investors, dates                       │
│      └──> Classifies: Funding stage (Seed, Series A, B, C, etc.)        │
│                                                                          │
│ Output Fields: fundingStage, totalFunding, lastRoundDate, investors     │
│ Tools: Smart Search, LLM Extraction with financial understanding        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 💻 TECH STACK AGENT                                                      │
│    "The Technology Detective"                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Role: Identifies technologies and tools used by the company             │
│                                                                          │
│ Requires: companyName, domain, website (from context)                   │
│                                                                          │
│ Multi-Source Strategy:                                                   │
│   [1] GitHub Analysis                                                    │
│       └──> Search: "site:github.com 'Acme Corp' OR acme"                │
│           └──> Scrape repos for languages, frameworks                   │
│                                                                          │
│   [2] Website HTML Analysis                                              │
│       └──> Scrape: https://acme.com                                     │
│           └──> Detect: JavaScript frameworks, analytics, CDN usage      │
│                                                                          │
│   [3] Tech Blog Search                                                   │
│       └──> Search: "'Acme Corp' tech stack built with powered by"       │
│           └──> Extract: Mentioned technologies                          │
│                                                                          │
│   [4] Hallucination Removal                                              │
│       └──> Filters out: Fake GitHub URLs, common misattributions        │
│                                                                          │
│ Output Fields: techStack (array of technologies)                        │
│ Tools: GitHub Search, Website Scraper, Smart Search, LLM Extraction     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 🌐 GENERAL AGENT                                                         │
│    "The Flexible All-Rounder"                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Role: Handles custom/uncategorized fields                               │
│                                                                          │
│ Requires: Full context from all previous agents                         │
│                                                                          │
│ Adaptive Strategy:                                                       │
│   For each custom field:                                                 │
│      │                                                                   │
│      ├──> Analyze field name/description                                │
│      ├──> Construct intelligent search query                            │
│      ├──> Use full company context (name, domain, industry, etc.)       │
│      └──> Extract with field-specific prompting                         │
│                                                                          │
│ Output Fields: Any user-defined custom fields                           │
│ Tools: All tools available (Smart Search, Scraper, LLM)                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## 4. DATA FLOW - Single Row Journey

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    DATA FLOW: ONE CSV ROW                                ║
╚══════════════════════════════════════════════════════════════════════════╝

CSV Row Input:
┌──────────────────────────────────────────────────────────────────────────┐
│ { email: "john@acme.com", name: "John Doe", title: "CEO" }              │
└──────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
                    ┌────────────────────────┐
                    │   Email Parsing        │
                    │   john@acme.com        │
                    └────────┬───────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ↓                         ↓
        ┌──────────────┐         ┌──────────────┐
        │   domain:    │         │ companyGuess:│
        │  "acme.com"  │         │   "Acme"     │
        └──────────────┘         └──────────────┘
                │                         │
                └────────────┬────────────┘
                             │
                             ↓
                ┌────────────────────────┐
                │  Field Categorization  │
                │  (4 agents needed)     │
                └────────┬───────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
         ↓               ↓               ↓              ↓
    ┌─────────┐    ┌─────────┐    ┌─────────┐   ┌─────────┐
    │Discovery│    │ Profile │    │ Metrics │   │ Funding │
    │  Agent  │    │  Agent  │    │  Agent  │   │  Agent  │
    └────┬────┘    └────┬────┘    └────┬────┘   └────┬────┘
         │              │              │             │
         │ (sequential execution with context passing)
         │              │              │             │
         ↓              ↓              ↓             ↓
    ┌─────────────────────────────────────────────────────┐
    │            Context Building                         │
    │                                                     │
    │  Step 1: {}                                         │
    │  Step 2: { companyName: "Acme Corp" }               │
    │  Step 3: { companyName: "Acme Corp",                │
    │             industry: "SaaS" }                      │
    │  Step 4: { companyName: "Acme Corp",                │
    │             industry: "SaaS",                       │
    │             employeeCount: "501-1000" }             │
    │  Step 5: { companyName: "Acme Corp",                │
    │             industry: "SaaS",                       │
    │             employeeCount: "501-1000",              │
    │             fundingStage: "Series B" }              │
    └─────────────────────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────────────────────┐
    │         Enrichment Results Merge                    │
    │                                                     │
    │  Original + Enrichments:                            │
    │  {                                                  │
    │    email: "john@acme.com",                          │
    │    name: "John Doe",                                │
    │    title: "CEO",                                    │
    │    companyName: {                                   │
    │      value: "Acme Corp",                            │
    │      confidence: 0.95,                              │
    │      sources: ["https://acme.com"],                 │
    │      reasoning: "Found on homepage"                 │
    │    },                                               │
    │    industry: { value: "SaaS", confidence: 0.87 },   │
    │    employeeCount: { value: "501-1000", ... },       │
    │    fundingStage: { value: "Series B", ... }         │
    │  }                                                  │
    └─────────────────────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────────────────────┐
    │            SSE Stream to Frontend                   │
    │                                                     │
    │  Event 1: { type: "progress", field: "companyName" }│
    │  Event 2: { type: "progress", field: "industry" }   │
    │  Event 3: { type: "progress", field: "employeeCount"}│
    │  Event 4: { type: "complete", data: {...} }         │
    └─────────────────────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────────────────────┐
    │         User Sees Live Updates                      │
    │                                                     │
    │  Row 1: ⏳ Enriching...                             │
    │         ✅ Company Name: Acme Corp                  │
    │         ✅ Industry: SaaS                           │
    │         ✅ Employees: 501-1000                      │
    │         ✅ Funding: Series B                        │
    │  Row 1: ✅ Complete!                                │
    └─────────────────────────────────────────────────────┘
```

## 5. CONTEXT BUILDING - The Intelligence

```
╔══════════════════════════════════════════════════════════════════════════╗
║              PROGRESSIVE CONTEXT BUILDING                                ║
║        Why Sequential Execution Beats Parallel Processing               ║
╚══════════════════════════════════════════════════════════════════════════╝

❌ PARALLEL (Without Context) - Less Accurate:
═══════════════════════════════════════════════════════════════════════════

Email: john@acme.com
   │
   └──────┬──────────┬───────────┬──────────┐
          │          │           │          │
          ↓          ↓           ↓          ↓
     ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
     │Discovery│ │Profile │ │Metrics │ │Funding │
     │(solo)   │ │(solo)  │ │(solo)  │ │(solo)  │
     └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
          │          │           │          │
          │ Profile can't use Discovery's company name!
          │ Metrics can't use industry context!
          │ Funding can't use employee count for validation!
          │
          └──────┬──────────┬───────────┬──────────┘
                 │
                 ↓
          Less accurate results


✅ SEQUENTIAL (With Context) - More Accurate:
═══════════════════════════════════════════════════════════════════════════

Email: john@acme.com
   │
   ↓
┌────────────────────────────────────────────────────────────────────────┐
│ [1] DISCOVERY AGENT                                                    │
│                                                                        │
│     Context In: { email: "john@acme.com", domain: "acme.com" }        │
│                                                                        │
│     Work: Identifies company → "Acme Corporation"                     │
│                                                                        │
│     Context Out: { companyName: "Acme Corporation",                   │
│                    domain: "acme.com",                                │
│                    website: "https://acmecorp.com" }                  │
└────────────────────────────────────────────────────────────────────────┘
   │
   ↓ (passes enriched context)
   │
┌────────────────────────────────────────────────────────────────────────┐
│ [2] PROFILE AGENT                                                      │
│                                                                        │
│     Context In: { companyName: "Acme Corporation",  ← FROM DISCOVERY  │
│                   domain: "acme.com",                                  │
│                   website: "https://acmecorp.com" }                    │
│                                                                        │
│     Work: Searches "Acme Corporation headquarters industry"           │
│           ← Uses exact company name, not just domain!                 │
│                                                                        │
│     Context Out: { companyName: "Acme Corporation",                   │
│                    domain: "acme.com",                                │
│                    website: "https://acmecorp.com",                   │
│                    industry: "Enterprise SaaS",                       │
│                    headquarters: "San Francisco, CA" }                │
└────────────────────────────────────────────────────────────────────────┘
   │
   ↓ (passes even richer context)
   │
┌────────────────────────────────────────────────────────────────────────┐
│ [3] METRICS AGENT                                                      │
│                                                                        │
│     Context In: { companyName: "Acme Corporation",  ← FROM DISCOVERY  │
│                   industry: "Enterprise SaaS",     ← FROM PROFILE     │
│                   headquarters: "San Francisco, CA" }                  │
│                                                                        │
│     Work: Searches "Acme Corporation Enterprise SaaS employees 2024"  │
│           ← Uses company name + industry for better search!           │
│           Can validate numbers against industry norms                 │
│                                                                        │
│     Context Out: { ...(previous context),                             │
│                    employeeCount: "501-1000",                         │
│                    revenue: "$50M-$100M ARR" }                        │
└────────────────────────────────────────────────────────────────────────┘
   │
   ↓ (maximum context for final agents)
   │
┌────────────────────────────────────────────────────────────────────────┐
│ [4] FUNDING AGENT                                                      │
│                                                                        │
│     Context In: { companyName: "Acme Corporation",                    │
│                   industry: "Enterprise SaaS",                        │
│                   employeeCount: "501-1000",      ← FROM METRICS      │
│                   revenue: "$50M-$100M ARR" }                         │
│                                                                        │
│     Work: Can validate funding stage against company size             │
│           Series B makes sense for 500-1000 employees                 │
│           Seed-stage wouldn't match these metrics                     │
│                                                                        │
│     Context Out: { ...(previous context),                             │
│                    fundingStage: "Series B",                          │
│                    totalFunding: "$75M" }                             │
└────────────────────────────────────────────────────────────────────────┘

KEY BENEFITS OF SEQUENTIAL CONTEXT BUILDING:

1. Better Search Queries:
   ❌ "acme.com employees"  (vague, might get unrelated results)
   ✅ "Acme Corporation Enterprise SaaS employees 2024"  (specific!)

2. Cross-Validation:
   - Employee count validates funding stage
   - Industry validates revenue ranges
   - Headquarters validates company size

3. Disambiguation:
   - Multiple "Acme" companies exist
   - Company name from Discovery ensures Profile searches correct one

4. Efficiency:
   - Later agents can skip searches if earlier agents found info
   - No duplicate work across agents
```

## 6. LLM PROVIDER INTEGRATION

```
╔══════════════════════════════════════════════════════════════════════════╗
║                   LLM PROVIDER ABSTRACTION                               ║
║                  OpenAI GPT-4 vs Google Gemini                           ║
╚══════════════════════════════════════════════════════════════════════════╝

CONFIGURATION:
┌──────────────────────────────────────────────────────────────────────────┐
│ .env file:                                                               │
│                                                                          │
│   USE_GEMINI=false  ←── Toggle                                          │
│   OPENAI_API_KEY=sk-...                                                 │
│   GEMINI_API_KEY=...                                                    │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ lib/config/gemini.ts                                                     │
│                                                                          │
│   function getActiveProvider() {                                        │
│     return USE_GEMINI ? 'gemini' : 'openai'                             │
│   }                                                                      │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ lib/strategies/agent-enrichment-strategy.ts                             │
│                                                                          │
│   constructor(...) {                                                    │
│     if (getActiveProvider() === 'gemini') {                             │
│       this.llmService = new GeminiService(geminiApiKey)  ──┐            │
│     } else {                                                │            │
│       this.llmService = new OpenAIService(openaiApiKey)  ──┤            │
│     }                                                       │            │
│   }                                                         │            │
└─────────────────────────────────────────────────────────────┼────────────┘
                                                              │
                             ┌────────────────────────────────┘
                             │
                ┌────────────┴─────────────┐
                │                          │
                ↓                          ↓
    ┌──────────────────────┐   ┌──────────────────────┐
    │   OpenAIService      │   │   GeminiService      │
    │                      │   │                      │
    │ - extractStructured  │   │ - extractStructured  │
    │   Data()             │   │   Data()             │
    │                      │   │                      │
    │ - chat()             │   │ - chat()             │
    │                      │   │                      │
    │ Model: GPT-4         │   │ Model: Gemini 2.0    │
    └──────────────────────┘   └──────────────────────┘
                │                          │
                └────────────┬─────────────┘
                             │
                             ↓
                ┌────────────────────────┐
                │   Agent Orchestrator   │
                │                        │
                │   this.llmService      │
                │   (duck typed)         │
                └────────────────────────┘
                             │
                             ↓
               ┌─────────────────────────┐
               │ All 6 agents use same   │
               │ LLM service interface   │
               │ (provider agnostic!)    │
               └─────────────────────────┘


INTERFACE (Duck Typing):
═══════════════════════════════════════════════════════════════════════════

Both services implement:

  async extractStructuredData(
    content: string,              // Scraped web content
    fields: EnrichmentField[],    // Fields to extract
    context: Record<string, any>  // Company context
  ): Promise<Record<string, EnrichmentResult>>

  async chat(
    messages: Message[],
    options?: ChatOptions
  ): Promise<string>


AGENT USAGE:
═══════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────┐
│ Any Agent (e.g., Profile Agent):                                        │
│                                                                          │
│   const content = await firecrawl.scrape(url)                           │
│                                                                          │
│   const results = await this.llmService.extractStructuredData(          │
│     content,         // ← Web page markdown                             │
│     fields,          // ← [industry, headquarters, yearFounded]         │
│     context          // ← { companyName: "Acme Corp", ... }             │
│   )                                                                      │
│                                                                          │
│   // Works with both OpenAI and Gemini!                                 │
│   // Agent doesn't care which provider is used                          │
└──────────────────────────────────────────────────────────────────────────┘


BENEFITS:
═══════════════════════════════════════════════════════════════════════════

✅ Single toggle to switch providers
✅ No agent code changes needed
✅ Same enrichment quality (Zod schema validation)
✅ Cost optimization (Gemini is cheaper)
✅ Fallback capability (if one provider is down)
✅ A/B testing different models
```

## 7. TOOL SYSTEM - Agent Capabilities

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         AGENT TOOL ARSENAL                               ║
╚══════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ 🔧 TOOL 1: Website Scraper Tool                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Purpose: Fetch and convert webpage to LLM-friendly markdown           │
│                                                                          │
│   Workflow:                                                              │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Input: https://acme.com                                       │   │
│   │    │                                                            │   │
│   │    ↓                                                            │   │
│   │  Firecrawl API                                                 │   │
│   │    │                                                            │   │
│   │    ├──> Handles JavaScript rendering                           │   │
│   │    ├──> Bypasses bot detection                                 │   │
│   │    ├──> Extracts clean content                                 │   │
│   │    └──> Converts to markdown                                   │   │
│   │         │                                                       │   │
│   │         ↓                                                       │   │
│   │  Output: Clean markdown                                        │   │
│   │                                                                 │   │
│   │  # Acme Corporation                                            │   │
│   │  Leading enterprise SaaS platform...                           │   │
│   │  Founded in 2015 | 500+ employees | Series B                   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   Used By: Discovery, Profile, Tech Stack agents                        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 🔎 TOOL 2: Smart Search Tool                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Purpose: Intelligent web search with ranking and filtering            │
│                                                                          │
│   Workflow:                                                              │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Input: "Acme Corporation funding Series B investors"          │   │
│   │    │                                                            │   │
│   │    ↓                                                            │   │
│   │  Firecrawl Search API                                          │   │
│   │    │                                                            │   │
│   │    ├──> Returns top N results with scores                      │   │
│   │    ├──> Each result has URL + markdown content                 │   │
│   │    └──> Ranked by relevance                                    │   │
│   │         │                                                       │   │
│   │         ↓                                                       │   │
│   │  Filtering Logic:                                               │   │
│   │    ├──> Removes duplicates (same domain)                       │   │
│   │    ├──> Filters low-quality sources                            │   │
│   │    ├──> Prioritizes authoritative sites                        │   │
│   │    │    (Crunchbase, LinkedIn, company site)                   │   │
│   │    └──> Limits to top 5 most relevant                          │   │
│   │         │                                                       │   │
│   │         ↓                                                       │   │
│   │  Output: Array of SearchResult objects                         │   │
│   │    [                                                            │   │
│   │      { url: "...", markdown: "...", score: 0.95 },             │   │
│   │      { url: "...", markdown: "...", score: 0.87 }              │   │
│   │    ]                                                            │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   Used By: All agents for contextual data gathering                     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 🧠 TOOL 3: LLM Extraction Tool                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Purpose: Extract structured data from unstructured text               │
│                                                                          │
│   Workflow:                                                              │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Input: Raw web content (markdown)                             │   │
│   │         Fields schema (Zod)                                    │   │
│   │         Context (company name, domain, etc.)                   │   │
│   │    │                                                            │   │
│   │    ↓                                                            │   │
│   │  Prompt Construction:                                           │   │
│   │    ┌──────────────────────────────────────────────────┐        │   │
│   │    │ You are extracting data for: Acme Corporation   │        │   │
│   │    │                                                  │        │   │
│   │    │ Extract these fields:                            │        │   │
│   │    │ - industry (business sector)                     │        │   │
│   │    │ - headquarters (city, state/country)             │        │   │
│   │    │                                                  │        │   │
│   │    │ From this content:                               │        │   │
│   │    │ [markdown content]                               │        │   │
│   │    │                                                  │        │   │
│   │    │ Return JSON matching this schema:                │        │   │
│   │    │ { industry: string, headquarters: string }       │        │   │
│   │    └──────────────────────────────────────────────────┘        │   │
│   │    │                                                            │   │
│   │    ↓                                                            │   │
│   │  LLM Processing (GPT-4 or Gemini)                              │   │
│   │    │                                                            │   │
│   │    ├──> Structured output mode (JSON)                          │   │
│   │    ├──> Schema validation (Zod)                                │   │
│   │    └──> Confidence estimation                                  │   │
│   │         │                                                       │   │
│   │         ↓                                                       │   │
│   │  Output: EnrichmentResult objects                              │   │
│   │    {                                                            │   │
│   │      industry: {                                                │   │
│   │        value: "Enterprise SaaS",                                │   │
│   │        confidence: 0.92,                                        │   │
│   │        sources: ["https://acme.com/about"],                     │   │
│   │        reasoning: "Found in About page"                         │   │
│   │      },                                                          │   │
│   │      headquarters: { ... }                                      │   │
│   │    }                                                            │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   Used By: All agents for final data extraction                         │
└──────────────────────────────────────────────────────────────────────────┘
```

## 8. COMPLETE ENRICHMENT FLOW - Real Example

```
╔══════════════════════════════════════════════════════════════════════════╗
║                 COMPLETE ENRICHMENT: REAL EXAMPLE                        ║
║                   john@onetrust.com → Full Profile                       ║
╚══════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ INPUT CSV ROW:                                                           │
│   { email: "john@onetrust.com", name: "John Doe" }                      │
│                                                                          │
│ FIELDS TO ENRICH:                                                        │
│   - companyName                                                          │
│   - industry                                                             │
│   - employeeCount                                                        │
│   - fundingStage                                                         │
└──────────────────────────────────────────────────────────────────────────┘
   │
   │ USER CLICKS "ENRICH"
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE: Email Context Extraction                                         │
│                                                                          │
│   parseEmail("john@onetrust.com")                                       │
│   └──> {                                                                │
│         domain: "onetrust.com",                                         │
│         localPart: "john",                                              │
│         companyNameGuess: "OneTrust",                                   │
│         isPersonal: false                                               │
│       }                                                                 │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ AGENT 1: Discovery Agent                                                │
│                                                                          │
│   Task: Find companyName                                                │
│                                                                          │
│   [Step 1] Try direct scrape:                                           │
│   │  GET https://onetrust.com                                           │
│   │  Status: 200 OK                                                     │
│   │  Content: "# OneTrust Privacy Management Platform..."              │
│   │                                                                     │
│   [Step 2] Extract with LLM:                                            │
│   │  llmService.extractStructuredData(                                  │
│   │    content: "# OneTrust Privacy Management...",                     │
│   │    fields: [{ name: "companyName", ... }],                          │
│   │    context: { domain: "onetrust.com" }                              │
│   │  )                                                                  │
│   │                                                                     │
│   [Result]                                                              │
│   companyName: {                                                        │
│     value: "OneTrust",                                                  │
│     confidence: 0.98,                                                   │
│     sources: ["https://onetrust.com"],                                  │
│     reasoning: "Found in page title and header"                         │
│   }                                                                     │
│                                                                          │
│   ✅ Context updated: { companyName: "OneTrust" }                       │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓ (companyName now available to next agent!)
   │
┌──────────────────────────────────────────────────────────────────────────┐
│ AGENT 2: Profile Agent                                                  │
│                                                                          │
│   Task: Find industry                                                   │
│   Context: { companyName: "OneTrust", domain: "onetrust.com" }         │
│                                                                          │
│   [Step 1] Smart search with company name:                              │
│   │  Query: "site:onetrust.com OR 'OneTrust' industry about"           │
│   │  Results: [                                                         │
│   │    { url: "onetrust.com/about", score: 0.95 },                      │
│   │    { url: "linkedin.com/company/onetrust", score: 0.89 }            │
│   │  ]                                                                  │
│   │                                                                     │
│   [Step 2] Extract from search results:                                 │
│   │  llmService.extractStructuredData(                                  │
│   │    content: "OneTrust provides privacy and security software...",   │
│   │    fields: [{ name: "industry", ... }],                             │
│   │    context: { companyName: "OneTrust" }  ← Uses discovered name!   │
│   │  )                                                                  │
│   │                                                                     │
│   [Result]                                                              │
│   industry: {                                                           │
│     value: "Privacy & Security Software",                               │
│     confidence: 0.94,                                                   │
│     sources: ["https://onetrust.com/about", "linkedin.com/..."],        │
│     reasoning: "Company specializes in privacy management"              │
│   }                                                                     │
│                                                                          │
│   ✅ Context updated: { companyName: "OneTrust",                        │
│                         industry: "Privacy & Security Software" }       │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓ (even more context!)
   │
┌──────────────────────────────────────────────────────────────────────────┐
│ AGENT 3: Metrics Agent                                                  │
│                                                                          │
│   Task: Find employeeCount                                              │
│   Context: { companyName: "OneTrust",                                   │
│              industry: "Privacy & Security Software" }                  │
│                                                                          │
│   [Step 1] Search with full context:                                    │
│   │  Query: "'OneTrust' employees team size 2024 2025"                  │
│   │  Results: [                                                         │
│   │    { url: "linkedin.com/company/onetrust", score: 0.92 },           │
│   │    { url: "crunchbase.com/organization/onetrust", score: 0.88 }     │
│   │  ]                                                                  │
│   │                                                                     │
│   [Step 2] Extract employee count:                                      │
│   │  Content: "OneTrust has approximately 2,500 employees..."           │
│   │  LLM extracts: "2,000-5,000" (maps to range)                        │
│   │                                                                     │
│   [Result]                                                              │
│   employeeCount: {                                                      │
│     value: "2000-5000",                                                 │
│     confidence: 0.87,                                                   │
│     sources: ["linkedin.com/company/onetrust"],                         │
│     reasoning: "LinkedIn company page shows ~2,500 employees"           │
│   }                                                                     │
│                                                                          │
│   ✅ Context: { companyName, industry, employeeCount }                  │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓ (maximum context for validation!)
   │
┌──────────────────────────────────────────────────────────────────────────┐
│ AGENT 4: Funding Agent                                                  │
│                                                                          │
│   Task: Find fundingStage                                               │
│   Context: { companyName: "OneTrust",                                   │
│              industry: "Privacy & Security Software",                   │
│              employeeCount: "2000-5000" }                               │
│                                                                          │
│   [Step 1] Search for funding info:                                     │
│   │  Query: "'OneTrust' funding raised investment series valuation"     │
│   │  Results: [                                                         │
│   │    { url: "crunchbase.com/organization/onetrust", score: 0.96 },    │
│   │    { url: "techcrunch.com/onetrust-raises...", score: 0.91 }        │
│   │  ]                                                                  │
│   │                                                                     │
│   [Step 2] Extract and validate:                                        │
│   │  Content: "OneTrust raised $210M Series B led by Insight..."        │
│   │  LLM extracts: "Series B"                                           │
│   │  Validation: ✅ Makes sense for 2,500 employee company              │
│   │                                                                     │
│   [Result]                                                              │
│   fundingStage: {                                                       │
│     value: "Series B",                                                  │
│     confidence: 0.96,                                                   │
│     sources: ["crunchbase.com/...", "techcrunch.com/..."],              │
│     reasoning: "Raised $210M Series B in 2019, consistent with size"    │
│   }                                                                     │
└──────────────────────────────────────────────────────────────────────────┘
   │
   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ FINAL OUTPUT: Enriched Row                                              │
│                                                                          │
│   {                                                                      │
│     // Original data                                                    │
│     email: "john@onetrust.com",                                         │
│     name: "John Doe",                                                   │
│                                                                          │
│     // Enriched data                                                    │
│     companyName: {                                                      │
│       value: "OneTrust",                                                │
│       confidence: 0.98,                                                 │
│       sources: ["https://onetrust.com"],                                │
│       reasoning: "Found in page title and header"                       │
│     },                                                                  │
│     industry: {                                                         │
│       value: "Privacy & Security Software",                             │
│       confidence: 0.94,                                                 │
│       sources: ["https://onetrust.com/about", "linkedin..."],           │
│       reasoning: "Company specializes in privacy management"            │
│     },                                                                  │
│     employeeCount: {                                                    │
│       value: "2000-5000",                                               │
│       confidence: 0.87,                                                 │
│       sources: ["linkedin.com/company/onetrust"],                       │
│       reasoning: "LinkedIn shows ~2,500 employees"                      │
│     },                                                                  │
│     fundingStage: {                                                     │
│       value: "Series B",                                                │
│       confidence: 0.96,                                                 │
│       sources: ["crunchbase.com/...", "techcrunch.com/..."],            │
│       reasoning: "Raised $210M Series B, consistent with company size"  │
│     }                                                                   │
│   }                                                                      │
│                                                                          │
│   Status: ✅ COMPLETED (4/4 fields enriched)                            │
│   Duration: ~12 seconds                                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

The Fire Enrich multi-agent system is a **sequential, context-building pipeline** where:

1. **6 Specialized Agents** each handle specific data domains
2. **Agent Orchestrator** coordinates execution with shared context
3. **Progressive Enrichment** builds knowledge incrementally
4. **LLM Provider Flexibility** supports OpenAI GPT-4 or Google Gemini
5. **Tool Arsenal** includes web scraping, smart search, and LLM extraction
6. **High Accuracy** through context-aware searches and cross-validation
7. **Real-time Updates** via Server-Sent Events (SSE) to frontend

Each agent contributes to a **shared context** that makes subsequent agents more accurate and efficient.
