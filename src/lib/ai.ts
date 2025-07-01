import { GOOGLE_API_KEY } from "@/ai/config";

/**
 * Checks if AI features are enabled by verifying if the API key has been
 * changed from its default placeholder value.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export function isAiEnabled(): boolean {
  // The key is considered "not set" if it's the placeholder string or empty.
  return !!GOOGLE_API_KEY && GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE';
}
