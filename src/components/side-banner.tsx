import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SideBanner() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] w-full group">
        <Image
          src="https://i4.codibook.net/files/1982120376802/06203b7b6ce909f3/749276620.jpg"
          alt="Side Banner"
          fill
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="fashion model style"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-2xl font-headline font-bold drop-shadow-md">New Arrivals</h3>
          <p className="mt-2 mb-4 text-sm drop-shadow">Fresh styles just for you.</p>
          <Button asChild variant="secondary">
            <Link href="#collection">Shop Now</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
