'use client'

import { useEffect, useState } from 'react'
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { TOKENS, TokenSymbol } from '../lib/tokens'

const tokenList: TokenSymbol[] = ['USDC', 'ETH', 'DAI']
const TREASURY = '0x35743eeE7178fCe2b474d1b1e42F851074Db4580' as const

const ERC20_ABI = [{
  name: 'transfer',
  type: 'function',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  outputs: [{ type: 'bool' }],
}] as const

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState<TokenSymbol>('USDC')
  const [toToken, setToToken] = useState<TokenSymbol>('ETH')
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'quoting' | 'paying' | 'settling' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | undefined>()
  const [payoutHash, setPayoutHash] = useState<string | null>(null)

  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  const { isSuccess: paymentConfirmed } = useWaitForTransactionReceipt({ hash: paymentHash })

  const { data: usdcBalance } = useBalance({ address, chainId: 5042002 })
  const { data: ethBalance } = useBalance({ address, token: TOKENS.ETH.address as `0x${string}`, chainId: 5042002 })
  const { data: daiBalance } = useBalance({ address, token: TOKENS.DAI.address as `0x${string}`, chainId: 5042002 })

  const balances: Record<TokenSymbol, string> = {
    USDC: usdcBalance ? formatEther(usdcBalance.value) : '0',
    ETH: ethBalance ? formatEther(ethBalance.value) : '0',
    DAI: daiBalance ? formatEther(daiBalance.value) : '0',
  }

  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || fromToken === toToken) {
      setQuote(null)
      return
    }
    const timer = setTimeout(async () => {
      setStatus((s) => s === 'paying' || s === 'settling' ? s : 'quoting')
      try {
        const res = await fetch('/api/swap', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromToken, toToken, amount }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setQuote(data)
        setStatus((s) => s === 'quoting' ? 'idle' : s)
      } catch {
        setQuote(null)
        setStatus((s) => s === 'quoting' ? 'idle' : s)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [fromToken, toToken, amount])

  const settleSwap = async (hash: `0x${string}`) => {
    if (!address || !quote) return
    setStatus('settling')
    const res = await fetch('/api/swap/settle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, fromToken, toToken, amount, paymentHash: hash }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Swap settlement failed')
    setPayoutHash(data.payoutHash)
    setStatus('success')
  }

  useEffect(() => {
    if (paymentConfirmed && paymentHash && status === 'paying') {
      settleSwap(paymentHash).catch((err) => {
        setErrorMsg(err?.message || 'Settlement failed')
        setStatus('error')
      })
    }
  }, [paymentConfirmed, paymentHash, status])

  const executeSwap = async () => {
    if (!quote || !address) return
    setStatus('paying')
    setErrorMsg(null)
    setPaymentHash(undefined)
    setPayoutHash(null)
    try {
      let hash: `0x${string}`
      if (fromToken === 'USDC') {
        hash = await sendTransactionAsync({ to: TREASURY, value: parseEther(amount) })
      } else {
        hash = await writeContractAsync({
          address: TOKENS[fromToken].address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [TREASURY, parseEther(amount)],
        })
      }
      setPaymentHash(hash)
    } catch (err: any) {
      setErrorMsg(err?.shortMessage || err?.message || 'Payment transaction rejected')
      setStatus('error')
    }
  }

  const switchTokens = () => {
    setFromToken(toToken); setToToken(fromToken); setAmount(''); setQuote(null)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <p className="text-indigo-400 text-sm font-medium mb-2">Real testnet swap</p>
        <h1 className="text-3xl font-bold text-white mb-4">Swap</h1>
        <p className="text-gray-400 mb-8">Send input token to Payarc treasury, then receive output token on Arc Testnet.</p>

        <div className="glass-card p-6 rounded-2xl">
          {!isConnected ? <div className="text-center py-8"><div className="text-6xl mb-4">🔄</div><p className="text-gray-400">Connect wallet to swap</p></div> : <>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400 mb-2"><span>From</span><span>Balance: {parseFloat(balances[fromToken]).toFixed(4)}</span></div>
              <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="flex-1 bg-transparent text-2xl text-white outline-none" />
                <select value={fromToken} onChange={(e) => setFromToken(e.target.value as TokenSymbol)} className="bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold">
                  {tokenList.map((t) => <option key={t} value={t}>{TOKENS[t].icon} {t}</option>)}
                </select>
              </div>
              <button onClick={() => setAmount(balances[fromToken])} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1">Max</button>
            </div>

            <div className="flex justify-center my-2"><button onClick={switchTokens} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition">↕</button></div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2"><span>To</span><span>Balance: {parseFloat(balances[toToken]).toFixed(4)}</span></div>
              <div className="flex gap-3 p-4 bg-slate-800/50 rounded-xl">
                <input type="text" value={quote ? quote.outputAmount.toFixed(6) : ''} readOnly placeholder="0.0" className="flex-1 bg-transparent text-2xl text-white outline-none" />
                <select value={toToken} onChange={(e) => setToToken(e.target.value as TokenSymbol)} className="bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold">
                  {tokenList.filter((t) => t !== fromToken).map((t) => <option key={t} value={t}>{TOKENS[t].icon} {t}</option>)}
                </select>
              </div>
            </div>

            {quote && <div className="mb-6 p-4 bg-slate-800/30 rounded-xl text-sm">
              <div className="flex justify-between text-gray-400 mb-2"><span>Rate</span><span>1 {fromToken} = {quote.rate} {toToken}</span></div>
              <div className="flex justify-between text-gray-400 mb-2"><span>Fee</span><span>{quote.fee.toFixed(6)} {fromToken}</span></div>
              <div className="flex justify-between text-gray-400"><span>Receive</span><span className="text-green-400">{quote.outputAmount.toFixed(6)} {toToken}</span></div>
            </div>}

            <button onClick={executeSwap} disabled={!quote || status === 'paying' || status === 'settling' || fromToken === toToken} className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'quoting' ? 'Getting quote...' : status === 'paying' ? 'Confirming payment...' : status === 'settling' ? 'Sending output token...' : !amount ? 'Enter amount' : 'Swap on Arc'}
            </button>

            {status === 'success' && payoutHash && <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20"><p className="text-green-400 font-medium">✓ Swap completed on Arc Testnet</p><a href={`https://testnet.arcscan.app/tx/${payoutHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 break-all">View payout transaction →</a></div>}
            {status === 'error' && errorMsg && <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20"><p className="text-red-400 font-medium">✗ Swap failed</p><p className="text-sm text-gray-400">{errorMsg}</p></div>}
          </>}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500"><p>Direct URL is wallet-gated. Open landing, connect wallet, then menu appears.</p></div>
      </div>
    </main>
  )
}
