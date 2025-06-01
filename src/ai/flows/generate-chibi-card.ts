
'use server';
/**
 * @fileOverview Generates a Chibi character image based on a textual description and rarity.
 *
 * - generateChibiCharacterImage - A function that handles the character image generation.
 * - GenerateChibiCharacterImageInput - The input type for the generateChibiCharacterImage function.
 * - GenerateChibiCharacterImageOutput - The return type for the generateChibiCharacterImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChibiCharacterImageInputSchema = z.object({
  description: z.string().describe('The description of the Chibi character and theme.'),
  rarity: z.string().describe('The rarity of the character (e.g., Common, Rare, Epic, Legendary, Shiny), which can subtly influence its appearance.'),
});
export type GenerateChibiCharacterImageInput = z.infer<typeof GenerateChibiCharacterImageInputSchema>;

const GenerateChibiCharacterImageOutputSchema = z.object({
  characterImageDataUri: z
    .string()
    .describe(
      'The generated Chibi character image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateChibiCharacterImageOutput = z.infer<typeof GenerateChibiCharacterImageOutputSchema>;

export async function generateChibiCharacterImage(input: GenerateChibiCharacterImageInput): Promise<GenerateChibiCharacterImageOutput> {
  return generateChibiCharacterImageFlow(input);
}

const generateChibiCharacterImageFlow = ai.defineFlow(
  {
    name: 'generateChibiCharacterImageFlow',
    inputSchema: GenerateChibiCharacterImageInputSchema,
    outputSchema: GenerateChibiCharacterImageOutputSchema,
  },
  async (input: GenerateChibiCharacterImageInput) => {
    const imagePromptText = `Create a single, high-quality Chibi-style character image.
Image dimensions: 400 pixels wide by 400 pixels tall.
Background: Simple, clean, single-color background (e.g. light grey or white) that can be easily isolated or made transparent. Avoid complex background scenes or patterns. The character should be the only subject.
Character Description: "${input.description}".
Character Art Style: Cute, Chibi-style (similar to Fall Guys or Stumble Guys if applicable to the theme), colorful, non-violent, wearing a fun costume matching the theme. Playful or iconic pose for the character type. The character should be the main focus and fill the 400x400 canvas appropriately, without being cut off.
Rarity Influence ("${input.rarity}"): This should subtly influence the character's appearance, not the background.
- Common: Standard appearance for the theme.
- Rare: Subtle cool blue-themed accents or details on the character's costume or accessories.
- Epic: Subtle impressive purple-themed accents or details on the character's costume or accessories.
- Legendary: Subtle majestic golden or bright yellow-themed accents or details on the character's costume or accessories.
- Shiny: Character might have a slight shimmer, sparkle effects, or iridescent highlights on parts of their costume or as an aura.
Focus on a single character. Ensure the character is well-defined, clearly visible, and centered. The final image MUST be exactly 400x400 pixels.
`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePromptText,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media URL.');
    }

    return {characterImageDataUri: media.url};
  }
);
