
'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Info, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { suggestProductPrice } from '@/ai/flows/suggest-product-price';
import { useAi } from '@/context/ai-context';

const ADMIN_PASSWORD = 'admin123';

export default function ManageProductsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isGeneratingDesc, startDescTransition] = useTransition();
  const [isGeneratingPrice, startPriceTransition] = useTransition();
  const { toast } = useToast();
  const { isAiEnabled, disableAi } = useAi();

  useEffect(() => {
    // Check login status from localStorage
    if (localStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
    }
    setProducts(getProducts());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
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
    setIsLoggedIn(false);
    setPassword('');
    localStorage.removeItem('isLoggedIn');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };
  
  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    toast({ title: 'Product Updated', description: `Successfully updated ${editingProduct.name}.` });
    setShowEditDialog(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({ title: 'Product Deleted', description: 'The product has been removed.' });
  };
  
  const handleGenerateDescription = () => {
    if (!editingProduct) return;

    startDescTransition(async () => {
      try {
        const result = await generateProductDescription({
          name: editingProduct.name,
          category: editingProduct.category,
        });
        if (result.description) {
          setEditingProduct({ ...editingProduct, description: result.description });
          toast({ title: 'Description Generated!', description: 'The new description has been added.' });
        }
      } catch (error) {
        console.error('Failed to generate description', error);
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
              title: 'Generation Failed',
              description,
            });
        }
      }
    });
  };

  const handleSuggestPrice = () => {
    if (!editingProduct) return;

    startPriceTransition(async () => {
      try {
        const result = await suggestProductPrice({
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description,
        });
        if (result.price) {
          setEditingProduct({ ...editingProduct, price: result.price });
          toast({ title: 'Price Suggested!', description: `The AI suggested a price of $${result.price.toFixed(2)}.` });
        }
      } catch (error) {
        console.error('Failed to suggest price', error);
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

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock <= 10) {
      return <Badge variant="secondary">Low Stock ({stock})</Badge>;
    }
    return <Badge variant="outline">In Stock ({stock})</Badge>;
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Enter the password to manage products.</p>
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
        <h1 className="text-4xl font-headline font-bold">Manage Products</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Developer Note</AlertTitle>
        <AlertDescription>
          Product edits and deletions are for demonstration purposes only and will not be saved permanently. Refreshing the page will reset all changes.
        </AlertDescription>
      </Alert>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>A list of all products in your store.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover aspect-square"
                    data-ai-hint={`${product.category} product`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">{getStockBadge(product.stock)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setShowEditDialog(true); }}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            product from the view.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProduct && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to the product details here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <div className="col-span-3 space-y-2">
                  <Textarea
                    id="description"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={5}
                  />
                  {isAiEnabled && (
                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDesc || isGeneratingPrice}>
                        {isGeneratingDesc ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="col-span-2"
                />
                 <div className="col-span-1">
                  {isAiEnabled && (
                      <Button type="button" variant="outline" size="sm" onClick={handleSuggestPrice} disabled={isGeneratingDesc || isGeneratingPrice}>
                          {isGeneratingPrice ? <Loader2 className="animate-spin" /> : <Sparkles />}
                          Suggest
                      </Button>
                  )}
                 </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={editingProduct.stock}
                   onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
