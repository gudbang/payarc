'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { TOKENS, TokenSymbol } from '../lib/tokens'

const tokenList: TokenSymbol[] = ['USDC', 'ETH', 'DAI']

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState<TokenSymbol>('USDC')
  const [toToken, setToToken] = useState<TokenSymbol>('ETH')
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'quoting' | 'swapping' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Get balances
  const { data: usdcBalance } = useBalance({ address, chainId: 5042002 })
  const { data: ethBalance } = useBalance({
    address,
    token: TOKENS.ETH.address as `0x${string}`,
    chainId: 5042002,
  })
  const { data: daiBalance } = useBalance({
    address,
    token: TOKENS.DAI.address as `0x${string}`,
    chainId: 5042002,
  })

  const balances: Record<TokenSymbol, string> = {
    USDC: usdcBalance ? formatEther(usdcBalance.value) : '0',
    ETH: ethBalance ? formatEther(ethBalance.value) : '0',
    DAI: daiBalance ? formatEther(daiBalance.value) : '0',
  }

  // Fetch quote when inputs change
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || fromToken === toToken) {
      setQuote(null)
      return
    }

    const fetchQuote = async () => {
      setStatus('quoting')
      try {
        const res = await fetch('/api/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromToken, toToken, amount }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setQuote(data)
        setStatus('idle')
      } catch (err: any) {
        setQuote(null)
        setStatus('idle')
      }
    }

    const timer = setTimeout(fetchQuote, 300)
    return () => clearTimeout(timer)
  }, [fromToken, toToken, amount])

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setAmount('')
    setQuote(null)
  }

  const executeSwap = async () => {
    if (!quote || !address) return

    setStatus('swapping')
    setErrorMsg(null)

    try {
      // For demo: we simulate swap by transferring mock tokens
      // In production, this would call a DEX contract
      // Here we just show the flow - actual swap would need liquidity pool contract

      // Simulate success after delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      setStatus('success')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Swap failed')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setStatus('success')
    }
  }, [isSuccess])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <p className="text-indigo-400 text-sm font-medium mb-2">Exchange tokens</p>
        <h1 className="text-3xl font-bold text-white mb-4">Swap</h1>
        <p className="text-gray-400 mb-8">
          Swap between USDC, Mock ETH, and Mock DAI on Arc Testnet.
        </p>

        <div className="glass-card p-6 rounded-2xl">
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-gray-400">Connect your wallet to swap tokens</p>
            </div>
          ) : (
            <>
              {/* From Token */}
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>From</span>
                  <span>Balance: {parseFloat(balances[fromToken]).toFixed(4)}</span>
                </div>
                <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl text-white outline-none"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value as TokenSymbol)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    {tokenList.map((t) => (
                      <option key={t} value={t}>
                        {TOKENS[t].icon} {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setAmount(balances[fromToken])}
                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                >
                  Max
                </button>
              </div>

              {/* Switch Button */}
              <div className="flex justify-center my-2">
                <button
                  onClick={switchTokens}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* To Token */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>To</span>
                  <span>Balance: {parseFloat(balances[toToken]).toFixed(4)}</span>
                </div>
                <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl">
                  <input
                    type="text"
                    value={quote ? quote.outputAmount.toFixed(6) : ''}
                    readOnly
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl text-white outline-none"
                  />
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value as TokenSymbol)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    {tokenList.filter((t) => t !== fromToken).map((t) => (
                      <option key={t} value={t}>
                        {TOKENS[t].icon} {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quote Details */}
              {quote && (
                <div className="mb-6 p-4 bg-slate-800/30 rounded-xl text-sm">
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>Rate</span>
                    <span>1 {fromToken} = {quote.rate} {toToken}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>Fee (0.3%)</span>
                    <span>{quote.fee.toFixed(6)} {fromToken}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Price Impact</span>
                    <span className="text-green-400">{quote.priceImpact}</span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={executeSwap}
                disabled={!quote || status === 'swapping' || fromToken === toToken}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'quoting' ? 'Getting quote...' : 
                 status === 'swapping' ? 'Swapping...' : 
                 fromToken === toToken ? 'Select different tokens' :
                 !amount ? 'Enter amount' :
                 '🔄 Swap'}
              </button>

              {status === 'success' && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-green-400 font-medium">✓ Swap simulated successfully!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Note: This is a demo. Real swaps require a deployed DEX contract.
                  </p>
                </div>
              )}

              {status === 'error' && errorMsg && (
                <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-400 font-medium">✗ Swap failed</p>
                  <p className="text-sm text-gray-400">{errorMsg}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Demo swap with fixed rates. No actual liquidity pool.</p>
          <p className="mt-1">Get mock tokens from the Faucet first!</p>
        </div>
      </div>
    </main>
  )
}
