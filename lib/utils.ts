export const COINS = {
  bitcoin:  { label: 'Bitcoin',  symbol: 'BTC', color: '#F7931A', icon: '₿' },
  ethereum: { label: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: '⟠' },
  solana:   { label: 'Solana',   symbol: 'SOL', color: '#9945FF', icon: '◎' },
} as const

export type CoinId = keyof typeof COINS

export interface Entry {
  id: number
  coin: CoinId
  date: string
  totalEur: number
  price: number
  coins: number
}

export type Frequency = 'daily' | 'weekly' | 'monthly'

export const fmt = (n: number | null, dec = 0) =>
  n == null ? '—' : n.toLocaleString('fr-FR', { maximumFractionDigits: dec, minimumFractionDigits: dec })

export const fmtEur = (n: number | null, dec = 0) => fmt(n, dec) + ' €'

export const fmtPct = (n: number) => (n >= 0 ? '+' : '') + fmt(n, 1) + ' %'

export function simulateDCA(
  prices: [number, number][],
  amount: number,
  duration: number,
  frequency: Frequency
) {
  const daysNeeded = duration * 30
  const subset = prices.slice(-Math.min(daysNeeded, prices.length))
  const step = frequency === 'weekly' ? 7 : frequency === 'monthly' ? 30 : 1
  let totalInvested = 0, totalCoins = 0
  const portfolioValues: number[] = []
  const investedValues: number[] = []
  const labels: string[] = []

  for (let i = 0; i < subset.length; i++) {
    const [ts, price] = subset[i]
    if (i % step === 0) { totalCoins += amount / price; totalInvested += amount }
    portfolioValues.push(parseFloat((totalCoins * price).toFixed(2)))
    investedValues.push(parseFloat(totalInvested.toFixed(2)))
    labels.push(new Date(ts).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }))
  }

  const lastPrice = subset[subset.length - 1][1]
  return {
    portfolioValues, investedValues, labels,
    totalInvested, currentValue: totalCoins * lastPrice,
    avgBuy: totalInvested / totalCoins, lastPrice, totalCoins,
  }
}

export function sparseLabels(labels: string[]) {
  const skip = Math.max(1, Math.floor(labels.length / 40))
  return labels.map((l, i) => i % skip === 0 ? l : '')
}

const historyCache: Record<string, [number, number][]> = {}
const priceCache: { data: Record<string, { eur: number }> | null; ts: number } = { data: null, ts: 0 }

export async function fetchHistory(coin: string, days: number): Promise<[number, number][]> {
  const key = `${coin}-${days}`
  if (historyCache[key]) return historyCache[key]
  const res = await fetch(`/api/history?coin=${coin}&days=${days}`)
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
  const data = await res.json()
  historyCache[key] = data
  return data
}

export async function fetchCurrentPrices(): Promise<Record<string, { eur: number }>> {
  if (priceCache.data && Date.now() - priceCache.ts < 60000) return priceCache.data
  const res = await fetch('/api/prices')
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
  const data = await res.json()
  priceCache.data = data
  priceCache.ts = Date.now()
  return data
}
