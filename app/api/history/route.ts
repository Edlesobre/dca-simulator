import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const coin = searchParams.get('coin')
  const days = searchParams.get('days') || '90'

  if (!coin) return NextResponse.json({ error: 'Missing coin' }, { status: 400 })

  const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=eur&days=${days}&interval=daily`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }
  })

  if (!res.ok) return NextResponse.json({ error: 'CoinGecko error' }, { status: res.status })
  const data = await res.json()
  return NextResponse.json(data.prices)
}
