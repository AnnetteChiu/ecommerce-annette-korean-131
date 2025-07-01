/**
 * Checks if AI features are enabled by verifying if the server-side
 * GOOGLE_API_KEY environment variable is set.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export function isAiEnabled(): boolean {
  // The key is considered "not set" if it's undefined, null, or an empty string.
  return !!process.env.GOOGLE_API_KEY;
}
