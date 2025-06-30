import { getProducts } from '@/lib/products';
import { getStories } from '@/lib/stories';
import { ProductCard } from '@/components/product-card';
import { StoryThumbnail } from '@/components/story-thumbnail';
import { BrandWeek } from '@/components/brand-week';
import { SaleBanner } from '@/components/sale-banner';
import { ImageBanner } from '@/components/image-banner';

export default function Home() {
  const products = getProducts();
  const stories = getStories();

  return (
    <div className="space-y-16">
      <SaleBanner />

      <ImageBanner />

      <BrandWeek />
      
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
