
"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChibiCardDisplayProps {
  cardDataUri: string | null;
  isLoading: boolean;
}

export function ChibiCardDisplay({ cardDataUri, isLoading }: ChibiCardDisplayProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-card/80 backdrop-blur-sm rounded-lg">
      <CardContent className="p-4">
        <div className={cn(
          "aspect-[2.5/3.5] w-full overflow-hidden relative group",
          "shadow-[0_0_10px_1px_hsl(var(--primary)/0.5)]" // Simplified shadow
        )}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 animate-pulse rounded-md">
              <svg className="w-16 h-16 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : cardDataUri ? (
            <Image
              src={cardDataUri}
              alt="Generated Chibi Battle Card"
              layout="fill"
              objectFit="contain"
              className="transition-opacity duration-500 opacity-0 group-data-[loaded=true]:opacity-100 rounded-md" // Added rounded-md here for the image itself if desired
              priority
              data-ai-hint="battle card character"
              onLoad={(e) => e.currentTarget.parentElement?.setAttribute('data-loaded', 'true')}
            />
          ) : (
            <Image
              src="https://placehold.co/400x560.png"
              alt="Placeholder for Chibi Battle Card"
              layout="fill"
              objectFit="cover"
              data-ai-hint="card game character"
              className="opacity-50 rounded-md" // Added rounded-md here
            />
          )}
           <div className="absolute inset-0 border border-black/20 rounded-md pointer-events-none" /> 
        </div>
      </CardContent>
    </Card>
  );
}
