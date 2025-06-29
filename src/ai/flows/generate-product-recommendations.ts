'use server';
/**
 * @fileOverview An AI agent for generating product recommendations.
 *
 * - generateProductRecommendations - A function that generates product recommendations based on browsing history and the current product.
 * - GenerateProductRecommendationsInput - The input type for the exported function.
 * - GenerateProductRecommendationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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

// This is the schema for the flow itself
const FlowInputSchema = z.object({
  currentProductId: z.string().describe('The ID of the product currently being viewed.'),
  browsingHistory: z.array(BrowsingHistoryItemSchema).describe('A list of products the user has recently viewed.'),
  count: z.number().optional().default(4).describe('The number of recommendations to return.'),
  availableProducts: z.array(ProductForPromptSchema).describe('The catalog of available products to recommend from.'),
});

// This is the schema for the exported function
export const GenerateProductRecommendationsInputSchema = FlowInputSchema.omit({ availableProducts: true });
export type GenerateProductRecommendationsInput = z.infer<typeof GenerateProductRecommendationsInputSchema>;

export const GenerateProductRecommendationsOutputSchema = z.object({
  productIds: z.array(z.string()).describe('An array of recommended product IDs.'),
});
export type GenerateProductRecommendationsOutput = z.infer<typeof GenerateProductRecommendationsOutputSchema>;

export async function generateProductRecommendations(input: GenerateProductRecommendationsInput): Promise<GenerateProductRecommendationsOutput> {
  const allProducts = getProducts();
  
  // Only filter out the currently viewed product, allowing previously viewed items to be recommended.
  const availableProducts = allProducts
    .filter(p => p.id !== input.currentProductId)
    .map(({ id, name, description, category }) => ({ id, name, description, category }));

  if (availableProducts.length === 0) {
    return { productIds: [] };
  }
  
  return productRecommendationFlow({ 
    ...input, 
    availableProducts,
  });
}

const recommendationPrompt = ai.definePrompt({
    name: 'productRecommendationPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: GenerateProductRecommendationsOutputSchema },
    prompt: `You are a helpful e-commerce style advisor. Your goal is to recommend products to users based on their interests.

The user is currently viewing the product with ID: {{currentProductId}}.

Here is the user's recent browsing history:
{{#if browsingHistory}}
{{#each browsingHistory}}
- {{this.name}} (ID: {{this.id}})
{{/each}}
{{else}}
The user has no browsing history yet.
{{/if}}

Based on the user's browsing history and the product they are currently viewing, please recommend up to {{count}} products from the catalog below that they might like.

Consider the categories and styles of the products viewed. Try to recommend items that are complementary or similar.

Here is the catalog of available products to recommend from:
{{#each availableProducts}}
- Name: {{this.name}}, ID: {{this.id}}, Category: {{this.category}}, Description: {{this.description}}
{{/each}}

Return a JSON object containing a 'productIds' array with the IDs of the recommended products from the provided catalog. For example: {"productIds": ["1", "2"]}`
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
      return output || { productIds: [] };
    } catch (error) {
        console.error("Error in productRecommendationFlow:", error);
        return { productIds: [] };
    }
  }
);
