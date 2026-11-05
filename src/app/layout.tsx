import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { I18nProvider } from '@/core/i18n/i18n.context';
import { CartProvider } from '@/core/services/cart.context';
import { Navbar } from '@/shared/navbar/navbar.component';
import { Footer } from '@/shared/footer/footer.component';
import { CartDrawer } from '@/shared/cart-drawer/cart-drawer.component';
import { FloatingChat } from '@/shared/floating-chat/floating-chat.component';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MELO | Discover. Love. Repeat. — Curated Accessories & Gifts Bangladesh',
  description:
    'MELO is your go-to destination for French-style light luxury earrings, hypoallergenic ear clips, dainty rings, and charming bracelets in Bangladesh. Cash on delivery available nationwide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-neutral-900 antialiased">
        <I18nProvider>
          <CartProvider>
            <Suspense fallback={<div className="h-20 bg-white border-b" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <FloatingChat />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
