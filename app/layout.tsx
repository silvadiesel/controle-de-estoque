import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Igne System',
  description: 'Tudo em um só lugar'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange>
          <a
            href='#main-content'
            className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground'>
            Pular para o conteúdo principal
          </a>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
