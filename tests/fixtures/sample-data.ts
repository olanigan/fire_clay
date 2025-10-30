/**
 * Test Fixtures - Sample data for testing
 */

import type { EnrichmentField } from '../../lib/types';

/**
 * Sample CSV rows
 */
export const sampleRows = [
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
];

/**
 * Sample enrichment fields
 */
export const sampleFields: EnrichmentField[] = [
  {
    name: 'companyName',
    displayName: 'Company Name',
    description: 'Official company name',
    type: 'string',
    required: false
  },
  {
    name: 'industry',
    displayName: 'Industry',
    description: 'Primary industry or sector',
    type: 'string',
    required: false
  },
  {
    name: 'employeeCount',
    displayName: 'Employee Count',
    description: 'Approximate number of employees',
    type: 'string',
    required: false
  },
  {
    name: 'fundingStage',
    displayName: 'Funding Stage',
    description: 'Current funding stage (Seed, Series A, B, C, etc.)',
    type: 'string',
    required: false
  }
];

/**
 * Extended field set for comprehensive testing
 */
export const extendedFields: EnrichmentField[] = [
  ...sampleFields,
  {
    name: 'website',
    displayName: 'Website',
    description: 'Company website URL',
    type: 'string',
    required: false
  },
  {
    name: 'headquarters',
    displayName: 'Headquarters',
    description: 'Headquarters location',
    type: 'string',
    required: false
  },
  {
    name: 'yearFounded',
    displayName: 'Year Founded',
    description: 'Year the company was founded',
    type: 'number',
    required: false
  },
  {
    name: 'techStack',
    displayName: 'Tech Stack',
    description: 'Technologies and tools used',
    type: 'string',
    required: false
  }
];

/**
 * Personal email (should be skipped)
 */
export const personalEmailRow = {
  email: 'user@gmail.com',
  name: 'Personal User'
};

/**
 * Invalid email
 */
export const invalidEmailRow = {
  email: 'not-an-email',
  name: 'Invalid User'
};
