'use server';
/**
 * @fileOverview An AI agent for generating product descriptions.
 *
 * - generateProductDescription - A function that generates a product description.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateProductDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product.'),
  keywords: z.string().optional().describe('Optional keywords to include in the description.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const descriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  system: "You are a creative copywriter for an e-commerce fashion brand. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
  prompt: `Generate a compelling, fresh, and sophisticated product description (around 2-3 sentences) for a product.
Be creative and evoke a sense of style and quality.

Product Name: {{name}}
Category: {{category}}
{{#if keywords}}
Keywords to include: {{keywords}}
{{/if}}
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await descriptionPrompt(input);
      if (!output?.description) {
          throw new Error('Failed to generate a product description.');
      }
      return output;
    } catch (err) {
      console.error('Error in generateProductDescriptionFlow:', err);
      if (err instanceof Error && err.message.includes('API_KEY_INVALID')) {
        throw new Error('The Google AI API key is not configured correctly. Please see the documentation for instructions.');
      }
      throw new Error("Could not generate a description at this time.");
    }
  }
);
