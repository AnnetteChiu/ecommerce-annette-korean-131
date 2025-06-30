import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SaleBanner() {
  return (
    <section className="relative h-[60vh] rounded-lg overflow-hidden flex items-center justify-center text-center text-white p-8 shadow-xl">
      <Image
        src="https://i3.codibook.net/files/1982091248011/db83bd046d982ef6/1061289592.jpg"
        alt="Woman in stylish outfit"
        fill
        className="object-cover object-right"
        priority
        data-ai-hint="fashion model"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-2xl flex flex-col items-center">
        <div className="bg-destructive/90 text-destructive-foreground font-bold text-2xl md:text-3xl py-2 px-8 mb-4 inline-block rounded-md shadow-lg">
          7折優惠
        </div>
        <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 drop-shadow-md">季節性促銷</h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow">
          所有您喜愛的款式限時優惠！
        </p>
        <Button asChild size="lg">
          <Link href="#collection">選購折扣商品</Link>
        </Button>
      </div>
    </section>
  );
}
