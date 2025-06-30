'use server';
/**
 * @fileOverview An AI agent for generating style recommendations.
 *
 * - generateStyleRecommendation - A function that generates style recommendations based on browsing history.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStyleRecommendationInputSchema = z.object({
  browsingHistory: z.string().describe('A comma-separated list of product names the user has viewed.'),
});
const GenerateStyleRecommendationOutputSchema = z.object({
  recommendations: z.string().describe('The personalized style recommendation text.'),
});

export type GenerateStyleRecommendationInput = z.infer<typeof GenerateStyleRecommendationInputSchema>;
export type GenerateStyleRecommendationOutput = z.infer<typeof GenerateStyleRecommendationOutputSchema>;

export async function generateStyleRecommendation(input: GenerateStyleRecommendationInput): Promise<GenerateStyleRecommendationOutput> {
  if (!input.browsingHistory || input.browsingHistory.trim() === '') {
      return { recommendations: 'Browse some products first to get a personalized style recommendation.' };
  }

  try {
    return await styleRecommendationFlow(input);
  } catch (error) {
    console.error("Error in generateStyleRecommendation:", error);
    throw error;
  }
}

const recommendationPrompt = ai.definePrompt({
    name: 'styleRecommendationPrompt',
    input: { schema: GenerateStyleRecommendationInputSchema },
    output: { schema: GenerateStyleRecommendationOutputSchema },
    system: "You are an e-commerce style advisor. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
    prompt: `You are an e-commerce style advisor. Your goal is to provide a short, personalized style recommendation to a user based on their browsing history.

The user has viewed the following products:
{{browsingHistory}}

Based on these items, generate a brief (2-3 sentences) style recommendation.`
});

const styleRecommendationFlow = ai.defineFlow(
  {
    name: 'styleRecommendationFlow',
    inputSchema: GenerateStyleRecommendationInputSchema,
    outputSchema: GenerateStyleRecommendationOutputSchema,
  },
  async (input) => {
    try {
      const response = await recommendationPrompt.generate(input);
      const rawText = response.text();

      // Clean up potential markdown formatting around the JSON response.
      const cleanedText = rawText.replace(/```json|```/g, '').trim();
      
      const parsed = JSON.parse(cleanedText);
      const validatedOutput = GenerateStyleRecommendationOutputSchema.parse(parsed);

      if (!validatedOutput || !validatedOutput.recommendations) {
          throw new Error("Style recommendation AI returned invalid or empty output.");
      }
      return validatedOutput;
    } catch (e) {
      console.error("Error in styleRecommendationFlow", e);
      throw e;
    }
  }
);
