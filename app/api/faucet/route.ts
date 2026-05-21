import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, http, isAddress, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'Arc Explorer', url: 'https://testnet.arcscan.app' } },
}

const FAUCET_AMOUNT = '0.5'

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const privateKey = process.env.FAUCET_PRIVATE_KEY as `0x${string}` | undefined
    if (!privateKey) {
      return NextResponse.json({ error: 'Faucet is not configured' }, { status: 500 })
    }

    const account = privateKeyToAccount(privateKey)
    const client = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })

    const hash = await client.sendTransaction({
      to: address,
      value: parseEther(FAUCET_AMOUNT),
    })

    return NextResponse.json({ hash, amount: FAUCET_AMOUNT })
  } catch (err: any) {
    console.error('Faucet API error:', err)
    return NextResponse.json({ error: err?.message || 'Faucet transaction failed' }, { status: 500 })
  }
}
