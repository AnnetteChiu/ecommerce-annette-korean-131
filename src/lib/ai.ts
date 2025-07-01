import { GOOGLE_API_KEY } from "@/ai/config";

/**
 * Checks if AI features are enabled by verifying if the API key is present
 * in the environment variables. This function is intended to be run on the server.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export function isAiEnabled(): boolean {
  // The key is considered "not set" if it's an empty string.
  return !!GOOGLE_API_KEY;
}
