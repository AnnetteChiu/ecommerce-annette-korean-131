'use server';
/**
 * @fileOverview An AI agent for finding similar products based on an image.
 *
 * - findSimilarProducts - A function that finds products similar to what's in a given image.
 * - FindSimilarProductsInput - The input type for the exported function.
 * - FindSimilarProductsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getProducts} from '@/lib/products';

const ProductForPromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

// This is the schema for the flow itself
const FlowInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to search with, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  count: z.number().optional().default(4).describe('The number of recommendations to return.'),
  availableProducts: z.array(ProductForPromptSchema).describe('The catalog of available products to recommend from.'),
});

// This is the schema for the exported function
export const FindSimilarProductsInputSchema = FlowInputSchema.omit({ availableProducts: true });
export type FindSimilarProductsInput = z.infer<typeof FindSimilarProductsInputSchema>;

export const FindSimilarProductsOutputSchema = z.object({
  productIds: z.array(z.string()).describe('An array of recommended product IDs.'),
});
export type FindSimilarProductsOutput = z.infer<typeof FindSimilarProductsOutputSchema>;

export async function findSimilarProducts(input: FindSimilarProductsInput): Promise<FindSimilarProductsOutput> {
  try {
    const allProducts = getProducts();
    
    const availableProducts = allProducts
      .map(({ id, name, description, category }) => ({ id, name, description, category }));
  
    if (availableProducts.length === 0) {
      return { productIds: [] };
    }
    
    return await findSimilarProductsFlow({ 
      ...input, 
      availableProducts,
    });
  } catch (error) {
    console.error("Error calling findSimilarProductsFlow from wrapper:", error);
    return { productIds: [] };
  }
}

const recommendationPrompt = ai.definePrompt({
    name: 'findSimilarProductsPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: FindSimilarProductsOutputSchema },
    prompt: `You are a helpful e-commerce style advisor. Your goal is to recommend products to users based on an image they uploaded.

The user has uploaded an image. Analyze the style, clothing items, colors, and overall aesthetic of the image.

Based on your analysis, please recommend up to {{count}} products from the catalog below that are visually similar or would be a good stylistic match.

Here is the catalog of available products to recommend from:
{{#each availableProducts}}
- Name: {{this.name}}, ID: {{this.id}}, Category: {{this.category}}, Description: {{this.description}}
{{/each}}

Photo: {{media url=photoDataUri}}

Return a JSON object containing a 'productIds' array with the IDs of the recommended products from the provided catalog. Prioritize items that are a close match to what is shown in the image. Your response MUST be ONLY the JSON object, with no other text, explanation, or markdown formatting.`
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
      return output || { productIds: [] };
    } catch (error) {
      console.error("Error in findSimilarProductsFlow:", error);
      return { productIds: [] };
    }
  }
);
