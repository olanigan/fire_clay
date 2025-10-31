# Gemini Integration - Quick Testing Guide

## Overview

Fire Enrich now supports **Google Gemini** as an alternative to OpenAI for LLM operations! This guide shows you how to quickly test Gemini integration.

## Setup (2 minutes)

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

### Step 2: Configure Environment

Add to your `.env.local` file:

```bash
# Google Gemini API Key
GEMINI_API_KEY=your-actual-gemini-api-key-here

# Enable Gemini
USE_GEMINI=true

# Keep existing keys
FIRECRAWL_API_KEY=fc-...
OPENAI_API_KEY=sk-...  # Optional when using Gemini
```

### Step 3: Restart Server

```bash
npm run dev
```

## Verify It's Working

### Check Logs

When you start the server and run an enrichment, you should see:

```
[AgentEnrichmentStrategy] Using Gemini service
[Orchestrator] Initialized with GEMINI provider
[STRATEGY] Using AgentEnrichmentStrategy with GEMINI provider
```

### Test Enrichment

1. Upload a small CSV with 2-3 rows
2. Select 2-3 fields (e.g., Company Name, Industry)
3. Click "Enrich Data"
4. Watch the console logs for Gemini-specific messages

## What Changed

### Quick Implementation (Phase 2-Lite)

We implemented a **minimal, fast path** to test Gemini without full provider abstraction:

1. **Config Flag**: `USE_GEMINI=true` switches to Gemini
2. **Orchestrator**: Accepts either `OpenAIService` or `GeminiService`
3. **Strategy**: Auto-selects service based on config
4. **API Route**: Checks for Gemini API key and passes it through

### Files Modified

- `lib/config/gemini.ts` - **NEW**: Gemini configuration
- `lib/agent-architecture/orchestrator.ts` - Accept both services
- `lib/strategies/agent-enrichment-strategy.ts` - Auto-select service
- `app/api/enrich/route.ts` - Support Gemini API key
- `.env.example` - Document USE_GEMINI flag

## Comparison: OpenAI vs Gemini

| Feature | OpenAI GPT-4 | Gemini 2.0 Flash |
|---------|--------------|------------------|
| **Model** | gpt-5 | gemini-2.0-flash-exp |
| **Speed** | ~2-5s per request | ~1-3s per request ⚡ |
| **Cost** | ~$0.01-0.03 per enrichment | ~$0.001-0.005 per enrichment 💰 |
| **Context Window** | 128k tokens | 1M tokens 🚀 |
| **Structured Output** | Native (Zod) | JSON Schema |
| **Rate Limits** | Tier-based | Generous free tier |

## Testing Checklist

- [ ] Gemini API key configured in `.env.local`
- [ ] `USE_GEMINI=true` set
- [ ] Server restarted (`npm run dev`)
- [ ] Logs show "Using Gemini service"
- [ ] Test enrichment with 2-3 rows
- [ ] Results populate correctly
- [ ] Confidence scores appear
- [ ] Source URLs are accurate

## Troubleshooting

### "Missing Gemini API key"

**Fix**: Check that `GEMINI_API_KEY` is set in `.env.local`

```bash
# Verify it's loaded
node -e "console.log(process.env.GEMINI_API_KEY)"
```

### Still using OpenAI

**Fix**: Verify `USE_GEMINI=true`

```bash
# Check the flag
node -e "console.log(process.env.USE_GEMINI)"
```

### "No response content" error

**Fix**: This usually means the Gemini API key is invalid

1. Regenerate key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Update `.env.local`
3. Restart server

## Switch Back to OpenAI

Simply change the flag:

```bash
USE_GEMINI=false  # or remove the line entirely
```

Then restart the server.

## Performance Testing

To compare OpenAI vs Gemini performance:

### Test 1: Same CSV, Different Providers

1. Run enrichment with OpenAI (note time)
2. Switch to Gemini
3. Run same enrichment (note time)
4. Compare results and speed

### Test 2: Accuracy Comparison

1. Pick 5-10 companies you know well
2. Run enrichment with both providers
3. Compare:
   - Data accuracy
   - Confidence scores
   - Source quality

## Known Limitations

### Current Implementation

✅ **Works**:
- All enrichment fields
- All 6 specialized agents
- Confidence scores
- Source attribution
- Real-time streaming

⚠️ **Not Yet Implemented**:
- Full provider abstraction (coming in Phase 2)
- Per-agent provider selection
- Provider fallback mechanism
- Mixed OpenAI/Gemini usage

## Next Steps

### Quick Wins

1. **Test with real data**: Run 50-100 rows
2. **Compare costs**: Check API usage on both dashboards
3. **Measure accuracy**: Validate enrichment quality
4. **Report issues**: Share findings for improvement

### Phase 2 (Full Implementation)

The current implementation is a **quick test version**. Full Phase 2 includes:

- Provider abstraction interface
- Message format converters
- Per-agent provider configuration
- Automatic fallback on errors
- A/B testing framework

See `specs/` folder for full Phase 2 plan.

## API Usage Monitoring

### OpenAI Dashboard

- Visit: [platform.openai.com/usage](https://platform.openai.com/usage)
- Check: Daily token usage and costs

### Gemini Dashboard

- Visit: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Check: Request counts and quotas

## Feedback

Please report your testing results:

- **Accuracy**: How do results compare to OpenAI?
- **Speed**: Faster, slower, or about the same?
- **Errors**: Any issues or unexpected behavior?
- **Cost**: Actual API costs from both providers

## Quick Reference

### Enable Gemini

```bash
# .env.local
USE_GEMINI=true
GEMINI_API_KEY=your-key-here
```

### Disable Gemini (back to OpenAI)

```bash
# .env.local
USE_GEMINI=false
# or just remove the line
```

### Check Active Provider

```bash
# Server logs will show:
[AgentEnrichmentStrategy] Using Gemini service
# or
[AgentEnrichmentStrategy] Using OpenAI service
```

---

**Happy Testing! 🚀**

For questions or issues, check the main README or create a GitHub issue.
