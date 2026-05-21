'use client'

import { useState } from 'react'
import { isAddress, parseEther, type Address } from 'viem'
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi'
import { arcTestnet, explorerTx } from '../utils'

export default function PayPage(){
 const {address, chainId}=useAccount(); const {switchChain}=useSwitchChain(); const {sendTransactionAsync,isPending}=useSendTransaction()
 const [to,setTo]=useState(''); const [amount,setAmount]=useState(''); const [memo,setMemo]=useState(''); const [status,setStatus]=useState(''); const [hash,setHash]=useState('')
 async function submit(e:React.FormEvent){e.preventDefault(); setStatus(''); setHash(''); if(!address) return setStatus('Connect your wallet first.'); if(chainId!==arcTestnet.id){ await switchChain({chainId:arcTestnet.id}) } if(!isAddress(to)) return setStatus('Enter a valid recipient address.'); const value=parseEther(amount||'0'); if(value<=BigInt(0)) return setStatus('Amount must be greater than 0.'); const h=await sendTransactionAsync({to:to as Address,value}); setHash(h); setStatus(`Payment sent${memo ? ` — ${memo}` : ''}`)}
 return <main className="page-shell"><div className="page-title"><p className="badge">Real Arc native transfer</p><h1>Send USDC</h1><p>Arc USDC is the native gas token, so this sends a native transaction with wagmi/viem.</p></div><form onSubmit={submit} className="glass-card form-card"><label>Recipient address<input value={to} onChange={e=>setTo(e.target.value)} placeholder="0x..." /></label><label>Amount (USDC)<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0" step="0.000001" placeholder="10.00" /></label><label>Memo (local note)<input value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Dinner, invoice #42..." /></label><button className="primary-btn justify-center" disabled={isPending}>{isPending?'Confirm in wallet…':'Send USDC'}</button>{status&&<p className="status">{status}</p>}{hash&&<a className="secondary-btn justify-center" target="_blank" href={explorerTx(hash)}>View transaction</a>}</form></main>
}