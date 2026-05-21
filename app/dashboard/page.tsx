'use client'

import Link from 'next/link'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWalletTxs, shortAddr, explorerTx } from '../utils'
import {
  ArrowRightIcon, PaperAirplaneIcon, QrCodeIcon,
  WalletIcon, CurrencyDollarIcon, ArrowsRightLeftIcon,
  ChartBarIcon, ClockIcon
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
    desc: 'Send native USDC directly to any wallet on Arc Testnet.',
    href: '/pay',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: QrCodeIcon,
    title: 'Payment Requests',
    desc: 'Generate shareable payment links with custom amounts.',
    href: '/request',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: ArrowsRightLeftIcon,
    title: 'Liquidity Pools',
    desc: 'Provide USDC, ETH, and DAI liquidity. Earn fees from swaps.',
    href: '/pool',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: ChartBarIcon,
    title: 'Yield Positions',
    desc: 'Put idle stablecoins to work. Track earnings in real time.',
    href: '/yield',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: ClockIcon,
    title: 'Transaction History',
    desc: 'Full on-chain history pulled live from Arc Testnet explorer.',
    href: '/history',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Testnet Faucet',
    desc: 'Claim 0.5 USDC instantly to start testing.',
    href: '/faucet',
    color: 'from-pink-500 to-rose-500',
  },
]

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['txs-dashboard', address],
    queryFn: () => getWalletTxs(address!),
    enabled: !!address,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  return (
    <main className="page-shell arc-grid">

      {/* Wallet Card */}
      <section className="glass-card rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex items-center gap-3 flex-1">
          <WalletIcon className="h-10 w-10 text-indigo-600" />
          <div>
            <p className="text-sm text-slate-500">Connected wallet</p>
            <p className="font-bold text-lg">{shortAddr(address)}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white min-w-[280px]">
          <p className="text-sm opacity-80">Balance</p>
          <p className="text-4xl font-black">
            {balance ? Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'} USDC
          </p>
          <p className="mt-2 text-sm opacity-80">Chain ID: {chainId || 5042002}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map(s => (
          <div key={s.label} className="glass-card rounded-3xl p-5 text-center">
            <p className="text-3xl font-black text-indigo-600">{s.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{s.label}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-black text-slate-950">Quick actions</h2>
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

      {/* Recent Txs */}
      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">Recent transactions</h2>
          <Link className="text-sm font-bold text-indigo-600" href="/history">View all</Link>
        </div>
        {isLoading
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

    </main>
  )
}
