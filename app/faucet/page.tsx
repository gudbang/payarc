'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const FAUCET_AMOUNT = '0.5'

export default function FaucetPage() {
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-lg mx-auto">
        <p className="text-indigo-400 text-sm font-medium mb-2">Get testnet USDC</p>
        <h1 className="text-3xl font-bold text-white mb-4">Faucet</h1>
        <p className="text-gray-400 mb-8">
          Claim {FAUCET_AMOUNT} USDC on Arc Testnet to start testing payments, pools, and yield features.
        </p>

        <div className="glass-card p-6 rounded-2xl">
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💧</div>
              <p className="text-gray-400 mb-4">Connect your wallet to claim testnet USDC</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-1">Your wallet</p>
                <p className="text-white font-mono text-sm break-all">{address}</p>
              </div>

              <div className="mb-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Claim amount</span>
                  <span className="text-2xl font-bold text-white">{FAUCET_AMOUNT} USDC</span>
                </div>
              </div>

              <button
                onClick={claimFaucet}
                disabled={status === 'loading'}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : '💧 Claim USDC'}
              </button>

              {status === 'success' && txHash && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-green-400 font-medium mb-2">✓ USDC sent!</p>
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 break-all"
                  >
                    View on Explorer →
                  </a>
                </div>
              )}

              {status === 'error' && errorMsg && (
                <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-400 font-medium mb-1">✗ Failed</p>
                  <p className="text-sm text-gray-400">{errorMsg}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Faucet balance is limited. Please use responsibly.</p>
          <p className="mt-1">One claim per session recommended.</p>
        </div>
      </div>
    </main>
  )
}
