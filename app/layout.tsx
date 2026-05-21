import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#0969A2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'QuickMedicare Solutions - From Critical Care to Home Care',
  description: 'Professional healthcare services combining critical care expertise with compassionate home care solutions. Book appointments with licensed medical professionals today.',
  keywords: ['healthcare', 'medical services', 'critical care', 'home care', 'appointments', 'health'],
  authors: [{ name: 'QuickMedicare Solutions' }],
  creator: 'QuickMedicare Solutions',
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
  openGraph: {
    title: 'QuickMedicare Solutions',
    description: 'From Critical Care to Home Care',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickMedicare Solutions',
    description: 'Professional healthcare services',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
