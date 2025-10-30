# Fire Enrich - Test Suite

End-to-end tests with simulated Gemini responses to verify the Gemini integration workflow.

## Overview

This test suite validates the complete Gemini integration flow **without requiring actual API keys** by using mock services that simulate realistic API responses.

## Directory Structure

```
tests/
├── README.md                          # This file
├── run-tests.sh                       # Test runner script
├── e2e/                               # End-to-end tests
│   └── gemini-integration.test.ts     # Main test suite
├── mocks/                             # Mock services
│   ├── gemini-service.mock.ts         # Simulated Gemini API
│   └── firecrawl-service.mock.ts      # Simulated Firecrawl API
└── fixtures/                          # Test data
    └── sample-data.ts                 # Sample CSV rows and fields
```

## Quick Start

### Method 1: Using npm

```bash
npm test
# or
npm run test:gemini
```

### Method 2: Using the runner script

```bash
./tests/run-tests.sh
```

### Method 3: Direct execution

```bash
npx tsx tests/e2e/gemini-integration.test.ts
```

## Test Suite

### 9 Comprehensive Tests

1. **Orchestrator Initialization**
   - Verifies orchestrator accepts mock Gemini service
   - Confirms provider name is set correctly

2. **Single Row Enrichment**
   - Tests enriching one CSV row
   - Validates all fields are populated
   - Checks confidence scores

3. **Multiple Rows Enrichment**
   - Processes 3 sample rows
   - Ensures all complete successfully
   - Tests sequential processing

4. **Extended Fields Enrichment**
   - Tests with 8 different field types
   - Validates complex field extraction
   - Includes: company name, industry, employees, funding, website, headquarters, year founded, tech stack

5. **Personal Email Handling**
   - Tests personal email detection (Gmail, Yahoo, etc.)
   - Verifies proper handling

6. **Progress Callbacks**
   - Tests real-time progress updates
   - Validates agent messages
   - Ensures callback functions work

7. **Performance Benchmark**
   - Runs 5 iterations
   - Measures average, min, max duration
   - Validates performance is acceptable

8. **Confidence Score Validation**
   - Checks all scores are between 0-1
   - Categorizes as HIGH/MEDIUM/LOW
   - Ensures data quality

9. **Source Attribution**
   - Verifies all fields have source URLs
   - Checks source context snippets
   - Validates data provenance

## Mock Services

### MockGeminiService

Simulates the Gemini API with realistic responses:

- **extractStructuredData()**: Generates mock enrichment data
- **generateText()**: Returns mock text responses
- **generateSearchQuery()**: Creates mock search queries
- Configurable delay for realistic timing
- Field-specific mock data generators

**Supported Fields**:
- Company Name
- Industry
- Website
- Description
- Employee Count
- Funding Stage
- Headquarters
- Year Founded
- Tech Stack
- CEO
- Revenue

### MockFirecrawlService

Simulates the Firecrawl API:

- **search()**: Returns mock search results
- **scrapeUrl()**: Returns mock scraped content
- Generates realistic markdown content
- Multiple sources (company site, TechCrunch, Crunchbase, LinkedIn, GitHub)
- Configurable delay

## Sample Data

### Test Rows

```typescript
{
  email: 'john@acme.com',
  name: 'John Doe'
},
{
  email: 'sarah@techcorp.io',
  name: 'Sarah Smith'
},
{
  email: 'mike@startup.ai',
  name: 'Mike Johnson'
}
```

### Test Fields

- Company Name
- Industry
- Employee Count
- Funding Stage
- Website
- Headquarters
- Year Founded
- Tech Stack

## Expected Output

When you run the tests, you'll see:

```
╔════════════════════════════════════════════════════════════╗
║     Fire Enrich - Gemini Integration E2E Test Suite       ║
╚════════════════════════════════════════════════════════════╝

============================================================
Test 1: Orchestrator Initialization with Mock Gemini
============================================================
[MockGemini] Initialized with mock delay: 50 ms
[Orchestrator] Initialized with GEMINI provider
✓ Orchestrator created successfully
✓ Orchestrator using Gemini provider

============================================================
Test 2: Single Row Enrichment
============================================================
ℹ Enriching: john@acme.com
[MockGemini] Extracting data for fields: companyName, industry, employeeCount, fundingStage
[MockGemini] Extracted 4 fields
ℹ Enrichment completed in 152ms
✓ Result is not null
✓ Status is 'completed'
✓ Has enrichment data
✓ Original data preserved
ℹ Checking enriched fields...
  ℹ Company Name: Acme (confidence: 0.95)
  ℹ Industry: Technology (confidence: 0.87)
  ℹ Employee Count: 51-200 (confidence: 0.75)
  ℹ Funding Stage: Series B (confidence: 0.80)

... [more tests] ...

============================================================
Test Summary
============================================================
Total Tests: 9
Passed: 9
Failed: 0
Duration: 1432ms

🎉 All tests passed!
```

