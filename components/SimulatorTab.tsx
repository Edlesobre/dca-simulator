'use client'
import { useState, useEffect, useCallback } from 'react'
import { COINS, CoinId, Frequency, fmtEur, fmtPct, fetchHistory, simulateDCA, sparseLabels } from '@/lib/utils'
import { MetricCard } from './MetricCard'
import { Spinner } from './Spinner'
import { DCAChart } from './DCAChart'

export function SimulatorTab() {
  const [coin, setCoin] = useState<CoinId>('bitcoin')
  const [amount, setAmount] = useState(100)
  const [duration, setDuration] = useState(24)
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [prices, setPrices] = useState<[number, number][] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((c: CoinId) => {
    setLoading(true); setError(null); setPrices(null)
    fetchHistory(c, Math.max(duration * 31, 90))
      .then(setPrices)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [duration])

  useEffect(() => { load(coin) }, [coin])

  const result = prices ? simulateDCA(prices, amount, duration, frequency) : null

  return (
    <div>
      {/* Coin selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(Object.entries(COINS) as [CoinId, typeof COINS[CoinId]][]).map(([id, c]) => (
          <button key={id} onClick={() => setCoin(id)} style={{
            padding: '8px 18px', borderRadius: 8,
            border: `1px solid ${coin === id ? c.color : 'var(--border2)'}`,
            background: coin === id ? c.color + '22' : 'transparent',
            color: coin === id ? c.color : 'var(--text2)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
          }}>{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Montant par achat', min: 10, max: 1000, step: 10, val: amount, set: setAmount, display: fmtEur(amount) },
          { label: 'Durée (mois)', min: 3, max: 60, step: 1, val: duration, set: setDuration, display: duration + ' mois' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: 10 }}>{s.label}</div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(Number(e.target.value))} />
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6, fontFamily: 'DM Mono, monospace' }}>{s.display}</div>
          </div>
        ))}
      </div>

      {/* Frequency */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', marginRight: 4 }}>Fréquence :</span>
        {([['daily', 'Quotidien'], ['weekly', 'Hebdo'], ['monthly', 'Mensuel']] as [Frequency, string][]).map(([f, l]) => (
          <button key={f} onClick={() => setFrequency(f)} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 500,
            border: `1px solid ${frequency === f ? 'rgba(255,255,255,0.3)' : 'var(--border)'}`,
            background: frequency === f ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: frequency === f ? 'var(--text)' : 'var(--text2)',
            transition: 'all 0.15s',
          }}>{l}</button>
        ))}
      </div>

      {loading && <Spinner text={`Chargement de l'historique ${COINS[coin].label}...`} />}
      {error && (
        <div style={{ color: 'var(--red)', fontSize: 13, padding: '1.5rem', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
          ⚠️ {error}
          <button onClick={() => load(coin)} style={{ display: 'block', margin: '8px auto 0', padding: '6px 16px', borderRadius: 6, border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontSize: 12 }}>Réessayer</button>
        </div>
      )}

      {result && (() => {
        const { portfolioValues, investedValues, labels, totalInvested, currentValue, avgBuy, lastPrice } = result
        const pnl = currentValue - totalInvested
        const pct = (pnl / totalInvested) * 100
        const color = COINS[coin].color
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
              <MetricCard label="Total investi" val={fmtEur(totalInvested)} />
              <MetricCard label="Valeur actuelle" val={fmtEur(currentValue)} sub={(pnl >= 0 ? '+' : '') + fmtEur(pnl)} pos={pnl >= 0} />
              <MetricCard label="Performance" val={fmtPct(pct)} pos={pct >= 0} big />
              <MetricCard label="Prix moyen d'achat" val={fmtEur(avgBuy, 0)} sub={'Actuel : ' + fmtEur(lastPrice, 0)} />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
              {[[color, 'Valeur portefeuille'], ['#444', 'Total investi']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
                  {l}
                </span>
              ))}
            </div>

            <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '16px', border: '1px solid var(--border)' }}>
              <DCAChart portfolioValues={portfolioValues} investedValues={investedValues} labels={sparseLabels(labels)} color={color} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
