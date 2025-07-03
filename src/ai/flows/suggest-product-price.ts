'use server';
/**
 * @fileOverview An AI agent for suggesting product prices.
 *
 * - suggestProductPrice - A function that suggests a price for a product.
 * - SuggestProductPriceInput - The input type for the suggestProductPrice function.
 * - SuggestProductPriceOutput - The return type for the suggestProductPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestProductPriceInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  description: z.string().describe('The description of the product.'),
  category: z.string().describe('The category of the product.'),
});
export type SuggestProductPriceInput = z.infer<typeof SuggestProductPriceInputSchema>;

const SuggestProductPriceOutputSchema = z.object({
  price: z.number().describe('The suggested price for the product in USD.'),
});
export type SuggestProductPriceOutput = z.infer<typeof SuggestProductPriceOutputSchema>;

export async function suggestProductPrice(input: SuggestProductPriceInput): Promise<SuggestProductPriceOutput> {
  return suggestProductPriceFlow(input);
}

const pricePrompt = ai.definePrompt({
  name: 'suggestProductPricePrompt',
  input: { schema: SuggestProductPriceInputSchema },
  output: { schema: SuggestProductPriceOutputSchema },
  system: "You are an expert e-commerce pricing analyst for a modern, mid-to-high-end fashion brand. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting. The price should be a number, not a string.",
  prompt: `Based on the following product details, suggest a competitive yet profitable market price in USD. Consider the materials, style, and target audience implied by the description.

Product Name: {{name}}
Category: {{category}}
Description: {{description}}

Return a JSON object with the suggested price. The price should be a numeric value (e.g., 129.99).
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const suggestProductPriceFlow = ai.defineFlow(
  {
    name: 'suggestProductPriceFlow',
    inputSchema: SuggestProductPriceInputSchema,
    outputSchema: SuggestProductPriceOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await pricePrompt(input);
      if (output?.price === undefined || output?.price === null) {
          throw new Error('Failed to generate a product price.');
      }
      // Round to 2 decimal places
      output.price = Math.round(output.price * 100) / 100;
      return output;
    } catch (err) {
      console.error('Error in suggestProductPriceFlow:', err);
      if (err instanceof Error && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error("Could not suggest a price at this time. Please try again.");
    }
  }
);
