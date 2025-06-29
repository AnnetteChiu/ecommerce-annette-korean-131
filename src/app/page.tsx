import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';

export default function Home() {
  const products = getProducts();

  return (
    <div>
      <h2 className="text-4xl font-headline font-bold mb-8 text-center">Our Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
