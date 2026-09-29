import { Desktop } from '@/components/Desktop';
import { ThemeSync } from '@/components/ThemeSync';

export default function Home() {
  return (
    <main className="relative w-screen h-dvh overflow-hidden">
      <ThemeSync />
      <Desktop />
    </main>
  );
}
