/**
 * Mock Gemini Service for Testing
 * Simulates Gemini API responses without making actual API calls
 */

import type { EnrichmentField, EnrichmentResult } from '../../lib/types';

export class MockGeminiService {
  private mockDelay: number;

  constructor(apiKey: string, mockDelay: number = 100) {
    this.mockDelay = mockDelay;
    console.log('[MockGemini] Initialized with mock delay:', mockDelay, 'ms');
  }

  /**
   * Simulate Gemini's extractStructuredData method
   */
  async extractStructuredData(
    content: string,
    fields: EnrichmentField[],
    context: Record<string, string>
  ): Promise<Record<string, EnrichmentResult>> {
    console.log('[MockGemini] Extracting data for fields:', fields.map(f => f.name).join(', '));

    // Simulate API delay
    await this.delay(this.mockDelay);

    // Parse company info from context
    const companyName = context.companyName || context.companyNameGuess || 'Test Company';
    const domain = context.targetDomain || context.domain || 'test.com';

    const results: Record<string, EnrichmentResult> = {};

    // Generate mock data for each field
    fields.forEach(field => {
      const mockData = this.generateMockData(field, companyName, domain, content);
      if (mockData) {
        results[field.name] = mockData;
      }
    });

    console.log('[MockGemini] Extracted', Object.keys(results).length, 'fields');
    return results;
  }

  /**
   * Generate realistic mock data based on field type
   */
  private generateMockData(
    field: EnrichmentField,
    companyName: string,
    domain: string,
    content: string
  ): EnrichmentResult | null {
    const fieldName = field.name.toLowerCase();

    // Company Name
    if (fieldName.includes('company') && fieldName.includes('name')) {
      return {
        field: field.name,
        value: companyName,
        confidence: 0.95,
        source: `https://${domain}/about`,
        sourceContext: [
          {
            url: `https://${domain}/about`,
            snippet: `${companyName} is a leading technology company providing innovative solutions.`
          }
        ]
      };
    }

    // Industry
    if (fieldName.includes('industry')) {
      const industries = ['Technology', 'Software', 'SaaS', 'E-commerce', 'Finance', 'Healthcare'];
      const industry = industries[Math.floor(Math.random() * industries.length)];
      return {
        field: field.name,
        value: industry,
        confidence: 0.87,
        source: `https://${domain}`,
        sourceContext: [
          {
            url: `https://${domain}`,
            snippet: `We are a ${industry} company focused on innovation and growth.`
          }
        ]
      };
    }

    // Website
    if (fieldName.includes('website')) {
      return {
        field: field.name,
        value: `https://${domain}`,
        confidence: 0.99,
        source: `https://${domain}`,
        sourceContext: [
          {
            url: `https://${domain}`,
            snippet: `Visit our official website at https://${domain}`
          }
        ]
      };
    }

    // Description
    if (fieldName.includes('description')) {
      return {
        field: field.name,
        value: `${companyName} is an innovative company delivering cutting-edge solutions to customers worldwide.`,
        confidence: 0.82,
        source: `https://${domain}/about`,
        sourceContext: [
          {
            url: `https://${domain}/about`,
            snippet: `${companyName} is an innovative company delivering cutting-edge solutions to customers worldwide.`
          }
        ]
      };
    }

    // Employee Count
    if (fieldName.includes('employee')) {
      const ranges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000'];
      const count = ranges[Math.floor(Math.random() * ranges.length)];
      return {
        field: field.name,
        value: count,
        confidence: 0.75,
        source: `https://linkedin.com/company/${domain.split('.')[0]}`,
        sourceContext: [
          {
            url: `https://linkedin.com/company/${domain.split('.')[0]}`,
            snippet: `${companyName} has ${count} employees across multiple locations.`
          }
        ]
      };
    }

    // Funding Stage
    if (fieldName.includes('funding')) {
      const stages = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Private Equity'];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      return {
        field: field.name,
        value: stage,
        confidence: 0.80,
        source: `https://crunchbase.com/organization/${domain.split('.')[0]}`,
        sourceContext: [
          {
            url: `https://crunchbase.com/organization/${domain.split('.')[0]}`,
            snippet: `${companyName} raised ${stage} funding to expand operations.`
          }
        ]
      };
    }

