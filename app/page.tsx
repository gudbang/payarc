'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  ArrowRightIcon, BoltIcon, ShieldCheckIcon, CurrencyDollarIcon,
  ArrowsRightLeftIcon, ChartBarIcon, UserGroupIcon
} from '@heroicons/react/24/outline'

const STATS = [
  { label: 'Total Liquidity', value: '$86,423' },
  { label: 'Transactions', value: '12,400+' },
  { label: 'Settlement', value: '<2s' },
  { label: 'Faucet', value: '0.5 USDC' },
]

const FEATURES = [
  { icon: CurrencyDollarIcon, title: 'P2P Payments', desc: 'Send native USDC instantly to any wallet.' },
  { icon: ArrowsRightLeftIcon, title: 'Liquidity Pools', desc: 'Provide liquidity and earn swap fees.' },
  { icon: ChartBarIcon, title: 'Yield Positions', desc: 'Put idle stablecoins to work.' },
]

const WHY = [
  { icon: BoltIcon, title: 'Native USDC Gas', desc: 'No ETH needed — Arc uses USDC as gas.' },
  { icon: ShieldCheckIcon, title: 'Non-custodial', desc: 'Your keys, your funds. Always.' },
  { icon: UserGroupIcon, title: 'Open Source', desc: 'Fully open on GitHub.' },
]

export default function LandingPage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <main className="min-h-screen arc-grid">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-2xl font-black text-white shadow-lg shadow-indigo-400/30">P</span>
          <span className="text-4xl font-black tracking-tight text-slate-900">Payarc</span>
        </div>
        
        <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 mb-6">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Arc Testnet • Native USDC
        </p>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 leading-tight max-w-4xl">
          The fastest P2P<br />
          <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            stablecoin payments
          </span><br />
          on Arc.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Send, request, pool, and earn with native USDC on Arc Testnet.
          Real wallet connectivity. Real on-chain transactions.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <ConnectButton.Custom>
            {({ openConnectModal, connectModalOpen }) => (
              <button
                onClick={openConnectModal}
                disabled={connectModalOpen}
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all hover:scale-105"
              >
                Connect Wallet to Enter
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </ConnectButton.Custom>
          <p className="text-sm text-slate-500">MetaMask, WalletConnect, or social login</p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-5xl mx-auto">
        {STATS.map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
            <p className="text-2xl font-black text-indigo-600">{s.value}</p>
            <p className="text-sm font-medium text-slate-600">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-slate-950 text-center mb-10">Full DeFi toolkit</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="glass-card rounded-2xl p-6 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center mb-4">
                <f.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-slate-950 text-center mb-10">Why Payarc</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {WHY.map(w => (
            <div key={w.title} className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                <w.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900">{w.title}</h4>
              <p className="mt-1 text-sm text-slate-500">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 p-10 text-white text-center max-w-4xl lg:mx-auto">
        <h2 className="text-3xl font-black">Ready to start?</h2>
        <p className="mt-3 opacity-80">Connect your wallet to access the full Payarc app.</p>
        <div className="mt-6">
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="rounded-2xl bg-white px-8 py-3 font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-slate-500">
        Built on Arc Testnet • Open Source on GitHub
      </footer>
    </main>
  )
}
