/**
 * Mock Firecrawl Service for Testing
 * Simulates Firecrawl API responses without making actual API calls
 */

export class MockFirecrawlService {
  private mockDelay: number;

  constructor(apiKey: string, mockDelay: number = 150) {
    this.mockDelay = mockDelay;
    console.log('[MockFirecrawl] Initialized with mock delay:', mockDelay, 'ms');
  }

  /**
   * Simulate search method
   */
  async search(query: string, options?: { limit?: number }): Promise<any[]> {
    console.log('[MockFirecrawl] Searching for:', query);
    await this.delay(this.mockDelay);

    const limit = options?.limit || 5;
    const results = [];

    // Extract company name from query
    const companyMatch = query.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const companyName = companyMatch ? companyMatch[0] : 'TestCompany';
    const domain = companyName.toLowerCase().replace(/\s+/g, '') + '.com';

    // Generate mock search results
    for (let i = 0; i < Math.min(limit, 5); i++) {
      results.push({
        url: this.generateUrl(domain, i),
        title: this.generateTitle(companyName, i),
        description: this.generateDescription(companyName, i),
        markdown: this.generateMarkdown(companyName, domain, i),
        score: 0.95 - (i * 0.05)
      });
    }

    console.log('[MockFirecrawl] Found', results.length, 'results');
    return results;
  }

  /**
   * Simulate scrapeUrl method
   */
  async scrapeUrl(url: string): Promise<any> {
    console.log('[MockFirecrawl] Scraping URL:', url);
    await this.delay(this.mockDelay);

    const domain = new URL(url).hostname;
    const companyName = this.extractCompanyName(domain);

    return {
      url,
      markdown: this.generateMarkdown(companyName, domain, 0),
      html: this.generateHtml(companyName),
      metadata: {
        title: `${companyName} - Official Website`,
        description: `${companyName} provides innovative solutions`,
        language: 'en'
      }
    };
  }

  /**
   * Generate realistic URL based on index
   */
  private generateUrl(domain: string, index: number): string {
    const paths = ['about', 'company', 'team', 'press', 'careers'];
    const sources = [
      `https://${domain}/${paths[index] || 'about'}`,
      `https://techcrunch.com/2024/01/15/${domain.split('.')[0]}-news`,
      `https://crunchbase.com/organization/${domain.split('.')[0]}`,
      `https://linkedin.com/company/${domain.split('.')[0]}`,
      `https://github.com/${domain.split('.')[0]}`
    ];
    return sources[index] || sources[0];
  }

  /**
   * Generate realistic title
   */
  private generateTitle(companyName: string, index: number): string {
    const titles = [
      `About ${companyName} - Official Website`,
      `${companyName} raises Series A funding - TechCrunch`,
      `${companyName} Company Profile - Crunchbase`,
      `${companyName} | LinkedIn`,
      `${companyName} - GitHub`
    ];
    return titles[index] || titles[0];
  }

  /**
   * Generate realistic description
   */
  private generateDescription(companyName: string, index: number): string {
    const descriptions = [
      `${companyName} is a leading technology company providing innovative solutions to businesses worldwide.`,
      `${companyName} announced today it has raised $10M in Series A funding to expand its platform.`,
      `${companyName} is a Technology company specializing in Software solutions with 51-200 employees.`,
      `${companyName} is on LinkedIn. Join to connect with ${companyName} and others you may know.`,
      `${companyName} has 15 repositories available. Follow their code on GitHub.`
    ];
    return descriptions[index] || descriptions[0];
  }

  /**
   * Generate realistic markdown content
   */
  private generateMarkdown(companyName: string, domain: string, index: number): string {
    const markdownTemplates = [
      // Company website
      `URL: https://${domain}/about

# About ${companyName}

${companyName} is an innovative technology company founded in 2018. We are headquartered in San Francisco, CA and have grown to over 150 employees.

## Our Mission

We provide cutting-edge solutions that help businesses transform their operations and achieve their goals.

## What We Do

${companyName} specializes in:
- Cloud-based solutions
- Data analytics
- Enterprise software
- AI-powered tools

## Team

Our team consists of experienced professionals from leading tech companies.

Contact us at: hello@${domain}`,

      // TechCrunch article
      `URL: https://techcrunch.com/2024/01/15/${domain.split('.')[0]}-news

# ${companyName} Raises $10M Series A to Expand Platform

${companyName}, a San Francisco-based software company, announced today it has closed a $10 million Series A round led by Sequoia Capital.

The company plans to use the funding to expand its engineering team and accelerate product development.

"We're excited about this milestone," said the CEO. "${companyName} has grown 300% year-over-year."

Founded in 2018, ${companyName} now serves over 500 enterprise customers.`,

      // Crunchbase profile
      `URL: https://crunchbase.com/organization/${domain.split('.')[0]}

${companyName}

Industry: Technology, Software
Headquarters: San Francisco, California
Employees: 51-200
Founded: 2018
Funding Stage: Series A
Total Raised: $15M

Investors:
- Sequoia Capital
- Y Combinator
- Andreessen Horowitz

Description:
${companyName} provides enterprise software solutions for modern businesses.`,

      // LinkedIn
      `URL: https://linkedin.com/company/${domain.split('.')[0]}

${companyName}

Technology Company
San Francisco, California
201-500 employees

About:
${companyName} is transforming how businesses operate with innovative software solutions.

Industry: Software Development
Company size: 201-500 employees
Headquarters: San Francisco, CA
Type: Privately Held
Founded: 2018`,

      // GitHub
      `URL: https://github.com/${domain.split('.')[0]}

${companyName}

We build amazing software.

Repositories: 15 public repositories
Languages: TypeScript, Python, Go
Followers: 1.2K

Popular repositories:
- ${domain.split('.')[0]}-core (TypeScript)
- ${domain.split('.')[0]}-api (Python)
- ${domain.split('.')[0]}-cli (Go)

Tech Stack: React, Node.js, PostgreSQL, Kubernetes, Docker`
    ];

    return markdownTemplates[index] || markdownTemplates[0];
  }

  /**
   * Generate realistic HTML
   */
  private generateHtml(companyName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${companyName} - Official Website</title>
  <meta name="description" content="${companyName} provides innovative solutions">
</head>
<body>
  <h1>About ${companyName}</h1>
  <p>${companyName} is a leading technology company.</p>
</body>
</html>
    `.trim();
  }

  /**
   * Extract company name from domain
   */
  private extractCompanyName(domain: string): string {
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Utility: Simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
