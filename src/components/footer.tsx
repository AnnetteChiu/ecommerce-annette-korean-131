'use client';

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
        <div className="text-center text-muted-foreground text-sm mt-8 border-t pt-4">
          <p>&copy; {year} CodiStyle. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
