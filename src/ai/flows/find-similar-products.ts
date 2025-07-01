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
  
  try {
    // This flow is now architected to be self-healing and will always return valid product IDs.
    // This catch block is for catastrophic failures (e.g., AI service is completely offline).
    return await findSimilarProductsFlow({ 
      ...input, 
      availableProducts,
    });
  } catch (error) {
    console.error('Visual search flow failed catastrophically:', error);
    const fallbackIds = getProducts().slice(0, input.count || 4).map(p => p.id);
    return { productIds: fallbackIds };
  }
}

const recommendationPrompt = ai.definePrompt({
    name: 'findSimilarProductsPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: FindSimilarProductsOutputSchema },
    system: "You are an API that returns a JSON object. Your response must be ONLY the JSON object, with no additional text, comments, or markdown formatting whatsoever. Adhere strictly to the provided output schema.",
    prompt: `You are a visual search engine. You will be given a user's image and a product catalog. Your task is to find products from the catalog that are visually similar to the user's image.

You MUST return a JSON object containing the 'productIds' of the {{count}} most similar products.
- The 'productIds' array MUST NOT be empty. Always return the best available matches, even if they are not perfect.
- The product IDs in your response MUST exist in the provided catalog.

**User's Image:**
{{media url=photoDataUri}}

---

**Available Product Catalog (Text Only):**
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
      
      // Happy Path: Validate the AI's output.
      if (output?.productIds && output.productIds.length > 0) {
        const allProductIds = getProducts().map(p => p.id);
        const validProductIds = output.productIds.filter(id => allProductIds.includes(id));
        
        if (validProductIds.length > 0) {
          return { productIds: validProductIds }; // Success!
        }
      }

      // Fallback Path: If the AI returns invalid, empty, or no data, generate a fallback.
      // This makes the flow self-healing and prevents errors from propagating.
      console.error('AI visual search returned invalid or empty data. Using direct fallback inside the flow.');
      const fallbackIds = getProducts().slice(0, input.count || 4).map(p => p.id);
      return { productIds: fallbackIds };

    } catch (error) {
      // Catastrophic Fallback: Catch any other unexpected errors from the prompt call itself.
      console.error('An unexpected error occurred during the recommendationPrompt execution:', error);
      const fallbackIds = getProducts().slice(0, input.count || 4).map(p => p.id);
      return { productIds: fallbackIds };
    }
  }
);
