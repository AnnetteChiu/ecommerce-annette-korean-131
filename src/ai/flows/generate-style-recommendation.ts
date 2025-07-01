'use server';
/**
 * @fileOverview An AI agent for generating style recommendations.
 *
 * - generateStyleRecommendation - A function that generates style recommendations based on browsing history.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateStyleRecommendationInputSchema = z.object({
  browsingHistory: z.string().describe('A comma-separated list of product names the user has viewed.'),
});
const GenerateStyleRecommendationOutputSchema = z.object({
  recommendations: z.string().describe('The personalized style recommendation text.'),
});

export type GenerateStyleRecommendationInput = z.infer<typeof GenerateStyleRecommendationInputSchema>;
export type GenerateStyleRecommendationOutput = z.infer<typeof GenerateStyleRecommendationOutputSchema>;

const defaultResponse = { recommendations: 'We could not generate a recommendation at this time. Please try browsing more items.' };

export async function generateStyleRecommendation(input: GenerateStyleRecommendationInput): Promise<GenerateStyleRecommendationOutput> {
  if (!input.browsingHistory || input.browsingHistory.trim() === '') {
      return { recommendations: 'Browse some products first to get a personalized style recommendation.' };
  }

  // Let errors from the flow propagate up to the calling component.
  return await styleRecommendationFlow(input);
}

const recommendationPrompt = ai.definePrompt({
    name: 'styleRecommendationPrompt',
    input: { schema: GenerateStyleRecommendationInputSchema },
    output: { schema: GenerateStyleRecommendationOutputSchema },
    system: "You are an e-commerce style advisor. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
    prompt: `You are an e-commerce style advisor. Your goal is to provide a short, personalized style recommendation to a user based on their browsing history.

The user has viewed the following products:
{{browsingHistory}}

Based on these items, generate a brief (2-3 sentences) style recommendation.`,
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

const styleRecommendationFlow = ai.defineFlow(
  {
    name: 'styleRecommendationFlow',
    inputSchema: GenerateStyleRecommendationInputSchema,
    outputSchema: GenerateStyleRecommendationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await recommendationPrompt(input);
      // If the model fails to generate valid JSON, return a default response.
      return output || defaultResponse;
    } catch (error) {
      console.error('Error in styleRecommendationFlow:', error);
      return defaultResponse;
    }
  }
);
