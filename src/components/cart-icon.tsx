'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CartIcon() {
  const { cartCount } = useCart();

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        <span className="sr-only">Shopping Cart</span>
        {cartCount > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs">
            {cartCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
