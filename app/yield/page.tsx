'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { shortAddr } from '../utils'

const VAULTS = [
  { id: 'stable', name: 'Stable Yield', token: 'USDC', apy: 8.5, lockDays: 0, desc: 'Flexible deposit, earn yield on idle USDC.' },
  { id: 'boosted', name: 'Boosted Arc', token: 'USDC', apy: 22.1, lockDays: 30, desc: '30-day lock for boosted rewards.' },
  { id: 'lp-farm', name: 'LP Farm', token: 'USDC/ARC LP', apy: 41.3, lockDays: 7, desc: 'Stake LP tokens for high-yield farming.' },
]

export default function YieldPage(){
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const [stakes, setStakes] = useState<Record<string, { amount: number; since: string }>>({})
  const [active, setActive] = useState<string | null>(null)
  const [amount, setAmount] = useState('')

  function stake(id: string){
    const val = parseFloat(amount)
    if(isNaN(val) || val <= 0) return
    setStakes(s => ({ ...s, [id]: { amount: (s[id]?.amount || 0) + val, since: new Date().toLocaleDateString() } }))
    setAmount(''); setActive(null)
  }

  function unstake(id: string){ setStakes(s => { const c = { ...s }; delete c[id]; return c }) }

  function earned(id: string){
    const s = stakes[id]; if(!s) return 0
    const vault = VAULTS.find(v => v.id === id)!
    return ((s.amount * vault.apy) / 100 / 365).toFixed(4)
  }

  return <main className="page-shell">
    <div className="page-title"><p className="badge">Simulated yield positions</p><h1>Yield farming</h1><p>Stake USDC or LP tokens to earn yield. Positions are tracked locally for demo purposes.</p></div>
    <div className="grid gap-6 lg:grid-cols-3">
      {VAULTS.map(vault => {
        const pos = stakes[vault.id]
        return <div key={vault.id} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between"><h3 className="text-xl font-bold">{vault.name}</h3><span className="badge">{vault.apy}% APY</span></div>
          <p className="text-sm text-slate-500">{vault.desc}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-slate-500">Token</p><p className="font-bold">{vault.token}</p></div>
            <div><p className="text-slate-500">Lock</p><p className="font-bold">{vault.lockDays === 0 ? 'Flexible' : `${vault.lockDays}d`}</p></div>
          </div>
          {pos && <div className="rounded-2xl bg-indigo-50 p-3 text-sm"><p>Staked: <strong>{pos.amount.toLocaleString()} {vault.token}</strong></p><p>Since: {pos.since}</p><p>Est. daily: <strong>{earned(vault.id)} USDC</strong></p></div>}
          {active === vault.id
            ? <div className="flex flex-col gap-2"><input className="input" type="number" min="0" step="0.01" placeholder={`Amount ${vault.token}`} value={amount} onChange={e=>setAmount(e.target.value)} /><button className="primary-btn justify-center text-sm" onClick={()=>stake(vault.id)}>Confirm stake</button><button className="text-xs text-slate-500" onClick={()=>setActive(null)}>Cancel</button></div>
            : <button className="secondary-btn justify-center text-sm" onClick={()=>setActive(vault.id)}>Stake</button>}
          {pos && <button className="text-xs text-red-500 hover:underline" onClick={()=>unstake(vault.id)}>Unstake all</button>}
        </div>
      })}
    </div>
    {isConnected && <div className="glass-card rounded-3xl p-6 mt-6"><p className="text-sm text-slate-500">Wallet: {shortAddr(address)} • Balance: {balance ? Number(balance.formatted).toLocaleString(undefined,{maximumFractionDigits:4}) : '0'} USDC</p></div>}
  </main>
}