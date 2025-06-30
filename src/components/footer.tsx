'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // This ensures that the year is set on the client-side after initial render,
    // preventing a hydration mismatch even in edge cases.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-muted-foreground text-sm mt-8 border-t pt-4 flex flex-wrap justify-between items-center gap-4">
          <p>&copy; {year} CodiStyle. All Rights Reserved.</p>
          <nav>
            <Link href="/manage-products" className="hover:text-primary transition-colors">
              Manage Products
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
