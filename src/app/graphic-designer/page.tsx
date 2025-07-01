
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAi } from '@/context/ai-context';
import { generateGraphicDesign } from '@/ai/flows/generate-graphic-design';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertTriangle, Info, Download } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function GraphicDesignerPage() {
    const { isAiEnabled, disableAi } = useAi();
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, startTransition] = useTransition();
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Prompt is empty',
                description: 'Please enter a description for the design you want to create.',
            });
            return;
        }
        
        startTransition(async () => {
            try {
                const result = await generateGraphicDesign({ prompt });
                if (result.generatedImageDataUri) {
                    setGeneratedImage(result.generatedImageDataUri);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'Generation Failed',
                        description: "The AI could not return an image. Please try a different prompt.",
                    });
                }
            } catch (err) {
                console.error('Graphic design generation failed:', err);
                const description = err instanceof Error ? err.message : "An unknown error occurred.";
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
    };
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-headline font-bold">AI Graphic Design Generator</h1>
                <p className="text-muted-foreground mt-2">Describe a design concept, and our AI will bring it to life.</p>
            </div>

            {!isAiEnabled ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Google AI API Key Required</AlertTitle>
                    <AlertDescription>
                      This feature is disabled. To enable it, set your Google AI API key in a <code>.env.local</code> file. See the <Link href="/docs" className="underline">documentation</Link> for details.
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles /> Your Design Concept</CardTitle>
                        <CardDescription>
                            Be as descriptive as possible. Mention style, colors, mood, and any specific elements you want to see.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            placeholder="e.g., A minimalist logo for a coffee shop, using earthy tones and a stylized coffee bean..."
                            rows={6}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={!isAiEnabled || isGenerating}
                        />
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleGenerate} disabled={!isAiEnabled || isGenerating || !prompt.trim()} className="w-full" size="lg">
                            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            {isGenerating ? 'Generating...' : 'Generate Design'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Generated Design</CardTitle>
                        <CardDescription>Your generated graphic will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground">
                            {isGenerating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/50 z-10">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Generating your vision...</p>
                                </div>
                             )}
                            {!isAiEnabled && !isGenerating ? (
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
                                <Image src={generatedImage} alt="Generated graphic design" fill className="object-contain" />
                            ) : !isGenerating && (
                                <p className="text-center p-4">Your result will appear here.</p>
                            )}
                        </div>
                        {generatedImage && (
                            <Button asChild className="w-full">
                                <a href={generatedImage} download={`codistyle-design-${Date.now()}.png`}>
                                    <Download className="mr-2" />
                                    Download Design
                                </a>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
