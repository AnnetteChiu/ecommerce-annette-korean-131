'use server';
/**
 * @fileOverview An AI agent for finding similar products based on an image.
 *
 * - findSimilarProducts - A function that finds products similar to what's in a given image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getProducts} from '@/lib/products';

const ProductForPromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

const FlowInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to search with, as a a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  count: z.number().optional().default(4).describe('The number of recommendations to return.'),
  availableProducts: z.array(ProductForPromptSchema).describe('The catalog of available products to recommend from.'),
});

const FindSimilarProductsInputSchema = FlowInputSchema.omit({ availableProducts: true });
const FindSimilarProductsOutputSchema = z.object({
  productIds: z.array(z.string()).describe('An array of recommended product IDs.'),
});

export type FindSimilarProductsInput = z.infer<typeof FindSimilarProductsInputSchema>;
export type FindSimilarProductsOutput = z.infer<typeof FindSimilarProductsOutputSchema>;

const defaultResponse = { productIds: [] };

export async function findSimilarProducts(input: FindSimilarProductsInput): Promise<FindSimilarProductsOutput> {
  const allProducts = getProducts();
  const availableProducts = allProducts
    .map(({ id, name, description, category }) => ({ id, name, description, category }));

  if (availableProducts.length === 0) {
    return defaultResponse;
  }
  
  // Let errors from the flow propagate up to the calling component.
  return await findSimilarProductsFlow({ 
    ...input, 
    availableProducts,
  });
}

const recommendationPrompt = ai.definePrompt({
    name: 'findSimilarProductsPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: FindSimilarProductsOutputSchema },
    system: "You are a visual search engine API. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
    prompt: `You are a visual search engine for an e-commerce fashion store. Your only job is to compare the user's uploaded image to a list of available products and find the best visual matches.

**Instructions:**
1. Carefully analyze the user's uploaded photo. Pay attention to the item type, color, pattern, material texture, and overall style.
2. Compare this analysis against the product descriptions in the catalog provided below.
3. You **must** select up to {{count}} products from the catalog that are the most similar.
4. Rank the products from most similar to least similar.
5. If no products are a perfect match, you must still return the *closest* available matches. Do not return an empty list unless the uploaded image contains no discernible clothing items.

**Product Catalog:**
{{#each availableProducts}}
- ID: {{this.id}}, Name: {{this.name}}, Category: {{this.category}}, Description: {{this.description}}
{{/each}}

**User's Photo:**
{{media url=photoDataUri}}`
});

const findSimilarProductsFlow = ai.defineFlow(
  {
    name: 'findSimilarProductsFlow',
    inputSchema: FlowInputSchema,
    outputSchema: FindSimilarProductsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await recommendationPrompt(input);
      // If the model fails to generate valid JSON or returns nothing, return a default response.
      return output || defaultResponse;
    } catch (error) {
      console.error('Error in findSimilarProductsFlow:', error);
      // On any error, return the default response to avoid crashing the client.
      return defaultResponse;
    }
  }
);
