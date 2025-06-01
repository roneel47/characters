
"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CharacterImageDisplayProps {
  characterImageDataUri: string | null;
  isLoading: boolean;
}

// Consider renaming this component file to character-image-display.tsx
export function CharacterImageDisplay({ characterImageDataUri, isLoading }: CharacterImageDisplayProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className={cn(
          "aspect-square w-full overflow-hidden relative group shadow-md rounded-md" // Changed aspect ratio and added rounded-md for the container
        )}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 animate-pulse rounded-md">
              <svg className="w-16 h-16 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : characterImageDataUri ? (
            <Image
              src={characterImageDataUri}
              alt="Generated Chibi Character"
              layout="fill"
              objectFit="contain" // Or "cover" depending on desired fit for 400x400
              className="transition-opacity duration-500 opacity-0 group-data-[loaded=true]:opacity-100 rounded-md"
              priority
              data-ai-hint="chibi character"
              onLoad={(e) => e.currentTarget.parentElement?.setAttribute('data-loaded', 'true')}
            />
          ) : (
            <Image
              src="https://placehold.co/400x400.png" // Updated placeholder
              alt="Placeholder for Chibi Character"
              layout="fill"
              objectFit="cover"
              data-ai-hint="character placeholder"
              className="opacity-50 rounded-md"
            />
          )}
           <div className="absolute inset-0 border border-black/20 rounded-md pointer-events-none" /> 
        </div>
      </CardContent>
    </Card>
  );
}
