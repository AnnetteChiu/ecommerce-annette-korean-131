'use server';
/**
 * @fileOverview An AI agent for finding similar products based on an image.
 *
 * - findSimilarProducts - A function that finds products similar to what's in a given image.
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
  try {
    const allProducts = getProducts();
    const availableProducts = allProducts
      .map(({ id, name, description, category }) => ({ id, name, description, category }));
  
    if (availableProducts.length === 0) {
      return defaultResponse;
    }
    
    return await findSimilarProductsFlow({ 
      ...input, 
      availableProducts,
    });
  } catch (error) {
    console.error("Error in findSimilarProducts:", error);
    throw error;
  }
}

const recommendationPrompt = ai.definePrompt({
    name: 'findSimilarProductsPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: FindSimilarProductsOutputSchema },
    system: "You are an e-commerce style advisor. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
    prompt: `Analyze the uploaded image's style, clothing, and colors. Recommend up to {{count}} products from the catalog below that are visually similar or a good stylistic match.

Catalog of available products:
{{#each availableProducts}}
- Name: {{this.name}}, ID: {{this.id}}, Category: {{this.category}}, Description: {{this.description}}
{{/each}}

Photo: {{media url=photoDataUri}}`
});

const findSimilarProductsFlow = ai.defineFlow(
  {
    name: 'findSimilarProductsFlow',
    inputSchema: FlowInputSchema,
    outputSchema: FindSimilarProductsOutputSchema,
  },
  async (input) => {
    try {
      const response = await recommendationPrompt.generate(input);
      const rawText = response.text();

      // Clean up potential markdown formatting around the JSON response.
      const cleanedText = rawText.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(cleanedText);
      const validatedOutput = FindSimilarProductsOutputSchema.parse(parsed);

      if (!validatedOutput || !validatedOutput.productIds) {
        throw new Error("Find similar products AI returned invalid or empty output.");
      }
      return validatedOutput;
    } catch (e) {
      console.error("Error in findSimilarProductsFlow", e);
      throw e;
    }
  }
);
