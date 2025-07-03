
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Truck, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAi } from '@/context/ai-context';
import { suggestSupplier } from '@/ai/flows/suggest-supplier';
import type { SuggestSupplierOutput } from '@/ai/flows/suggest-supplier';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const ADMIN_PASSWORD = 'admin123';

// Mock data for suppliers
const mockSuppliers = [
  { id: 'sup1', name: 'Supplier A', contact: 'contact@suppliera.com', products: 5, address: '123 Fashion Ave, New York, NY, USA', deliveryTime: '5-7 business days' },
  { id: 'sup2', name: 'Supplier B', contact: 'contact@supplierb.com', products: 12, address: '456 Textile Road, London, UK', deliveryTime: '7-10 business days' },
  { id: 'sup3', name: 'Supplier C', contact: 'contact@supplierc.com', products: 8, address: '789 Design Court, Tokyo, Japan', deliveryTime: '10-14 business days' },
  { id: 'sup4', name: 'Supplier D', contact: 'info@supplierd.it', products: 20, address: '10 Corso Como, Milan, Italy', deliveryTime: '8-12 business days' },
  { id: 'sup5', name: 'Supplier E', contact: 'sales@suppliere.co.kr', products: 15, address: '135-7, Cheongdam-dong, Gangnam-gu, Seoul, South Korea', deliveryTime: '9-13 business days' },
];

export default function SupplierManagementPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { isAiEnabled, disableAi } = useAi();
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [recommendation, setRecommendation] = useState<SuggestSupplierOutput | null>(null);
  const [isGenerating, startTransition] = useTransition();

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      toast({ title: 'Login Successful', description: 'Welcome, admin!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect password. Please try again.',
      });
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setPassword('');
    localStorage.removeItem('isAdminLoggedIn');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };
  
  const handleGetSuggestion = () => {
    if (!productName || !productDescription) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a product name and description.' });
        return;
    }

    startTransition(async () => {
        try {
            const suppliersForPrompt = mockSuppliers.map(({ id, name, address, deliveryTime }) => ({ id, name, address, deliveryTime }));
            const result = await suggestSupplier({
                productName,
                productDescription,
                suppliers: suppliersForPrompt,
            });
            setRecommendation(result);
            toast({ title: 'Recommendation Ready!', description: 'The AI has suggested a supplier below.' });
        } catch (error) {
            console.error('Failed to get supplier suggestion', error);
            const description = error instanceof Error ? error.message : "An unknown error occurred.";
            if (description === 'API_KEY_INVALID') {
                disableAi();
                toast({
                    variant: 'destructive',
                    title: 'Google AI Key Invalid',
                    description: 'Your API key is invalid. All AI features have been disabled.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Suggestion Failed',
                    description,
                });
            }
        }
    });
};

  if (!isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">Supplier Management</h1>
            <p className="text-muted-foreground mt-2">Enter the password to manage suppliers.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
            />
            <Button type="submit" className="w-full">Login</Button>
          </form>
           <p className="text-center text-sm text-muted-foreground">Hint: The password is <strong>{ADMIN_PASSWORD}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-headline font-bold">Supplier Management</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      
      {isAiEnabled ? (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles /> AI Supplier Optimizer</CardTitle>
                <CardDescription>Describe a new product to get an AI-powered supplier recommendation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input id="product-name" placeholder="e.g., Silk Scarf with Floral Print" value={productName} onChange={(e) => setProductName(e.target.value)} disabled={isGenerating} />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="product-description">Product Description</Label>
                        <Textarea id="product-description" placeholder="e.g., A lightweight, luxurious silk scarf featuring a vibrant, hand-painted floral design. Made in Italy..." value={productDescription} onChange={(e) => setProductDescription(e.target.value)} disabled={isGenerating} rows={3} />
                    </div>
                </div>
                 <Button onClick={handleGetSuggestion} disabled={isGenerating || !productName || !productDescription}>
                    {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    {isGenerating ? 'Analyzing...' : 'Get Recommendation'}
                </Button>
            </CardContent>
            { (isGenerating || recommendation) &&
                <CardFooter>
                    {isGenerating ? (
                        <p className="text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Thinking...</p>
                    ) : recommendation ? (
                        <Alert>
                           <Sparkles className="h-4 w-4" />
                            <AlertTitle>AI Recommendation</AlertTitle>
                            <AlertDescription>{recommendation.justification}</AlertDescription>
                        </Alert>
                    ) : null}
                </CardFooter>
            }
          </Card>
      ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>AI Features Disabled</AlertTitle>
            <AlertDescription>
                The AI Supplier Optimizer requires a Google AI API key. Please see the <Link href="/docs" className="underline font-semibold">documentation</Link> for setup instructions.
            </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>A list of all suppliers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Est. Delivery</TableHead>
              <TableHead className="text-right">Product Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSuppliers.map((supplier) => (
              <TableRow 
                key={supplier.id}
                className={cn(recommendation?.supplierId === supplier.id && 'bg-primary/10 ring-2 ring-primary transition-all duration-500')}
              >
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{supplier.address}</span>
                    <Button asChild variant="link" className="p-0 h-auto justify-start font-normal text-muted-foreground">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.address)}`} target="_blank" rel="noopener noreferrer">
                        <MapPin className="mr-1 h-3 w-3" />
                        View on Map
                      </a>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.deliveryTime}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{supplier.products}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
