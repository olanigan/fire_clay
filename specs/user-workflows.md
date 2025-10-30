# Fire Enrich - User Workflows & User Guide

## User Journey Overview

Fire Enrich provides a streamlined 4-step workflow for enriching CSV data:

```
1. Upload CSV
    ↓
2. Select Fields
    ↓
3. Watch Real-time Enrichment
    ↓
4. Download Results
```

---

## Detailed User Workflows

### Workflow 1: Basic CSV Enrichment

**Use Case**: Enrich a contact list with company information

**Steps**:

#### 1. Prepare CSV File

**Requirements**:
- Must have at least one email column
- Supported formats: `.csv`, `.txt` (comma-separated)
- Maximum size: 5MB (public), 50MB (self-hosted)
- Maximum rows: 15 (public), unlimited (self-hosted)

**Example CSV**:
```csv
email,name
john@acme.com,John Doe
sarah@techcorp.io,Sarah Smith
mike@startup.ai,Mike Johnson
```

#### 2. Upload CSV

**Actions**:
1. Visit Fire Enrich homepage
2. Click "Upload CSV" or drag-and-drop file
3. System auto-detects email column
4. Preview shows first 5 rows

**UI Flow**:
```
[Drop zone] "Drag CSV here or click to upload"
    ↓
[File selected] "contact-list.csv (3 rows)"
    ↓
[Auto-detection] "Email column: email ✓"
    ↓
[Preview table]
| email              | name         |
|--------------------|--------------|
| john@acme.com      | John Doe     |
| sarah@techcorp.io  | Sarah Smith  |
```

#### 3. Select Fields to Enrich

**Options**:

**Preset Fields** (click to add):
- Company Name
- Industry
- Headquarters
- Employee Count
- Revenue
- Funding Stage
- Tech Stack
- CEO Name
- Website

**Custom Fields** (natural language):
- Type description: "Find the company's main product"
- AI generates field: `mainProduct`
- Add to selection

**Field Limit**:
- Public: 10 fields maximum
- Self-hosted: 50 fields maximum

**Example Selection**:
```
Selected Fields (4/10):
✓ Company Name
✓ Industry
✓ Employee Count
✓ Funding Stage
```

#### 4. Start Enrichment

**Actions**:
1. Click "Enrich Data" button
2. Confirm field selection
3. Real-time progress begins

**Progress Indicators**:
```
Row 1/3: Processing ⏳
├─ Discovery Agent: Identifying company ✓
├─ Company Profile Agent: Finding industry ✓
├─ Metrics Agent: Getting employee count ✓
└─ Funding Agent: Checking funding stage ✓

Row 2/3: Pending ⏸
Row 3/3: Pending ⏸
```

#### 5. Watch Real-time Updates

**UI Updates**:
- Table cells populate as data arrives
- Confidence scores show as badges
- Source URLs appear on hover
- Progress bar updates

**Example Table View**:
```
| email           | Company Name    | Industry    | Employee Count | Funding Stage |
|-----------------|-----------------|-------------|----------------|---------------|
| john@acme.com   | ACME Corp (95%) | Software    | 1,001-5,000   | Series B      |
|                 |                 | (87%)       | (82%)          | (90%)         |
```

#### 6. Download Results

**Actions**:
1. Wait for all rows to complete
2. Click "Download CSV" or "Download JSON"
3. File includes original + enriched data

**CSV Output**:
```csv
email,name,companyName,industry,employeeCount,fundingStage
john@acme.com,John Doe,ACME Corp,Software,1001-5000,Series B
sarah@techcorp.io,Sarah Smith,TechCorp,IT Services,201-500,Seed
mike@startup.ai,Mike Johnson,Startup AI,Artificial Intelligence,11-50,Series A
```

**JSON Output**:
```json
[
  {
    "email": "john@acme.com",
    "name": "John Doe",
    "enrichments": {
      "companyName": {
        "value": "ACME Corp",
        "confidence": 0.95,
        "source": "https://acme.com/about"
      },
      "industry": {
        "value": "Software",
        "confidence": 0.87,
        "source": "https://acme.com"
      }
    }
  }
]
```

