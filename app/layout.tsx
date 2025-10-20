import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkAuthProvider } from '@/lib/auth/clerk-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { NextAuthSessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/navigation';
import { LoadingProvider } from '@/components/loading-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ask Me Anything - Live Chat Platform',
  description: 'A real-time chat platform with anonymous questions and live discussions',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AMA Chat',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Determine which auth provider to use based on environment
  const authProvider = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'clerk' : 'nextauth';

  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingProvider>
          <NextAuthSessionProvider>
            {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
              <ClerkAuthProvider>
                <AuthProvider authProvider="clerk">
                  <Navigation />
                  <main className="pt-16">
                    {children}
                  </main>
                </AuthProvider>
              </ClerkAuthProvider>
            ) : (
              <AuthProvider authProvider="nextauth">
                <Navigation />
                <main className="pt-16">
                  {children}
                </main>
              </AuthProvider>
            )}
          </NextAuthSessionProvider>
        </LoadingProvider>
       </body>
     </html>
   );
 }
