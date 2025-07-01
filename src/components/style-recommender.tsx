
'use client';

import { useState, useTransition } from 'react';
import { generateStyleRecommendation } from '@/ai/flows/generate-style-recommendation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';

export function StyleRecommender() {
  const [recommendations, setRecommendations] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGetRecommendations = () => {
    startTransition(async () => {
      try {
        const history = JSON.parse(sessionStorage.getItem('browsingHistory') || '[]');
        if (history.length === 0) {
          toast({
            title: 'Your History is Empty',
            description: 'Browse some products first to get a personalized style recommendation.',
          });
          setRecommendations('');
          return;
        }

        const productNames = history.map((item: { name: string }) => item.name).join(', ');
        
        const result = await generateStyleRecommendation({ browsingHistory: productNames });
        setRecommendations(result.recommendations);
      } catch (error) {
        console.error('Failed to generate style recommendations:', error);
        let description = 'We could not generate recommendations at this time. Please try again later.';
        if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
            description = "The Google AI API key is not configured correctly. Please see the documentation for instructions.";
        }
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: description,
        });
        setRecommendations('');
      }
    });
  };

  return (
    <Card className="max-w-2xl mx-auto bg-background/50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Discover Your Style</CardTitle>
        <CardDescription>Get a personalized style recommendation based on your browsing.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={handleGetRecommendations} disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate My Recommendation
        </Button>

        {recommendations && (
          <div className="mt-6 p-4 border rounded-lg bg-background text-left">
            <h4 className="font-bold mb-2 text-primary">Our suggestion for you:</h4>
            <p className="text-muted-foreground whitespace-pre-line">{recommendations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
