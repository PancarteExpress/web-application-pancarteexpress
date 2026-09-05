/**
 * toute la logique métier (intl, auth, routes, etc.)
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import Header from '../global-components/header/header';
import Footer from '../global-components/footer/footer';
import frMessages from '@/translator/fr.json';
import enMessages from '@/translator/en.json';
import { Inter } from 'next/font/google'; 

const inter = Inter({ subsets: ['latin'] });

const locales = ['fr', 'en'];

export const metadata: Metadata = {
  title: 'MyApp',
};

/*export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}*/

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();
  
  const messages = locale === 'fr' ? frMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </NextIntlClientProvider>
  );
}