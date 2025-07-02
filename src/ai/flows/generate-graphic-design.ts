
'use server';
/**
 * @fileOverview An AI agent for generating graphic designs.
 *
 * - generateGraphicDesign - A function that generates a graphic design based on a text prompt.
 * - GenerateGraphicDesignInput - The input type for the generateGraphicDesign function.
 * - GenerateGraphicDesignOutput - The return type for the generateGraphicDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateGraphicDesignInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired graphic design.'),
});
export type GenerateGraphicDesignInput = z.infer<typeof GenerateGraphicDesignInputSchema>;

const GenerateGraphicDesignOutputSchema = z.object({
  generatedImageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateGraphicDesignOutput = z.infer<typeof GenerateGraphicDesignOutputSchema>;

export async function generateGraphicDesign(input: GenerateGraphicDesignInput): Promise<GenerateGraphicDesignOutput> {
  return generateGraphicDesignFlow(input);
}

const generateGraphicDesignFlow = ai.defineFlow(
  {
    name: 'generateGraphicDesignFlow',
    inputSchema: GenerateGraphicDesignInputSchema,
    outputSchema: GenerateGraphicDesignOutputSchema,
  },
  async ({ prompt }) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A professional, modern, and aesthetically pleasing graphic design for a high-end fashion and lifestyle brand. The design should be based on the following concept: "${prompt}". Avoid including any text in the image unless it is explicitly requested in the concept.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
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

      if (!media?.url) {
        throw new Error('Image generation failed to produce an image.');
      }

      return { generatedImageDataUri: media.url };
    } catch (err) {
      console.error('Error in generateGraphicDesignFlow:', err);
      if (err instanceof Error && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error("We couldn't generate a new design. The AI may have had an issue with your prompt. Please try again.");
    }
  }
);
