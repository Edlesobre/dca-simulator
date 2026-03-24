import { NextResponse } from 'next/server'

export async function GET() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur'
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 60 }
  })
  if (!res.ok) return NextResponse.json({ error: 'CoinGecko error' }, { status: res.status })
  const data = await res.json()
  return NextResponse.json(data)
}
