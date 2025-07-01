/**
 * Checks if AI features are enabled by verifying the presence of the Google AI API key.
 * This check is performed server-side.
 * @returns {boolean} True if AI features are enabled.
 */
export function isAiEnabled(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}
