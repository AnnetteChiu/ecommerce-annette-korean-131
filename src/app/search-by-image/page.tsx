'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
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

// Helper to resize and compress the image
const resizeAndCompressImage = (file: File, maxSize = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for compression
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(new Error('Image load error'));
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('FileReader did not return a result.'));
      }
    };
    reader.onerror = (err) => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
};


export default function SearchByImagePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load previous search from localStorage on mount
  useEffect(() => {
    try {
      const savedSearch = localStorage.getItem('visualSearch');
      if (savedSearch) {
        const { imageDataUri: savedImageDataUri, recommendationIds } = JSON.parse(savedSearch);
        if (savedImageDataUri && recommendationIds && Array.isArray(recommendationIds)) {
          setImagePreview(savedImageDataUri);
          setImageDataUri(savedImageDataUri);

          const recommendedProducts = recommendationIds
            .map((id: string) => getProductById(id))
            .filter((p): p is Product => !!p);
          
          setRecommendations(recommendedProducts);
          setSearchPerformed(true);
        }
      }
    } catch (error) {
      console.error('Failed to load visual search from localStorage', error);
      localStorage.removeItem('visualSearch'); // Clear corrupted data
    }
  }, []); // Run only on mount

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 10MB.',
        });
        return;
      }
      
      // Clear previous search from state and storage
      localStorage.removeItem('visualSearch');
      setRecommendations([]);
      setSearchPerformed(false);
      setImageDataUri(null); // Reset data URI while processing
      setImagePreview(URL.createObjectURL(file)); // Show preview immediately

      try {
        const compressedDataUri = await resizeAndCompressImage(file);
        setImageDataUri(compressedDataUri);
      } catch (error) {
        console.error('Image processing failed:', error);
        toast({
          variant: 'destructive',
          title: 'Image Processing Failed',
          description: 'Could not process the uploaded image. Please try a different one.',
        });
        setImagePreview(null);
        setImageDataUri(null);
      }
    }
  };

  const handleSearch = () => {
    if (!imageDataUri) {
      toast({
        title: 'Image is still processing',
        description: 'Please wait a moment for the image to be prepared for search.',
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
          // Persist search results for the user
           try {
            localStorage.setItem('visualSearch', JSON.stringify({
              imageDataUri: imageDataUri,
              recommendationIds: result.productIds,
            }));
          } catch (e) {
            console.error("Failed to save visual search results to localStorage", e);
          }
        } else {
          setRecommendations([]);
          localStorage.removeItem('visualSearch');
        }
      } catch (error) {
        setRecommendations([]);
        localStorage.removeItem('visualSearch');
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
                <Button onClick={handleSearch} disabled={isPending || !imageDataUri} size="lg" className="w-full">
                {isPending ? (
                    <Loader2 className="mr-2 animate-spin" />
                ) : (
                    <Search className="mr-2" />
                )}
                {isPending ? 'Analyzing...' : !imageDataUri ? 'Processing Image...' : 'Find Similar Products'}
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
