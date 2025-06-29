import productsData from '@/data/products.json';
import type { Product } from '@/types';

const products: Product[] = productsData;

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
