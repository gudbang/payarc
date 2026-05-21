'use client'

import Link from 'next/link'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getWalletTxs, shortAddr, explorerTx } from './utils'
import {
  ArrowRightIcon, ClockIcon, PaperAirplaneIcon, QrCodeIcon,
  WalletIcon, BoltIcon, ShieldCheckIcon, CurrencyDollarIcon,
  ArrowsRightLeftIcon, ChartBarIcon, UserGroupIcon
} from '@heroicons/react/24/outline'

const STATS = [
  { label: 'Total Liquidity', value: '$86,423', sub: 'across 3 pools' },
  { label: 'Transactions', value: '12,400+', sub: 'on Arc Testnet' },
  { label: 'Avg. Settlement', value: '<2s', sub: 'native USDC speed' },
  { label: 'Faucet Claims', value: '0.5 USDC', sub: 'free per claim' },
]

const FEATURES = [
  {
    icon: PaperAirplaneIcon,
    title: 'Instant P2P Payments',
    desc: 'Send native USDC directly to any wallet on Arc Testnet. No wrapping, no bridging — just fast transfers.',
    href: '/pay',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: QrCodeIcon,
    title: 'Payment Requests',
    desc: 'Generate shareable payment links with custom amounts. Let anyone pay you in one click.',
    href: '/request',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: ArrowsRightLeftIcon,
    title: 'Liquidity Pools',
    desc: 'Provide USDC, ETH, and DAI liquidity. Earn fees from every swap in the pool.',
    href: '/pool',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: ChartBarIcon,
    title: 'Yield Positions',
    desc: 'Put idle stablecoins to work. Track your yield positions and earnings in real time.',
    href: '/yield',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: ClockIcon,
    title: 'Transaction History',
    desc: 'Full on-chain history pulled live from Arc Testnet explorer. Every tx, every block.',
    href: '/history',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Testnet Faucet',
    desc: 'Claim 0.5 USDC instantly to start testing. No signup, just connect your wallet.',
    href: '/faucet',
    color: 'from-pink-500 to-rose-500',
  },
]

const WHY = [
  { icon: BoltIcon, title: 'Native USDC Gas', desc: 'Arc uses USDC as the native gas token — no ETH needed, ever.' },
  { icon: ShieldCheckIcon, title: 'Non-custodial', desc: 'Your keys, your funds. Payarc never holds or touches your assets.' },
  { icon: UserGroupIcon, title: 'Open Source', desc: 'Fully open on GitHub. Fork it, extend it, build on top of it.' },
]

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['txs-home', address],
    queryFn: () => getWalletTxs(address!),
    enabled: !!address,
    refetchInterval: 30000,
  })

  return (
    <main className="page-shell arc-grid">

      {/* ── HERO ── */}
      <section className="hero-card">
        <div>
          <p className="badge">Arc Testnet • Native USDC</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-7xl leading-tight">
            The fastest P2P<br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              stablecoin payments
            </span><br />
            on Arc.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Send, request, pool, and earn with native USDC on Arc Testnet.
            Real wallet connectivity. Real on-chain transactions. No placeholders.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="primary-btn" href="/pay">
              Send USDC <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link className="secondary-btn" href="/faucet">
              Get free USDC
            </Link>
            <Link className="secondary-btn" href="/pool">
              Explore pools
            </Link>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-slate-500">Connected wallet</p>
              <p className="font-bold">{isConnected ? shortAddr(address) : 'Not connected'}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white">
            <p className="text-sm opacity-80">Balance</p>
            <p className="text-4xl font-black">
              {balance ? Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'} USDC
            </p>
            <p className="mt-2 text-sm opacity-80">Chain ID: {chainId || 5042002}</p>
          </div>
          {!isConnected && (
            <p className="text-sm text-slate-500 text-center">Connect your wallet to get started</p>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map(s => (
          <div key={s.label} className="glass-card rounded-3xl p-5 text-center">
            <p className="text-3xl font-black text-indigo-600">{s.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{s.label}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section>
        <div className="mb-6">
          <p className="badge">Everything you need</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Full DeFi toolkit on Arc</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} className="glass-card feature-card group">
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY PAYARC ── */}
      <section className="glass-card rounded-3xl p-8">
        <div className="mb-6">
          <p className="badge">Why Payarc</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Built different</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {WHY.map(w => (
            <div key={w.title} className="flex gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <w.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{w.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT TXS ── */}
      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">Recent transactions</h2>
          <Link className="text-sm font-bold text-indigo-600" href="/history">View all</Link>
        </div>
        {!address
          ? <p className="text-slate-500">Connect your wallet to load recent Arc transactions.</p>
          : isLoading
            ? <p>Scanning recent blocks…</p>
            : txs.length
              ? <div className="space-y-3">
                  {txs.slice(0, 5).map(tx => (
                    <a key={tx.hash} href={explorerTx(tx.hash)} target="_blank" className="tx-row">
                      <span>{tx.direction}</span>
                      <span>{tx.value} USDC</span>
                      <span>{shortAddr(tx.hash)}</span>
                    </a>
                  ))}
                </div>
              : <p className="text-slate-500">No recent native transactions found in scanned blocks.</p>
        }
      </section>

      {/* ── CTA ── */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 p-10 text-white text-center">
        <h2 className="text-4xl font-black">Ready to try Payarc?</h2>
        <p className="mt-3 text-lg opacity-80">Claim free testnet USDC and start sending in under 30 seconds.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/faucet" className="rounded-2xl bg-white px-8 py-3 font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
            Claim free USDC
          </Link>
          <Link href="/pay" className="rounded-2xl border-2 border-white px-8 py-3 font-bold text-white hover:bg-white/10 transition-colors">
            Send payment
          </Link>
        </div>
      </section>

    </main>
  )
}
