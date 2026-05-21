'use client'

import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getWalletTxs, shortAddr, explorerTx } from '../utils'

export default function HistoryPage(){
  const { address, isConnected } = useAccount()
  const { data: txs = [], isLoading, refetch } = useQuery({ queryKey: ['txs-history', address], queryFn: () => getWalletTxs(address!, 5000), enabled: !!address, refetchInterval: 30000 })

  return <main className="page-shell">
    <div className="page-title"><p className="badge">On-chain data via viem</p><h1>Transaction history</h1><p>Scans recent Arc testnet blocks for native USDC transfers involving your wallet.</p></div>
    {!isConnected ? <div className="glass-card form-card"><p>Connect your wallet to view transaction history.</p></div> :
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Transactions for {shortAddr(address)}</h2><button onClick={()=>refetch()} className="text-sm font-bold text-indigo-600 hover:underline">Refresh</button></div>
      {isLoading ? <p className="text-slate-500">Scanning blocks…</p> : txs.length === 0 ? <p className="text-slate-500">No native transactions found in recent blocks.</p> :
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-slate-500"><th className="pb-2">Direction</th><th className="pb-2">Amount</th><th className="pb-2">From</th><th className="pb-2">To</th><th className="pb-2">Block</th><th className="pb-2">Tx</th></tr></thead><tbody>{txs.map(tx=><tr key={tx.hash} className="border-b border-slate-100 hover:bg-indigo-50/40"><td className={`py-2 font-bold ${tx.direction==='Received'?'text-green-600':tx.direction==='Sent'?'text-red-500':'text-slate-600'}`}>{tx.direction}</td><td className="py-2 font-mono">{Number(tx.value).toLocaleString(undefined,{maximumFractionDigits:6})} USDC</td><td className="py-2 font-mono">{shortAddr(tx.from)}</td><td className="py-2 font-mono">{tx.to ? shortAddr(tx.to) : '—'}</td><td className="py-2">{tx.blockNumber.toString()}</td><td className="py-2"><a href={explorerTx(tx.hash)} target="_blank" className="text-indigo-600 hover:underline">View</a></td></tr>)}</tbody></table></div>}
    </div>}
  </main>
}