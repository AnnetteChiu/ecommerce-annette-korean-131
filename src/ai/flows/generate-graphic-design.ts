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

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A professional, modern, and aesthetically pleasing graphic design based on the following concept: "${prompt}". The design should be suitable for a high-end fashion and lifestyle brand. Avoid text unless explicitly requested. The output should be only the image.`,
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
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce an image.');
    }

    return { generatedImageDataUri: media.url };
  }
);
