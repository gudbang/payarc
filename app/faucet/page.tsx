'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const FAUCET_AMOUNT = '0.5'
const MOCK_AMOUNTS: Record<'ETH' | 'DAI', string> = { ETH: '1', DAI: '100' }

type ClaimStatus = 'idle' | 'loading' | 'success' | 'error'

export default function FaucetPage() {
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<ClaimStatus>('idle')
  const [mockStatus, setMockStatus] = useState<Record<'ETH' | 'DAI', ClaimStatus>>({ ETH: 'idle', DAI: 'idle' })
  const [txHash, setTxHash] = useState<string | null>(null)
  const [mockTxHash, setMockTxHash] = useState<Record<'ETH' | 'DAI', string | null>>({ ETH: null, DAI: null })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mockError, setMockError] = useState<Record<'ETH' | 'DAI', string | null>>({ ETH: null, DAI: null })

  const claimFaucet = async () => {
    if (!address) return

    setStatus('loading')
    setTxHash(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Faucet transaction failed')
      setTxHash(data.hash)
      setStatus('success')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Transaction failed')
      setStatus('error')
    }
  }

  const claimMockToken = async (token: 'ETH' | 'DAI') => {
    if (!address) return

    setMockStatus((prev) => ({ ...prev, [token]: 'loading' }))
    setMockTxHash((prev) => ({ ...prev, [token]: null }))
    setMockError((prev) => ({ ...prev, [token]: null }))

    try {
      const res = await fetch('/api/mock-faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `${token} mint failed`)
      setMockTxHash((prev) => ({ ...prev, [token]: data.hash }))
      setMockStatus((prev) => ({ ...prev, [token]: 'success' }))
    } catch (err: any) {
      setMockError((prev) => ({ ...prev, [token]: err?.message || `${token} mint failed` }))
      setMockStatus((prev) => ({ ...prev, [token]: 'error' }))
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-indigo-400 text-sm font-medium mb-2">Get Arc testnet assets</p>
        <h1 className="text-3xl font-bold text-white mb-4">Faucet</h1>
        <p className="text-gray-400 mb-8">
          Claim native Arc testnet USDC plus mock ETH/DAI for Payarc swaps, pools, and yield demos.
        </p>

        <div className="glass-card p-6 rounded-2xl">
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💧</div>
              <p className="text-gray-400 mb-4">Connect your wallet to claim testnet assets</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-1">Your wallet</p>
                <p className="text-white font-mono text-sm break-all">{address}</p>
              </div>

              <div className="mb-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-gray-400 block text-sm">Native Arc token</span>
                    <span className="text-2xl font-bold text-white">{FAUCET_AMOUNT} USDC</span>
                  </div>
                  <button
                    onClick={claimFaucet}
                    disabled={status === 'loading'}
                    className="py-3 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Sending...' : '💧 Claim USDC'}
                  </button>
                </div>
                {status === 'success' && txHash && (
                  <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-indigo-400 hover:text-indigo-300 break-all">
                    USDC sent — view transaction →
                  </a>
                )}
                {status === 'error' && errorMsg && <p className="mt-3 text-sm text-red-400">{errorMsg}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(['ETH', 'DAI'] as const).map((token) => (
                  <div key={token} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Mock token</p>
                        <p className="text-2xl font-bold text-white">{MOCK_AMOUNTS[token]} m{token}</p>
                      </div>
                      <div className="text-3xl">{token === 'ETH' ? '🔷' : '🟡'}</div>
                    </div>
                    <button
                      onClick={() => claimMockToken(token)}
                      disabled={mockStatus[token] === 'loading'}
                      className="w-full py-3 px-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mockStatus[token] === 'loading' ? 'Minting...' : `Mint Mock ${token}`}
                    </button>
                    {mockStatus[token] === 'success' && mockTxHash[token] && (
                      <a href={`https://testnet.arcscan.app/tx/${mockTxHash[token]}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-indigo-400 hover:text-indigo-300 break-all">
                        Minted — view transaction →
                      </a>
                    )}
                    {mockStatus[token] === 'error' && mockError[token] && <p className="mt-3 text-sm text-red-400">{mockError[token]}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Faucet balance is limited. Mock ETH/DAI are test-only ERC20 tokens.</p>
          <p className="mt-1">Use Swap after claiming tokens.</p>
        </div>
      </div>
    </main>
  )
}
