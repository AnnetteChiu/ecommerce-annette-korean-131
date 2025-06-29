import { getProducts } from '@/lib/products';
import { getStories } from '@/lib/stories';
import { ProductCard } from '@/components/product-card';
import { StoryThumbnail } from '@/components/story-thumbnail';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const products = getProducts();
  const stories = getStories();

  return (
    <div className="space-y-16">
      <section className="relative h-[60vh] rounded-lg overflow-hidden flex items-center justify-center text-center text-white p-8 shadow-xl">
        <Image
          src="https://i4.codibook.net/files/1982120449802/be4b443f04f3eeb3/1591521268.jpg"
          alt="Woman in stylish outfit"
          fill
          className="object-cover object-center"
          priority
          data-ai-hint="fashion model"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 drop-shadow-md">Unleash Your Style</h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow">
            Discover curated collections and find your unique look.
          </p>
          <Button asChild size="lg">
            <Link href="#collection">Shop Now</Link>
          </Button>
        </div>
      </section>
      
      {stories.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-bold mb-8 text-center">Style Stories</h2>
          <div className="flex justify-center items-start gap-x-6 md:gap-x-8 overflow-x-auto pb-4">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <StoryThumbnail story={story} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="collection">
        <h2 className="text-4xl font-headline font-bold mb-8 text-center">Our Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
