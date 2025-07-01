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

const defaultResponse = { productIds: [] };

export async function findSimilarProducts(input: FindSimilarProductsInput): Promise<FindSimilarProductsOutput> {
  const allProducts = getProducts();
  const availableProducts = allProducts
    .map(({ id, name, description, category, imageUrl }) => ({ id, name, description, category, imageUrl }));

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
    system: "You are an API that returns a JSON object. Your response must be ONLY the JSON object, with no additional text, comments, or markdown formatting whatsoever. Adhere strictly to the provided output schema.",
    prompt: `You are a visual search expert. Your task is to find products from the catalog that are visually similar to the user's photo.

Analyze the key visual elements in the user's photo (e.g., clothing type, color, pattern, style).

Then, find up to {{count}} products from the "Product Catalog" below that are the best visual match. You MUST return product IDs, even if the match is not perfect.

**User's Photo:**
{{media url=photoDataUri}}

---

**Product Catalog:**
{{#each availableProducts}}
Product ID: {{this.id}}
Name: {{this.name}}
Description: {{this.description}}
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
    const { output } = await recommendationPrompt(input);
    // If the model fails to generate valid JSON or returns nothing, we return a default response.
    // The calling component is set up to handle true errors from the AI, which will be thrown by recommendationPrompt.
    return output || defaultResponse;
  }
);
