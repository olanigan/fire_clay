# Fire Enrich - Configuration Guide

## Environment Configuration

### Required Environment Variables

Fire Enrich requires the following API keys to function:

```bash
# Firecrawl API Key (required)
FIRECRAWL_API_KEY=fc-your-firecrawl-api-key-here

# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Enable unlimited mode
FIRE_ENRICH_UNLIMITED=true

# Optional: Node environment
NODE_ENV=development
```

### Environment File Setup

Create a `.env.local` file in the project root:

```bash
# Copy from example
cp .env.example .env.local

# Edit with your API keys
nano .env.local
```

**`.env.local` example**:
```env
FIRECRAWL_API_KEY=fc-1234567890abcdef
OPENAI_API_KEY=sk-proj-1234567890abcdef
FIRE_ENRICH_UNLIMITED=true
NODE_ENV=development
```

### API Key Acquisition

#### Firecrawl API Key

1. Visit [firecrawl.dev](https://firecrawl.dev)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into `.env.local`

**Pricing**:
- Free tier: 500 credits/month
- Pro tier: From $29/month
- Credits used per search: ~1-5 credits

#### OpenAI API Key

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy immediately (won't be shown again)
6. Paste into `.env.local`

**Requirements**:
- Must have GPT-4 access
- Pay-as-you-go billing enabled
- Recommended: Set usage limits

**Pricing** (as of 2025):
- GPT-4: ~$0.01-0.03 per enrichment
- GPT-4 Turbo: ~$0.005-0.015 per enrichment

---

## Application Configuration

### Fire Enrich Config

**File**: `app/fire-enrich/config.ts`

```typescript
export const FIRE_ENRICH_CONFIG = {
  // CSV upload limits
  CSV_LIMITS: {
    MAX_ROWS: isUnlimitedMode ? Infinity : 15,
    MAX_COLUMNS: isUnlimitedMode ? Infinity : 5,
  },

  // Processing configuration
  PROCESSING: {
    DELAY_BETWEEN_ROWS_MS: 1000,
    MAX_RETRIES: 3,
  },

  // Request limits
  REQUEST_LIMITS: {
    MAX_BODY_SIZE_MB: isUnlimitedMode ? 50 : 5,
    MAX_FIELDS_PER_ENRICHMENT: isUnlimitedMode ? 50 : 10,
  },

  // Feature flags
  FEATURES: {
    IS_UNLIMITED: isUnlimitedMode,
  },
} as const;
```

#### Configuration Options

**CSV_LIMITS.MAX_ROWS**:
- **Public Demo**: 15 rows
- **Self-Hosted**: Unlimited
- **Purpose**: Prevent abuse on public deployment
- **Override**: Set `FIRE_ENRICH_UNLIMITED=true`

**CSV_LIMITS.MAX_COLUMNS**:
- **Public Demo**: 5 columns
- **Self-Hosted**: Unlimited
- **Purpose**: Limit complexity
- **Override**: Set `FIRE_ENRICH_UNLIMITED=true`

**PROCESSING.DELAY_BETWEEN_ROWS_MS**:
- **Default**: 1000ms (1 second)
- **Purpose**: Rate limiting, prevent API throttling
- **Recommendation**: Keep at 1000ms for stability
- **Custom**: Modify in `lib/config/enrichment.ts`

**PROCESSING.MAX_RETRIES**:
- **Default**: 3 attempts
- **Purpose**: Retry failed enrichments
- **Use Case**: Network errors, transient API failures

**REQUEST_LIMITS.MAX_BODY_SIZE_MB**:
- **Public Demo**: 5MB
- **Self-Hosted**: 50MB
- **Purpose**: Prevent large CSV uploads
- **Note**: CSV files are typically < 1MB

**REQUEST_LIMITS.MAX_FIELDS_PER_ENRICHMENT**:
- **Public Demo**: 10 fields
- **Self-Hosted**: 50 fields
- **Purpose**: Limit API usage per request
- **Recommendation**: 5-10 fields for optimal performance

---

### Enrichment Processing Config

**File**: `lib/config/enrichment.ts`

```typescript
export const ENRICHMENT_CONFIG = {
  /**
   * Number of rows to process concurrently
   * Higher values = faster processing but more API usage
   * Recommended: 2-5 for most use cases
   */
  CONCURRENT_ROWS: 10,

  /**
   * Delay between batches (milliseconds)
   * Helps prevent rate limiting
   */
  BATCH_DELAY_MS: 1000,
} as const;
```

#### Tuning Concurrency

**CONCURRENT_ROWS**:
- **Default**: 10
- **Low Traffic** (1-10 rows): 2-3
- **Medium Traffic** (10-100 rows): 5-10
- **High Traffic** (100+ rows): 10-20
- **Impact**:
  - Higher = Faster completion
  - Higher = More API calls/second
  - Higher = Risk of rate limits

**Recommendations**:
```typescript
// Conservative (avoid rate limits)
CONCURRENT_ROWS: 2

// Balanced (default)
CONCURRENT_ROWS: 10

// Aggressive (fast processing)
CONCURRENT_ROWS: 20
```

---

## Feature Flags

### Unlimited Mode

Automatically enabled when:
- `FIRE_ENRICH_UNLIMITED=true` in environment, OR
- `NODE_ENV=development`

**Effects**:
- Removes row/column limits
- Increases field limit to 50
- Increases body size to 50MB
- Displays "Unlimited Mode" badge in UI

**Check Status**:
```typescript
import { FIRE_ENRICH_CONFIG } from '@/app/fire-enrich/config';

if (FIRE_ENRICH_CONFIG.FEATURES.IS_UNLIMITED) {
  console.log('Unlimited mode active');
}
```

---

## Agent Configuration

### Default Agent Settings

Each agent has configurable parameters:

```typescript
// lib/agent-architecture/agents/discovery-agent.ts
const AGENT_CONFIG = {
  MAX_SEARCH_QUERIES: 3,
  MAX_RESULTS_PER_QUERY: 5,
  TIMEOUT_MS: 30000,
};
```

### Model Selection

**OpenAI Models**:
```typescript
// lib/services/openai.ts
const DEFAULT_MODEL = 'gpt-4o'; // GPT-4 Optimized
const FALLBACK_MODEL = 'gpt-4-turbo';
```

**Gemini Models** (Migration):
```typescript
// lib/services/gemini.ts
const DEFAULT_MODEL = 'gemini-1.5-pro';
const FLASH_MODEL = 'gemini-1.5-flash'; // Faster, cheaper
```

### Search Configuration

**Firecrawl Settings**:
```typescript
// lib/services/firecrawl.ts
const FIRECRAWL_CONFIG = {
  MAX_PAGES_PER_SEARCH: 5,
  INCLUDE_RAW_HTML: false,
  TIMEOUT: 30000,
};
```

---

## Performance Tuning

### Memory Configuration

**Node.js Memory**:
```bash
# Increase heap size for large CSVs
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### Timeout Configuration

**API Timeouts**:
```typescript
// Adjust in service files
const TIMEOUT_CONFIG = {
  FIRECRAWL_TIMEOUT: 30000,  // 30 seconds
  OPENAI_TIMEOUT: 60000,      // 60 seconds
  TOTAL_ROW_TIMEOUT: 120000,  // 2 minutes per row
};
```

### Cache Configuration (Future)

```typescript
// Planned: Redis caching
const CACHE_CONFIG = {
  ENABLED: true,
  TTL: 3600,  // 1 hour
  MAX_SIZE: 1000,  // Max cached entries
};
```

---

## Security Configuration

### API Key Security

**Best Practices**:
1. Never commit `.env.local` to git
2. Use environment variables in production
3. Rotate keys regularly
4. Set usage limits on API dashboards
5. Use separate keys for dev/prod

**gitignore**:
```gitignore
.env.local
.env*.local
.env.development.local
.env.production.local
```

### CORS Configuration

**For Self-Hosted Deployments**:
```typescript
// next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,DELETE' },
        ],
      },
    ];
  },
};
```

### Rate Limiting

**Upstash Rate Limit** (Optional):
```bash
# Add to .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

