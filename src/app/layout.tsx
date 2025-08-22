import React from 'react'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Sora } from 'next/font/google'

const sora = Sora({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora'
})

export const metadata: Metadata = {
  title: 'ImmoPix AI - Optimisez vos photos immobilières',
  description: 'Plateforme web qui transforme vos photos immobilières en images optimisées via IA',
  keywords: 'immobilier, photo, IA, optimisation, retouche',
  authors: [{ name: 'ImmoPix AI' }],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={sora.variable}>
      <body className={`${sora.className} antialiased`}>
        {children}
      </body>
    </html>
  )
} 