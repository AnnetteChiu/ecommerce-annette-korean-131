
'use server';
/**
 * @fileOverview An AI agent for a virtual fitting room.
 *
 * - virtualTryOn - A function that superimposes a clothing item onto a person's photo.
 * - VirtualTryOnInput - The input type for the virtualTryOn function.
 * - VirtualTryOnOutput - The return type for the virtualTryOn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const VirtualTryOnInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productImageDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

const VirtualTryOnOutputSchema = z.object({
  generatedImageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function virtualTryOn(input: VirtualTryOnInput): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async ({ userPhotoDataUri, productImageDataUri }) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: userPhotoDataUri } },
          { media: { url: productImageDataUri } },
          { text: "Take the clothing item from the second image and realistically place it onto the person in the first image. The person's pose and the background of the first image must be preserved exactly as they are. The output must be only the final image, with no added text or logos." },
        ],
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
      console.error('Error in virtualTryOnFlow:', err);
      if (err instanceof Error && err.message.includes('API_KEY_INVALID')) {
        throw new Error('The Google AI API key is not configured correctly. Please see the documentation for instructions.');
      }
      throw new Error("We couldn't generate the image. The AI may have had trouble with this combination. Please try a different item or photo.");
    }
  }
);
