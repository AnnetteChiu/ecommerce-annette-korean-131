import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductViewTracker } from '@/components/product-view-tracker';
import { ExternalLink } from 'lucide-react';
import { RecommendedProducts } from '@/components/recommended-products';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductViewTracker productId={product.id} productName={product.name} />
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
          <div className="flex items-center justify-between mb-8">
            <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
          </div>
          <Button asChild size="lg" className="w-full md:w-auto">
            <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer">
              Buy Now
              <ExternalLink className="ml-2" />
            </a>
          </Button>
        </div>
      </div>
      <RecommendedProducts currentProductId={product.id} />
    </>
  );
}
