'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { findSimilarProducts } from '@/ai/flows/find-similar-products';
import { getProductById } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Upload, ImageOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SearchByImagePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageDataUri(result);
        setRecommendations([]); // Clear previous recommendations
        setSearchPerformed(false); // Reset on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (!imageDataUri) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image to find similar products.',
      });
      return;
    }

    setSearchPerformed(true);
    startTransition(async () => {
      try {
        const result = await findSimilarProducts({
          photoDataUri: imageDataUri,
          count: 4,
        });

        if (result.productIds && result.productIds.length > 0) {
          const recommendedProducts = result.productIds
            .map(id => getProductById(id))
            .filter((p): p is Product => !!p);
          setRecommendations(recommendedProducts);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        setRecommendations([]);
        console.error('Failed to find similar products:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'We could not perform the search at this time. Please try again later.',
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Find Your Style</CardTitle>
          <CardDescription>Upload an image to find products with a similar look.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-center">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
              <Upload className="mr-2" />
              Upload Image
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
          </div>

          {imagePreview && (
            <div className="mt-4 p-4 border rounded-lg w-full max-w-md flex flex-col items-center gap-4">
                <Image
                    src={imagePreview}
                    alt="Image preview"
                    width={400}
                    height={400}
                    className="rounded-md object-contain max-h-96 w-auto"
                />
                <Button onClick={handleSearch} disabled={isPending} size="lg" className="w-full">
                {isPending ? (
                    <Loader2 className="mr-2 animate-spin" />
                ) : (
                    <Search className="mr-2" />
                )}
                {isPending ? 'Analyzing...' : 'Find Similar Products'}
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isPending && (
         <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing your image...</p>
        </div>
      )}

      {!isPending && searchPerformed && recommendations.length === 0 && (
        <div className="w-full mt-8 text-center border rounded-lg p-12 bg-muted/50">
          <ImageOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline font-bold">No Matches Found</h2>
          <p className="text-muted-foreground mt-2">We couldn't find any products that match your style. Please try a different image.</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="w-full mt-8">
            <h2 className="text-3xl font-headline font-bold mb-8 text-center">Our Recommendations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendations.map(product => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