---

## Deployment Configuration

### Vercel Deployment

**Environment Variables**:
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add:
   - `FIRECRAWL_API_KEY`
   - `OPENAI_API_KEY`
   - `FIRE_ENRICH_UNLIMITED` (optional)

**Build Configuration**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  fire-enrich:
    build: .
    ports:
      - "3000:3000"
    environment:
      - FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - FIRE_ENRICH_UNLIMITED=true
    restart: unless-stopped
```

**Run**:
```bash
docker-compose up -d
```

### Self-Hosted (VPS)

**Setup Script**:
```bash
#!/bin/bash

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/firecrawl/fire-enrich.git
cd fire-enrich

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
nano .env.local  # Add your API keys

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "fire-enrich" -- start
pm2 save
pm2 startup
```

---

## Monitoring Configuration

### Logging

**Console Logging**:
```typescript
// Adjust log level
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Available levels: 'debug', 'info', 'warn', 'error'
```

**Structured Logging** (Future):
```bash
npm install winston

# Add to .env.local
LOG_LEVEL=debug
LOG_FILE=/var/log/fire-enrich.log
```

### Analytics

**Vercel Analytics**:
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Development Configuration

### TypeScript Config

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Next.js Config

**File**: `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Turbopack for faster dev
  experimental: {
    turbo: true,
  },

  // Increase API timeout for long-running enrichments
  api: {
    responseLimit: false,
  },

  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
