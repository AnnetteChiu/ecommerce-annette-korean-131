'use client';

import { useEffect, useState, useTransition } from 'react';
import { generateProductRecommendations } from '@/ai/flows/generate-product-recommendations';
import { getProductById } from '@/lib/products';
import { ProductCard } from './product-card';
import type { Product } from '@/types';
import { Loader2 } from 'lucide-react';

type RecommendedProductsProps = {
  currentProductId: string;
};

export function RecommendedProducts({ currentProductId }: RecommendedProductsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      setError(null);
      try {
        const history = JSON.parse(sessionStorage.getItem('browsingHistory') || '[]');
        const result = await generateProductRecommendations({
          currentProductId,
          browsingHistory: history,
          count: 4,
        });

        if (result.productIds) {
          const recommendedProducts = result.productIds
            .map(id => getProductById(id))
            .filter((p): p is Product => !!p);
          setRecommendations(recommendedProducts);
        }
      } catch (error) {
        console.error('Failed to generate product recommendations:', error);
        setError("Could not load recommendations.");
      }
    });
  }, [currentProductId]);

  if (isPending && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finding recommendations for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 pt-8 border-t">
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">You Might Also Like</h2>
        <div className="text-center text-muted-foreground bg-accent p-6 rounded-lg max-w-2xl mx-auto">
          <p className="font-semibold text-destructive mb-2">Could Not Load Recommendations</p>
          <p>There was an error fetching recommendations. This can happen if the AI service isn't configured correctly on the server (e.g., missing an API key in the production environment).</p>
        </div>
      </div>
    );
  }

  if (!isPending && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t">
      <h2 className="text-3xl font-headline font-bold mb-8 text-center">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
