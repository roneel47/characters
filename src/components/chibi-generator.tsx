
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateChibiCard, type GenerateChibiCardInput } from '@/ai/flows/generate-chibi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChibiCardDisplay } from './chibi-card-display';
import { Loader2, FileDown } from 'lucide-react';

const themes = ["Pirate", "Ninja", "Ice Cream", "Robot", "Unicorn", "Wizard", "Cat", "Astronaut", "Superhero", "Dragon", "Fairy", "Alien", "Zombie", "Vampire", "Ghost"];
const rarities = ["Common", "Rare", "Epic", "Legendary", "Shiny"];
const sizes = ["Tiny", "Small", "Medium", "Large", "Giant"];

const formSchema = z.object({
  theme: z.string().min(1, "Theme is required."),
  rarity: z.string().min(1, "Rarity is required."),
  additionalDescription: z.string().optional(),
  attack: z.coerce.number().min(0, "Attack must be at least 0.").max(100, "Attack cannot exceed 100."),
  defense: z.coerce.number().min(0, "Defense must be at least 0.").max(100, "Defense cannot exceed 100."),
  size: z.string().min(1, "Size is required."),
  height: z.string().min(1, "Height is required.").max(20, "Height seems too long (max 20 chars)."),
});

type ChibiFormValues = z.infer<typeof formSchema>;

export function ChibiGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [cardImageUri, setCardImageUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ChibiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: themes[0],
      rarity: rarities[0],
      additionalDescription: "",
      attack: 10,
      defense: 10,
      size: sizes[2], // Default to Medium
      height: "5cm", 
    },
  });

  const onSubmit: SubmitHandler<ChibiFormValues> = async (data) => {
    setIsLoading(true);
    setCardImageUri(null);

    const descriptionForAI = `A ${data.theme.toLowerCase()} themed chibi character. ${data.additionalDescription || ''}`.trim();
    
    const input: GenerateChibiCardInput = {
      description: descriptionForAI,
      attack: data.attack,
      defense: data.defense,
      size: data.size,
      height: data.height,
      rarity: data.rarity,
    };

    try {
      const result = await generateChibiCard(input);
      if (result.cardDataUri) {
        setCardImageUri(result.cardDataUri);
        toast({
          title: "Card Generated!",
          description: "Your Chibi Clash Card is ready.",
        });
      } else {
        throw new Error("AI did not return card data.");
      }
    } catch (error) {
      console.error("Error generating card:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate card. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (cardImageUri) {
      const link = document.createElement('a');
      link.href = cardImageUri;
      const theme = form.getValues("theme") || "Chibi";
      const rarity = form.getValues("rarity") || "Card";
      const attack = form.getValues("attack");
      const defense = form.getValues("defense");
      link.download = `ChibiCard-${theme.replace(/\s+/g, '_')}-${rarity.replace(/\s+/g, '_')}-A${attack}-D${defense}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Your Chibi card is being downloaded.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center">Create Your Chibi Card</CardTitle>
            <CardDescription className="text-center">
              Select a theme, rarity, add details, and set attributes for your card!
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
                      <FormLabel>Rarity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select card rarity" />
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
                          placeholder="e.g., holding a shiny sword, wearing a party hat"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="attack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attack</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Defense</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select character size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
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
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder='e.g., "5cm" or "Tall"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Card"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          {cardImageUri && (
            <CardFooter className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleDownload} disabled={!cardImageUri || isLoading}>
                <FileDown className="mr-2 h-4 w-4" />
                Download Card
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <div className="sticky top-8">
          <ChibiCardDisplay cardDataUri={cardImageUri} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
