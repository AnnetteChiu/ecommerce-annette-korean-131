/**
 * Checks if AI features are enabled.
 * NOTE: With the current setup, the API key is hardcoded in src/ai/genkit.ts,
 * so this function will always return true.
 * @returns {boolean} True, indicating AI features are enabled.
 */
export function isAiEnabled(): boolean {
  // Hardcoded to true because the key is set directly in the code.
  return true;
}
