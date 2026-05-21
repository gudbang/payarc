import type { Metadata } from 'next'
import { Providers } from './providers'
import { Navbar } from './components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Payarc — P2P Stablecoin Payments on Arc',
  description: 'Send, request, pool, and earn with USDC payments on Arc Network.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}