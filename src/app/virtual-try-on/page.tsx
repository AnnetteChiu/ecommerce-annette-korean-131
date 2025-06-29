
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Image from 'next/image';
import { virtualTryOn } from '@/ai/flows/virtual-try-on-flow';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VirtualTryOnPage() {
  const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
  const [modelImageDataUri, setModelImageDataUri] = useState<string | null>(null);
  const [modelImageUrl, setModelImageUrl] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);
  
  const clearModelState = () => {
    setGeneratedImage(null);
    setSelectedProduct(null);
  }

  const handleModelImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setModelImagePreview(URL.createObjectURL(file));
        setModelImageDataUri(result);
        clearModelState();
      };
      reader.readAsDataURL(file);
    }
  };

  const imageUrlToDataUri = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }

  const handleUrlSubmit = async () => {
    if (!modelImageUrl) {
        toast({ title: 'Please enter an image URL.'});
        return;
    }
    setIsFetchingUrl(true);
    try {
        const dataUri = await imageUrlToDataUri(modelImageUrl);
        setModelImageDataUri(dataUri);
        setModelImagePreview(modelImageUrl);
        clearModelState();
    } catch (error) {
        console.error("Failed to fetch image from URL:", error);
        toast({
            variant: 'destructive',
            title: 'Failed to load image',
            description: 'Could not fetch image from the URL. Please check the link or try another.',
        });
    } finally {
        setIsFetchingUrl(false);
    }
  }

  const handleTryOn = (product: Product) => {
    if (!modelImageDataUri) {
      toast({
        title: 'No Model Image',
        description: 'Please upload a photo of a person first.',
      });
      return;
    }
    setSelectedProduct(product);
    setGeneratedImage(null);

    startTransition(async () => {
      try {
        const productPhotoDataUri = await imageUrlToDataUri(product.imageUrl);

        const result = await virtualTryOn({
          modelPhotoDataUri: modelImageDataUri,
          productPhotoDataUri,
        });

        if (result.generatedImageUri) {
          setGeneratedImage(result.generatedImageUri);
        } else {
          toast({
            variant: 'destructive',
            title: 'Try-On Failed',
            description: 'We couldn\'t generate the image. Please try another product or model image.',
          });
        }
      } catch (error) {
        console.error('Failed to perform virtual try-on:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'We could not perform the try-on at this time. Please try again later.',
        });
      }
    });
  };

  const isLoading = isPending || isFetchingUrl;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">Virtual Try-On</h1>
        <p className="text-muted-foreground mt-2">See how our clothes look on you. Upload your photo to get started.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Uploader and Image Display */}
        <div className="flex flex-col gap-8 items-center sticky top-24">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>1. Upload Your Photo</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                     <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg" className="w-full" disabled={isLoading}>
                        <Upload className="mr-2" />
                        Choose a photo from your device
                    </Button>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleModelImageUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        disabled={isLoading}
                    />
                    <div className="flex items-center gap-2">
                        <hr className="flex-grow border-t" />
                        <span className="text-muted-foreground text-sm">OR</span>
                        <hr className="flex-grow border-t" />
                    </div>
                    <div className="flex items-center gap-2">
                         <Input
                            type="url"
                            placeholder="Paste an image URL"
                            value={modelImageUrl}
                            onChange={(e) => setModelImageUrl(e.target.value)}
                            disabled={isLoading}
                         />
                         <Button onClick={handleUrlSubmit} disabled={isLoading} size="icon" aria-label="Use URL">
                            {isFetchingUrl ? <Loader2 className="animate-spin" /> : <LinkIcon />}
                         </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="w-full aspect-[3/4] relative border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20">
                {(isPending || isFetchingUrl) && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">
                          {isPending ? 'Generating your new look...' : 'Fetching your image...'}
                        </p>
                        {isPending && <p className="text-sm text-muted-foreground/80">This can take a moment.</p>}
                    </div>
                )}
                
                {generatedImage ? (
                     <Image src={generatedImage} alt="Virtual try-on result" fill className="object-cover rounded-lg" />
                ) : modelImagePreview ? (
                    <Image src={modelImagePreview} alt="Model preview" fill className="object-cover rounded-lg" />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <p>Your photo will appear here.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Product Selector */}
        <div className="flex flex-col gap-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>2. Select an Item to Try On</CardTitle>
                    <CardDescription>Click a product to see it on your photo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto p-1">
                        {products.map((product) => (
                            <div key={product.id} className="relative group">
                                <button 
                                    onClick={() => handleTryOn(product)} 
                                    disabled={isLoading || !modelImageDataUri}
                                    className="w-full text-left border-2 rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <div className="aspect-square overflow-hidden">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-2 bg-background">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                                    </div>
                                </button>
                                {isPending && selectedProduct?.id === product.id && (
                                     <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                        <Loader2 className="w-6 h-6 animate-spin"/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
