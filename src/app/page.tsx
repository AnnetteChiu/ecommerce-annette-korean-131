import { getProducts } from '@/lib/products';
import { getStories } from '@/lib/stories';
import { ProductCard } from '@/components/product-card';
import { StoryThumbnail } from '@/components/story-thumbnail';
import { BrandWeek } from '@/components/brand-week';
import { SaleBanner } from '@/components/sale-banner';
import { ImageBanner } from '@/components/image-banner';
import { SideBanner } from '@/components/side-banner';
import { StyleRecommender } from '@/components/style-recommender';
import { isAiEnabled } from '@/lib/ai';

export default function Home() {
  const products = getProducts();
  const stories = getStories();
  const aiEnabled = isAiEnabled();

  return (
    <div className="space-y-16">
      <SaleBanner />

      <ImageBanner 
        src="https://i4.codibook.net/files/1982120615601/bcb491b3c8b53337/271340960.jpg"
        alt="New Collection Banner"
        data-ai-hint="fashion collection"
        title="New Collection"
        description="Discover the latest trends and styles"
        buttonText="Shop Now"
        buttonLink="#collection"
        layout="left"
      />

      <ImageBanner 
        src="https://i4.codibook.net/files/1982120613804/cfee74844ee74050/1877193488.jpg"
        alt="Stylish outfit banner"
        data-ai-hint="fashion style"
      />

      <ImageBanner 
        src="https://i4.codibook.net/files/1982120533604/40d5990d4d96ac2b/1085592249.jpg"
        alt="Stylish fashion banner"
        data-ai-hint="fashion style"
      />

      <ImageBanner 
        src="https://i3.codibook.net/files/1982111035400/d6ba3597d8be1d5e/14841547.jpg"
        alt="Stylish fashion banner"
        data-ai-hint="fashion style"
      />

      <ImageBanner 
        src="https://i4.codibook.net/files/1982120751817/d87a70fe9b9ff7/1124494606.jpg"
        alt="Stylish fashion banner"
        data-ai-hint="fashion style"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
        <main className="lg:col-span-3 space-y-16 lg:order-last">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </main>
        
        <aside className="lg:col-span-1 space-y-8 sticky top-24 self-start">
          <SideBanner />
          {aiEnabled && <StyleRecommender />}
        </aside>
      </div>
    </div>
  );
}
