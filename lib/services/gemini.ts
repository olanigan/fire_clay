import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import type { EnrichmentField, EnrichmentResult } from '../types';

export class GeminiService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  createEnrichmentSchema(fields: EnrichmentField[]) {
    // Create JSON schema for Gemini instead of Zod schema
    const properties: Record<string, any> = {};

    fields.forEach(field => {
      let fieldSchema: any;

      switch (field.type) {
        case 'string':
          fieldSchema = { type: 'string' };
          break;
        case 'number':
          fieldSchema = { type: 'number' };
          break;
        case 'boolean':
          fieldSchema = { type: 'boolean' };
          break;
        case 'array':
          fieldSchema = {
            type: 'array',
            items: { type: 'string' }
          };
          break;
        default:
          fieldSchema = { type: 'string' };
      }

      // For optional fields, we still include them but they can be null
      properties[field.name] = fieldSchema;
    });

    // Add confidence scores and source evidence for each field
    fields.forEach(field => {
      properties[`${field.name}_confidence`] = {
        type: 'number',
        minimum: 0,
        maximum: 1
      };
      // Each field can have multiple sources with their own quotes
      properties[`${field.name}_sources`] = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            quote: { type: 'string' }
          },
          required: ['url', 'quote']
        },
        nullable: true
      };
    });

    return {
      type: 'object',
      properties,
      required: [] // Make all fields optional since we want to extract what's available
    };
  }

  async extractStructuredData(
    content: string,
    fields: EnrichmentField[],
    context: Record<string, string>
  ): Promise<Record<string, EnrichmentResult>> {
    try {
      const schema = this.createEnrichmentSchema(fields);
      const fieldDescriptions = fields
        .map(f => `- ${f.name}: ${f.description}`)
        .join('\n');

      // Format context to emphasize company identity
      const contextInfo = Object.entries(context)
        .map(([key, value]) => {
          if (key === 'targetDomain' && value) {
            return `Company Domain: ${value} (if you see content from this domain, it's likely the target company)`;
          }
          if (key === 'name' || key === '_parsed_name') {
            return `Person Name: ${value}`;
          }
          return `${key}: ${value}`;
        })
        .filter(line => !line.includes('undefined'))
        .join('\n');

       // Trim content to prevent token overflow
       const MAX_CONTENT_CHARS = 400000; // Conservative limit for Gemini models
       let trimmedContent = content;
       if (content.length > MAX_CONTENT_CHARS) {
         console.log(`[GEMINI] Content too long (${content.length} chars), trimming to ${MAX_CONTENT_CHARS} chars`);
         trimmedContent = content.substring(0, MAX_CONTENT_CHARS) + '\n\n[Content truncated due to length...]';
       }

       const prompt = `You are an expert data extractor. Extract the requested information from the provided content with high accuracy.

**CRITICAL RULE**: You MUST ONLY extract information that is EXPLICITLY STATED in the provided content. DO NOT make up, guess, or infer any values. If the information is not clearly present in the text, you MUST return null.

**IMPORTANT**: If a Person Name is provided in the context, you should:
1. Look for information about THAT SPECIFIC PERSON's current company/employer
2. Extract information about the company where this person currently works
3. Do NOT extract information about other companies mentioned unless they are the person's current employer

For each field, you must provide:
1. The extracted value (or null if not found)
2. A confidence score between 0 and 1
3. A sources array - an array of objects, each containing:
   - url: The URL where you found this information (from "URL:" in content)
   - quote: The EXACT text from THAT SPECIFIC source about this field (NOT shared across sources)

Confidence scores:
- 1.0: Information is explicitly stated with exact values/text in the provided content
- 0.8-0.9: Information is clearly present with minor inference needed
- 0.5-0.7: Information requires some interpretation but is based on actual content
- 0.3-0.4: Information is unclear or contradictory
- 0.0-0.2: Information is NOT FOUND in the content

**MANDATORY**:
1. If you cannot find the specific information, return null for that field
2. Set confidence to 0.0 if not found
3. For the sources array, include EACH source that mentions the information
4. IMPORTANT: Each source must have its OWN unique quote from that specific URL - extract the actual text from each source
5. CRITICAL: Only use URLs that are explicitly listed in the content after "URL:" - do NOT create or modify URLs

**EXAMPLE**:
If you're looking for info about "Example Corp" and the content contains:
"URL: techcrunch.com ... Example Corp has grown to 150 employees this year..."
"URL: forbes.com ... The company Example Corp now employs 150 people..."
"URL: seekcompany.com ... Seek offers AI for data analytics with 200 employees..."

For Example Corp's employee count, you would return:
{
 "employeeCount": 150,
 "employeeCount_confidence": 1.0,
 "employeeCount_sources": [
   {"url": "techcrunch.com", "quote": "Example Corp has grown to 150 employees this year"},
   {"url": "forbes.com", "quote": "The company Example Corp now employs 150 people"}
 ]
}

**ACCEPTABLE VARIATIONS**:
If looking for "Seek AI" and find:
- "Seek offers AI for data" from seek.ai domain → This IS the same company
- "Seek has 200 employees" from seek.ai → This IS valid

**WRONG EXAMPLE**:
If looking for "Example Corp" but finding "Microsoft has 200,000 employees":
- Value: null (because Microsoft is clearly a different company)
- Confidence: 0.0
- Source quote: null
- Source URLs: null

**CRITICAL**: Use domain names and context to verify if it's the same company. Be smart about name variations.

**TARGET ENTITY - IMPORTANT**: You are ONLY extracting information about:
${contextInfo}

**CRITICAL**:
- Only extract information about the TARGET ENTITY listed above
- Company name variations are OK (e.g., "Seek AI" vs "Seek", "OpenAI" vs "Open AI")
- Look for domain matches (e.g., if searching for "Seek AI" and you see content from seek.ai, that's likely the same company)
- Common variations to accept:
  - With/without "Inc", "Corp", "LLC", "Ltd"
  - With/without spaces in compound names
  - With/without industry descriptors ("AI", "Software", etc.)
- Use proper capitalization for known companies (e.g., "OneTrust" not "onetrust", "Scale AI" not "scale")
- Always capitalize industry names properly (e.g., "Technology", "Healthcare", "E-commerce", "Finance")
- If you find information about CLEARLY DIFFERENT companies, IGNORE IT

Fields to extract for the TARGET ENTITY ONLY:
${fieldDescriptions}

ADDITIONAL GUIDELINES:
1. Employee Count: Must be explicitly stated. Look for phrases like "X employees", "team of X", "X people". If not found, return null.
2. Funding Stage: Must be explicitly mentioned (e.g., "raised Series A", "seed funding"). If not found, return null.
3. Revenue: Must be explicitly stated with numbers. If not found, return null.
4. Year Founded: Must be explicitly mentioned (e.g., "founded in X", "established X"). If not found, return null.
5. DO NOT use general knowledge or make educated guesses.
6. DO NOT fill in values based on what seems likely.
7. ONLY extract what is ACTUALLY WRITTEN in the provided content.
8. When multiple sources mention the same field, extract the ACTUAL QUOTE from EACH source - do not copy the same quote to multiple sources.

REMEMBER: It is better to return null than to guess or make up information.

CRITICAL FOR SOURCES: Each URL in the content has its own unique text. When you find information in multiple sources:
- Go to each URL section in the content
- Find the EXACT sentence/phrase from THAT specific URL
- Do NOT reuse quotes across different URLs
- Each source should have its own unique quote as it appears in that source

DOMAIN PARKING/SALE PAGES:
- If you see content about "domain for sale", "buy this domain", "make an offer", "checkout the full domain details", etc., this is NOT valid company information
- Domain parking pages are NOT legitimate sources - return null for all fields if only parking pages are found
- Look for actual company websites with real business information

${trimmedContent}`;

      const result = await this.client.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response content');
      }

      const parsed = JSON.parse(text);

      // Transform the flat structure into EnrichmentResult format
      const results: Record<string, EnrichmentResult> = {};

      fields.forEach(field => {
        let value = parsed[field.name];
        let confidence = parsed[`${field.name}_confidence`] as number;
        const sourcesWithQuotes = parsed[`${field.name}_sources`] as Array<{url: string, quote: string}> | null;

        // Filter out invalid placeholder values
        if (value === '/' || value === '-' || value === 'N/A' || value === 'n/a') {
          value = null;
        }

        // Post-processing validation for specific fields
        if (value !== null && value !== undefined) {
          // Employee count validation
          if ((field.name === 'employeeCount' || field.displayName === 'Employee Count') && typeof value === 'number') {
            if (value > 1000000) {
              // Likely a parsing error (e.g., "500+" interpreted as 500,000)
              console.warn(`Unrealistic employee count detected: ${value}. Reducing confidence.`);
              confidence = Math.min(confidence, 0.3);
            }
          }

          // Year founded validation
          if ((field.name === 'yearFounded' || field.displayName === 'Year Founded') && typeof value === 'number') {
            const currentYear = new Date().getFullYear();
            if (value < 1800 || value > currentYear) {
              confidence = Math.min(confidence, 0.2);
            }
          }

          // Funding stage normalization
          if ((field.name === 'fundingStage' || field.displayName === 'Funding Stage') && typeof value === 'string') {
            // Normalize funding stage values
            const normalized = value.toLowerCase();
            if (normalized.includes('seed') && !normalized.includes('pre')) {
              value = 'Seed';
            } else if (normalized.includes('pre-seed') || normalized.includes('preseed')) {
              value = 'Pre-seed';
            } else if (normalized.match(/series\s*[a-e]/i)) {
              const series = normalized.match(/series\s*([a-e])/i)?.[1]?.toUpperCase();
              if (series) value = `Series ${series}`;
            }
          }
        }

        // Only include results with actual data found (confidence > 0.3)
        // This prevents hallucinated data from being shown
        if (value !== null && value !== undefined && confidence > 0.3) {
          results[field.name] = {
            field: field.name,
            value,
            confidence,
            source: sourcesWithQuotes ? sourcesWithQuotes.map(s => s.url).join(', ') : 'structured_extraction',
            sourceContext: sourcesWithQuotes ? sourcesWithQuotes.map(s => ({
              url: s.url,
              snippet: s.quote
            })) : undefined,
            // Don't set sourceCount here - let the UI count actual sources after filtering
          };
        }
      });

      return results;
    } catch (error) {
      console.error('Gemini extraction error:', error);
      throw new Error('Failed to extract structured data');
    }
  }

  async generateText(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    try {
      const result = await this.client.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 1000,
        },
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      return text?.trim() || '';
    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw new Error('Failed to generate text');
    }
  }

  async generateSearchQuery(question: string, context?: Record<string, unknown>): Promise<string> {
    try {
      const conversationHistory = (context?.conversationHistory as Array<{ role: string; content: string }>) || [];
      const currentDate = new Date().toISOString().split('T')[0];

      let prompt = `You are a search query optimizer. Convert natural language questions into effective search queries.

**Current date: ${currentDate}**

If the question is about recent/current data (funding, metrics, etc.), include the current year (${new Date().getFullYear()}) in the search query to get the most up-to-date results.

If the question references previous context (like "when was that"), use the conversation history to understand what the user is asking about.

Return ONLY the search query, nothing else.`;

      if (conversationHistory.length > 0) {
        prompt += `\n\nPrevious conversation:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
      }

      prompt += `\n\nQuestion: ${question}\n\nContext: ${JSON.stringify(context || {})}\n\nGenerate the best search query:`;

      const result = await this.client.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      return text?.trim() || question;
    } catch (error) {
      console.error('Gemini search query generation error:', error);
      return question;
    }
  }
}