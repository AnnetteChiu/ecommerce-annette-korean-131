import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            CodiStyle
          </Link>
          <nav>
            <TooltipProvider>
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
            </TooltipProvider>
          </nav>
        </div>
      </div>
    </header>
  );
}
