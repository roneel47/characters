import { ChibiGenerator } from '@/components/chibi-generator';
import { ChibiClashLogo } from '@/components/icons/chibi-clash-logo';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gradient-to-br from-background to-secondary">
      <header className="mb-8 text-center">
        <ChibiClashLogo className="h-16 md:h-20 mx-auto mb-2" />
        <p className="text-muted-foreground text-lg">Create and collect adorable battle cards!</p>
      </header>
      <ChibiGenerator />
    </main>
  );
}
