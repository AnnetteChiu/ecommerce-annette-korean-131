'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getStoryById } from '@/lib/stories';
import { getProductById } from '@/lib/products';
import type { Story, Product } from '@/types';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function StoryViewerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const storyId = params.id;
  const [story, setStory] = useState<Story | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const storyData = getStoryById(storyId);
    if (storyData) {
      setStory(storyData);
    } else {
      notFound();
    }
  }, [storyId]);

  const goToNextPage = useCallback(() => {
    if (story && currentPageIndex < story.pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      router.push('/');
    }
  }, [story, currentPageIndex, router]);

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (!story) return;

    const currentProduct = getProductById(story.pages[currentPageIndex].productId || '');
    setProduct(currentProduct || null);
    
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => p + 1);
    }, 50); // 50ms * 100 = 5000ms = 5 seconds

    return () => clearInterval(timer);
  }, [story, currentPageIndex]);
  
  useEffect(() => {
      if (progress >= 100) {
          goToNextPage();
      }
  }, [progress, goToNextPage]);


  if (!story) {
    return null;
  }

  const currentPage = story.pages[currentPageIndex];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10">
        {story.pages.map((_, index) => (
          <div key={index} className="flex-1 bg-white/30 rounded-full h-1 overflow-hidden">
             {index < currentPageIndex && <div className="bg-white h-full w-full rounded-full" />}
             {index === currentPageIndex && <Progress value={progress} className="h-1 [&>div]:bg-white" />}
          </div>
        ))}
      </div>
      <Button variant="ghost" size="icon" className="absolute top-8 right-4 z-10 text-white hover:bg-white/20 hover:text-white" onClick={() => router.push('/')}>
        <X size={28} />
      </Button>

      <div className="relative w-full h-full max-w-sm max-h-[85vh] rounded-lg overflow-hidden shadow-2xl">
        <Image
          src={currentPage.imageUrl}
          alt={`Story page ${currentPageIndex + 1}`}
          fill
          className="object-cover"
          priority
          data-ai-hint="fashion story content"
        />

        <div className="absolute inset-0 flex justify-between items-center">
            <button className="h-full w-1/3" onClick={goToPrevPage} aria-label="Previous story page"></button>
            <button className="h-full w-2/3" onClick={goToNextPage} aria-label="Next story page"></button>
        </div>

        {product && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-20">
            <Button asChild className="w-full bg-black/50 backdrop-blur-sm text-white border-white/30 border hover:bg-white hover:text-black">
                <Link href={`/products/${product.id}`}>
                    <ShoppingBag className="mr-2" />
                    View {product.name}
                </Link>
            </Button>
          </div>
        )}
      </div>

       <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white hidden md:flex" onClick={goToPrevPage} disabled={currentPageIndex === 0}>
            <ChevronLeft size={32} />
       </Button>
       <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white hidden md:flex" onClick={goToNextPage}>
            <ChevronRight size={32} />
       </Button>
    </div>
  );
}
