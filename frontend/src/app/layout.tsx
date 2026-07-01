import type { Metadata, Viewport } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Providers from './providers'; // 👈 أضف هذا السطر

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UniCom CX – Omnichannel CX Automation',
  description: 'منصة UniCom CX لتجربة العملاء متعددة القنوات',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'UniCom CX',
    statusBarStyle: 'default',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${inter.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers> {/* 👈 أضف هذا الغلاف */}
          {children}
        </Providers>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                      console.log('SW registered: ', registration.scope);
                    },
                    (err) => {
                      console.log('SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
