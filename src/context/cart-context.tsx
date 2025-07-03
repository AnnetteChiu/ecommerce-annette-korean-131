
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { Product, CartItem, CouponDiscount } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { validateCoupon } from '@/lib/coupons';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => void;
  removeCoupon: () => void;
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  shipping: number;
  total: number;
  appliedCoupon: { code: string; discount: CouponDiscount } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: CouponDiscount } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedCoupon = localStorage.getItem('coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch (error) {
        console.error("Failed to parse cart/coupon from localStorage", error);
        setCartItems([]);
        setAppliedCoupon(null);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        if (appliedCoupon) {
            localStorage.setItem('coupon', JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem('coupon');
        }
    } catch (error) {
        console.error("Failed to save cart/coupon to localStorage", error);
    }
  }, [cartItems, appliedCoupon]);

  const addToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity }];
    });
    toast({
      title: 'Added to Cart',
      description: `${quantity} x ${product.name}`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
      title: 'Item Removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };
  
  const applyCouponCode = (code: string) => {
    const result = validateCoupon(code);
    if (result.success && result.discount) {
        setAppliedCoupon({ code: code.toUpperCase(), discount: result.discount });
        toast({ title: "Coupon Applied!", description: result.message });
    } else {
        setAppliedCoupon(null);
        toast({ variant: "destructive", title: "Invalid Coupon", description: result.message });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({ title: "Coupon Removed" });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const { subtotal, discountAmount, shipping, total } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = sub >= 35 ? 0 : 4.99;
    
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount.type === 'percentage') {
            discount = sub * (appliedCoupon.discount.value / 100);
        } else {
            discount = appliedCoupon.discount.value;
        }
    }
    // Ensure discount doesn't exceed subtotal
    discount = Math.min(sub, discount);
    
    // Note: This total does not include taxes, which are calculated on the server.
    const finalTotal = sub - discount + shippingCost;

    return {
        subtotal: sub,
        discountAmount: discount,
        shipping: shippingCost,
        total: finalTotal > 0 ? finalTotal : 0,
    };
  }, [cartItems, appliedCoupon]);


  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCouponCode,
    removeCoupon,
    cartCount,
    subtotal,
    discountAmount,
    shipping,
    total,
    appliedCoupon,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
