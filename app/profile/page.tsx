'use client'

import { useAccount, useBalance, useEnsName, useEnsAvatar } from 'wagmi'
import { explorerAddress, shortAddr } from '../utils'
import { mainnet } from 'viem/chains'

export default function ProfilePage(){
  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id, query: { enabled: !!address } })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined, chainId: mainnet.id, query: { enabled: !!ensName } })

  if(!isConnected) return <main className="page-shell"><div className="page-title"><p className="badge">Wallet identity</p><h1>Profile</h1><p>View your connected wallet info, ENS name, and social identity.</p></div><div className="glass-card form-card"><p>Connect your wallet to view your profile.</p></div></main>

  return <main className="page-shell">
    <div className="page-title"><p className="badge">Wallet identity</p><h1>Profile</h1><p>Your connected wallet info and on-chain identity.</p></div>
    <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-4 mb-6">
        {ensAvatar ? <img src={ensAvatar} alt="ENS Avatar" className="h-24 w-24 rounded-full border-4 border-indigo-100" /> : <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-3xl font-black text-white">{address?.[2]?.toUpperCase()}</div>}
        <div className="text-center">
          {ensName && <p className="text-2xl font-bold text-slate-900">{ensName}</p>}
          <p className="font-mono text-slate-600">{address}</p>
        </div>
      </div>
      <div className="grid gap-4 text-sm">
        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Connector</span><span className="font-bold">{connector?.name || 'Unknown'}</span></div>
        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Balance (Arc testnet)</span><span className="font-bold">{balance ? Number(balance.formatted).toLocaleString(undefined,{maximumFractionDigits:6}) : '0'} USDC</span></div>
        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Chain ID</span><span className="font-bold">5042002</span></div>
        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">ENS Name</span><span className="font-bold">{ensName || 'Not set'}</span></div>
        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Short address</span><span className="font-bold font-mono">{shortAddr(address)}</span></div>
      </div>
      <div className="mt-6 flex gap-3">
        <a href={explorerAddress(address!)} target="_blank" className="secondary-btn flex-1 justify-center text-sm">View on ArcScan</a>
        <button onClick={()=>navigator.clipboard.writeText(address!)} className="secondary-btn flex-1 justify-center text-sm">Copy address</button>
      </div>
    </div>
  </main>
}