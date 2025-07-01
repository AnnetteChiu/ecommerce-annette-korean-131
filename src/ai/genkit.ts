import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  // IMPORTANT: Add your Google AI API key here.
  // This is not a secure practice for production applications.
  plugins: [googleAI({apiKey: 'YOUR_GOOGLE_API_KEY_HERE'})],
  model: 'googleai/gemini-2.0-flash',
});
