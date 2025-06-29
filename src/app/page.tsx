import { getProducts } from '@/lib/products';
import { getStories } from '@/lib/stories';
import { ProductCard } from '@/components/product-card';
import { StoryThumbnail } from '@/components/story-thumbnail';

export default function Home() {
  const products = getProducts();
  const stories = getStories();

  return (
    <div>
      {stories.length > 0 && (
        <div className="mb-12">
          <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <StoryThumbnail story={story} />
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-4xl font-headline font-bold mb-8 text-center">Our Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
