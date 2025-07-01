/**
 * Checks if the Google AI API key is configured in the environment variables.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export function isAiEnabled(): boolean {
  // This function will only be executed on the server.
  return !!process.env.GOOGLE_API_KEY;
}
