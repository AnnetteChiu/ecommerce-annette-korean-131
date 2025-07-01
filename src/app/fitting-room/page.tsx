
'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types';
import { virtualTryOn } from '@/ai/flows/virtual-try-on';
import { useAi } from '@/context/ai-context';
import { convertImageUrlToDataUri } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, PersonStanding, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Helper to resize and compress an image from a data URI
const resizeImage = (dataUri: string, maxSize = 1024, quality = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
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
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(new Error('Image load error'));
        img.src = dataUri;
    });
};

export default function FittingRoomPage() {
    const { isAiEnabled, disableAi } = useAi();
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, startTransition] = useTransition();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();

    const apparelProducts = getProducts().filter(p => p.category === 'Apparel');

    useEffect(() => {
        try {
            const savedTryOn = sessionStorage.getItem('fittingRoomResult');
            if (savedTryOn) {
                const { captured, generated, product } = JSON.parse(savedTryOn);
                if (captured && generated && product) {
                    setCapturedImage(captured);
                    setGeneratedImage(generated);
                    setSelectedProduct(product);
                }
            }
        } catch (error) {
            console.error("Failed to load fitting room state from sessionStorage", error);
            sessionStorage.removeItem('fittingRoomResult');
        }
    }, []); // Run only on mount

    useEffect(() => {
        const getCameraPermission = async () => {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use the virtual try-on.',
                });
            }
          } else {
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not seem to support camera access.',
            });
          }
        };

        getCameraPermission();
        
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);

    const handleVirtualTryOn = useCallback((productToTryOn: Product) => {
        if (!isAiEnabled || !capturedImage) {
            if (isAiEnabled && !capturedImage) {
                toast({
                    variant: 'destructive',
                    title: 'No Photo Captured',
                    description: 'Please capture a photo first, then select an item to try on.',
                });
            }
            return;
        }

        startTransition(async () => {
            try {
                const productImageDataUri = await convertImageUrlToDataUri(productToTryOn.imageUrl);
                const resizedCapturedImage = await resizeImage(capturedImage);
                const result = await virtualTryOn({
                    userPhotoDataUri: resizedCapturedImage,
                    productImageDataUri: productImageDataUri,
                });

                if (result.generatedImageDataUri) {
                    setGeneratedImage(result.generatedImageDataUri);
                    try {
                        sessionStorage.setItem('fittingRoomResult', JSON.stringify({
                            captured: resizedCapturedImage,
                            generated: result.generatedImageDataUri,
                            product: productToTryOn,
                        }));
                    } catch (e) {
                        console.error("Failed to save fitting room state to sessionStorage", e);
                    }
                }
            } catch (error) {
                console.error('Virtual try-on failed:', error);
                const description = error instanceof Error ? error.message : "An unknown error occurred.";
                if (description.includes('API key') || description.includes('API_KEY_INVALID')) {
                    disableAi();
                    toast({
                        variant: 'destructive',
                        title: 'Google AI Key Invalid',
                        description: 'Your API key is invalid. All AI features have been disabled.',
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Generation Failed',
                        description,
                    });
                }
            }
        });
    }, [isAiEnabled, capturedImage, startTransition, toast, disableAi]);
    
    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        handleVirtualTryOn(product);
    };

    const handleCapturePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg', 0.9);

            try {
                const resizedDataUri = await resizeImage(dataUri);
                setCapturedImage(resizedDataUri);
            } catch (error) {
                 console.error("Failed to resize image", error);
                toast({
                    variant: 'destructive',
                    title: 'Photo Capture Failed',
                    description: 'Could not process the captured photo. Please try again.',
                });
                setCapturedImage(null);
            }
            setGeneratedImage(null);
            sessionStorage.removeItem('fittingRoomResult');
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setGeneratedImage(null);
        setSelectedProduct(null);
        sessionStorage.removeItem('fittingRoomResult');
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-headline font-bold">AI Fitting Room</h1>
                <p className="text-muted-foreground mt-2">Virtually try on our collection from the comfort of your home.</p>
            </div>

            {!isAiEnabled && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Google AI API Key Required</AlertTitle>
                    <AlertDescription>
                      This feature is disabled. To enable it, set your Google AI API key in a <code>.env.local</code> file. See the <Link href="/docs" className="underline">documentation</Link> for details.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Camera /> Step 1: Your Photo</CardTitle>
                        <CardDescription>
                            {capturedImage ? "Your photo is ready. Retake or proceed to step 2." : "Position yourself in the frame and capture a photo."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !!capturedImage })} autoPlay muted playsInline />
                            {capturedImage && (
                                <Image src={capturedImage} alt="Captured photo" fill className="object-cover" />
                            )}
                            
                            {hasCameraPermission === null && !capturedImage && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground p-4 bg-background/80 backdrop-blur-sm z-10">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Requesting camera access...</p>
                                </div>
                            )}

                            {hasCameraPermission === false && !capturedImage && (
                                <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm z-10">
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>
                                            Please allow camera access in your browser to use the virtual try-on. You may need to check your browser's site settings.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <Button onClick={capturedImage ? handleRetake : handleCapturePhoto} className="w-full" disabled={hasCameraPermission !== true}>
                            <Camera className="mr-2"/>
                            {capturedImage ? 'Retake Photo' : 'Capture Photo'}
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="sticky top-24">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><PersonStanding /> Step 2: Select & See</CardTitle>
                        <CardDescription>{isAiEnabled ? "Choose an item. Your new look will generate automatically." : "This feature is disabled until the API key is configured."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ScrollArea className="w-full">
                            <div className={cn("flex space-x-4 pb-4", !isAiEnabled && "opacity-50 pointer-events-none")}>
                                {apparelProducts.map(product => (
                                    <div 
                                        key={product.id} 
                                        className="flex-shrink-0 cursor-pointer" 
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <div className={cn(
                                            "rounded-lg overflow-hidden border-2 transition-all",
                                            selectedProduct?.id === product.id ? 'border-primary shadow-lg' : 'border-transparent'
                                        )}>
                                            <Image 
                                                src={product.imageUrl} 
                                                alt={product.name} 
                                                width={150} 
                                                height={200} 
                                                className="object-cover w-[150px] h-[200px]"
                                                data-ai-hint={`${product.category} product`}
                                            />
                                        </div>
                                        <p className="text-xs mt-1 text-center font-medium w-[150px] truncate">{product.name}</p>
                                    </div>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                        
                        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground">
                            {isGenerating ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/50 z-10">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Generating your new look...</p>
                                </div>
                            ) : !isAiEnabled ? (
                                <div className="p-4 w-full">
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Google AI API Key Required</AlertTitle>
                                        <AlertDescription>
                                          This feature is disabled. To enable it, set your Google AI API key in a <code>.env.local</code> file. See the <Link href="/docs" className="underline">documentation</Link> for details.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            ) : generatedImage ? (
                                <Image src={generatedImage} alt="Virtual try-on result" fill className={cn("object-cover", isGenerating && "opacity-50")} />
                            ) : (
                                <p className="text-center p-4">Your result will appear here.</p>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
