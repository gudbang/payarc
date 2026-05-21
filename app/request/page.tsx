'use client'

import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { shortAddr } from '../utils'

function buildQrUrl(text: string){
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(text)}`
}

export default function RequestPage(){
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)

  const link = useMemo(() => {
    if(!address) return ''
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://payarc.local'
    const params = new URLSearchParams()
    params.set('to', address)
    if(amount) params.set('amount', amount)
    if(note) params.set('note', note)
    return `${origin}/pay?${params.toString()}`
  }, [address, amount, note])

  const eip681 = useMemo(() => {
    if(!address) return ''
    const value = amount ? `?value=${amount}e18` : ''
    return `ethereum:${address}@5042002${value}`
  }, [address, amount])

  function copy(){
    if(!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(()=>setCopied(false), 1600)
  }

  return <main className="page-shell">
    <div className="page-title"><p className="badge">Shareable payment links</p><h1>Request a payment</h1><p>Generate a Payarc link plus a scannable EIP-681 QR for any amount of native USDC on Arc.</p></div>
    {!isConnected ? <div className="glass-card form-card"><p>Connect your wallet to generate a request link.</p></div> :
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="glass-card form-card">
        <label>Receiving wallet<input readOnly value={address ?? ''} /></label>
        <label>Amount (USDC, optional)<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0" step="0.000001" placeholder="25.00" /></label>
        <label>Note (optional)<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Coffee" /></label>
        <label>Payment link<input readOnly value={link} /></label>
        <button type="button" className="primary-btn justify-center" onClick={copy}>{copied ? 'Copied!' : 'Copy link'}</button>
        <p className="status">EIP-681 URI: <span className="font-mono break-all text-xs">{eip681}</span></p>
      </div>
      <div className="glass-card flex flex-col items-center gap-3 rounded-3xl p-6">
        <p className="text-sm font-bold text-slate-500">Scan to pay</p>
        {link && <img alt="Payment QR" className="rounded-2xl border border-indigo-100" src={buildQrUrl(eip681 || link)} />}
        <p className="text-xs text-slate-500">{shortAddr(address)} • Arc testnet</p>
      </div>
    </div>}
  </main>
}