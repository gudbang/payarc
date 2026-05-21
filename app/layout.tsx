import type { Metadata } from 'next'
import { Providers } from './providers'
import { NavbarWrapper } from './components/NavbarWrapper'
import { AppGate } from './components/AppGate'
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
          <AppGate>
            <NavbarWrapper />
            {children}
          </AppGate>
        </Providers>
      </body>
    </html>
  )
}
