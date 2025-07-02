import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/context/cart-context';
import { AiProvider } from '@/context/ai-context';
import { isAiEnabled } from '@/lib/ai';

export const metadata: Metadata = {
  title: 'CodiStyle',
  description: 'An unconventional, sophisticated, and inviting e-commerce experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const aiEnabled = isAiEnabled();
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <AiProvider enabled={aiEnabled}>
          <CartProvider>
            <Header isProduction={isProduction} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </CartProvider>
        </AiProvider>
      </body>
    </html>
  );
}
