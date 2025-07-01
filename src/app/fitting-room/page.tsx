'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types';
import { virtualTryOn } from '@/ai/flows/virtual-try-on';
import { useAi } from '@/context/ai-context';
import Link from 'next/link';
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
    const { isAiEnabled } = useAi();
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [showAiNotice, setShowAiNotice] = useState(false);
    const [isGenerating, startTransition] = useTransition();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();

    const apparelProducts = getProducts().filter(p => p.category === 'Apparel');

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
            // Stop camera stream on component unmount
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);

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

            setGeneratedImage(null); // Clear previous results
            setGenerationError(null);
            setShowAiNotice(false);
        }
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setGenerationError(null);
        setGeneratedImage(null);
    };

    const handleVirtualTryOn = () => {
        if (!capturedImage || !selectedProduct) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please capture a photo and select a product to try on.',
            });
            return;
        }

        setShowAiNotice(false);
        setGenerationError(null);
        setGeneratedImage(null); // Clear previous results before starting

        if (!isAiEnabled) {
            setShowAiNotice(true);
            return;
        }

        startTransition(async () => {
            try {
                const productImageDataUri = await convertImageUrlToDataUri(selectedProduct.imageUrl);
                
                const resizedCapturedImage = await resizeImage(capturedImage);

                const result = await virtualTryOn({
                    userPhotoDataUri: resizedCapturedImage,
                    productImageDataUri: productImageDataUri,
                });

                if (result.generatedImageDataUri) {
                    setGeneratedImage(result.generatedImageDataUri);
                } else {
                    throw new Error("AI did not return an image.");
                }
            } catch (error) {
                console.error('Virtual try-on failed:', error);
                setGeneratedImage(capturedImage); 
                setGenerationError("We couldn't generate the image, but here's your original photo. The AI may have had trouble with this combination. Please try a different item or photo.");
            }
        });
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setGeneratedImage(null);
        setGenerationError(null);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-headline font-bold">AI Fitting Room</h1>
                <p className="text-muted-foreground mt-2">Virtually try on our collection from the comfort of your home.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                    {/* Step 1: Capture Photo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Camera /> Step 1: Your Photo</CardTitle>
                            <CardDescription>
                                {capturedImage ? "Retake your photo or proceed to the next step." : "Position yourself in the frame and capture a photo."}
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

                    {/* Step 2: Select Product */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><PersonStanding /> Step 2: Select an Item</CardTitle>
                            <CardDescription>Choose a piece of clothing to try on.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full">
                                <div className="flex space-x-4 pb-4">
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
                        </CardContent>
                    </Card>
                </div>
                
                {/* Step 3: Generate & Result */}
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles /> Step 3: See Your Look</CardTitle>
                        <CardDescription>Once you have your photo and selected an item, generate your new look!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Button onClick={handleVirtualTryOn} disabled={!capturedImage || !selectedProduct || isGenerating} className="w-full" size="lg">
                            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            {isGenerating ? 'Generating...' : 'Virtually Try It On'}
                        </Button>
                        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground">
                            {isGenerating ? (
                                <>
                                    {generatedImage ? (
                                        <>
                                            <Image src={generatedImage} alt="Virtual try-on result" fill className="object-cover opacity-50" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/50 z-10">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                                <p>Generating new look...</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                            <p>Our AI is styling you...</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {generatedImage ? (
                                        <Image src={generatedImage} alt="Virtual try-on result" fill className="object-cover" />
                                    ) : capturedImage ? (
                                        <Image src={capturedImage} alt="Your captured photo" fill className="object-cover" />
                                    ) : (
                                        <p>Your result will appear here.</p>
                                    )}
                                </>
                            )}
                        </div>
                        {showAiNotice && (
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>AI Feature Inactive</AlertTitle>
                                <AlertDescription>
                                  A Google AI API key is required. Please add your key to the
                                  {' '}<code className="font-mono bg-muted p-1 rounded-md">.env.local</code> file and restart the server.
                                  See the{' '}
                                  <Link href="/docs" className="font-medium text-primary underline">
                                    documentation
                                  </Link>
                                  {' '}for detailed instructions.
                                </AlertDescription>
                            </Alert>
                        )}
                        {generationError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Generation Failed</AlertTitle>
                                <AlertDescription>
                                    {generationError}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
