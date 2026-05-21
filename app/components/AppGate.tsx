'use client'

import { useAccount } from 'wagmi'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AppGate({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting, isReconnecting } = useAccount()
  const pathname = usePathname()
  const router = useRouter()
  const isLanding = pathname === '/'

  useEffect(() => {
    if (!isLanding && !isConnected && !isConnecting && !isReconnecting) {
      router.replace('/')
    }
  }, [isLanding, isConnected, isConnecting, isReconnecting, router])

  if (!isLanding && !isConnected) {
    return null
  }

  return <>{children}</>
}
