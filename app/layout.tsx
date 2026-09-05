
/**
 * structure HTML + styles/polices globales + providers vraiment globaux
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import './globals.css';
import { Inter, Poppins, Montserrat } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'] });
const montserrat = Montserrat({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });

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