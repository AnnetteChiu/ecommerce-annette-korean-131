'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold font-headline">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Your Shopping Cart</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <Card key={item.id} className="flex items-center p-4">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={100}
                height={100}
                className="rounded-md object-cover aspect-square"
                data-ai-hint="product"
              />
              <div className="ml-4 flex-grow">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        className="w-12 text-center border-0 focus-visible:ring-0 p-0 h-auto"
                        value={item.quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                                updateQuantity(item.id, value);
                            }
                        }}
                        min="1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <p className="w-20 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                Proceed to Checkout
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