---

### Workflow 2: Custom Field Enrichment

**Use Case**: Extract specific information not in preset fields

**Steps**:

#### 1. Upload CSV (same as Workflow 1)

#### 2. Add Custom Field

**Actions**:
1. Click "+ Add Custom Field"
2. Type natural language description
3. AI generates structured field
4. Review and add to selection

**Example**:

**Input**: "What is their main product or service?"

**AI Generates**:
```json
{
  "name": "mainProduct",
  "displayName": "Main Product",
  "description": "Primary product or service offering",
  "type": "string"
}
```

**More Examples**:

| User Input | Generated Field |
|------------|----------------|
| "Find the CEO's LinkedIn profile" | `ceoLinkedIn` (string) |
| "Number of customers" | `customerCount` (string) |
| "Recent news mentions" | `recentNews` (array) |
| "Main competitors" | `competitors` (array) |

#### 3. Combine Preset + Custom Fields

**Example Selection**:
```
Preset Fields:
✓ Company Name
✓ Industry

Custom Fields:
✓ Main Product
✓ CEO LinkedIn
✓ Recent News
```

#### 4. Enrich and Download (same as Workflow 1)

---

### Workflow 3: Large Dataset Processing

**Use Case**: Enrich 100+ rows (self-hosted only)

**Steps**:

#### 1. Enable Unlimited Mode

**Method 1: Environment Variable**:
```bash
# .env.local
FIRE_ENRICH_UNLIMITED=true
```

**Method 2: Development Mode**:
```bash
npm run dev
# Unlimited mode auto-enabled
```

**Verification**:
- UI shows "Unlimited Mode" badge
- No row limit warnings

#### 2. Upload Large CSV

**Prepare**:
- Split very large files (1000+ rows) into batches
- Ensure clean CSV format
- Remove duplicate emails

**Upload**:
- Same drag-and-drop interface
- Progress bar during upload
- Shows total row count

#### 3. Select Key Fields Only

**Recommendation**:
- Choose 3-5 most important fields
- More fields = slower processing
- Optimal: 5 fields for 100 rows

**Example**:
```
Selected Fields (5):
✓ Company Name
✓ Industry
✓ Employee Count
✓ Funding Stage
✓ Website
```

#### 4. Monitor Progress

**Concurrent Processing**:
- Default: 10 rows at a time
- Adjust in config if needed
- Total time: ~10-15 seconds per row

**Progress View**:
```
Processing 100 rows...

Completed: 45/100 (45%)
Current Batch:
├─ Row 46: Processing
├─ Row 47: Processing
├─ Row 48: Processing
├─ Row 49: Processing
└─ Row 50: Processing

Estimated time remaining: 8 minutes
```

#### 5. Handle Errors

**Skip Personal Emails**:
```
Row 12: Skipped (Personal email: john@gmail.com)
Row 23: Skipped (Personal email: sarah@yahoo.com)
```

**Retry Failed Rows**:
```
Row 37: Failed (Network error)
[Retry] button available
```

#### 6. Download Results

**Batch Download**:
- CSV with all completed rows
- JSON with detailed metadata
- Error report for failed rows

---

### Workflow 4: API Key Configuration

**Use Case**: First-time setup or changing API keys

**Method 1: Environment Variables** (Recommended)

**Steps**:
1. Create `.env.local` file
2. Add API keys:
   ```env
   FIRECRAWL_API_KEY=fc-...
   OPENAI_API_KEY=sk-...
   ```
3. Restart server: `npm run dev`

**Method 2: Browser Storage**

**Steps**:
1. Visit Fire Enrich
2. See "API Keys Required" message
3. Click "Enter API Keys"
4. Modal appears with two inputs:
   - Firecrawl API Key
   - OpenAI API Key
5. Keys saved to localStorage
6. Page reloads, ready to use

**Security Note**:
- Browser method stores keys client-side only
- Keys sent with each API request via headers
- Clear browser data = lose keys

