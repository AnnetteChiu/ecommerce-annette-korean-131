import Link from 'next/link';
import { Search, Book, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CartIcon } from './cart-icon';
import { isAiEnabled } from '@/lib/ai';

export function Header() {
  const aiEnabled = isAiEnabled();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            CodiStyle
          </Link>
          <nav>
            <div className="flex items-center gap-1">
              {aiEnabled && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/fitting-room">
                      <Camera />
                      Fitting Room
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/search-by-image">
                      <Search />
                      Find Your Style
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/docs">
                      <Book />
                      Docs
                    </Link>
                  </Button>
                </>
              )}
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <CartIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Shopping Cart</p>
                    </TooltipContent>
                  </Tooltip>
              </TooltipProvider>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
