import { createPublicClient, formatEther, http, type Address, defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
})

export const publicClient = createPublicClient({ chain: arcTestnet, transport: http('https://rpc.testnet.arc.network') })

export type TxRow = { hash: string; from: string; to: string | null; value: string; blockNumber: bigint; direction: 'Sent' | 'Received' | 'Self' }

export async function getWalletTxs(address: Address, blocks = 3000): Promise<TxRow[]> {
  const latest = await publicClient.getBlockNumber()
  const start = latest > BigInt(blocks) ? latest - BigInt(blocks) : 0n
  const collected: TxRow[] = []
  const chunk = 250n
  for (let fromBlock = start; fromBlock <= latest && collected.length < 30; fromBlock += chunk + 1n) {
    const toBlock = fromBlock + chunk > latest ? latest : fromBlock + chunk
    const logs = await publicClient.getLogs({ address, fromBlock, toBlock }).catch(() => [])
    void logs
    const blockPromises = []
    for (let n = toBlock; n >= fromBlock && blockPromises.length < 30; n--) blockPromises.push(publicClient.getBlock({ blockNumber: n, includeTransactions: true }))
    const blocksData = await Promise.allSettled(blockPromises)
    for (const result of blocksData) {
      if (result.status !== 'fulfilled') continue
      for (const tx of result.value.transactions) {
        if (typeof tx === 'string') continue
        const mine = tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()
        if (!mine) continue
        collected.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to ?? null,
          value: formatEther(tx.value),
          blockNumber: result.value.number ?? 0n,
          direction: tx.from.toLowerCase() === address.toLowerCase() && tx.to?.toLowerCase() === address.toLowerCase() ? 'Self' : tx.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received',
        })
        if (collected.length >= 30) break
      }
      if (collected.length >= 30) break
    }
  }
  return collected.sort((a, b) => Number(b.blockNumber - a.blockNumber))
}

export function shortAddr(addr?: string) { return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '' }
export function explorerTx(hash: string) { return `https://testnet.arcscan.app/tx/${hash}` }
export function explorerAddress(address: string) { return `https://testnet.arcscan.app/address/${address}` }
