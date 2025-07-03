'use server';
/**
 * @fileOverview An AI agent for suggesting the best supplier for a product.
 *
 * - suggestSupplier - A function that suggests a supplier based on product details.
 * - SuggestSupplierInput - The input type for the suggestSupplier function.
 * - SuggestSupplierOutput - The return type for the suggestSupplier function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SupplierSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string().describe('The location of the supplier.'),
    deliveryTime: z.string().describe('The estimated delivery time from this supplier.'),
});

export const SuggestSupplierInputSchema = z.object({
  productName: z.string().describe('The name of the product we need to source.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  suppliers: z.array(SupplierSchema).describe('The list of available suppliers to choose from.'),
});
export type SuggestSupplierInput = z.infer<typeof SuggestSupplierInputSchema>;

export const SuggestSupplierOutputSchema = z.object({
  supplierId: z.string().describe('The ID of the recommended supplier.'),
  justification: z.string().describe('A brief justification for why this supplier was recommended.'),
});
export type SuggestSupplierOutput = z.infer<typeof SuggestSupplierOutputSchema>;

export async function suggestSupplier(input: SuggestSupplierInput): Promise<SuggestSupplierOutput> {
  return suggestSupplierFlow(input);
}

const suggestionPrompt = ai.definePrompt({
  name: 'suggestSupplierPrompt',
  input: { schema: SuggestSupplierInputSchema },
  output: { schema: SuggestSupplierOutputSchema },
  system: "You are an expert supply chain analyst for a high-end fashion e-commerce company. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
  prompt: `You are an expert supply chain analyst. Your task is to recommend the best supplier for a new product based on its description and the list of available suppliers.

Analyze the product details to understand its style, materials, and target audience. Then, evaluate the supplier list. Consider factors like:
-   **Geographic Specialization:** A supplier's location can hint at their specialty (e.g., Milan for luxury goods, Seoul for trendy fashion).
-   **Delivery Time:** Faster is often better, but may not be the only factor.
-   **Implied Quality:** Match the product's description to the likely quality and focus of a supplier based on their location.

**Product to Source:**
-   Name: {{productName}}
-   Description: {{productDescription}}

**Available Suppliers:**
{{#each suppliers}}
-   ID: {{this.id}}
    Name: {{this.name}}
    Location: {{this.address}}
    Est. Delivery: {{this.deliveryTime}}
---
{{/each}}

Based on your analysis, recommend the single best supplier and provide a concise, one-sentence justification for your choice.
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

const suggestSupplierFlow = ai.defineFlow(
  {
    name: 'suggestSupplierFlow',
    inputSchema: SuggestSupplierInputSchema,
    outputSchema: SuggestSupplierOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await suggestionPrompt(input);
      if (!output?.supplierId || !output?.justification) {
          throw new Error('Failed to generate a supplier suggestion.');
      }
      return output;
    } catch (err) {
      console.error('Error in suggestSupplierFlow:', err);
      if (err instanceof Error && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error("Could not get a suggestion at this time. Please try again.");
    }
  }
);
