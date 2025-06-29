'use server';
/**
 * @fileOverview An AI agent for virtually trying on clothes.
 *
 * - virtualTryOn - A function that generates an image of a model wearing a selected clothing item.
 * - VirtualTryOnInput - The input type for the exported function.
 * - VirtualTryOnOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const VirtualTryOnInputSchema = z.object({
  modelPhotoDataUri: z
    .string()
    .describe(
      "A photo of the model, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productPhotoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

export const VirtualTryOnOutputSchema = z.object({
  generatedImageUri: z.string().describe('The generated image as a data URI.'),
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
  async ({ modelPhotoDataUri, productPhotoDataUri }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: modelPhotoDataUri } },
        { media: { url: productPhotoDataUri } },
        { text: `You are a fashion expert with advanced image editing skills.
The user has provided two images: one of a person (the model) and one of a clothing item.
Your task is to generate a new, photorealistic image of the model wearing the clothing item from the second image.
Maintain the model's original pose, body shape, and the background. The clothing should look natural on the model.
Only return the generated image.` },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }

    return { generatedImageUri: media.url };
  }
);
