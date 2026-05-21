import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, encodeFunctionData, http, isAddress, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'Arc Explorer', url: 'https://testnet.arcscan.app' } },
}

const FAUCET_WALLET = '0x35743eeE7178fCe2b474d1b1e42F851074Db4580' as const
const MOCK_TOKENS = {
  ETH: '0xA21DDc1f17dF41589BC6A5209292AED2dF61Cc94',
  DAI: '0x2A590C461Db46bca129E8dBe5C3998A8fF402e76',
} as const

const SWAP_RATES: Record<string, Record<string, number>> = {
  USDC: { ETH: 0.0005, DAI: 1 },
  ETH: { USDC: 2000, DAI: 2000 },
  DAI: { USDC: 1, ETH: 0.0005 },
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
    const { address, fromToken, toToken, amount, paymentHash } = await req.json()
    if (!address || !isAddress(address)) return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    if (!paymentHash || typeof paymentHash !== 'string') return NextResponse.json({ error: 'Missing payment hash' }, { status: 400 })

    const rate = SWAP_RATES[fromToken]?.[toToken]
    const inputAmount = Number(amount)
    if (!rate || !inputAmount || inputAmount <= 0) return NextResponse.json({ error: 'Invalid swap request' }, { status: 400 })

    const privateKey = process.env.FAUCET_PRIVATE_KEY as `0x${string}` | undefined
    if (!privateKey) return NextResponse.json({ error: 'Swap treasury is not configured' }, { status: 500 })

    const publicClient = createPublicClient({ chain: arcTestnet, transport: http('https://rpc.testnet.arc.network') })
    const receipt = await publicClient.waitForTransactionReceipt({ hash: paymentHash as `0x${string}`, timeout: 60_000 })
    if (receipt.status !== 'success') return NextResponse.json({ error: 'Payment transaction failed' }, { status: 400 })

    const tx = await publicClient.getTransaction({ hash: paymentHash as `0x${string}` })
    if (tx.from.toLowerCase() !== address.toLowerCase()) return NextResponse.json({ error: 'Payment sender mismatch' }, { status: 400 })

    if (fromToken === 'USDC') {
      if (!tx.to || tx.to.toLowerCase() !== FAUCET_WALLET.toLowerCase()) return NextResponse.json({ error: 'USDC payment was not sent to swap treasury' }, { status: 400 })
      if (tx.value < parseEther(String(inputAmount))) return NextResponse.json({ error: 'Payment amount too low' }, { status: 400 })
    } else if (!MOCK_TOKENS[fromToken as keyof typeof MOCK_TOKENS]) {
      return NextResponse.json({ error: 'Unsupported input token' }, { status: 400 })
    }

    const outputAmount = inputAmount * rate * 0.997
    const account = privateKeyToAccount(privateKey)
    const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http('https://rpc.testnet.arc.network') })

    let payoutHash: `0x${string}`
    if (toToken === 'USDC') {
      payoutHash = await walletClient.sendTransaction({ to: address as `0x${string}`, value: parseEther(outputAmount.toFixed(18)) })
    } else if (MOCK_TOKENS[toToken as keyof typeof MOCK_TOKENS]) {
      const data = encodeFunctionData({
        abi: mintAbi,
        functionName: 'mint',
        args: [address as `0x${string}`, parseEther(outputAmount.toFixed(18))],
      })
      payoutHash = await walletClient.sendTransaction({ to: MOCK_TOKENS[toToken as keyof typeof MOCK_TOKENS], data })
    } else {
      return NextResponse.json({ error: 'Unsupported output token' }, { status: 400 })
    }

    return NextResponse.json({ paymentHash, payoutHash, outputAmount, toToken, treasury: FAUCET_WALLET })
  } catch (err: any) {
    console.error('Swap settle API error:', err)
    return NextResponse.json({ error: err?.message || 'Swap settlement failed' }, { status: 500 })
  }
}
