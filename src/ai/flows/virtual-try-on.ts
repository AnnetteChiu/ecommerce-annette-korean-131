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
  productImageUrl: z
    .string()
    .url()
    .describe(
      "An image URL of the product to try on."
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

async function urlToDataUri(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    return `data:${blob.type};base64,${buffer.toString('base64')}`;
}

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async ({ userPhotoDataUri, productImageUrl }) => {
    const productImageDataUri = await urlToDataUri(productImageUrl);

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: userPhotoDataUri } },
        { media: { url: productImageDataUri } },
        { text: "You are a virtual fitting room assistant. Your task is to realistically place the clothing item from the second image onto the person in the first image. Ensure the clothing fits the person's body shape and pose. The background of the first image should be preserved. Do not include any text or logos in the output image." },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce an image.');
    }

    return { generatedImageDataUri: media.url };
  }
);
