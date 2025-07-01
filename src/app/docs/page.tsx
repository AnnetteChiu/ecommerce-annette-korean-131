
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Info, KeyRound, Server, CheckCircle, Sparkles, Camera, Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function DocsPage() {
  const codeSnippet = `
// A sample browsing history with a few products.
const newHistory = [
  { "id": "1", "name": "The Minimalist Tote" },
  { "id": "2", "name": "Relaxed Fit Blue Jeans" },
  { "id": "8", "name": "Chunky Knit Sweater" },
  { "id": "10", "name": "Tailored Black Trousers" }
];

// Set the history in sessionStorage.
sessionStorage.setItem('browsingHistory', JSON.stringify(newHistory));

// Log to the console to confirm it was set.
console.log('Browsing history has been updated. New history:', JSON.parse(sessionStorage.getItem('browsingHistory')));

// Refresh the page to see the new recommendations.
console.log('Please refresh the page to see the changes take effect.');
  `.trim();
  
  const apiKeySnippet = `
// In the file: src/ai/config.ts
export const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
  `.trim();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-center">Developer Documentation</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6" />
            <CardTitle>How to Enable AI Features</CardTitle>
          </div>
          <CardDescription>
            To activate the AI features, you need to provide your Google AI API key in the configuration file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Generate Your API Key</h3>
            <p className="text-muted-foreground mb-4">Visit Google AI Studio to create a free API key for your project.</p>
            <Button asChild>
                <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Get Your Google AI Key
                </Link>
            </Button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Add Your Key to `src/ai/config.ts`</h3>
            <p className="text-muted-foreground mb-4">
              Open the file at <code>src/ai/config.ts</code> and replace the placeholder string with your key.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="font-code text-sm text-muted-foreground">
                {apiKeySnippet}
              </code>
            </pre>
             <p className="text-muted-foreground mt-4">
              <strong>Important:</strong> After saving the file, you must stop and restart your development server for the changes to take effect.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                <CardTitle>AI Feature Details & Testing</CardTitle>
            </div>
            <CardDescription>
                An overview of how each AI feature works.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="image-generation">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Camera /> Virtual Try-On & Graphic Designer
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-2 text-muted-foreground">
                        <p>These features use Google's Gemini image generation model to create new visuals.</p>
                        <p><strong>For Virtual Try-On:</strong> For best results, use a clear, well-lit, and front-facing photo.</p>
                        <p><strong>For the Graphic Designer:</strong> Be descriptive in your prompts to get the best results. Mention styles, colors, and specific elements.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="recommendations">
                    <AccordionTrigger>
                         <div className="flex items-center gap-2">
                            <Search /> Recommendations & Visual Search
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-2 text-muted-foreground">
                         <p>The Style Recommender, product recommendations, and visual image search use Gemini's multimodal capabilities to analyze text and images.</p>
                         <p>The Style Recommender and product recommendations use your recent browsing history (stored locally in your browser's <code>sessionStorage</code>) to personalize suggestions. The visual search analyzes an uploaded image to find similar items.</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="testing-recs">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Code /> Testing Product Recommendations
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2">
                           <div>
                              <h3 className="font-semibold mb-2 text-card-foreground">How to use:</h3>
                              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Open your running application in the browser.</li>
                                <li>Open the developer tools (usually by pressing F12 or Cmd+Opt+I).</li>
                                <li>Go to the "Console" tab.</li>
                                <li>Copy and paste the code below into the console and press Enter.</li>
                                <li>Refresh any product page to see the recommendations update.</li>
                              </ol>
                            </div>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                              <code className="font-code text-sm text-muted-foreground">
                                {codeSnippet}
                              </code>
                            </pre>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
