
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

export async function findSimilarProducts(input: FindSimilarProductsInput): Promise<FindSimilarProductsOutput> {
  const allProducts = getProducts();
  const availableProducts = allProducts
    .map(({ id, name, description, category }) => ({ id, name, description, category }));

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
    prompt: `You are an expert fashion stylist with an eye for visual detail. Your task is to act as a visual search engine. You will be given an image from a user and a catalog of available products. Your goal is to find the products from the catalog that are the most visually similar to the clothing item in the user's image.

**Analyze the user's image in detail:**
-   **Item Type:** What is the main clothing item (e.g., t-shirt, blazer, jeans)?
-   **Color Palette:** What are the dominant and accent colors?
-   **Pattern & Texture:** Is there a pattern (e.g., plaid, stripes, floral)? What is the texture (e.g., knit, denim, smooth)?
-   **Style & Cut:** What is the overall style (e.g., minimalist, bohemian, formal)? What is the cut (e.g., relaxed fit, slim fit, A-line)?

**Compare with the product catalog:**
Based on your analysis, find the products in the catalog that are the closest visual match. Prioritize overall look and feel, then color and pattern.

**Your Response:**
You MUST return a JSON object containing a 'productIds' array with exactly {{count}} product IDs from the provided catalog.
-   The product IDs in your response MUST exist in the provided catalog.
-   **CRITICAL RULE:** It is crucial that you always return {{count}} product IDs. If you cannot find several good matches, you MUST still select the most plausible items from the catalog to meet the count. Do not return an empty array. Your goal is to provide options, even if they are not a perfect one-to-one match.

**User's Image:**
{{media url=photoDataUri}}

---

**Available Product Catalog:**
{{#if availableProducts}}
{{#each availableProducts}}
Product ID: {{this.id}}
Name: {{this.name}}
Description: {{this.description}}
Category: {{this.category}}
---
{{/each}}
{{else}}
No products available. You must return an empty productIds array.
{{/if}}`,
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

const findSimilarProductsFlow = ai.defineFlow(
  {
    name: 'findSimilarProductsFlow',
    inputSchema: FlowInputSchema,
    outputSchema: FindSimilarProductsOutputSchema,
  },
  async (input) => {
    if (input.availableProducts.length === 0) {
      return { productIds: [] };
    }

    try {
      const { output } = await recommendationPrompt(input);
      
      if (!output?.productIds) {
        throw new Error('The AI model did not return any product IDs.');
      }
      
      const availableProductIds = new Set(input.availableProducts.map(p => p.id));
      const validIds = output.productIds.filter(id => availableProductIds.has(id));
      
      if (validIds.length === 0) {
          throw new Error('The AI model returned product IDs that do not exist in the catalog.');
      }
      
      return { productIds: validIds };

    } catch (err) {
      console.error('Error in findSimilarProductsFlow:', err);
      if (err instanceof Error && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('API_KEY_INVALID');
      }
      throw err;
    }
  }
);