    // Headquarters
    if (fieldName.includes('headquarter') || fieldName.includes('location')) {
      const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'];
      const location = locations[Math.floor(Math.random() * locations.length)];
      return {
        field: field.name,
        value: location,
        confidence: 0.88,
        source: `https://${domain}/contact`,
        sourceContext: [
          {
            url: `https://${domain}/contact`,
            snippet: `Our headquarters is located in ${location}.`
          }
        ]
      };
    }

    // Year Founded
    if (fieldName.includes('founded') || fieldName.includes('year')) {
      const year = 2010 + Math.floor(Math.random() * 15);
      return {
        field: field.name,
        value: year,
        confidence: 0.85,
        source: `https://${domain}/about`,
        sourceContext: [
          {
            url: `https://${domain}/about`,
            snippet: `${companyName} was founded in ${year}.`
          }
        ]
      };
    }

    // Tech Stack
    if (fieldName.includes('tech') && fieldName.includes('stack')) {
      const techStacks = [
        ['React', 'Node.js', 'PostgreSQL'],
        ['Python', 'Django', 'Redis'],
        ['Vue.js', 'Express', 'MongoDB'],
        ['Angular', 'Java', 'MySQL']
      ];
      const stack = techStacks[Math.floor(Math.random() * techStacks.length)];
      return {
        field: field.name,
        value: stack.join(', '),
        confidence: 0.70,
        source: `https://github.com/${domain.split('.')[0]}`,
        sourceContext: [
          {
            url: `https://github.com/${domain.split('.')[0]}`,
            snippet: `Our tech stack includes ${stack.join(', ')}.`
          }
        ]
      };
    }

    // CEO
    if (fieldName.includes('ceo')) {
      const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller'];
      const ceo = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      return {
        field: field.name,
        value: ceo,
        confidence: 0.78,
        source: `https://${domain}/leadership`,
        sourceContext: [
          {
            url: `https://${domain}/leadership`,
            snippet: `${ceo} serves as CEO of ${companyName}.`
          }
        ]
      };
    }

    // Revenue
    if (fieldName.includes('revenue')) {
      const revenues = ['$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M', '$100M+'];
      const revenue = revenues[Math.floor(Math.random() * revenues.length)];
      return {
        field: field.name,
        value: revenue,
        confidence: 0.65,
        source: `https://crunchbase.com/organization/${domain.split('.')[0]}`,
        sourceContext: [
          {
            url: `https://crunchbase.com/organization/${domain.split('.')[0]}`,
            snippet: `${companyName} reports annual revenue of ${revenue}.`
          }
        ]
      };
    }

    // Default: return null for unknown fields
    console.log(`[MockGemini] No mock data generator for field: ${field.name}`);
    return null;
  }

  /**
   * Simulate generateText method
   */
  async generateText(
    prompt: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    await this.delay(this.mockDelay);
    return 'Mock generated text response';
  }

  /**
   * Simulate generateSearchQuery method
   */
  async generateSearchQuery(
    question: string,
    context?: Record<string, unknown>
  ): Promise<string> {
    await this.delay(this.mockDelay / 2);
    return `${question} ${context?.companyName || ''}`.trim();
  }

  /**
   * Simulate extractStructuredDataWithCorroboration (OpenAI method)
   * For compatibility with orchestrator
   */
  async extractStructuredDataWithCorroboration(
    content: string,
    fields: EnrichmentField[],
    context: Record<string, string>,
    onMessage?: (message: string, type: 'info' | 'success' | 'warning' | 'agent', sourceUrl?: string) => void
  ): Promise<Record<string, EnrichmentResult>> {
    // Just call the main method
    return this.extractStructuredData(content, fields, context);
  }

  /**
   * Utility: Simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
