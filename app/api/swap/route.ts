import { NextRequest, NextResponse } from 'next/server'

// Swap rates (fixed for demo)
// 1 USDC = 0.0005 ETH (simulating ETH at $2000)
// 1 USDC = 1 DAI (stablecoin peg)
const SWAP_RATES: Record<string, Record<string, number>> = {
  USDC: { ETH: 0.0005, DAI: 1 },
  ETH: { USDC: 2000, DAI: 2000 },
  DAI: { USDC: 1, ETH: 0.0005 },
}

export async function POST(req: NextRequest) {
  try {
    const { fromToken, toToken, amount } = await req.json()

    if (!fromToken || !toToken || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rate = SWAP_RATES[fromToken]?.[toToken]
    if (!rate) {
      return NextResponse.json({ error: 'Invalid token pair' }, { status: 400 })
    }

    const inputAmount = parseFloat(amount)
    if (isNaN(inputAmount) || inputAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const outputAmount = inputAmount * rate
    const fee = inputAmount * 0.003 // 0.3% fee

    return NextResponse.json({
      fromToken,
      toToken,
      inputAmount,
      outputAmount,
      rate,
      fee,
      priceImpact: '< 0.01%',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Quote failed' }, { status: 500 })
  }
}
