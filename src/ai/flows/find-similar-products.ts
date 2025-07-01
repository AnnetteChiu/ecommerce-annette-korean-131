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

  if (availableProducts.length === 0) {
    return { productIds: [] };
  }
  
  // The flow is now self-healing and guaranteed to return a result.
  // No complex try/catch is needed here anymore.
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
    prompt: `You are a visual search engine API. Your task is to find products from the provided catalog that are visually similar to the item in the user's image.

You have one, critical instruction: **You MUST ALWAYS return a JSON object containing a 'productIds' array with exactly {{count}} product IDs from the provided catalog.**

-   **Analyze the User's Image:** Identify the main clothing item, its style, color, pattern, and material.
-   **Compare with Catalog:** Find the products in the catalog that are the closest visual match.
-   **CRITICAL RULE:** If you cannot find any good matches, you MUST still return the \`productIds\` of the most plausible items from the catalog. **Do NOT return an empty array.** If the image is a blue shirt, and the catalog only has red shirts, return the red shirts. You must fulfill the request.
-   The product IDs in your response MUST exist in the provided catalog.

**User's Image:**
{{media url=photoDataUri}}

---

**Available Product Catalog:**
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
      
      // Robust check: ensure output and productIds exist and are not empty.
      if (output?.productIds && output.productIds.length > 0) {
        // Further validation: ensure the IDs are valid products.
        const allProductIds = new Set(getProducts().map(p => p.id));
        const validIds = output.productIds.filter(id => allProductIds.has(id));
        
        if (validIds.length > 0) {
            // As long as we have at least one valid ID, we return it.
            return { productIds: validIds };
        }
      }
      
      // Fallback Case 1: AI returned empty, null, or only invalid product IDs.
      console.error('AI visual search returned invalid or empty data. Using fallback.');
      const fallbackIds = getProducts().slice(0, input.count || 4).map(p => p.id);
      return { productIds: fallbackIds };

    } catch (error) {
      // Fallback Case 2: A catastrophic error occurred (e.g., Genkit/network failure).
      console.error('A catastrophic error occurred during the visual search flow:', error);
      const fallbackIds = getProducts().slice(0, input.count || 4).map(p => p.id);
      return { productIds: fallbackIds };
    }
  }
);
