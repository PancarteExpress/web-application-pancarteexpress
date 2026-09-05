/**
 * toute la logique métier (intl, auth, routes, etc.)
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Footer from '../global-components/footer/footer';
import frMessages from '@/translator/fr.json';
import enMessages from '@/translator/en.json';
import { Inter } from 'next/font/google'; 

import dynamic from 'next/dynamic';

//import Header from '../global-components/header/header';
const Header = dynamic(() => import('../global-components/header/header'), {
  ssr: false,
  loading: () => <div style={{ height: '80px' }} />, // Placeholder durant le load
});

const inter = Inter({ subsets: ['latin'] });

const locales = ['fr', 'en'];

export const metadata: Metadata = {
  title: 'MyApp',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();
  
  setRequestLocale(locale);
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