'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pay', label: 'Pay' },
  { href: '/request', label: 'Request' },
  { href: '/swap', label: 'Swap' },
  { href: '/faucet', label: 'Faucet' },
  { href: '/history', label: 'History' },
  { href: '/pool', label: 'Pool' },
  { href: '/yield', label: 'Yield' },
  { href: '/profile', label: 'Profile' },
  { href: '/contacts', label: 'Contacts' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-xl text-sm font-semibold transition ${pathname === href ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-700 hover:text-indigo-700 hover:bg-white/70'}`

  return (
    <nav className="sticky top-0 z-50 border-b border-indigo-100/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-lg font-black text-white shadow-lg shadow-indigo-400/30">P</span>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900">Payarc</div>
              <div className="hidden text-xs font-medium text-slate-500 sm:block">Arc testnet payments</div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => <Link key={item.href} href={item.href} className={linkClass(item.href)}>{item.label}</Link>)}
          </div>

          <div className="hidden sm:block"><ConnectButton /></div>
          <button className="rounded-xl p-2 text-slate-700 hover:bg-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-indigo-100 bg-white/95 px-4 py-4 shadow-xl lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={linkClass(item.href)}>{item.label}</Link>)}
            <div className="pt-3 sm:hidden"><ConnectButton /></div>
          </div>
        </div>
      )}
    </nav>
  )
}