/**
 * Checks if a non-placeholder Google AI API key is configured in the environment variables.
 * @returns {boolean} True if the API key is set and is not the placeholder, false otherwise.
 */
export function isAiEnabled(): boolean {
  // This function will only be executed on the server.
  const apiKey = process.env.GOOGLE_API_KEY;
  return !!apiKey && apiKey !== 'YOUR_API_KEY_HERE';
}
