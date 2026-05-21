'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { shortAddr } from '../utils'
import { TOKENS, TOKEN_PAIRS, type TokenSymbol } from '../lib/tokens'

type PoolId = `${TokenSymbol}-${TokenSymbol}`

const POOLS = TOKEN_PAIRS.map((pair) => ({
  id: `${pair.token0}-${pair.token1}` as PoolId,
  token0: pair.token0 as TokenSymbol,
  token1: pair.token1 as TokenSymbol,
  name: `${pair.token0} / ${pair.token1}`,
  liquidity: pair.liquidity,
  apr: pair.apy,
  userLp: 0,
}))

export default function PoolPage(){
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const [selected, setSelected] = useState<string | null>(null)
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [positions, setPositions] = useState<Record<string, { token0: number; token1: number }>>({})

  function deposit(poolId: string){
    if(!poolId || !amount0 || !amount1) return
    const val0 = parseFloat(amount0)
    const val1 = parseFloat(amount1)
    if(isNaN(val0) || isNaN(val1) || val0 <= 0 || val1 <= 0) return
    setPositions(p => ({
      ...p,
      [poolId]: {
        token0: (p[poolId]?.token0 || 0) + val0,
        token1: (p[poolId]?.token1 || 0) + val1,
      }
    }))
    setAmount0('')
    setAmount1('')
    setSelected(null)
  }

  function withdraw(id: string){
    setPositions(p => { const copy = { ...p }; delete copy[id]; return copy })
  }

  return <main className="page-shell">
    <div className="page-title">
      <p className="badge">Multi-token liquidity</p>
      <h1>Liquidity pools</h1>
      <p>Add USDC, ETH, and DAI liquidity pairs on Arc Testnet. USDC is native on Arc; ETH and DAI are represented as testnet pool assets for demo trading depth.</p>
    </div>

    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {(Object.keys(TOKENS) as TokenSymbol[]).map(symbol => {
        const token = TOKENS[symbol]
        return <div key={symbol} className="glass-card rounded-3xl p-5">
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${token.color} text-white flex items-center justify-center text-2xl mb-3`}>{token.icon}</div>
          <h3 className="text-lg font-bold">{token.name}</h3>
          <p className="text-sm text-slate-500">{token.symbol} • {token.decimals} decimals</p>
          <p className="text-xs text-slate-400 mt-2 break-all">{token.address === '0x0000000000000000000000000000000000000000' ? 'Native Arc token' : token.address}</p>
        </div>
      })}
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {POOLS.map(pool => {
        const userPos = positions[pool.id]
        const token0 = TOKENS[pool.token0]
        const token1 = TOKENS[pool.token1]
        return <div key={pool.id} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className={`h-10 w-10 rounded-full bg-gradient-to-br ${token0.color} flex items-center justify-center text-white ring-2 ring-white`}>{token0.icon}</span>
                <span className={`h-10 w-10 rounded-full bg-gradient-to-br ${token1.color} flex items-center justify-center text-white ring-2 ring-white`}>{token1.icon}</span>
              </div>
              <h3 className="text-xl font-bold">{pool.name}</h3>
            </div>
            <span className="badge">{pool.apr} APR</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-slate-500">Liquidity</p><p className="font-bold">{pool.liquidity}</p></div>
            <div><p className="text-slate-500">Your LP</p><p className="font-bold">{userPos ? `${userPos.token0} ${pool.token0} + ${userPos.token1} ${pool.token1}` : '0'}</p></div>
          </div>
          {selected === pool.id ? <div className="flex flex-col gap-2">
            <input className="input" type="number" min="0" step="0.01" placeholder={`Amount ${pool.token0}`} value={amount0} onChange={e=>setAmount0(e.target.value)} />
            <input className="input" type="number" min="0" step="0.01" placeholder={`Amount ${pool.token1}`} value={amount1} onChange={e=>setAmount1(e.target.value)} />
            <button className="primary-btn justify-center text-sm" onClick={()=>deposit(pool.id)}>Confirm deposit</button>
            <button className="text-xs text-slate-500" onClick={()=>setSelected(null)}>Cancel</button>
          </div> : <button className="secondary-btn justify-center text-sm" onClick={()=>setSelected(pool.id)}>Add liquidity</button>}
          {userPos && <button className="text-xs text-red-500 hover:underline" onClick={()=>withdraw(pool.id)}>Withdraw all</button>}
        </div>
      })}
    </div>
    {isConnected && <div className="glass-card rounded-3xl p-6 mt-6"><p className="text-sm text-slate-500">Wallet: {shortAddr(address)} • Native USDC Balance: {balance ? Number(balance.formatted).toLocaleString(undefined,{maximumFractionDigits:4}) : '0'} USDC</p></div>}
  </main>
}