/**
 * Gemini Configuration
 * Quick toggle for testing Gemini vs OpenAI
 */

export const GEMINI_CONFIG = {
  /**
   * Enable Gemini for LLM operations
   * Set to true to use Gemini instead of OpenAI
   */
  ENABLED: process.env.USE_GEMINI === 'true',

  /**
   * Gemini API Key
   * Get from: https://aistudio.google.com/app/apikey
   */
  API_KEY: process.env.GEMINI_API_KEY || '',

  /**
   * Default model
   */
  MODEL: 'gemini-2.0-flash-exp',
} as const;

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return GEMINI_CONFIG.ENABLED && GEMINI_CONFIG.API_KEY.length > 0;
}

/**
 * Get active LLM provider name
 */
export function getActiveProvider(): 'openai' | 'gemini' {
  return isGeminiConfigured() ? 'gemini' : 'openai';
}
