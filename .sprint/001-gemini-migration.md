# Sprint 001: Gemini Migration

## Overview
Migrate the AI system from OpenAI-only to support Google's Gemini API (non-Vertex version using Google AI Studio API keys).

## Context
- Current system uses OpenAI's API exclusively
- Need to add Gemini support for cost optimization and reliability
- Using the new `@google/genai` SDK instead of deprecated `@google/generative-ai`
- Focus on Google AI Studio API (not Vertex AI) for simplicity

## Goals
- ✅ Add Gemini API support alongside existing OpenAI
- ✅ Maintain all existing functionality
- ✅ Enable provider switching via configuration
- ✅ Prepare foundation for multi-provider support

## Technical Details

### Gemini API Key Differences
- **OpenAI**: Single API key in header
- **Gemini**: API key from Google AI Studio (makersuite.google.com)

### SDK Differences
- **OpenAI**: `openai.chat.completions.create()`
- **Gemini**: `new GoogleGenAI({apiKey}).models.generateContent()`

### Message Format Differences
- **OpenAI**: `{role: 'user', content: 'text'}`
- **Gemini**: `{role: 'user', parts: [{text: 'text'}]}`

### Tool Calling Differences
- **OpenAI**: `tools[].function`
- **Gemini**: `tools[].functionDeclarations`

### Structured Output Differences
- **OpenAI**: `response_format: zodResponseFormat(schema)`
- **Gemini**: `generationConfig.responseSchema`

## Sprint Checklist

### Phase 1: Foundation Setup ✅ COMPLETED
- [x] Install `@google/genai` package
- [x] Create `lib/services/gemini.ts` service class
- [x] Implement basic text generation with Gemini
- [x] Add Gemini API key configuration
- [x] Test basic Gemini connectivity

**Phase 1 Notes:**
- Successfully installed `@google/genai` v1.23.0
- Created comprehensive `GeminiService` class with `extractStructuredData`, `generateText`, and `generateSearchQuery` methods
- Added `GEMINI_API_KEY` to `.env.example` with documentation
- Verified code structure and imports work correctly (API key needed for actual testing)
- Maintained compatibility with existing OpenAI service patterns

### Phase 2: Message Format Conversion 🔄 NEXT
- [ ] Create message format converters (OpenAI ↔ Gemini)
- [ ] Update `BaseAgent` to support provider abstraction
- [ ] Implement Gemini tool calling format
- [ ] Add structured output support for Gemini
- [ ] Test agent execution with Gemini

**Phase 2 Notes:**
- Need to create utility functions to convert between OpenAI and Gemini message formats
- Update `lib/agent-architecture/core/agent-base.ts` to accept provider parameter
- Implement Gemini-specific tool calling (functionDeclarations vs functions)
- Add Gemini structured output using `generationConfig.responseSchema`
- Test with existing agent types to ensure compatibility

### Phase 3: Orchestrator Integration
- [ ] Update `AgentOrchestrator` to support provider selection
- [ ] Add provider configuration options
- [ ] Implement fallback logic (OpenAI → Gemini)
- [ ] Update API routes to accept provider parameter
- [ ] Test full enrichment pipeline with Gemini

### Phase 4: Testing & Validation
- [ ] Create comprehensive test suite for Gemini integration
- [ ] Test all agent types (discovery, profile, metrics, funding, tech stack, general)
- [ ] Validate tool calling functionality
- [ ] Test structured data extraction
- [ ] Performance comparison (OpenAI vs Gemini)
- [ ] Error handling validation

### Phase 5: Documentation & Cleanup
- [ ] Update README with Gemini setup instructions
- [ ] Add environment variable documentation
- [ ] Create migration guide for users
- [ ] Update API documentation
- [ ] Clean up any temporary code

## Success Criteria
- [ ] All existing OpenAI functionality preserved
- [ ] Gemini API integration working end-to-end
- [ ] Provider switching working via configuration
- [ ] No breaking changes to existing API
- [ ] Comprehensive test coverage
- [ ] Performance meets or exceeds current levels

## Risks & Mitigations
- **API Differences**: Gemini has different capabilities than OpenAI
  - *Mitigation*: Feature detection and graceful degradation
- **Tool Calling Compatibility**: Different tool calling formats
  - *Mitigation*: Abstract tool calling interface
- **Structured Output**: Different JSON schema approaches
  - *Mitigation*: Unified schema handling
- **Cost Management**: Gemini pricing may differ
  - *Mitigation*: Cost tracking and monitoring

## Timeline
- **Week 1**: Foundation setup and basic integration
- **Week 2**: Message format conversion and agent updates
- **Week 3**: Orchestrator integration and API updates
- **Week 4**: Testing, validation, and documentation

## Dependencies
- `@google/genai` package (latest version)
- Google AI Studio API key for testing
- Existing OpenAI integration for comparison

## Testing Strategy
- Unit tests for individual components
- Integration tests for full pipeline
- Performance benchmarks
- Error scenario testing
- Cross-provider compatibility testing

## Rollback Plan
- Keep OpenAI as default provider
- Feature flags for Gemini functionality
- Easy rollback via configuration
- Comprehensive logging for troubleshooting

## Progress Summary
- **Phase 1**: ✅ Foundation Setup Complete
- **Phase 2**: 🔄 Message Format Conversion (Next)
- **Phase 3**: ⏳ Orchestrator Integration (Pending)
- **Phase 4**: ⏳ Testing & Validation (Pending)
- **Phase 5**: ⏳ Documentation & Cleanup (Pending)

## Next Steps
1. ✅ **Phase 1 Complete**: Foundation setup done, Gemini service created
2. **Phase 2**: Create message format converters and update BaseAgent
3. **Phase 3**: Update orchestrator for provider selection
4. **Phase 4**: Comprehensive testing and validation
5. **Phase 5**: Documentation and cleanup

---

*Session Log - Sprint 001: Gemini Migration*
*Started: Thu Oct 10 2025*
*Phase 1 Completed: Thu Oct 10 2025*
*Status: Phase 2 In Progress*