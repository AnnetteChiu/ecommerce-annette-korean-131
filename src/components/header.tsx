import Link from 'next/link';
import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            CommerceKit
          </Link>
          <nav>
            <Link href="/search-by-image" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Search className="mr-2 h-4 w-4" />
              Search by Image
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
