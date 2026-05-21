'use client'

import { useState, useEffect } from 'react'
import { isAddress } from 'viem'
import { shortAddr } from '../utils'
import { TrashIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline'

type Contact = { id: string; name: string; address: string; note?: string }

export default function ContactsPage(){
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('payarc-contacts')
    if(saved) setContacts(JSON.parse(saved))
  }, [])

  function save(newContacts: Contact[]){
    setContacts(newContacts)
    localStorage.setItem('payarc-contacts', JSON.stringify(newContacts))
  }

  function add(){
    if(!name.trim() || !isAddress(address)) return
    const contact: Contact = { id: Date.now().toString(), name: name.trim(), address, note: note.trim() || undefined }
    save([...contacts, contact])
    setName(''); setAddress(''); setNote(''); setShowForm(false)
  }

  function remove(id: string){ save(contacts.filter(c => c.id !== id)) }

  return <main className="page-shell">
    <div className="page-title"><p className="badge">Local storage</p><h1>Contacts</h1><p>Save wallet addresses with names for quick payments. Stored locally in your browser.</p></div>
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Saved contacts</h2>
        <button onClick={()=>setShowForm(!showForm)} className="primary-btn text-sm"><PlusIcon className="h-4 w-4" />Add contact</button>
      </div>
      {showForm && <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
        <div className="grid gap-3">
          <input className="input" placeholder="Contact name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Wallet address (0x...)" value={address} onChange={e=>setAddress(e.target.value)} />
          <input className="input" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={add} className="primary-btn flex-1 justify-center text-sm">Save contact</button>
            <button onClick={()=>setShowForm(false)} className="secondary-btn text-sm">Cancel</button>
          </div>
        </div>
      </div>}
      {contacts.length === 0 ? <p className="text-slate-500 text-center py-8">No contacts saved yet. Add one to get started.</p> :
      <div className="space-y-3">
        {contacts.map(contact => <div key={contact.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 transition">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold"><UserIcon className="h-5 w-5" /></div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900">{contact.name}</p>
            <p className="font-mono text-sm text-slate-500">{shortAddr(contact.address)}</p>
            {contact.note && <p className="text-xs text-slate-400 mt-1">{contact.note}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>navigator.clipboard.writeText(contact.address)} className="text-xs text-indigo-600 hover:underline">Copy</button>
            <button onClick={()=>remove(contact.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
          </div>
        </div>)}
      </div>}
    </div>
  </main>
}