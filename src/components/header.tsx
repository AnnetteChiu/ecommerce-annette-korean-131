'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Book, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CartIcon } from './cart-icon';
import { useAi } from '@/context/ai-context';
import { cn } from '@/lib/utils';

export function Header() {
  const { isAiEnabled } = useAi();
  const pathname = usePathname();

  const navLinks = [
    { href: '/fitting-room', label: 'Fitting Room', icon: Camera },
    { href: '/docs', label: 'Docs', icon: Book },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            CodiStyle
          </Link>
          <nav>
            <div className="flex items-center gap-1">
              {isAiEnabled && (
                <>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Button
                        key={link.href}
                        variant="ghost"
                        asChild
                        className={cn(
                          isActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <Link href={link.href}>
                          <link.icon />
                          {link.label}
                        </Link>
                      </Button>
                    );
                  })}
                </>
              )}
              <TooltipProvider>
                {isAiEnabled && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild className={cn(pathname === '/search-by-image' && 'bg-accent text-accent-foreground')}>
                          <Link href="/search-by-image">
                              <Search className="h-5 w-5" />
                              <span className="sr-only">Find Your Style</span>
                          </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Find Your Style</p>
                    </TooltipContent>
                  </Tooltip>
                )}
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
