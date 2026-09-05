
/**
 * structure HTML + styles/polices globales + providers vraiment globaux
 */

import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyApp',
  description: 'Bienvenue sur MyApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}