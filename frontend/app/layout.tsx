import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: {
    default: 'Tenki Clone - GitHub Actions Runners Alternative',
    template: '%s | Tenki Clone'
  },
  description: 'Szybsze i tańsze GitHub Actions runners. 90% taniej, 30% szybciej. Migracja w 2 kliknięcia.',
  keywords: [
    'GitHub Actions',
    'CI/CD',
    'Runners',
    'DevOps',
    'Continuous Integration',
    'Build Automation'
  ],
  authors: [{ name: 'Artur Wyroslak' }],
  creator: 'Artur Wyroslak',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://tenki-clone.dev',
    title: 'Tenki Clone - GitHub Actions Runners Alternative',
    description: 'Szybsze i tańsze GitHub Actions runners. 90% taniej, 30% szybciej.',
    siteName: 'Tenki Clone',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenki Clone - GitHub Actions Runners Alternative',
    description: 'Szybsze i tańsze GitHub Actions runners. 90% taniej, 30% szybciej.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}