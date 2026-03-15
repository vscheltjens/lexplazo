import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LexPlazo — Calculadora de Plazos Procesales',
  description:
    'Calculadora de plazos procesales laborales. Cómputo automático conforme a la LRJS, ET y LPACAP, con festivos por comunidad autónoma según el BOE.',
  keywords: ['plazos procesales', 'calculadora laboral', 'LRJS', 'ET', 'LPACAP', 'festivos'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
