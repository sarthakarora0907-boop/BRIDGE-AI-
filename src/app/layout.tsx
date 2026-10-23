import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Bridge AI — Turn Messy Problems Into Clear Next Steps',
  description:
    'Describe any complicated real-world situation naturally. Bridge AI transforms your messy problems into structured, understandable, and actionable guidance using the power of Gemini AI.',
  keywords: ['AI assistant', 'problem solving', 'Gemini AI', 'bridge AI', 'structured guidance', 'real-world help'],
  authors: [{ name: 'Bridge AI' }],
  creator: 'Bridge AI',
  openGraph: {
    title: 'Bridge AI — Turn Messy Problems Into Clear Next Steps',
    description:
      'A universal AI bridge between human intent and complex systems. Describe your problem naturally, get structured actionable guidance.',
    type: 'website',
    siteName: 'Bridge AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridge AI',
    description: 'Turn messy problems into clear next steps with Gemini AI.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070711' },
    { media: '(prefers-color-scheme: light)', color: '#f8f9ff' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
