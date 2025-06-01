
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateChibiCharacterImage, type GenerateChibiCharacterImageInput } from '@/ai/flows/generate-chibi-card'; // Note: file name kept for now
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CharacterImageDisplay } from './chibi-card-display'; // Will be renamed or component name changed
import { Loader2, FileDown } from 'lucide-react';

const themes = ["Pirate", "Ninja", "Ice Cream", "Robot", "Unicorn", "Wizard", "Cat", "Astronaut", "Superhero", "Dragon", "Fairy", "Alien", "Zombie", "Vampire", "Ghost", "Disney Dolls"];
const rarities = ["Common", "Rare", "Epic", "Legendary", "Shiny"];

const formSchema = z.object({
  theme: z.string().min(1, "Theme is required."),
  rarity: z.string().min(1, "Rarity is required."),
  additionalDescription: z.string().optional(),
});

type ChibiFormValues = z.infer<typeof formSchema>;

export function ChibiGenerator() { // Consider renaming to ChibiCharacterGenerator
  const [isLoading, setIsLoading] = useState(false);
  const [characterImageUri, setCharacterImageUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ChibiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: themes[0],
      rarity: rarities[0],
      additionalDescription: "",
    },
  });

  const onSubmit: SubmitHandler<ChibiFormValues> = async (data) => {
    setIsLoading(true);
    setCharacterImageUri(null);

    const descriptionForAI = `A ${data.theme.toLowerCase()} themed chibi character. ${data.additionalDescription || ''}`.trim();
    
    const input: GenerateChibiCharacterImageInput = {
      description: descriptionForAI,
      rarity: data.rarity,
    };

    try {
      const result = await generateChibiCharacterImage(input);
      if (result.characterImageDataUri) {
        setCharacterImageUri(result.characterImageDataUri);
        toast({
          title: "Character Image Generated!",
          description: "Your Chibi character image is ready.",
        });
      } else {
        throw new Error("AI did not return image data.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (characterImageUri) {
      const link = document.createElement('a');
      link.href = characterImageUri;
      const theme = form.getValues("theme") || "Chibi";
      const rarity = form.getValues("rarity") || "Character";
      link.download = `ChibiCharacter-${theme.replace(/\s+/g, '_')}-${rarity.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Your Chibi character image is being downloaded.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center">Create Your Chibi Character</CardTitle>
            <CardDescription className="text-center">
              Select a theme, rarity, and add details for your character image!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme} value={theme}>
                              {theme}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rarity (influences character style)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select character rarity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rarities.map((rarity) => (
                            <SelectItem key={rarity} value={rarity}>
                              {rarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., holding a magic wand, wearing sunglasses"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    "Generate Character Image"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          {characterImageUri && (
            <CardFooter className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleDownload} disabled={!characterImageUri || isLoading}>
                <FileDown className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <div className="sticky top-8">
          <CharacterImageDisplay characterImageDataUri={characterImageUri} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
