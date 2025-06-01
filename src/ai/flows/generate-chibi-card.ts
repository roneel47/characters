
'use server';
/**
 * @fileOverview Generates a Chibi Battle Card image based on a textual description, attack, defense, height, and rarity.
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
    const imagePromptText = `Create a Chibi Battle Card with a MINIMAL and CLEAN design, inspired by the provided visual example. The final image dimensions MUST be 500 pixels wide by 700 pixels tall. The overall card should have SLIGHTLY ROUNDED CORNERS.

Character Description: "${input.description}".
Character Art Style: Cute, Chibi-style character (like Fall Guys/Stumble Guys or the example image), colorful, non-violent, wearing a fun costume matching the theme. Playful pose. The character should be the main focus and take up a significant portion of the upper card area.

Card Layout:
1.  Character Art Area:
    *   The character art should be contained within a SHARP RECTANGULAR frame. This frame is inside the overall card.
    *   Background (within character art area): Simple, thematic, subtly influenced by rarity.
    *   Border (around character art area): Clean, thin line.
2.  Bottom Section: A distinct rectangular area below the character art, for name and attributes. This section should be clearly separated from the character art area.
    *   Character Name: Displayed prominently in this bottom section, using a clear, legible, slightly playful font. (You can invent a fitting name based on the theme and character).
    *   Attributes: Clearly display Attack, Defense, and Height in this bottom section.
        *   For each attribute (Attack: "${input.attack}", Defense: "${input.defense}", Height: "${input.height}"):
            *   The numeric VALUE (e.g., "${input.attack}") should be inside a small, solid-colored rectangular box. The color of this box can be thematic or a standard accent color.
            *   The attribute LABEL (e.g., "ATTACK") should be written clearly and legibly underneath its respective value box.

Rarity Influence ("${input.rarity}"): This is crucial and MUST subtly dictate the card's background (within the character art area) and accent colors/thin outer border of the overall card.
- Common: Simple, clean background. Standard, minimal border/accents.
- Rare: Subtle cool blue-themed hues in the background and/or border/accents.
- Epic: Subtle impressive purple-themed hues in the background and/or border/accents.
- Legendary: Subtle majestic golden or bright yellow-themed hues in the background and/or border/accents.
- Shiny: Subtle vibrant, sparkling, or holographic-style hints in the background, with hints of stars or glitter. The character itself might also have a slight shimmer. The border/accents should also reflect this shininess subtly.

Overall Style: Light-hearted, colorful, cute, and minimal. Ensure all text (name, attributes) is highly legible. The card should feel like a collectible item from a modern, cute game. The card itself must be a full rectangle with slightly rounded outer corners, but the inner character art frame must have sharp corners. Avoid overly complex designs; prioritize clarity and cuteness. The final image MUST be 500x700 pixels.
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

    return {cardDataUri: media.url};
  }
);
