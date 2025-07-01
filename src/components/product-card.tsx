'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [totalImpressions, setTotalImpressions] = useState(product.impressions);

  useEffect(() => {
    try {
      const viewsString = localStorage.getItem('productImpressions');
      if (viewsString) {
        const views = JSON.parse(viewsString);
        const additionalViews = views[product.id] || 0;
        setTotalImpressions(product.impressions + additionalViews);
      }
    } catch (error) {
      console.error("Could not read product impressions from localStorage:", error);
      setTotalImpressions(product.impressions);
    }
  }, [product.id, product.impressions]);

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
          <div className="flex items-center justify-between">
            <p className="text-primary font-semibold text-lg">
              ${product.price.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{totalImpressions.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
