'use client';

import { useState, useEffect } from 'react';
import { getProductById } from '@/lib/products';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { RecommendedProducts } from '@/components/recommended-products';
import { useCart } from '@/context/cart-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const params = useParams<{ id: string }>();
  const product = getProductById(params.id);

  useEffect(() => {
    if (product) {
      try {
        const impressionsString = localStorage.getItem('productImpressions');
        const impressions = impressionsString ? JSON.parse(impressionsString) : {};
        impressions[product.id] = (impressions[product.id] || 0) + 1;
        localStorage.setItem('productImpressions', JSON.stringify(impressions));
      } catch (error) {
        console.error("Could not update impressions in localStorage:", error);
      }
    }
  }, [product]);

  if (!product) {
    notFound();
  }
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
        const newQuantity = prev + amount;
        if (newQuantity < 1) return 1;
        if (product && newQuantity > product.stock) return product.stock;
        return newQuantity;
    })
  }

  const hasDetails = product.details && (product.details.material || product.details.fit || product.details.care);

  const getStockDisplay = () => {
    if (product.stock === 0) {
      return <p className="font-semibold text-destructive">Out of Stock</p>;
    }
    if (product.stock <= 10) {
      return <p className="font-bold text-primary">Low Stock - Only {product.stock} left!</p>;
    }
    return <p className="text-muted-foreground">In Stock</p>;
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="overflow-hidden rounded-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={800}
            className="w-full h-full object-cover object-center rounded-lg shadow-lg"
            data-ai-hint={`${product.category} product detail`}
          />
        </div>
        <div className="flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-4">{product.name}</h1>
          <p className="text-muted-foreground text-lg mb-6">{product.description}</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
          </div>
          <div className="min-h-[24px] mb-6">
            {getStockDisplay()}
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus />
              </Button>
              <Input
                type="number"
                className="w-16 text-center border-0 focus-visible:ring-0"
                value={quantity}
                onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && product && value <= product.stock) {
                        setQuantity(value);
                    }
                }}
                min="1"
                max={product.stock}
              />
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={!product || quantity >= product.stock}>
                <Plus />
              </Button>
            </div>
            <Button size="lg" className="flex-grow" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </div>

          {hasDetails && (
            <Accordion type="single" collapsible className="w-full mt-8">
              {product.details?.material && (
                <AccordionItem value="material">
                  <AccordionTrigger>Material</AccordionTrigger>
                  <AccordionContent>
                    {product.details.material}
                  </AccordionContent>
                </AccordionItem>
              )}
              {product.details?.fit && (
                <AccordionItem value="fit">
                  <AccordionTrigger>Fit & Sizing</AccordionTrigger>
                  <AccordionContent>
                    {product.details.fit}
                  </AccordionContent>
                </AccordionItem>
              )}
              {product.details?.care && (
                <AccordionItem value="care">
                  <AccordionTrigger>Care Instructions</AccordionTrigger>
                  <AccordionContent>
                    {product.details.care}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}

        </div>
      </div>
      <RecommendedProducts currentProductId={product.id} currentProductName={product.name} />
    </>
  );
}
