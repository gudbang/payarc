'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { shortAddr } from '../utils'

const POOLS = [
  { id: 'usdc-eth', name: 'USDC / ETH', tvl: 142500, apr: 12.4, userLp: 0 },
  { id: 'usdc-arc', name: 'USDC / ARC', tvl: 89200, apr: 18.7, userLp: 0 },
  { id: 'usdc-dai', name: 'USDC / DAI', tvl: 210000, apr: 6.2, userLp: 0 },
]

export default function PoolPage(){
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const [selected, setSelected] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [positions, setPositions] = useState<Record<string, number>>({})

  function deposit(){
    if(!selected || !amount) return
    const val = parseFloat(amount)
    if(isNaN(val) || val <= 0) return
    setPositions(p => ({ ...p, [selected]: (p[selected] || 0) + val }))
    setAmount('')
    setSelected(null)
  }

  function withdraw(id: string){
    setPositions(p => { const copy = { ...p }; delete copy[id]; return copy })
  }

  return <main className="page-shell">
    <div className="page-title"><p className="badge">Simulated pool interactions</p><h1>Liquidity pools</h1><p>Provide liquidity to earn fees. Pool interactions are simulated locally for demo purposes.</p></div>
    <div className="grid gap-6 lg:grid-cols-3">
      {POOLS.map(pool => {
        const userPos = positions[pool.id] || 0
        return <div key={pool.id} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between"><h3 className="text-xl font-bold">{pool.name}</h3><span className="badge">{pool.apr}% APR</span></div>
          <div className="grid grid-cols-2 gap-2 text-sm"><div><p className="text-slate-500">TVL</p><p className="font-bold">${pool.tvl.toLocaleString()}</p></div><div><p className="text-slate-500">Your LP</p><p className="font-bold">{userPos.toLocaleString()} USDC</p></div></div>
          {selected === pool.id ? <div className="flex flex-col gap-2"><input className="input" type="number" min="0" step="0.01" placeholder="Amount USDC" value={amount} onChange={e=>setAmount(e.target.value)} /><button className="primary-btn justify-center text-sm" onClick={deposit}>Confirm deposit</button><button className="text-xs text-slate-500" onClick={()=>setSelected(null)}>Cancel</button></div> : <button className="secondary-btn justify-center text-sm" onClick={()=>setSelected(pool.id)}>Add liquidity</button>}
          {userPos > 0 && <button className="text-xs text-red-500 hover:underline" onClick={()=>withdraw(pool.id)}>Withdraw all</button>}
        </div>
      })}
    </div>
    {isConnected && <div className="glass-card rounded-3xl p-6 mt-6"><p className="text-sm text-slate-500">Wallet: {shortAddr(address)} • Balance: {balance ? Number(balance.formatted).toLocaleString(undefined,{maximumFractionDigits:4}) : '0'} USDC</p></div>}
  </main>
}