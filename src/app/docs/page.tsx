
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Info, KeyRound, Server, Sparkles, Camera, Search, Terminal, FileCode } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

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
  
  const envSnippet = `
# In a new file at the root of your project named .env.local
GOOGLE_API_KEY="YOUR_API_KEY_HERE"
  `.trim();
  
  const gcloudCreateSecret = `gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic"`;
  const gcloudAddSecret = `echo -n "YOUR_API_KEY_HERE" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-`;
  const firebaseDeploy = `firebase deploy`;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-center">Developer Documentation</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <KeyRound className="h-8 w-8" />
            <div className="flex flex-col">
              <CardTitle className="text-2xl">Enabling AI Features</CardTitle>
              <CardDescription>
                To activate the AI features, you must provide your Google AI API key. The setup depends on your environment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-300" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">First, Get Your Key</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              No matter your environment, you first need to generate a free API key from Google AI Studio.
               <Button asChild variant="link" className="p-0 h-auto ml-1">
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      Create Your API Key
                  </Link>
              </Button>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-6 border rounded-lg">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">For Local Development</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  For running the app on your local machine, create a <code>.env.local</code> file in the project's root directory and add your key to it.
                </p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="font-code text-sm text-muted-foreground">
                    {envSnippet}
                  </code>
                </pre>
                 <p className="text-muted-foreground text-sm">
                  <strong>Important:</strong> After creating this file, you must stop and restart your development server for the change to take effect.
                </p>
            </div>
            <div className="space-y-4 p-6 border rounded-lg">
                <div className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">For Production Deployment</h3>
                </div>
                 <p className="text-muted-foreground text-sm">
                  When deploying to Firebase App Hosting, your key must be stored securely in Google Cloud Secret Manager. The following <code className="font-code">gcloud</code> commands will set this up.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step 1: Create the Secret</Label>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto mt-1">
                      <code className="font-code text-xs text-muted-foreground">
                        {gcloudCreateSecret}
                      </code>
                    </pre>
                  </div>
                   <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step 2: Add Your Key as the Secret Value</Label>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto mt-1">
                      <code className="font-code text-xs text-muted-foreground">
                        {gcloudAddSecret}
                      </code>
                    </pre>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step 3: Deploy Your App</Label>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto mt-1">
                      <code className="font-code text-xs text-muted-foreground">
                        {firebaseDeploy}
                      </code>
                    </pre>
                  </div>
                </div>
            </div>
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
                            <Terminal /> Testing Product Recommendations
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
