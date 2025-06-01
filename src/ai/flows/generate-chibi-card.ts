
'use server';
/**
 * @fileOverview Generates a Chibi Battle Card image based on a textual description, attack, defense, and rarity.
 *
 * - generateChibiCard - A function that handles the card generation process.
 * - GenerateChibiCardInput - The input type for the generateChibiCard function.
 * - GenerateChibiCardOutput - The return type for the generateChibiCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChibiCardInputSchema = z.object({
  description: z.string().describe('The description of the Chibi Battle Card character and theme.'),
  attack: z.number().describe('The attack value for the card.'),
  defense: z.number().describe('The defense value for the card.'),
  rarity: z.string().describe('The rarity of the card (e.g., Common, Rare, Epic, Legendary, Shiny), which influences the background.'),
});
export type GenerateChibiCardInput = z.infer<typeof GenerateChibiCardInputSchema>;

const GenerateChibiCardOutputSchema = z.object({
  cardDataUri: z
    .string()
    .describe(
      'The generated Chibi Battle Card image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateChibiCardOutput = z.infer<typeof GenerateChibiCardOutputSchema>;

export async function generateChibiCard(input: GenerateChibiCardInput): Promise<GenerateChibiCardOutput> {
  return generateChibiCardFlow(input);
}

const generateChibiCardFlow = ai.defineFlow(
  {
    name: 'generateChibiCardFlow',
    inputSchema: GenerateChibiCardInputSchema,
    outputSchema: GenerateChibiCardOutputSchema,
  },
  async (input: GenerateChibiCardInput) => {
    const imagePromptText = `Create a visually distinct Chibi Battle Card.
Theme based on: "${input.description}".
Rarity: "${input.rarity}". This is crucial and MUST dictate the card's background and overall feel:
- Common: Simple, clean, or blank background. Minimal extra effects.
- Rare: Cool blue-themed background. May include subtle patterns, light water or air-like effects.
- Epic: Impressive purple-themed background. Could feature magical glows, swirling energy, or arcane symbols.
- Legendary: Majestic golden or bright yellow-themed background. Should feel powerful and prestigious, possibly with ornate details, sunbeam effects, or a regal aura.
- Shiny: Vibrant, sparkling, holographic-style background with prominent stars, glitter, and rainbow refractions. The character itself might also have a slight shimmer.

Card Elements (all clearly visible and integrated into the design):
1. Character: A cute, Chibi or bean-shaped character (like Fall Guys/Stumble Guys), colorful, non-violent, wearing a fun costume matching the theme. Playful pose.
2. Card Name: Displayed at the top in a bubbly, rounded, thematic font. (You can invent a fitting name).
3. Attack Value: "${input.attack}" (clearly displayed, e.g., in a corner or designated stat box).
4. Defense Value: "${input.defense}" (clearly displayed, similar to attack).
5. Border: A soft glowing border around the card frame, complementing the rarity.

Overall Style: Light-hearted, colorful, game-friendly for a casual digital card game. Ensure attack and defense numbers are legible.
The rarity's visual impact on the background is a primary requirement.`;

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

    return {cardDataUri: media.url};
  }
);
