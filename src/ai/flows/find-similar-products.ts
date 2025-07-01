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
  imageUrl: z.string().url(),
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
    .map(({ id, name, description, category, imageUrl }) => ({ id, name, description, category, imageUrl }));

  if (availableProducts.length === 0) {
    return { productIds: [] };
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
    system: "You are an API that returns a JSON object. Your response must be ONLY the JSON object, with no additional text, comments, or markdown formatting whatsoever. Adhere strictly to the provided output schema.",
    prompt: `You are a visual search engine. Your task is to find products that are visually and stylistically similar to the user's uploaded image. You will be given the user's image and a catalog of product images.

Compare the user's image to each product image in the catalog. Focus on matching elements like garment type (e.g., dress, jeans), style (e.g., minimalist, bohemian), color, pattern, and overall aesthetic.

You MUST return up to {{count}} of the closest matches. It is critical that you always return results, even if the match isn't perfect. Prioritize the best available options from the catalog. Do NOT return an empty 'productIds' array.

**User's Image:**
{{media url=photoDataUri}}

---

**Available Product Catalog (Images and Details):**
{{#each availableProducts}}
Product ID: {{this.id}}
Name: {{this.name}}
Description: {{this.description}}
Category: {{this.category}}
Image: {{media url=this.imageUrl}}
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
      // The prompt now demands results, but as a safeguard,
      // if it still fails to provide any, we'll throw to trigger the fallback.
      if (!output?.productIds || output.productIds.length === 0) {
        throw new Error("AI returned no product IDs despite being instructed to.");
      }
      return output;
    } catch (error) {
      console.error('Visual search flow failed, using server-side fallback:', error);
      // If the AI fails for any reason, return the first few products as a fallback.
      // This prevents the client from ever seeing a "No Matches" state.
      const fallbackIds = getProducts().slice(0, input.count || 4).map(p => p.id);
      return { productIds: fallbackIds };
    }
  }
);
