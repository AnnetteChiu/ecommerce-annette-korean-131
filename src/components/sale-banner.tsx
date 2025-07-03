import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SaleBanner() {
  return (
    <section className="relative h-[60vh] rounded-lg overflow-hidden flex items-center justify-center text-center text-white p-8 shadow-xl">
      <Image
        src="https://placehold.co/1200x800.png"
        alt="Stylish model wearing new arrivals"
        fill
        className="object-cover object-center"
        priority
        data-ai-hint="fashion model"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-2xl flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 drop-shadow-md">Explore Our New Collection</h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow">
          Discover the latest trends and timeless pieces, curated just for you.
        </p>
        <Button asChild size="lg">
          <Link href="#collection">Shop Now</Link>
        </Button>
      </div>
    </section>
  );
}
