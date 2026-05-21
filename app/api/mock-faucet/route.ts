import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, http, isAddress, parseEther, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'Arc Explorer', url: 'https://testnet.arcscan.app' } },
}

const MOCK_TOKENS = {
  ETH: {
    address: '0xA21DDc1f17dF41589BC6A5209292AED2dF61Cc94' as `0x${string}`,
    amount: '1', // 1 mock ETH
  },
  DAI: {
    address: '0x2A590C461Db46bca129E8dBe5C3998A8fF402e76' as `0x${string}`,
    amount: '100', // 100 mock DAI
  },
}

const mintAbi = [{
  name: 'mint',
  type: 'function',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  outputs: [],
}] as const

export async function POST(req: NextRequest) {
  try {
    const { address, token } = await req.json()

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    if (!token || !MOCK_TOKENS[token as keyof typeof MOCK_TOKENS]) {
      return NextResponse.json({ error: 'Invalid token. Use ETH or DAI' }, { status: 400 })
    }

    const privateKey = process.env.FAUCET_PRIVATE_KEY as `0x${string}` | undefined
    if (!privateKey) {
      return NextResponse.json({ error: 'Faucet is not configured' }, { status: 500 })
    }

    const tokenConfig = MOCK_TOKENS[token as keyof typeof MOCK_TOKENS]
    const account = privateKeyToAccount(privateKey)
    const client = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })

    const data = encodeFunctionData({
      abi: mintAbi,
      functionName: 'mint',
      args: [address as `0x${string}`, parseEther(tokenConfig.amount)],
    })

    const hash = await client.sendTransaction({
      to: tokenConfig.address,
      data,
    })

    return NextResponse.json({ hash, amount: tokenConfig.amount, token })
  } catch (err: any) {
    console.error('Mock faucet API error:', err)
    return NextResponse.json({ error: err?.message || 'Mint transaction failed' }, { status: 500 })
  }
}
