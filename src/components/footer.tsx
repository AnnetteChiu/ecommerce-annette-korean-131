
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // This hook runs only on the client. It ensures that if the client's date
    // is different from the server's, we use the client's date after hydration.
    // This avoids a potential hydration mismatch error.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-muted-foreground text-sm mt-8 border-t pt-4 flex flex-wrap justify-between items-center gap-4">
          <p suppressHydrationWarning>&copy; {year} CodiStyle. All Rights Reserved.</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-primary transition-colors">
              About CodiStyle
            </Link>
            <Link href="/transactions" className="hover:text-primary transition-colors">
              Transactions
            </Link>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin Dashboard
            </Link>
            <Link href="/manage-products" className="hover:text-primary transition-colors">
              Manage Products
            </Link>
            <Link href="/supplier-management" className="hover:text-primary transition-colors">
              Supplier Management
            </Link>
             <Link href="/marketing" className="hover:text-primary transition-colors">
              Marketing
            </Link>
            <Link href="/debug-env" className="hover:text-primary transition-colors">
              Debug ENV
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
