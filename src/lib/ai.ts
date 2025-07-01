import { GOOGLE_API_KEY } from "@/ai/config";

/**
 * Checks if AI features are enabled by verifying if the API key has been changed
 * from its placeholder value.
 * @returns {boolean} True if the API key is set, false otherwise.
 */
export function isAiEnabled(): boolean {
  return GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE';
}
