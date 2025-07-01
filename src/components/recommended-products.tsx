'use client';

import { useEffect, useState, useTransition } from 'react';
import { generateProductRecommendations } from '@/ai/flows/generate-product-recommendations';
import { getProductById, getProducts } from '@/lib/products';
import { ProductCard } from './product-card';
import type { Product } from '@/types';
import { Loader2 } from 'lucide-react';

type RecommendedProductsProps = {
  currentProductId: string;
  currentProductName: string;
};

export function RecommendedProducts({ currentProductId, currentProductName }: RecommendedProductsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        let history = [];
        try {
          const historyString = sessionStorage.getItem('browsingHistory');
          history = JSON.parse(historyString || '[]');
        } catch (e) {
          console.error("Could not read browsing history, proceeding with empty history.", e);
        }

        const result = await generateProductRecommendations({
          currentProductId,
          browsingHistory: history,
          count: 4,
        });

        if (result && result.productIds && result.productIds.length > 0) {
          const recommendedProducts = result.productIds
            .map(id => getProductById(id))
            .filter((p): p is Product => !!p);
          setRecommendations(recommendedProducts);
        } else {
            // If AI gives no results, throw an error to trigger the fallback.
            throw new Error("AI returned no recommendations.");
        }
      } catch (error) {
        console.error('AI recommendations failed, using fallback logic:', error);
        
        // Fallback Logic
        const allProducts = getProducts();
        const currentProduct = getProductById(currentProductId);
        
        let fallbackRecs: Product[] = [];

        if (currentProduct) {
          // 1. Try to get products from the same category
          fallbackRecs = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);
        }
        
        // 2. If not enough recommendations, fill with other random products
        const otherProducts = allProducts.filter(
            p => p.id !== currentProductId && !fallbackRecs.find(fr => fr.id === p.id)
        );

        // Shuffle the remaining products to ensure variety
        const shuffledOthers = otherProducts.sort(() => 0.5 - Math.random());

        // Add products until we have 4 recommendations
        while (fallbackRecs.length < 4 && shuffledOthers.length > 0) {
            fallbackRecs.push(shuffledOthers.shift()!);
        }

        setRecommendations(fallbackRecs.slice(0, 4));
      }
    });
  }, [currentProductId, currentProductName]);

  if (isPending && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finding recommendations for you...</p>
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
