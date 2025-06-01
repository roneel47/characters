'use server';
/**
 * @fileOverview Generates a Chibi Battle Card image based on a textual description.
 *
 * - generateChibiCard - A function that handles the card generation process.
 * - GenerateChibiCardInput - The input type for the generateChibiCard function.
 * - GenerateChibiCardOutput - The return type for the generateChibiCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChibiCardInputSchema = z.object({
  description: z.string().describe('The description of the Chibi Battle Card.'),
  attack: z.number().describe('The attack value for the card.'),
  defense: z.number().describe('The defense value for the card.'),
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

const generateChibiCardPrompt = ai.definePrompt({
  name: 'generateChibiCardPrompt',
  input: {schema: GenerateChibiCardInputSchema},
  output: {schema: GenerateChibiCardOutputSchema},
  prompt: `Create a cute, cartoon-style battle card featuring a chibi or bean-shaped character in the style of Fall Guys or Stumble Guys. The character should be colorful, non-violent, and wearing a fun costume that matches a theme. The card should include the following:\n\nCharacter in center with a playful pose\nCard name at the top in bubbly, rounded font\nAttack: {{{attack}}}\nDefense: {{{defense}}}\nA soft glowing border around the card frame\nBackground matching the character’s theme (e.g., candy world, space, jungle, etc.)\n\nMake the overall style light-hearted, colorful, and game-friendly for a casual digital card game.\n\nDescription: {{{description}}}`,
});

const generateChibiCardFlow = ai.defineFlow(
  {
    name: 'generateChibiCardFlow',
    inputSchema: GenerateChibiCardInputSchema,
    outputSchema: GenerateChibiCardOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: input.description,  
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {cardDataUri: media.url!};
  }
);
