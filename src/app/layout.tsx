import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { I18nProvider } from '@/core/i18n/i18n.context';
import { CartProvider } from '@/core/services/cart.context';
import { WishlistProvider } from '@/core/services/wishlist.context';
import { Navbar } from '@/shared/navbar/navbar.component';
import { Footer } from '@/shared/footer/footer.component';
import { CartDrawer } from '@/shared/cart-drawer/cart-drawer.component';
import { WishlistDrawer } from '@/shared/wishlist-drawer/wishlist-drawer.component';
import { ChatWidget } from '@/shared/chat-widget/chat-widget.component';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MELO | Curated Lifestyle, Accessories & Little Wonders — Dhaka, Bangladesh',
  description:
    'MELO is your boutique destination for curated lifestyle finds, aesthetic gadgets, French ear clips, and charming accessories in Bangladesh. Card, bKash & Cash on Delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] antialiased selection:bg-[#C5A059]/25 selection:text-[#1C1917]">
        <I18nProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<div className="h-24 bg-[#FAF7F2] border-b border-[#E7E0D6]" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <WishlistDrawer />
              <ChatWidget />
            </WishlistProvider>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
