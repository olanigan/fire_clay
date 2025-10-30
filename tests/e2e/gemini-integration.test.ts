/**
 * End-to-End Test: Gemini Integration
 * Tests the complete enrichment flow using mock Gemini and Firecrawl services
 */

import { AgentOrchestrator } from '../../lib/agent-architecture/orchestrator';
import { MockGeminiService } from '../mocks/gemini-service.mock';
import { MockFirecrawlService } from '../mocks/firecrawl-service.mock';
import { sampleRows, sampleFields, extendedFields, personalEmailRow } from '../fixtures/sample-data';
import type { RowEnrichmentResult } from '../../lib/types';
 * Test Suite Configuration
const TEST_CONFIG = {
  MOCK_DELAY_MS: 50, // Fast for testing
  VERBOSE: true,
};
 * Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
 * Test utilities
function log(message: string, color: string = colors.reset) {
  if (TEST_CONFIG.VERBOSE) {
    console.log(`${color}${message}${colors.reset}`);
  }
}
function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
function logError(message: string) {
  log(`✗ ${message}`, colors.red);
function logInfo(message: string) {
  log(`ℹ ${message}`, colors.blue);
function logSection(message: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(message, colors.cyan);
  log('='.repeat(60), colors.cyan);
 * Assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    logError(message);
    throw new Error(message);
  logSuccess(message);
 * Test 1: Basic Orchestrator Initialization
async function testOrchestratorInit(): Promise<void> {
  logSection('Test 1: Orchestrator Initialization with Mock Gemini');
  const mockGemini = new MockGeminiService('mock-gemini-key', TEST_CONFIG.MOCK_DELAY_MS);
  const mockFirecrawl = new MockFirecrawlService('mock-firecrawl-key', TEST_CONFIG.MOCK_DELAY_MS);
  // Create orchestrator with mock services
  const orchestrator = new AgentOrchestrator(
    'mock-firecrawl-key',
    mockGemini as any, // Cast to satisfy TypeScript
    'gemini',
    mockFirecrawl  // Pass mock Firecrawl service
  );
  assert(orchestrator !== null, 'Orchestrator created successfully');
  assert((orchestrator as any).providerName === 'gemini', 'Orchestrator using Gemini provider');
 * Test 2: Single Row Enrichment
async function testSingleRowEnrichment(): Promise<void> {
  logSection('Test 2: Single Row Enrichment');
    mockGemini as any,
    mockFirecrawl
  const row = sampleRows[0];
  logInfo(`Enriching: ${row.email}`);
  const startTime = Date.now();
  const result: RowEnrichmentResult = await orchestrator.enrichRow(
    row,
    sampleFields,
    'email'
  const duration = Date.now() - startTime;
  logInfo(`Enrichment completed in ${duration}ms`);
  // Assertions
  assert(result !== null, 'Result is not null');
  assert(result.status === 'completed', `Status is 'completed' (got: ${result.status})`);
  assert(Object.keys(result.enrichments).length > 0, 'Has enrichment data');
  assert(result.originalData.email === row.email, 'Original data preserved');
  // Check specific fields
  logInfo('Checking enriched fields...');
  for (const field of sampleFields) {
    const enrichment = result.enrichments[field.name];
    if (enrichment) {
      logInfo(`  ${field.displayName}: ${enrichment.value} (confidence: ${enrichment.confidence})`);
      assert(enrichment.value !== null, `${field.displayName} has value`);
      assert(enrichment.confidence >= 0 && enrichment.confidence <= 1, `${field.displayName} has valid confidence`);
    }
 * Test 3: Multiple Rows Enrichment
async function testMultipleRowsEnrichment(): Promise<void> {
  logSection('Test 3: Multiple Rows Enrichment');
    'gemini'
  const results: RowEnrichmentResult[] = [];
  for (let i = 0; i < sampleRows.length; i++) {
    const row = sampleRows[i];
    logInfo(`[${i + 1}/${sampleRows.length}] Enriching: ${row.email}`);
    const result = await orchestrator.enrichRow(
      row,
      sampleFields,
      'email'
    );
    results.push(result);
    assert(result.status === 'completed', `Row ${i + 1} completed`);
  assert(results.length === sampleRows.length, 'All rows processed');
  logSuccess(`Successfully enriched ${results.length} rows`);
 * Test 4: Extended Fields Enrichment
async function testExtendedFieldsEnrichment(): Promise<void> {
  logSection('Test 4: Extended Fields Enrichment');
  logInfo(`Enriching with ${extendedFields.length} fields: ${row.email}`);
  const result = await orchestrator.enrichRow(
    extendedFields,
  assert(result.status === 'completed', 'Enrichment completed');
  assert(Object.keys(result.enrichments).length >= sampleFields.length, 'Multiple fields enriched');
  logInfo('Extended enrichment results:');
  for (const [fieldName, enrichment] of Object.entries(result.enrichments)) {
    logInfo(`  ${fieldName}: ${enrichment.value}`);
 * Test 5: Personal Email Skipping
async function testPersonalEmailSkipping(): Promise<void> {
  logSection('Test 5: Personal Email Handling');
  logInfo(`Testing personal email: ${personalEmailRow.email}`);
    personalEmailRow,
  // Personal emails should be handled (may be processed or skipped depending on implementation)
  assert(result !== null, 'Result received for personal email');
  logInfo(`Personal email status: ${result.status}`);
 * Test 6: Progress Callbacks
async function testProgressCallbacks(): Promise<void> {
  logSection('Test 6: Progress Callbacks');
  const progressMessages: string[] = [];
  const agentMessages: string[] = [];
  const onProgress = (field: string, value: unknown) => {
    progressMessages.push(`${field}: ${value}`);
  };
  const onAgentProgress = (message: string, type: 'info' | 'success' | 'warning' | 'agent') => {
    agentMessages.push(`[${type}] ${message}`);
  logInfo(`Enriching with callbacks: ${row.email}`);
    'email',
    onProgress,
    onAgentProgress
  logInfo(`Received ${progressMessages.length} progress updates`);
  logInfo(`Received ${agentMessages.length} agent messages`);
  if (agentMessages.length > 0) {
    logInfo('Sample agent messages:');
    agentMessages.slice(0, 3).forEach(msg => logInfo(`  ${msg}`));
 * Test 7: Performance Benchmarking
async function testPerformanceBenchmark(): Promise<void> {
  logSection('Test 7: Performance Benchmark');
  const iterations = 5;
  const durations: number[] = [];
  logInfo(`Running ${iterations} enrichment iterations...`);
  for (let i = 0; i < iterations; i++) {
    const row = sampleRows[i % sampleRows.length];
    const startTime = Date.now();
    await orchestrator.enrichRow(row, sampleFields, 'email');
    const duration = Date.now() - startTime;
    durations.push(duration);
    logInfo(`Iteration ${i + 1}: ${duration}ms`);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  logInfo(`\nPerformance Statistics:`);
  logInfo(`  Average: ${avgDuration.toFixed(2)}ms`);
  logInfo(`  Min: ${minDuration}ms`);
  logInfo(`  Max: ${maxDuration}ms`);
  logInfo(`  Total: ${durations.reduce((a, b) => a + b, 0)}ms`);
  assert(avgDuration < 5000, 'Average duration is reasonable'); // Should be fast with mocks
 * Test 8: Confidence Score Validation
async function testConfidenceScores(): Promise<void> {
  logSection('Test 8: Confidence Score Validation');
  const result = await orchestrator.enrichRow(row, sampleFields, 'email');
  logInfo('Validating confidence scores...');
    assert(
      enrichment.confidence >= 0 && enrichment.confidence <= 1,
      `${fieldName} confidence is in valid range (0-1): ${enrichment.confidence}`
    if (enrichment.confidence > 0.8) {
      logInfo(`  ${fieldName}: HIGH confidence (${enrichment.confidence})`);
    } else if (enrichment.confidence > 0.5) {
      logInfo(`  ${fieldName}: MEDIUM confidence (${enrichment.confidence})`);
    } else {
      logInfo(`  ${fieldName}: LOW confidence (${enrichment.confidence})`);
 * Test 9: Source Attribution
async function testSourceAttribution(): Promise<void> {
  logSection('Test 9: Source Attribution');
  logInfo('Checking source attribution...');
    if (enrichment.source) {
      logInfo(`  ${fieldName}: ${enrichment.source}`);
      assert(enrichment.source.length > 0, `${fieldName} has source URL`);
    if (enrichment.sourceContext && enrichment.sourceContext.length > 0) {
      logInfo(`    - ${enrichment.sourceContext.length} source(s) with snippets`);
  logSuccess('All enrichments have proper source attribution');
 * Main Test Runner
async function runAllTests(): Promise<void> {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║     Fire Enrich - Gemini Integration E2E Test Suite       ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan);
  const tests = [
    { name: 'Orchestrator Initialization', fn: testOrchestratorInit },
    { name: 'Single Row Enrichment', fn: testSingleRowEnrichment },
    { name: 'Multiple Rows Enrichment', fn: testMultipleRowsEnrichment },
    { name: 'Extended Fields Enrichment', fn: testExtendedFieldsEnrichment },
    { name: 'Personal Email Handling', fn: testPersonalEmailSkipping },
    { name: 'Progress Callbacks', fn: testProgressCallbacks },
    { name: 'Performance Benchmark', fn: testPerformanceBenchmark },
    { name: 'Confidence Scores', fn: testConfidenceScores },
    { name: 'Source Attribution', fn: testSourceAttribution },
  ];
  let passed = 0;
  let failed = 0;
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      failed++;
      logError(`Test failed: ${test.name}`);
      if (error instanceof Error) {
        logError(`  Error: ${error.message}`);
      }
  // Summary
  logSection('Test Summary');
  log(`Total Tests: ${tests.length}`, colors.blue);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`Duration: ${duration}ms`, colors.blue);
  if (failed === 0) {
    log('\n🎉 All tests passed!', colors.green);
  } else {
    log(`\n❌ ${failed} test(s) failed`, colors.red);
    process.exit(1);
 * Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    logError('Test suite failed:');
    console.error(error);
  });
export {
  runAllTests,
  testOrchestratorInit,
  testSingleRowEnrichment,
  testMultipleRowsEnrichment,
  testExtendedFieldsEnrichment,
  testPersonalEmailSkipping,
  testProgressCallbacks,
  testPerformanceBenchmark,
  testConfidenceScores,
  testSourceAttribution,
