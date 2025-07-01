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
  
  // The flow is designed to handle its own errors and return a default response.
  return await findSimilarProductsFlow({ 
    ...input, 
    availableProducts,
  });
}

const recommendationPrompt = ai.definePrompt({
    name: 'findSimilarProductsPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: FindSimilarProductsOutputSchema },
    system: "You are an API that returns a JSON object. Your response must be ONLY the JSON object, with no additional text, comments, or markdown formatting whatsoever. Adhere strictly to the provided output schema.",
    prompt: `You are an expert fashion stylist. Your goal is to find products from a catalog that stylistically match a user's uploaded photo.

1.  **Analyze the Photo:** Carefully examine the user's photo to identify key fashion elements like the type of garment, style (e.g., casual, formal, bohemian), color, pattern, and material.
2.  **Match with Catalog:** Compare these visual elements to the text descriptions of the products in the provided catalog.
3.  **Select Best Matches:** Choose up to {{count}} products that are the closest stylistic match to the photo.
4.  **CRITICAL FALLBACK:** If you cannot find any products that are a good stylistic match, **do not return an empty list.** Instead, as a fallback, select the first {{count}} product IDs from the catalog provided. Your primary goal is to always provide recommendations.

You MUST return a JSON object with a 'productIds' array containing the selected product IDs. Prioritize good matches, but use the fallback if necessary to ensure the list is never empty.

**User's Photo to Analyze:**
{{media url=photoDataUri}}

---

**Product Catalog (Text Descriptions):**
{{#each availableProducts}}
Product ID: {{this.id}}
Name: {{this.name}}
Description: {{this.description}}
Category: {{this.category}}
---
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
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
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
      // If the model fails to generate valid JSON or returns nothing, we return a default response.
      return output || defaultResponse;
    } catch (error) {
        console.error('Error in findSimilarProductsFlow:', error);
        // Return a default empty response to the client to avoid a crash.
        // The UI will gracefully handle the empty list of recommendations.
        return defaultResponse;
    }
  }
);
