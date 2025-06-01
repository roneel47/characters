
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateChibiCharacterImage, type GenerateChibiCharacterImageInput } from '@/ai/flows/generate-chibi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CharacterImageDisplay } from './chibi-card-display';
import { Loader2, FileDown } from 'lucide-react';

const themes = ["Pirate", "Ninja", "Ice Cream", "Robot", "Unicorn", "Wizard", "Cat", "Astronaut", "Superhero", "Dragon", "Fairy", "Alien", "Zombie", "Vampire", "Ghost", "Disney Dolls"];
const rarities = ["Common", "Rare", "Epic", "Legendary", "Shiny"];

const formSchema = z.object({
  theme: z.string().min(1, "Theme is required."),
  additionalDescription: z.string().optional(),
});

type ChibiFormValues = z.infer<typeof formSchema>;

interface GeneratedImageInfo {
  uri: string | null;
  rarity: string;
  theme: string;
}

export function ChibiGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageInfo[]>([]);
  const { toast } = useToast();

  const form = useForm<ChibiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: themes[0],
      additionalDescription: "",
    },
  });

  const onSubmit: SubmitHandler<ChibiFormValues> = async (data) => {
    setIsGenerating(true);
    setGeneratedImages([]);
    const currentImages: GeneratedImageInfo[] = [];

    const descriptionForAI = `A ${data.theme.toLowerCase()} themed chibi character. ${data.additionalDescription || ''}`.trim();

    for (const rarity of rarities) {
      const input: GenerateChibiCharacterImageInput = {
        description: descriptionForAI,
        rarity: rarity,
      };

      try {
        toast({
          title: `Generating ${rarity} Character...`,
          description: `Theme: ${data.theme}. Please wait.`,
        });
        const result = await generateChibiCharacterImage(input);
        if (result.characterImageDataUri) {
          currentImages.push({ uri: result.characterImageDataUri, rarity, theme: data.theme });
          setGeneratedImages([...currentImages]); // Update state incrementally
          toast({
            title: `${rarity} Character Generated!`,
            description: `Theme: ${data.theme}.`,
          });
        } else {
          throw new Error(`AI did not return image data for ${rarity} rarity.`);
        }
      } catch (error) {
        console.error(`Error generating ${rarity} image:`, error);
        currentImages.push({ uri: null, rarity, theme: data.theme }); // Add a placeholder or error indicator
        setGeneratedImages([...currentImages]);
        toast({
          variant: "destructive",
          title: `Generation Failed for ${rarity}`,
          description: error instanceof Error ? error.message : `Could not generate ${rarity} image.`,
        });
      }
    }
    setIsGenerating(false);
  };

  const handleDownload = (imageInfo: GeneratedImageInfo) => {
    if (imageInfo.uri) {
      const link = document.createElement('a');
      link.href = imageInfo.uri;
      link.download = `ChibiCharacter-${imageInfo.theme.replace(/\s+/g, '_')}-${imageInfo.rarity.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: `${imageInfo.rarity} ${imageInfo.theme} character image is being downloaded.`,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <Card className="shadow-lg md:col-span-1">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center">Create Your Chibi Characters</CardTitle>
            <CardDescription className="text-center">
              Select a theme and add details. Images for all rarities will be generated!
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
                 <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating All Images...
                    </>
                  ) : (
                    "Generate Character Images"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isGenerating && generatedImages.length === 0 && rarities.map(rarity => (
            <div key={rarity} className="flex flex-col items-center">
              <p className="font-semibold text-lg mb-2">{rarity}</p>
              <CharacterImageDisplay characterImageDataUri={null} isLoading={true} />
            </div>
          ))}
          {generatedImages.map((imageInfo, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <h3 className="text-xl font-semibold text-center">{imageInfo.rarity}</h3>
              <CharacterImageDisplay characterImageDataUri={imageInfo.uri} isLoading={isGenerating && !imageInfo.uri} />
              {imageInfo.uri && (
                <Button variant="outline" onClick={() => handleDownload(imageInfo)} disabled={!imageInfo.uri}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download {imageInfo.rarity}
                </Button>
              )}
              {!imageInfo.uri && !isGenerating && (
                <p className="text-destructive text-center">Failed to load</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