**Verification**:
- Visit `/api/check-env`
- Should return:
  ```json
  {
    "firecrawl": true,
    "openai": true
  }
  ```

---

## User Interface Components

### CSV Upload Component

**Features**:
- Drag-and-drop zone
- Click to browse files
- File type validation
- Size limit validation
- Auto-detect email column
- Preview table (first 5 rows)

**States**:
1. **Empty**: "Drop CSV here"
2. **Hover**: "Release to upload"
3. **Uploading**: Progress spinner
4. **Success**: Preview table
5. **Error**: Error message with retry

### Field Selector Component

**Features**:
- Search/filter preset fields
- Category grouping (Company, Financial, Technical)
- Add custom field modal
- Selected count indicator
- Drag to reorder (future)

**Categories**:
- **Company Info**: Name, Industry, Headquarters
- **Financial**: Funding, Revenue, Valuation
- **People**: CEO, Founders, Team size
- **Technical**: Tech Stack, GitHub, APIs
- **Custom**: User-defined fields

### Enrichment Progress Component

**Features**:
- Overall progress bar
- Row-by-row status
- Agent activity log
- Real-time cell updates
- Confidence score badges
- Source URL hover tooltips

**Status Icons**:
- ⏸ Pending
- ⏳ Processing
- ✓ Completed
- ✗ Error
- ⊘ Skipped

### Results Table Component

**Features**:
- Sortable columns
- Filterable by confidence
- Expandable row details
- Source attribution
- Copy individual cells
- Export options

**Cell Display**:
```
[Value] (Confidence%)
└─ Hover: Shows source URL + snippet
```

**Example**:
```
ACME Corporation (95%)
Source: https://acme.com/about
Snippet: "ACME Corporation is a leading..."
```

---

## Common User Scenarios

### Scenario 1: Sales Team Prospecting

**Goal**: Enrich 50 leads with company size and funding

**Workflow**:
1. Export leads from CRM as CSV
2. Upload to Fire Enrich
3. Select fields:
   - Company Name
   - Industry
   - Employee Count
   - Funding Stage
4. Download enriched CSV
5. Import back to CRM

**Time**: ~10 minutes for 50 leads

### Scenario 2: Recruiter Sourcing

**Goal**: Find company details for candidate outreach

**Workflow**:
1. LinkedIn export with emails
2. Upload to Fire Enrich
3. Select fields:
   - Company Name
   - Industry
   - Tech Stack
   - Company Size
4. Use data for personalized outreach

**Time**: ~5 minutes for 25 candidates

### Scenario 3: Market Research

**Goal**: Build database of competitors

**Workflow**:
1. List competitor emails
2. Upload to Fire Enrich
3. Custom fields:
   - Main Product
   - Target Market
   - Pricing Model
   - Recent News
4. Export to spreadsheet for analysis

**Time**: ~15 minutes for 30 competitors

### Scenario 4: Investment Research

**Goal**: Screen potential portfolio companies

**Workflow**:
1. Collect founder emails
2. Upload to Fire Enrich
3. Select fields:
   - Company Name
   - Funding Stage
   - Total Raised
   - Investors
   - Valuation
4. Download and analyze

**Time**: ~20 minutes for 50 companies

---

## User Tips & Best Practices

### Maximize Accuracy

1. **Use Corporate Emails**: Personal emails (Gmail, Yahoo) are skipped
2. **Clean Data First**: Remove duplicates and invalid emails
3. **Review Confidence Scores**: High confidence (80%+) is reliable
4. **Check Sources**: Hover to see where data was found
5. **Start Small**: Test with 5-10 rows before large batches

### Optimize Performance

1. **Limit Fields**: 5-7 fields is optimal
2. **Batch Large Files**: Split 500+ rows into batches
3. **Peak vs Off-Peak**: Process during off-peak hours
4. **Monitor Progress**: Watch for errors early
5. **Save Incrementally**: Download results periodically

### Handle Edge Cases

**Personal Emails**:
- Automatically skipped
- Use corporate/work emails instead

