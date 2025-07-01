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
            <TooltipProvider>
              <div className="flex items-center gap-1">
                {aiEnabled && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href="/fitting-room">
                            <Camera className="h-5 w-5" />
                            <span className="sr-only">AI Fitting Room</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI Fitting Room</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href="/search-by-image">
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search by Image</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Search by Image</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href="/docs">
                            <Book className="h-5 w-5" />
                            <span className="sr-only">Documentation</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Documentation</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CartIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Shopping Cart</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </nav>
        </div>
      </div>
    </header>
  );
}
