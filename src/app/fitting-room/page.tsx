
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types';
import { virtualTryOn } from '@/ai/flows/virtual-try-on';
import { useAi } from '@/context/ai-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, PersonStanding, Sparkles, AlertTriangle, PowerOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function FittingRoomPage() {
    const { isAiEnabled } = useAi();
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
                    description: 'Please enable camera permissions in your browser settings to use the fitting room.',
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

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImage(dataUri);
            setGeneratedImage(null); // Clear previous results
        }
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

        startTransition(async () => {
            setGeneratedImage(null);
            try {
                const result = await virtualTryOn({
                    userPhotoDataUri: capturedImage,
                    productImageUrl: selectedProduct.imageUrl,
                });

                if (result.generatedImageDataUri) {
                    setGeneratedImage(result.generatedImageDataUri);
                } else {
                    throw new Error("AI did not return an image.");
                }
            } catch (error) {
                console.error('Virtual try-on failed:', error);
                toast({
                    variant: 'destructive',
                    title: 'Generation Failed',
                    description: 'Could not generate the image. The AI might be busy, or the images might not be suitable. Please try again.',
                });
            }
        });
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
                                                Please allow camera access in your browser to use this feature. You may need to check your browser's site settings.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <Button onClick={capturedImage ? () => setCapturedImage(null) : handleCapturePhoto} className="w-full" disabled={hasCameraPermission !== true}>
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
                                            onClick={() => setSelectedProduct(product)}
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
                         <Button onClick={handleVirtualTryOn} disabled={!capturedImage || !selectedProduct || isGenerating || !isAiEnabled} className="w-full" size="lg">
                            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            {isGenerating ? 'Generating...' : 'Virtually Try It On'}
                        </Button>
                        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground">
                            {isGenerating && (
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Our AI is styling you...</p>
                                </div>
                            )}
                            {!isGenerating && generatedImage && (
                                <Image src={generatedImage} alt="Virtual try-on result" fill className="object-cover" />
                            )}
                            {!isGenerating && !generatedImage && (
                                <p>Your result will appear here.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
