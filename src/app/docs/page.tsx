import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, PowerOff } from 'lucide-react';
import { isAiEnabled } from '@/lib/ai';

function AiDisabledMessage() {
  return (
    <div className="text-center py-20">
      <PowerOff className="mx-auto h-16 w-16 text-muted-foreground" />
      <h1 className="mt-4 text-3xl font-bold font-headline">AI Feature Disabled</h1>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        This feature requires a Google AI API key, but it has not been configured. Please see the README for setup instructions.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}

export default function DocsPage() {
  if (!isAiEnabled()) {
    return <AiDisabledMessage />;
  }
  
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

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-center">Developer Documentation</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            <CardTitle>Testing Product Recommendations</CardTitle>
          </div>
          <CardDescription>
            Use this JavaScript snippet to manually set your browsing history for testing the AI recommendation engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">How to use:</h3>
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
        </CardContent>
      </Card>
    </div>
  );
}
