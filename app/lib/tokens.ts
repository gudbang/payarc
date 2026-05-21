// Arc Testnet token configuration
export const TOKENS = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x0000000000000000000000000000000000000000', // Native token
    decimals: 18,
    icon: '💵',
    color: 'from-blue-500 to-blue-600',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Mock Ethereum',
    address: '0xA21DDc1f17dF41589BC6A5209292AED2dF61Cc94', // Deployed ERC20 on Arc Testnet
    decimals: 18,
    icon: '⟠',
    color: 'from-gray-600 to-gray-700',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Mock Dai Stablecoin',
    address: '0x2A590C461Db46bca129E8dBe5C3998A8fF402e76', // Deployed ERC20 on Arc Testnet
    decimals: 18,
    icon: '🔴',
    color: 'from-yellow-400 to-yellow-500',
  },
} as const

export type TokenSymbol = keyof typeof TOKENS

export const TOKEN_PAIRS = [
  { token0: 'USDC', token1: 'ETH', liquidity: '$42,756.57', apy: '12.5%' },
  { token0: 'USDC', token1: 'DAI', liquidity: '$28,432.10', apy: '8.3%' },
  { token0: 'ETH', token1: 'DAI', liquidity: '$15,234.89', apy: '15.2%' },
] as const

export function getToken(symbol: TokenSymbol) {
  return TOKENS[symbol]
}

export function getTokenPair(token0: TokenSymbol, token1: TokenSymbol) {
  return TOKEN_PAIRS.find(
    (pair) =>
      (pair.token0 === token0 && pair.token1 === token1) ||
      (pair.token0 === token1 && pair.token1 === token0)
  )
}
