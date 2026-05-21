'use client'

import Link from 'next/link'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getWalletTxs, shortAddr, explorerTx } from './utils'
import { ArrowRightIcon, ClockIcon, PaperAirplaneIcon, QrCodeIcon, WalletIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const { data: txs = [], isLoading } = useQuery({ queryKey: ['txs-home', address], queryFn: () => getWalletTxs(address!), enabled: !!address, refetchInterval: 30000 })

  return <main className="page-shell arc-grid">
    <section className="hero-card">
      <div>
        <p className="badge">Arc Testnet • Native USDC</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-7xl">Fast P2P payments on Arc.</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">Connect with RainbowKit, send real native USDC transactions, generate payment links, and track wallet activity on Arc testnet.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link className="primary-btn" href="/pay">Send USDC <ArrowRightIcon className="h-5 w-5" /></Link><Link className="secondary-btn" href="/request">Request payment</Link></div>
      </div>
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3"><WalletIcon className="h-8 w-8 text-indigo-600" /><div><p className="text-sm text-slate-500">Connected wallet</p><p className="font-bold">{isConnected ? shortAddr(address) : 'Not connected'}</p></div></div>
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white"><p className="text-sm opacity-80">Balance</p><p className="text-4xl font-black">{balance ? Number(balance.formatted).toLocaleString(undefined,{maximumFractionDigits:4}) : '0'} USDC</p><p className="mt-2 text-sm opacity-80">Chain ID: {chainId || 5042002}</p></div>
      </div>
    </section>
    <section className="grid gap-6 md:grid-cols-3">
      {[['/pay','Send Payment',PaperAirplaneIcon],['/request','Payment Request',QrCodeIcon],['/history','Live History',ClockIcon]].map(([href,title,Icon]: any)=><Link key={href} href={href} className="glass-card feature-card"><Icon className="h-8 w-8 text-indigo-600"/><h3>{title}</h3><p>Open {title.toLowerCase()} tools.</p></Link>)}
    </section>
    <section className="glass-card rounded-3xl p-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Recent transactions</h2><Link className="text-sm font-bold text-indigo-600" href="/history">View all</Link></div>{!address ? <p className="text-slate-500">Connect your wallet to load recent Arc transactions.</p> : isLoading ? <p>Scanning recent blocks…</p> : txs.length ? <div className="space-y-3">{txs.slice(0,5).map(tx=><a key={tx.hash} href={explorerTx(tx.hash)} target="_blank" className="tx-row"><span>{tx.direction}</span><span>{tx.value} USDC</span><span>{shortAddr(tx.hash)}</span></a>)}</div> : <p className="text-slate-500">No recent native transactions found in scanned blocks.</p>}</section>
  </main>
}