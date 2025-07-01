
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { findSimilarProducts } from '@/ai/flows/find-similar-products';
import { getProductById, getProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Upload, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAi } from '@/context/ai-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const { isAiEnabled } = useAi();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load previous search from localStorage on mount
  useEffect(() => {
    if (!isAiEnabled) return;
    try {
      const savedSearch = localStorage.getItem('visualSearch');
      if (savedSearch) {
        const { imageDataUri: savedImageDataUri, recommendationIds } = JSON.parse(savedSearch);
        if (savedImageDataUri && Array.isArray(recommendationIds) && recommendationIds.length > 0) {
          setImagePreview(savedImageDataUri);
          setImageDataUri(savedImageDataUri);

          const recommendedProducts = recommendationIds
            .map((id: string) => getProductById(id))
            .filter((p): p is Product => !!p);
          
          if (recommendedProducts.length > 0) {
            setRecommendations(recommendedProducts);
            setSearchPerformed(true);
          } else {
            localStorage.removeItem('visualSearch');
          }
        } else {
          localStorage.removeItem('visualSearch');
        }
      }
    } catch (error) {
      console.error('Failed to load visual search from localStorage', error);
      localStorage.removeItem('visualSearch'); // Clear corrupted data
    }
  }, [isAiEnabled]); // Run only on mount

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
      setRecommendations([]);
      setSearchPerformed(false);
      setImageDataUri(null); // Reset data URI while processing
      setImagePreview(URL.createObjectURL(file)); // Show preview immediately
      localStorage.removeItem('visualSearch');

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
    setRecommendations([]);
    startTransition(async () => {
      try {
        const result = await findSimilarProducts({
          photoDataUri: imageDataUri,
          count: 4,
        });

        const recommendedProducts = result.productIds
          .map(id => getProductById(id))
          .filter((p): p is Product => !!p);

        setRecommendations(recommendedProducts);

        if (recommendedProducts.length > 0) {
            try {
              localStorage.setItem('visualSearch', JSON.stringify({
                imageDataUri: imageDataUri,
                recommendationIds: result.productIds,
              }));
            } catch (e) {
              console.error("Failed to save visual search results to localStorage", e);
            }
        } else {
            toast({
                title: "No Products Found",
                description: "Your product catalog appears to be empty."
            })
            localStorage.removeItem('visualSearch');
        }
      } catch (error) {
        console.error("Visual search error:", error);
        const description = error instanceof Error ? error.message : "An unknown error occurred.";
        
        // Use a client-side fallback if the AI fails for any reason other than a misconfigured key
        if (!description.includes('API key')) {
             toast({
                variant: "destructive",
                title: "Visual Search Unsuccessful",
                description: "We couldn't find a match, but here are some of our popular items!",
            });
            const fallbackProducts = getProducts().sort(() => 0.5 - Math.random()).slice(0, 4);
            setRecommendations(fallbackProducts);
        } else {
            // Show the specific API key error
            toast({
                variant: "destructive",
                title: "Visual Search Failed",
                description: description,
            });
            setRecommendations([]);
        }
        
        localStorage.removeItem('visualSearch');
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
          {!isAiEnabled && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>AI Feature Disabled</AlertTitle>
                <AlertDescription>
                  Your Google AI API key is not configured. Please add it to <code>src/ai/config.ts</code> to enable this feature.
                </AlertDescription>
            </Alert>
          )}
          <div className="w-full flex justify-center">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg" disabled={!isAiEnabled}>
              <Upload className="mr-2" />
              Upload Image
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              disabled={!isAiEnabled}
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
                <Button onClick={handleSearch} disabled={isPending || !imageDataUri || !isAiEnabled} size="lg" className="w-full">
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

      {!isPending && recommendations.length > 0 && (
        <div className="w-full mt-8">
            <h2 className="text-3xl font-headline font-bold mb-8 text-center">
              { searchPerformed ? "Our Recommendations" : "Your Previous Search Results" }
            </h2>
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
