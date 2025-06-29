import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const brands = [
  { name: 'Aura', href: '#' },
  { name: 'Elysian', href: '#' },
  { name: 'Vertex', href: '#' },
  { name: 'Momentum', href: '#' },
  { name: 'Solstice', href: '#' },
];

export function BrandWeek() {
  return (
    <section className="py-12 bg-secondary/50 rounded-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-headline font-bold mb-8 text-center text-primary">Brand of the Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
          {brands.map((brand) => (
            <Link key={brand.name} href={brand.href} className="group">
              <Card className="flex items-center justify-center h-24 bg-background transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
                <CardContent className="p-0">
                  <span className="text-2xl font-bold font-headline text-muted-foreground group-hover:text-primary">{brand.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