```

### ESLint Config

**File**: `eslint.config.mjs`

```javascript
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
```

---

## Testing Configuration

### Jest Setup (Future)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**jest.config.js**:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### Environment-Specific Configs

**Development**:
```env
NODE_ENV=development
FIRE_ENRICH_UNLIMITED=true
LOG_LEVEL=debug
```

**Staging**:
```env
NODE_ENV=production
FIRE_ENRICH_UNLIMITED=true
LOG_LEVEL=info
```

**Production**:
```env
NODE_ENV=production
FIRE_ENRICH_UNLIMITED=false
LOG_LEVEL=warn
```

---

## Troubleshooting Configuration Issues

### API Keys Not Working

**Check**:
```bash
# Verify environment variables loaded
node -e "console.log(process.env.OPENAI_API_KEY)"

# Check .env.local exists
ls -la .env.local

# Restart dev server
npm run dev
```

### Rate Limiting Issues

**Adjust**:
```typescript
// Reduce concurrency
CONCURRENT_ROWS: 2

// Increase delay
BATCH_DELAY_MS: 2000
```

### Memory Issues

**Increase Node.js heap**:
```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run dev
```

### Timeout Issues

**Increase timeouts**:
```typescript
// In service files
const TIMEOUT = 120000; // 2 minutes
```

---

## Configuration Checklist

### Initial Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Firecrawl API key
- [ ] Add OpenAI API key
- [ ] Set unlimited mode (optional)
- [ ] Install dependencies: `npm install`
- [ ] Test configuration: `npm run dev`

### Production Deployment
- [ ] Set environment variables on hosting platform
- [ ] Configure domain and SSL
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting
- [ ] Test API endpoints
- [ ] Set usage limits on API dashboards

### Performance Optimization
- [ ] Tune concurrent rows
- [ ] Adjust batch delay
- [ ] Configure caching (if implemented)
- [ ] Set up CDN for static assets
- [ ] Enable compression

### Security Hardening
- [ ] Rotate API keys
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Configure CSP headers
- [ ] Set up error monitoring
