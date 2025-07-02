
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Book, Camera, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CartIcon } from './cart-icon';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isProduction: boolean;
}

export function Header({ isProduction }: HeaderProps) {
  const pathname = usePathname();

  const allNavLinks = [
    { href: '/fitting-room', label: 'Fitting Room', icon: Camera },
    { href: '/graphic-designer', label: 'Graphic Designer', icon: Palette },
    { href: '/docs', label: 'Docs', icon: Book },
  ];
  
  const navLinks = isProduction 
    ? allNavLinks.filter(link => link.href !== '/docs')
    : allNavLinks;

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            CodiStyle
          </Link>
          <nav>
            <div className="flex items-center gap-1">
              <>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Button
                      key={link.href}
                      variant="ghost"
                      asChild
                      className={cn(
                        'hidden md:inline-flex',
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
              <TooltipProvider>
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
