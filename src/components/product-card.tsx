import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out">
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-ai-hint={`${product.category} product`}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-headline leading-tight mb-1">{product.name}</CardTitle>
          <p className="text-primary font-semibold text-lg">
            ${product.price.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
