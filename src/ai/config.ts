// This file is the single source of truth for the Google AI API key.
// It reads the key from the `GOOGLE_API_KEY` environment variable, which should
// be set in a .env.local file. See the README.md for more details.
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
