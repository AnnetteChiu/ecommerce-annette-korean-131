import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { GOOGLE_API_KEY } from './config';

export const ai = genkit({
  plugins: [googleAI({apiKey: GOOGLE_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