## Configuration

### Adjust Mock Delay

Edit `tests/e2e/gemini-integration.test.ts`:

```typescript
const TEST_CONFIG = {
  MOCK_DELAY_MS: 50,  // Faster for testing
  VERBOSE: true,
};
```

- Lower delay = faster tests
- Higher delay = more realistic timing

### Verbose Output

Set `VERBOSE: false` to reduce console output.

## What's Being Tested

### Core Functionality

✅ Gemini service initialization
✅ Orchestrator integration
✅ Field extraction
✅ Confidence scoring
✅ Source attribution
✅ Progress callbacks
✅ Error handling
✅ Multi-row processing
✅ Performance

### Data Quality

✅ Realistic company names
✅ Valid industries
✅ Proper employee count ranges
✅ Correct funding stages
✅ Valid URLs
✅ Formatted locations
✅ Reasonable year founded
✅ Tech stack strings

### Integration Points

✅ AgentOrchestrator accepts Gemini service
✅ Mock services match real API interfaces
✅ Type compatibility
✅ Async/await handling
✅ Error propagation

## Troubleshooting

### "Cannot find module 'tsx'"

Install tsx globally:
```bash
npm install -g tsx
```

Or use npx:
```bash
npx tsx tests/e2e/gemini-integration.test.ts
```

### "Permission denied" on run-tests.sh

Make it executable:
```bash
chmod +x tests/run-tests.sh
```

### Import errors

Make sure you're in the project root:
```bash
cd /path/to/fire_clay
npm test
```

### Tests fail on CI

Tests use mock services and should work anywhere. If failing:
1. Check Node.js version (18+)
2. Verify TypeScript compilation
3. Check for missing dependencies

## Extending Tests

### Add New Test

1. Create test function in `gemini-integration.test.ts`:

```typescript
async function testMyNewFeature(): Promise<void> {
  logSection('Test X: My New Feature');

  const mockGemini = new MockGeminiService('mock-key', 50);
  const orchestrator = new AgentOrchestrator(
    'mock-firecrawl-key',
    mockGemini as any,
    'gemini'
  );

  // Your test logic

  assert(condition, 'Test assertion');
}
```

2. Add to test array:

```typescript
const tests = [
  // ... existing tests
  { name: 'My New Feature', fn: testMyNewFeature },
];
```

### Add Mock Data for New Field

Edit `tests/mocks/gemini-service.mock.ts`:

```typescript
// In generateMockData() method
if (fieldName.includes('mynewfield')) {
  return {
    field: field.name,
    value: 'mock value',
    confidence: 0.85,
    source: `https://${domain}/page`,
    sourceContext: [...]
  };
}
```

## Benefits of Mock Testing

1. **No API Keys Needed**: Run tests without Gemini or Firecrawl credentials
2. **Fast Execution**: Mock responses are instant
3. **Deterministic**: Same input = same output
4. **Cost-Free**: No API charges
5. **Offline Testing**: Works without internet
6. **CI/CD Ready**: Perfect for automated testing

## Real API Testing

Once mocks pass, test with real APIs:

1. Set environment variables:
```bash
GEMINI_API_KEY=your-real-key
FIRECRAWL_API_KEY=your-real-key
USE_GEMINI=true
```

2. Run the actual application:
```bash
npm run dev
```

3. Upload a small CSV and verify results match mock expectations

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Run Tests
  run: npm test
```

### GitLab CI

```yaml
test:
  script:
    - npm install
    - npm test
```

## Next Steps

After all tests pass:

1. ✅ Verify mock behavior matches real API
2. ✅ Test with actual Gemini API key
3. ✅ Compare results to OpenAI
4. ✅ Run performance benchmarks
5. ✅ Deploy to production

## Contributing

To add tests:

1. Add mock data to `fixtures/sample-data.ts`
2. Extend mock services if needed
3. Write test functions following existing patterns
4. Update this README

## Support

For questions about tests:
- Check test output for detailed error messages
- Review mock service implementations
- Compare with real API documentation
- Open an issue on GitHub

---

**Happy Testing! 🧪**
