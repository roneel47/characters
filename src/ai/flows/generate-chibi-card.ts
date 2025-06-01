
'use server';
/**
 * @fileOverview Generates a Chibi Battle Card image based on a textual description, attack, defense, size, height, and rarity.
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
  size: z.string().describe('The size category of the character (e.g., Tiny, Small, Medium, Large, Giant).'),
  height: z.string().describe('The specific height of the character (e.g., "5cm", "2 inches", "Tall").'),
  rarity: z.string().describe('The rarity of the card (e.g., Common, Rare, Epic, Legendary, Shiny), which influences the background and border.'),
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
    const imagePromptText = `Create a visually distinct Chibi Battle Card with SHARP RECTANGULAR EDGES (NO ROUNDED CORNERS).
The card design should be dynamic and engaging, inspired by collectible trading cards (like Slam Attax or Pokemon cards), featuring clear sections for character art and stats. It should not look plain.

Theme based on: "${input.description}".
Character: A cute, Chibi or bean-shaped character (like Fall Guys/Stumble Guys), colorful, non-violent, wearing a fun costume matching the theme. Playful pose.

Rarity: "${input.rarity}". This is crucial and MUST dictate the card's background, border, and overall feel:
- Common: Simple, clean, or muted background. Minimal extra effects. Standard border.
- Rare: Cool blue-themed background and border accents. May include subtle patterns, light water or air-like effects.
- Epic: Impressive purple-themed background and border accents. Could feature magical glows, swirling energy, or arcane symbols.
- Legendary: Majestic golden or bright yellow-themed background and border accents. Should feel powerful and prestigious, possibly with ornate details, sunbeam effects, or a regal aura.
- Shiny: Vibrant, sparkling, holographic-style background that covers most of the card, with prominent stars, glitter, and rainbow refractions. The character itself might also have a slight shimmer. The border should also be holographic or shimmering.

Card Elements (all clearly visible, legible, and integrated into the design):
1. Card Name: Displayed prominently at the top in a bubbly, rounded, thematic font. (You can invent a fitting name based on the theme and character).
2. Character Art: The Chibi character should be the main focus.
3. Attributes Section: Clearly display the following attributes, possibly in designated stat boxes or areas with clear labels (e.g., "ATK: ${input.attack}", "DEF: ${input.defense}", "SIZE: ${input.size}", "HGT: ${input.height}"):
    - Attack: "${input.attack}"
    - Defense: "${input.defense}"
    - Size: "${input.size}"
    - Height: "${input.height}"
4. Border: A sharp rectangular border around the card frame, complementing the rarity (e.g., simple for common, metallic for rare/epic, ornate for legendary, holographic for shiny). NO rounded corners on the card itself.

Overall Style: Light-hearted, colorful, game-friendly for a casual digital card game. Ensure all text, especially stats, are highly legible against their backgrounds. The card should feel like a collectible item.
The rarity's visual impact on the background and border is a primary requirement. The card must be a full rectangle.`;

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