**No Results Found**:
- Very new companies may lack online presence
- Try alternative email addresses
- Manually research if critical

**Low Confidence**:
- Scores < 50% need verification
- Check multiple sources
- Consider manual research

**API Errors**:
- Rate limit errors: Wait and retry
- Timeout errors: Reduce concurrent rows
- Invalid API keys: Check configuration

---

## Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate between elements
- **Enter**: Activate buttons/select fields
- **Escape**: Close modals/cancel actions
- **Arrow Keys**: Navigate table cells

### Screen Reader Support

- All form inputs have labels
- Progress updates announced
- Error messages read aloud
- Table headers properly marked

### Visual Accessibility

- High contrast mode support
- Confidence scores color-coded:
  - Green: High (80%+)
  - Yellow: Medium (50-80%)
  - Red: Low (<50%)
- Focus indicators on interactive elements

---

## Mobile Experience

### Responsive Design

- Mobile-optimized upload interface
- Collapsible field selector
- Horizontal scrollable table
- Touch-friendly controls

### Mobile Limitations

- Large CSVs may be slow
- Table viewing challenging on small screens
- Recommendation: Use desktop for 20+ rows

---

## Error Handling

### User-Facing Errors

**Upload Errors**:
- "File too large" → Reduce file size
- "Invalid format" → Check CSV structure
- "No email column" → Add email column

**Processing Errors**:
- "API key invalid" → Check configuration
- "Rate limit exceeded" → Wait or reduce concurrency
- "Network error" → Check connection and retry

**Data Errors**:
- "Personal email skipped" → Use corporate email
- "No results found" → Company may lack online presence
- "Low confidence" → Verify data manually

### Error Recovery

**Automatic Retry**:
- Network errors: 3 retries
- Timeout errors: 2 retries
- API errors: 1 retry

**Manual Retry**:
- Failed rows show "Retry" button
- Click to re-process specific row
- Maintains previous successful results

---

## Future User Features

### Planned Enhancements

1. **Save Templates**: Save field selections for reuse
2. **Scheduled Enrichment**: Periodic automatic enrichment
3. **Webhooks**: Get notified when processing completes
4. **Bulk Upload**: Drag multiple CSV files
5. **Data Validation**: Pre-enrichment data quality checks
6. **Export Formats**: Excel, Google Sheets integration
7. **Collaboration**: Share enriched datasets
8. **Version History**: Track changes over time

### Requested Features

1. Email verification before enrichment
2. LinkedIn profile enrichment
3. Industry-specific presets (e.g., "SaaS company enrichment")
4. Confidence threshold filtering
5. Duplicate detection and merging
6. Integration with popular CRMs
7. API access for programmatic enrichment
8. Batch processing queue management

---

## User Support

### Getting Help

**Documentation**:
- README.md: Quick start guide
- Specs folder: Detailed documentation
- GitHub Issues: Bug reports and feature requests

**Community**:
- GitHub Discussions: Q&A and sharing
- Discord (planned): Real-time chat support

### Reporting Issues

**Bug Report Template**:
1. What were you trying to do?
2. What happened instead?
3. Steps to reproduce
4. Screenshots (if applicable)
5. Browser/OS information

**Feature Request Template**:
1. What problem does this solve?
2. How would you use this feature?
3. Any examples from other tools?

---

## User Privacy

### Data Handling

- **CSV Files**: Processed client-side, not stored on server
- **Enriched Data**: Not persisted server-side
- **API Keys**: Stored in environment or browser localStorage
- **Logs**: May contain email addresses for debugging

### GDPR Compliance

- No personal data storage
- No tracking cookies
- User controls all data
- Export/delete capabilities

### Third-Party Data Sharing

Fire Enrich shares data with:
1. **Firecrawl**: Company domains for web scraping
2. **OpenAI/Gemini**: Text for LLM processing
3. **No one else**: No analytics, no advertising

**User Responsibility**:
- Ensure you have rights to enrich email data
- Comply with local privacy laws
- Obtain consent if required
