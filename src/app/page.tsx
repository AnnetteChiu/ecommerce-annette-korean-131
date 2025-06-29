import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shirt } from 'lucide-react';

export default function Home() {
  const products = getProducts();

  return (
    <div>
      <div className="text-center my-12">
        <h1 className="text-4xl font-headline font-bold mb-4">Virtual Try-On</h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Curious how it looks? Upload your photo and try on our collection virtually.
        </p>
        <Button asChild size="lg">
          <Link href="/virtual-try-on">
            <Shirt className="mr-2" />
            Try It Now
          </Link>
        </Button>
      </div>

      <div className="border-t my-12"></div>

      <h2 className="text-4xl font-headline font-bold mb-8 text-center">Our Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
