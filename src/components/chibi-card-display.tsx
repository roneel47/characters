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
    <Card className="w-full max-w-md mx-auto shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className={cn(
          "aspect-[2.5/3.5] w-full rounded-lg overflow-hidden relative group",
          "shadow-[0_0_15px_2px_hsl(var(--primary)/0.7)] hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.9)] transition-shadow duration-300"
        )}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 animate-pulse">
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
              className="transition-opacity duration-500 opacity-0 group-data-[loaded=true]:opacity-100"
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
              className="opacity-50"
            />
          )}
           <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 animate-glow opacity-75 group-hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  );
}
