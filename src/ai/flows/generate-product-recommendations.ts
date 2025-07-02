
'use server';
/**
 * @fileOverview An AI agent for generating product recommendations.
 *
 * - generateProductRecommendations - A function that generates product recommendations based on browsing history and the current product.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getProducts} from '@/lib/products';

const BrowsingHistoryItemSchema = z.object({
  id: z.string(),
  name: z.string()
});

const ProductForPromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

const FlowInputSchema = z.object({
  currentProductId: z.string().describe('The ID of the product currently being viewed.'),
  browsingHistory: z.array(BrowsingHistoryItemSchema).describe('A list of products the user has recently viewed.'),
  count: z.number().optional().default(4).describe('The number of recommendations to return.'),
  availableProducts: z.array(ProductForPromptSchema).describe('The catalog of available products to recommend from.'),
});

const GenerateProductRecommendationsInputSchema = FlowInputSchema.omit({ availableProducts: true });
const GenerateProductRecommendationsOutputSchema = z.object({
  productIds: z.array(z.string()).describe('An array of recommended product IDs.'),
});

export type GenerateProductRecommendationsInput = z.infer<typeof GenerateProductRecommendationsInputSchema>;
export type GenerateProductRecommendationsOutput = z.infer<typeof GenerateProductRecommendationsOutputSchema>;

export async function generateProductRecommendations(input: GenerateProductRecommendationsInput): Promise<GenerateProductRecommendationsOutput> {
    const allProducts = getProducts();
    
    const availableProducts = allProducts
      .filter(p => p.id !== input.currentProductId)
      .map(({ id, name, description, category }) => ({ id, name, description, category }));

    if (availableProducts.length === 0) {
      return { productIds: [] };
    }
    
    return await productRecommendationFlow({ 
      ...input, 
      availableProducts,
    });
}

const recommendationPrompt = ai.definePrompt({
    name: 'productRecommendationPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: GenerateProductRecommendationsOutputSchema },
    system: "You are an e-commerce style advisor. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting. Your goal is to provide relevant recommendations, but it is CRITICAL that you always return an array of product IDs, even if the matches aren't perfect. The array must contain {{count}} product IDs.",
    prompt: `Based on the user's browsing history and the product they are currently viewing, recommend exactly {{count}} products from the catalog.
Consider the categories and styles of the products. Try to recommend items that are complementary or similar.

Current Product ID: {{currentProductId}}

Browsing History:
{{#if browsingHistory}}
{{#each browsingHistory}}
- {{this.name}} (ID: {{this.id}})
{{/each}}
{{else}}
None
{{/if}}

Available Product Catalog:
{{#each availableProducts}}
- Name: {{this.name}}, ID: {{this.id}}, Category: {{this.category}}, Description: {{this.description}}
{{/each}}`,
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

const productRecommendationFlow = ai.defineFlow(
  {
    name: 'productRecommendationFlow',
    inputSchema: FlowInputSchema,
    outputSchema: GenerateProductRecommendationsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await recommendationPrompt(input);
      
      if (!output?.productIds) {
          throw new Error("AI failed to return valid recommendations.");
      }
      
      return output;

    } catch (err) {
      console.error('Error in productRecommendationFlow:', err);
      if (err instanceof Error && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error("Could not generate recommendations at this time. Please try again.");
    }
  }
);
