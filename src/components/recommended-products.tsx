
'use client';

import { useEffect, useState, useTransition } from 'react';
import { generateProductRecommendations } from '@/ai/flows/generate-product-recommendations';
import { getProductById } from '@/lib/products';
import { ProductCard } from './product-card';
import type { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RecommendedProductsProps = {
  currentProductId: string;
  currentProductName: string;
};

export function RecommendedProducts({ currentProductId, currentProductName }: RecommendedProductsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

        const recommendedProducts = result.productIds
          .map(id => getProductById(id))
          .filter((p): p is Product => !!p);
        
        setRecommendations(recommendedProducts);

      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        let description = "We couldn't find recommendations at this time.";
        if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
            description = 'The Google AI API key is not configured correctly. Please see the documentation for instructions.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Could Not Load Recommendations',
          description: description,
        });
        
        setRecommendations([]);
      }
    });
  }, [currentProductId, currentProductName, toast]);

  if (isPending && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finding recommendations for you...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't render the section if there are no recommendations
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
