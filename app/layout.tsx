import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mahr.fyi'),
  title: 'mahr.fyi - Transparent Mahr Data',
  description: 'Transparent, dignified data on mahr practices around the world.',
  keywords: ['mahr', 'dowry', 'marriage', 'transparency', 'data', 'Islamic', 'community'],
  authors: [{ name: 'mahr.fyi team' }],
  openGraph: {
    title: 'mahr.fyi - Transparent Mahr Data',
    description: 'Transparent, dignified data on mahr practices around the world.',
    type: 'website',
    locale: 'en_US',
    siteName: 'mahr.fyi',
    url: 'https://mahr.fyi',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'mahr.fyi - Transparent Mahr Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mahr.fyi - Transparent Mahr Data',
    description: 'Transparent, dignified data on mahr practices around the world.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'your-google-verification-code', // Optional: Add if you have Google Search Console
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf9f7',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        
        {/* iOS-specific meta tags for better iMessage previews */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="mahr.fyi" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Additional Open Graph tags for better social sharing */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
      </head>
      <body className={`${inter.className} bg-gradient-warm min-h-screen text-stone-800 antialiased`}>
        {children}
      </body>
    </html>
  )
} 