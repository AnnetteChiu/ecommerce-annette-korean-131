'use server';
/**
 * @fileOverview An AI agent for generating product recommendations.
 *
 * - generateProductRecommendations - A function that generates product recommendations based on browsing history and the current product.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getProducts, getProductById} from '@/lib/products';
import type { Product } from '@/types';

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
    
    // The flow is now self-healing and guaranteed to return a result.
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
{{/each}}`
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
      
      // Validate the output
      if (output?.productIds && output.productIds.length > 0) {
        const allProductIds = new Set(input.availableProducts.map(p => p.id));
        const validIds = output.productIds.filter(id => allProductIds.has(id));

        if (validIds.length > 0) {
          // Return valid IDs, ensuring the count is met if possible, but don't fail.
          return { productIds: validIds.slice(0, input.count) };
        }
      }
      
      // If we reach here, AI failed or returned invalid data.
      throw new Error("AI returned no valid recommendations.");

    } catch (error) {
      console.error('AI recommendations failed, using server-side fallback:', error);
        
        // Server-Side Fallback Logic
        const allProducts = getProducts();
        const currentProduct = getProductById(input.currentProductId);
        
        let fallbackRecs: Product[] = [];

        if (currentProduct) {
          // 1. Try to get products from the same category
          fallbackRecs = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);
        }
        
        // 2. If not enough recommendations, fill with other products
        const otherProducts = allProducts.filter(
            p => p.id !== input.currentProductId && !fallbackRecs.find(fr => fr.id === p.id)
        );

        // Shuffle the remaining products to ensure variety
        const shuffledOthers = otherProducts.sort(() => 0.5 - Math.random());

        // Add products until we have the required count
        while (fallbackRecs.length < input.count && shuffledOthers.length > 0) {
            fallbackRecs.push(shuffledOthers.shift()!);
        }

        const fallbackIds = fallbackRecs.slice(0, input.count).map(p => p.id);
        return { productIds: fallbackIds };
    }
  }
);
